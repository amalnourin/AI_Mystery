import mongoose from 'mongoose';

const SuspectSchema = new mongoose.Schema({
  id: { type: String, required: true }, name: { type: String, required: true },
  background: String, relationshipToIncident: String, possibleMotive: String,
  alibi: String, profileImage: { type: String, default: '' }, publicDescription: String,
}, { _id: false });

const EvidenceSchema = new mongoose.Schema({
  id: { type: String, required: true }, title: String, type: String, description: String,
  content: mongoose.Schema.Types.Mixed, createdAtInStory: String,
  relatedSuspectIds: [String], assetUrl: String, metadata: mongoose.Schema.Types.Mixed,
}, { _id: false });

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true }, scenarioInput: { type: String, required: true },
  category: String, difficulty: String, status: { type: String, default: 'ready' },
  summary: String, incident: mongoose.Schema.Types.Mixed, timeline: [mongoose.Schema.Types.Mixed],
  suspects: [SuspectSchema], evidence: [EvidenceSchema], hints: [String], solution: { type: mongoose.Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

const SessionSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
  sessionHash: { type: String, required: true, index: true }, viewedEvidenceIds: [String], discoveredEvidenceIds: [String],
  hintsUsed: { type: Number, default: 0 }, deliveredHints: [String],
  accusation: String, accusationExplanation: String, score: Number, completed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

export const Case = mongoose.model('Case', CaseSchema);
export const InvestigationSession = mongoose.model('InvestigationSession', SessionSchema);
