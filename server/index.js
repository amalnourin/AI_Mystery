import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { randomBytes, createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Case, InvestigationSession } from './models.js';
import { generateCase } from './generator.js';
import { calculateScore, getDifficultyRules } from './game-rules.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const cookieName = 'mystery_session';
const sessionDays = Math.min(Math.max(Number(process.env.SESSION_DAYS || 7), 1), 30);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '30kb' }));
app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));
if (process.env.NODE_ENV === 'production') {
  app.use('/api', (req, res, next) => {
    if (req.path === '/health') return next();
    if (!process.env.PROXY_SECRET) return res.status(503).json({ error: 'The API proxy secret is not configured.' });
    if (req.get('x-mystery-proxy-secret') !== process.env.PROXY_SECRET) return res.status(403).json({ error: 'This API is available through the deployed application only.' });
    next();
  });
}
const generationLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Generation limit reached. Please try again later.' } });
const hash = token => createHash('sha256').update(token).digest('hex');
const publicCase = doc => ({ id: doc.id, title: doc.title, category: doc.category, difficulty: doc.difficulty, summary: doc.summary, incident: doc.incident, timeline: doc.timeline, suspects: doc.suspects, evidenceCount: doc.evidence.length, hintCount: doc.hints.length, createdAt: doc.createdAt });
const scrubHiddenKeys = value => {
  if (Array.isArray(value)) return value.map(scrubHiddenKeys);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !/(culprit|decisive|solution|isanswer|iscorrect|isfalse|isredherring)/i.test(key))
    .map(([key, child]) => [key, scrubHiddenKeys(child)]));
};
const publicEvidence = item => ({ id: item.id, title: item.title, type: item.type, description: item.description, content: scrubHiddenKeys(item.content), createdAtInStory: item.createdAtInStory, relatedSuspectIds: item.relatedSuspectIds, assetUrl: item.assetUrl, metadata: scrubHiddenKeys(item.metadata) });
const scoreBreakdown = (doc, session) => calculateScore({ difficulty: doc.difficulty, correct: session.accusation === doc.solution.culpritSuspectId, discoveredClues: session.discoveredEvidenceIds.length, hintsUsed: session.hintsUsed });
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function authorized(req, res, caseId) {
  const token = req.cookies[cookieName];
  if (!token) { res.status(401).json({ error: 'Your investigation session has expired. Start a new case to continue.' }); return null; }
  const session = await InvestigationSession.findOne({ caseId, sessionHash: hash(token), expiresAt: { $gt: new Date() } });
  if (!session) { res.status(404).json({ error: 'This case is unavailable in your current session. Start a new investigation.' }); return null; }
  return session;
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.post('/api/cases/generate', generationLimit, asyncRoute(async (req, res) => {
  const { title, scenario, category = '', difficulty = 'Medium', suspectCount, preferences = '' } = req.body || {};
  if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) return res.status(400).json({ error: 'Add a case title between 3 and 100 characters.' });
  if (typeof scenario !== 'string' || scenario.trim().length < 30 || scenario.trim().length > 4000) return res.status(400).json({ error: 'Scenario details must be between 30 and 4,000 characters.' });
  if (!['Easy','Medium','Hard'].includes(difficulty)) return res.status(400).json({ error: 'Choose an available difficulty.' });
  const count = getDifficultyRules(difficulty)?.suspects;
  if (!count) return res.status(400).json({ error: 'Choose an available difficulty.' });
  if (suspectCount !== undefined && Number(suspectCount) !== count) return res.status(400).json({ error: `${difficulty} cases use exactly ${count} suspects.` });
  const data = await generateCase({ title: title.trim(), scenario: scenario.trim() + (preferences ? `\nCreative preferences: ${String(preferences).slice(0, 500)}` : ''), category: String(category).slice(0, 60), difficulty, suspectCount: count });
  const expiresAt = new Date(Date.now() + sessionDays * 86400000);
  const doc = await Case.create({ ...data, scenarioInput: scenario.trim(), category: category || 'General mystery', difficulty, status: 'ready', expiresAt });
  const priorToken = req.cookies[cookieName];
  const token = priorToken && await InvestigationSession.exists({ sessionHash: hash(priorToken), expiresAt: { $gt: new Date() } })
    ? priorToken
    : randomBytes(32).toString('base64url');
  await InvestigationSession.create({ caseId: doc._id, sessionHash: hash(token), expiresAt });
  res.cookie(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: sessionDays * 86400000, path: '/' });
  res.status(201).json({ case: publicCase(doc) });
}));

app.get('/api/cases/:caseId', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.caseId)) return res.status(400).json({ error: 'Invalid case ID.' });
  const session = await authorized(req, res, req.params.caseId); if (!session) return;
  const doc = await Case.findById(req.params.caseId); if (!doc) return res.status(404).json({ error: 'Case not found.' });
  res.json({ case: publicCase(doc), progress: { viewedEvidenceIds: session.viewedEvidenceIds, completed: session.completed } });
}));

app.get('/api/cases/:caseId/evidence', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.caseId)) return res.status(400).json({ error: 'Invalid case ID.' });
  const session = await authorized(req, res, req.params.caseId); if (!session) return;
  const doc = await Case.findById(req.params.caseId).select('evidence'); if (!doc) return res.status(404).json({ error: 'Case not found.' });
  res.json({ evidence: doc.evidence.map(publicEvidence) });
}));

app.get('/api/cases/:caseId/evidence/:evidenceId', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.caseId)) return res.status(400).json({ error: 'Invalid case ID.' });
  const session = await authorized(req, res, req.params.caseId); if (!session) return;
  const doc = await Case.findById(req.params.caseId).select('evidence'); if (!doc) return res.status(404).json({ error: 'Case not found.' });
  const evidence = doc.evidence.find(item => item.id === req.params.evidenceId); if (!evidence) return res.status(404).json({ error: 'Evidence not found.' });
  if (!session.viewedEvidenceIds.includes(evidence.id)) { session.viewedEvidenceIds.push(evidence.id); await session.save(); }
  res.json({ evidence: publicEvidence(evidence) });
}));

app.get('/api/cases/:caseId/progress', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.caseId)) return res.status(400).json({ error: 'Invalid case ID.' });
  const session = await authorized(req, res, req.params.caseId); if (!session) return;
  const doc = await Case.findById(req.params.caseId).select('difficulty'); if (!doc) return res.status(404).json({ error: 'Case not found.' });
  const correctBase = getDifficultyRules(doc.difficulty).basePoints;
  res.json({ viewedEvidenceIds: session.viewedEvidenceIds, discoveredEvidenceIds: session.discoveredEvidenceIds, hintsUsed: session.hintsUsed, hints: session.deliveredHints, score: Math.max(0, session.discoveredEvidenceIds.length * 5 - session.hintsUsed * 10), possibleAccusationScore: Math.max(0, correctBase + session.discoveredEvidenceIds.length * 5 - session.hintsUsed * 10), completed: session.completed, accusation: session.completed ? session.accusation : undefined });
}));

app.post('/api/cases/:caseId/clues/:clueId/discover', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.caseId)) return res.status(400).json({ error: 'Invalid case ID.' });
  const session = await authorized(req, res, req.params.caseId); if (!session) return;
  if (session.completed) return res.status(409).json({ error: 'This investigation is already complete.' });
  const doc = await Case.findById(req.params.caseId).select('evidence'); if (!doc) return res.status(404).json({ error: 'Case not found.' });
  if (!doc.evidence.some(item => item.id === req.params.clueId)) return res.status(404).json({ error: 'Clue not found.' });
  if (!session.viewedEvidenceIds.includes(req.params.clueId)) return res.status(409).json({ error: 'Open this clue before marking it discovered.' });
  if (!session.discoveredEvidenceIds.includes(req.params.clueId)) { session.discoveredEvidenceIds.push(req.params.clueId); await session.save(); }
  res.json({ discoveredEvidenceIds: session.discoveredEvidenceIds, cluesDiscovered: session.discoveredEvidenceIds.length, score: Math.max(0, session.discoveredEvidenceIds.length * 5 - session.hintsUsed * 10) });
}));

app.post('/api/cases/:caseId/hints', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.caseId)) return res.status(400).json({ error: 'Invalid case ID.' });
  const session = await authorized(req, res, req.params.caseId); if (!session) return;
  if (session.completed) return res.status(409).json({ error: 'This investigation is already complete.' });
  const doc = await Case.findById(req.params.caseId).select('hints'); if (!doc) return res.status(404).json({ error: 'Case not found.' });
  if (session.hintsUsed >= doc.hints.length) return res.status(409).json({ error: 'You have used all available hints.' });
  const hint = doc.hints[session.hintsUsed];
  session.hintsUsed += 1; session.deliveredHints.push(hint); await session.save();
  res.json({ hint, hintsUsed: session.hintsUsed, hintsRemaining: doc.hints.length - session.hintsUsed, score: Math.max(0, session.discoveredEvidenceIds.length * 5 - session.hintsUsed * 10) });
}));

app.get('/api/cases/:caseId/result', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.caseId)) return res.status(400).json({ error: 'Invalid case ID.' });
  const session = await authorized(req, res, req.params.caseId); if (!session) return;
  if (!session.completed) return res.status(403).json({ error: 'Submit your final accusation to unlock the solution.' });
  const doc = await Case.findById(req.params.caseId); if (!doc) return res.status(404).json({ error: 'Case not found.' });
  const culprit = doc.suspects.find(s => s.id === doc.solution.culpritSuspectId);
  res.json({ correct: session.accusation === doc.solution.culpritSuspectId, score: session.score, scoreBreakdown: scoreBreakdown(doc, session), culprit, solution: doc.solution, evidence: doc.evidence.map(({ id, title }) => ({ id, title })) });
}));

app.patch('/api/cases/:caseId/progress', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.caseId)) return res.status(400).json({ error: 'Invalid case ID.' });
  const session = await authorized(req, res, req.params.caseId); if (!session) return;
  const ids = Array.isArray(req.body?.viewedEvidenceIds) ? req.body.viewedEvidenceIds.slice(0, 30) : [];
  const doc = await Case.findById(req.params.caseId).select('evidence'); if (!doc) return res.status(404).json({ error: 'Case not found.' });
  const allowed = new Set(doc.evidence.map(item => item.id));
  session.viewedEvidenceIds = [...new Set([...session.viewedEvidenceIds, ...ids.filter(id => allowed.has(id))])]; await session.save();
  res.json({ viewedEvidenceIds: session.viewedEvidenceIds, completed: session.completed });
}));

app.post('/api/cases/:caseId/accuse', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.caseId)) return res.status(400).json({ error: 'Invalid case ID.' });
  const session = await authorized(req, res, req.params.caseId); if (!session) return;
  if (session.completed) return res.status(409).json({ error: 'Your final accusation has already been submitted.' });
  const { suspectId, reasoning = '' } = req.body || {};
  const doc = await Case.findById(req.params.caseId); if (!doc) return res.status(404).json({ error: 'Case not found.' });
  if (typeof suspectId !== 'string' || !doc.suspects.some(s => s.id === suspectId)) return res.status(400).json({ error: 'Select a valid suspect before submitting.' });
  if (typeof reasoning !== 'string' || reasoning.length > 1200) return res.status(400).json({ error: 'Reasoning must be 1,200 characters or fewer.' });
  const correct = suspectId === doc.solution.culpritSuspectId;
  const breakdown = calculateScore({ difficulty: doc.difficulty, correct, discoveredClues: session.discoveredEvidenceIds.length, hintsUsed: session.hintsUsed });
  const finalScore = breakdown.total;
  const completedSession = await InvestigationSession.findOneAndUpdate(
    { _id: session._id, completed: false },
    { $set: { accusation: suspectId, accusationExplanation: reasoning, score: finalScore, completed: true } },
    { new: true },
  );
  if (!completedSession) return res.status(409).json({ error: 'Your final accusation has already been submitted.' });
  const culprit = doc.suspects.find(s => s.id === doc.solution.culpritSuspectId);
  res.json({ correct, score: finalScore, scoreBreakdown: breakdown, culprit, solution: doc.solution, evidence: doc.evidence.map(({ id, title }) => ({ id, title })) });
}));

app.use((err, req, res, next) => {
  console.error('Request failed:', err.message);
  if (err?.publicMessage) return res.status(err.statusCode || 500).json({ error: err.publicMessage });
  if (err?.name === 'ValidationError') return res.status(400).json({ error: 'The generated case could not be saved. Please try again.' });
  if (err?.name === 'MongoServerSelectionError' || err?.name === 'MongooseServerSelectionError') return res.status(503).json({ error: 'The case database is unavailable. Check MongoDB and try again.' });
  if (err?.status === 429) return res.status(503).json({ error: 'The case generator is busy. Please wait a moment and retry.' });
  res.status(500).json({ error: err.message?.startsWith('Gemini is not configured') ? err.message : 'Something went wrong while preparing your investigation. Please try again.' });
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../client/dist')));
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../client/dist/index.html')));
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-mystery-investigation')
  .then(() => app.listen(port, () => console.log(`Mystery API listening on ${port}`)))
  .catch(error => { console.error('Unable to connect to MongoDB:', error.message); process.exit(1); });
