# AI Mystery Investigation

A single-player, guest-mode mystery game. Players provide a fictional premise, investigate a Gemini-generated case, and make one final accusation. The Express server keeps the culprit and solution private until that accusation is submitted.

## Requirements

- Node.js 20 or newer
- MongoDB 7 or newer, local or hosted
- A Google Gemini API key

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and `GEMINI_API_KEY`.
3. Start MongoDB.
4. Run `npm run dev`.
5. Open <http://localhost:5173>.

For a production build, run `npm run build`, then set `NODE_ENV=production` and run `npm start`. The Express server serves the built frontend from `client/dist` and the API from one origin. Configure `CLIENT_ORIGIN` to the frontend origin if frontend and API are deployed separately. In production, HTTPS is required for the secure session cookie.

Run the scoring-rule unit tests with `npm test`.

## Deploy: Vercel frontend + Render API + MongoDB Atlas

The Vercel API function proxies `/api/*` to Render and relays the anonymous session cookie on the Vercel domain. The Render API requires a shared proxy secret, so browsers cannot call the backend origin directly.

### 1. Push the project to GitHub

Create an empty GitHub repository, then run these commands from the project root (replace the repository URL):

```powershell
git init
git add .
git commit -m "Prepare AI Mystery Room for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/YOUR-REPOSITORY.git
git push -u origin main
```

`.env` is ignored by Git. Do not force-add it or paste its contents into deployment settings other than the relevant secret fields.

### 2. Allow Render to reach MongoDB Atlas

In Atlas, open **Network Access → IP Access List**. After creating the Render service in the next step, use its **Connect → Outbound** list and add the listed Render egress CIDR ranges to Atlas. Render uses shared regional outbound ranges unless you pay for dedicated IPs, so copy the ranges from the service dashboard instead of guessing them. [Render outbound IP documentation](https://render.com/docs/outbound-ip-addresses) · [Atlas IP access list documentation](https://www.mongodb.com/docs/atlas/security/add-ip-address-to-list/).

### 3. Deploy the API on Render

1. In Render, choose **New → Blueprint** and connect the GitHub repository.
2. Render reads `render.yaml` and creates the `ai-mystery-room-api` web service. It runs `npm ci && npm run build`, then `npm start`, with `/api/health` as its health check.
3. When prompted, enter `MONGODB_URI` and `GEMINI_API_KEY` as secret environment values.
4. Generate one random 32-byte secret locally, for example with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Enter that value as `PROXY_SECRET` on Render. Keep it available for the Vercel step; never commit it.
5. Wait for Render to report the service as live. Copy its HTTPS origin, such as `https://ai-mystery-room-api.onrender.com`.

### 4. Deploy the frontend on Vercel

1. In Vercel, choose **Add New → Project** and import the same GitHub repository. Keep the project root at the repository root; `vercel.json` configures Vite's `client/dist` output and the API proxy function.
2. Add these Production environment variables:
   - `API_ORIGIN`: the Render HTTPS origin from the previous step, with no trailing slash.
   - `PROXY_SECRET`: the exact same value entered on Render.
3. Deploy. Vercel builds the React app and the `api/[...path].js` proxy function.
4. Open `https://YOUR-VERCEL-DOMAIN/api/health`. It should return `{"status":"ok"}`.

### 5. Verify the deployed game

Open the Vercel website and generate one case. Verify the evidence room, clue discovery, hint limit and deductions, one accusation, score breakdown, and final reveal. Check Render and Vercel function logs if a step fails. Keep `MONGODB_URI`, `GEMINI_API_KEY`, and `PROXY_SECRET` only in the hosting providers' server-side environment variables.

Deployment references: [Vercel Vite guide](https://vercel.com/docs/frameworks/frontend/vite), [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json), [Render Blueprints](https://render.com/docs/blueprint-spec), and [Render web services](https://render.com/docs/web-services).

## Configuration

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Express port | `4000` |
| `MONGODB_URI` | MongoDB connection string | local `ai-mystery-investigation` database |
| `GEMINI_API_KEY` | Server-side Gemini credential | Required for generation |
| `GEMINI_MODEL` | Gemini model identifier | `gemini-3.8-flash` |
| `CLIENT_ORIGIN` | Allowed browser origin | `http://localhost:5173` |
| `SESSION_DAYS` | Anonymous case and session lifetime, 1–30 days | `7` |

The frontend never calls Gemini. If MongoDB or Gemini is unavailable, generation returns an actionable error and does not create a pretend case.

## Gameplay and privacy

- The first request to generate a case creates an opaque, HTTP-only browser session. The database stores only a SHA-256 hash of its token.
- The same browser session can reopen cases generated during its lifetime. The session cookie is `Secure` in production, `SameSite=Lax`, and scoped to the site.
- Case records and progress are stored in MongoDB and expire through the investigation session TTL. No account or personal contact information is collected.
- Case APIs return public case data only. The solution is served by `/api/cases/:caseId/result` only after a completed accusation.
- Generation is limited to five requests per hour per client IP; the API has a general request limit as well.
- All characters, chat messages, call records, logs, and image placeholders are fictional game materials.

## API overview

- `POST /api/cases/generate`
- `GET /api/cases/:caseId`
- `GET /api/cases/:caseId/evidence`
- `GET /api/cases/:caseId/evidence/:evidenceId`
- `POST /api/cases/:caseId/clues/:clueId/discover`
- `POST /api/cases/:caseId/hints`
- `GET` and `PATCH /api/cases/:caseId/progress`
- `POST /api/cases/:caseId/accuse`
- `GET /api/cases/:caseId/result` (authorized and completed sessions only)
- `GET /api/health`

## Difficulty and scoring

| Difficulty | Suspects | Clues | Hints | Correct accusation base |
| --- | ---: | ---: | ---: | ---: |
| Easy | 3 | 5 | 2 | 100 |
| Medium | 4 | 7 | 3 | 150 |
| Hard | 5 | 9 | 3 | 200 |

Each newly discovered clue adds 5 points. Each hint requested costs 10 points. A correct accusation adds the difficulty base; an incorrect accusation adds no base points. Final score is `max(0, accusation base + clue points - hint costs)`. The server calculates the score from stored session progress.

## Project layout

```text
client/              React application, Vite config, and responsive styles
server/index.js      Express API, guest sessions, authorization, reveal rules
server/generator.js  Gemini prompt, structured validation, consistency checks
server/models.js     Mongoose Case and InvestigationSession schemas
server/game-rules.js Shared difficulty and scoring rules
server/game-rules.test.js Score-rule unit tests
api/[...path].js    Same-origin Vercel proxy for API and session cookies
render.yaml         Render API service definition
vercel.json         Vite output and Vercel function configuration
```
