# AI MYSTERY INVESTIGATION
## Product Specification Document (SSOT)

**Document Version:** 1.0  
**Project Type:** AI-powered web application  
**Development Methodology:** Spec-Driven Development (SDD)  
**Primary Coding Agent:** OpenAI Codex  
**AI Provider:** Google Gemini  
**Technology Stack:** MERN (MongoDB, Express.js, React.js, Node.js)

---

# 1. Project Overview

## 1.1 Project Name

**AI Mystery Investigation**

Working title, subject to change.

## 1.2 Project Description

AI Mystery Investigation is a web application that transforms a user's short story, scenario, or mystery premise into an interactive fictional crime investigation.

The user provides a scenario describing a situation, incident, or mystery. The application uses Google Gemini through a secure backend integration to generate a complete fictional investigation.

The generated investigation contains:
- A mystery case with a clear central incident.
- Multiple suspects, each with a background and possible motive.
- A hidden culprit selected by the AI.
- Evidence items such as fictional WhatsApp conversations, images, call recordings or transcripts, timelines, and other investigation records.
- Contradictions, clues, and misleading evidence that users must analyze.
- An interactive interface where the user reviews evidence and selects the person they believe is responsible.
- A final case reveal explaining the actual culprit and the reasoning behind the solution.

**Core concept:** The AI creates the mystery, but the user acts as the investigator and must solve it using the evidence provided.

All cases and evidence must be fictional and AI-generated or programmatically generated for the purpose of the game. The application must not present fabricated evidence as authentic real-world records.

# 2. Project Goals

The application must:

1. Allow users to submit their own mystery premise.
2. Generate a complete, coherent mystery investigation using AI.
3. Create a fixed solution and hidden culprit before presenting the investigation to the user.
4. Generate multiple evidence items that support or challenge different suspects.
5. Make the investigation interactive, engaging, and easy to navigate.
6. Allow users to inspect evidence and submit a final accusation.
7. Reveal the solution with an explanation grounded in the generated evidence.
8. Preserve case consistency across all evidence items.
9. Store case data and investigation progress in MongoDB.
10. Keep all AI API credentials and sensitive server operations on the backend.

# 3. Target Users

- People who enjoy detective games and mystery-solving.
- Students participating in interactive technical or creative activities.
- Casual users who want to generate and solve fictional cases.
- Users interested in deduction, puzzles, and investigative reasoning.

The initial product is a single-player web application.

# 4. Scope

## 4.1 Minimum Viable Product (MVP)

The first version must support:

- A landing page.
- A scenario submission page.
- AI-generated investigation creation.
- A case overview and suspect profiles.
- A digital evidence room.
- Evidence detail views.
- Suspect selection and accusation submission.
- A final solution and score screen.
- Persistent case storage.
- Loading, error, and retry states.

## 4.2 Out of Scope for the MVP

Unless explicitly requested later, do not implement:

- Multiplayer investigations.
- Live human investigators or chat rooms.
- Real police records or real criminal databases.
- Real WhatsApp, phone, or social media account integrations.
- Real phone calls or surveillance.
- Payments, subscriptions, or paid credits.
- Public case-sharing or community features.
- User-generated evidence uploads.
- A complex administrator dashboard.

Keep the architecture extensible enough to support additional features later.

# 5. Technology Stack

## 5.1 Frontend

**React.js**

Responsibilities:
- Render the user interface.
- Collect scenario inputs.
- Display the generated case and evidence.
- Manage navigation and client-side interaction.
- Display progress, loading, and error states.
- Submit accusations and display results.

Recommended supporting technologies:
- React Router for page navigation.
- Fetch API or Axios for backend communication.
- CSS Modules, standard CSS, or another consistent styling solution.
- Lucide React for interface icons, if needed.

Use JavaScript or TypeScript consistently throughout the frontend. TypeScript is preferred if the project is being initialized from scratch.

## 5.2 Backend

**Node.js + Express.js**

Responsibilities:
- Expose REST API endpoints.
- Validate and sanitize user input.
- Communicate with Google Gemini.
- Generate and validate structured case data.
- Enforce the hidden solution and scoring rules.
- Persist cases and investigation progress.
- Handle errors, timeouts, and rate limits.
- Protect API keys and enforce access controls.

## 5.3 Database

**MongoDB**

Use MongoDB to store:
- Case metadata.
- Original scenario inputs.
- Suspect profiles.
- Evidence metadata and content.
- The hidden solution.
- Case generation status.
- User investigation progress.
- Accusation attempts and completion status.

Mongoose may be used for schemas and database validation.

## 5.4 Artificial Intelligence

**Google Gemini API**

Gemini is responsible for generating structured fictional investigations based on the user's scenario.

The backend must:
- Send a carefully designed prompt to Gemini.
- Request structured JSON output.
- Validate the returned data against the case schema.
- Check for logical contradictions.
- Retry or repair invalid output when appropriate.
- Save valid cases before returning playable case data to the frontend.

The frontend must never call Gemini directly.

The Gemini model must be configurable through an environment variable rather than hardcoded throughout the application.

## 5.5 Optional Media Generation

Images and audio can be added through compatible generation services or deterministic mock assets.

The MVP must not depend on an external image or audio generation provider to work. If media generation is unavailable, the application should still provide a complete investigation using text-based evidence and clearly labeled illustrative placeholders.

# 6. User Journey

The main workflow is:

1. User opens the landing page.
2. User selects **Create a Mystery**.
3. User enters a scenario or story premise.
4. User optionally chooses case settings.
5. User clicks **Generate Investigation**.
6. The backend sends the premise to Gemini.
7. The backend validates and stores the completed case.
8. The application opens the generated case briefing.
9. User reviews suspects and available evidence.
10. User opens individual evidence items and examines their details.
11. User selects a suspected culprit.
12. User submits the accusation.
13. The application checks the answer on the backend.
14. The final reveal explains the actual culprit and the decisive clues.
15. The user can start a new investigation.

The user must not see the actual culprit before submitting the accusation.

# 7. Functional Requirements

## FR-01: Landing Page

The landing page must:
- Introduce the AI mystery-solving concept.
- Display a prominent **Create a Mystery** button.
- Explain briefly that users provide a scenario and investigate the resulting case.
- Use a polished detective or investigative visual theme.
- Work on desktop, tablet, and mobile devices.

Clicking the primary button must open the scenario submission page.

## FR-02: Scenario Submission

Provide a form with the following fields:

**Required**
- Scenario title or short description.
- Scenario details, entered as free-form text.

**Optional**
- Mystery category: murder, theft, cybercrime, disappearance, corporate mystery, or general mystery.
- Difficulty: Easy, Medium, or Hard.
- Number of suspects.
- Preferred setting or location.
- Additional constraints or creative preferences.

Suggested defaults:
- Difficulty: Medium.
- Number of suspects: 4.
- Case category: AI-selected.

The scenario must have a configurable maximum length. Validate empty, excessively long, or invalid input before submitting.

Do not assume that every mystery must involve murder. The AI must respect the user's premise and selected category.

## FR-03: AI Case Generation

When the user submits a valid scenario, the backend must create a complete investigation.

The generated case must include:

1. Case ID.
2. Case title.
3. Case summary.
4. Incident details and timeline.
5. Victim or affected party, where relevant.
6. Suspect profiles.
7. One designated culprit.
8. Motives and relevant relationships.
9. Evidence items.
10. Important clues.
11. Red herrings, where appropriate.
12. The true explanation of the incident.
13. The final solution.
14. A set of reasoning points connecting the evidence to the solution.

The AI must establish the actual solution before generating the evidence shown to the user.

The culprit must be a valid suspect in the case.

All references to names, dates, times, locations, and events must remain consistent across the entire investigation.

## FR-04: Case Briefing

The case briefing page must display:
- Case title and ID.
- Incident summary.
- Incident date and location, if relevant.
- Background information.
- Investigation objectives.
- A list of suspects.
- An evidence count.
- A button to enter the evidence room.

The case briefing must not disclose the culprit, hidden motive, or final explanation.

## FR-05: Suspect Profiles

Each suspect must have:
- A unique suspect ID.
- A name.
- A profile image or illustrative avatar.
- A short background.
- Their relationship to the incident.
- A possible motive.
- An alibi or account of their whereabouts, where relevant.
- Relevant statements or behavior.
- A public-facing profile description.

At least two suspects should appear plausible, especially at Medium and Hard difficulty.

Suspect profiles must not directly expose the correct answer.

Suspect images must be fictional or appropriately licensed assets. Avoid generating images that imply a real person committed a real crime.

## FR-06: Digital Evidence Room

The evidence room is the central gameplay interface.

Display the evidence as organized cards or folders. Each item must have:
- Evidence ID.
- Evidence title.
- Evidence type.
- Short description.
- Availability status.
- A control to open the full evidence.

Suggested evidence types:

| Evidence type | Example |
|---|---|
| Chat messages | Fictional WhatsApp-style conversation |
| Images | Scene photographs or fictional object images |
| Call records | Call times, durations, and participants |
| Audio | Fictional voice recordings or transcripts |
| Documents | Reports, notes, emails, receipts |
| Digital logs | Login records, access logs, activity history |
| Timeline | Sequence of events |
| Witness statements | Accounts from fictional characters |
| Physical evidence | Objects, fingerprints described in text, or other clues |

The case includes the difficulty-specific number of playable clues: Easy 5, Medium 7, Hard 9. Every clue is an evidence item with a unique ID.

Not every evidence type must appear in every case. The evidence should fit the scenario.

## FR-07: Evidence Details

When an evidence item is opened, show:
- Its title and evidence ID.
- The complete fictional content.
- Its source or origin within the story.
- Relevant dates and timestamps.
- Related suspects, if appropriate.
- Any associated image, audio player, or document viewer.
- A way to return to the evidence room.

Evidence must not be marked as “correct,” “false,” or “decisive” in the normal investigation view.

For chat evidence, use a readable conversation layout with participants, timestamps, and message bubbles.

For call records, show participants, timestamps, and durations where relevant.

For audio, provide an audio player when an actual audio asset is available. Otherwise, show a clearly labeled fictional transcript or mock recording interface.

For images, display the generated image or an illustrative placeholder with a clear fictional label.

All evidence must be invented for the game. Mock interface designs must not imply that the application has retrieved authentic private communications or actual call recordings.

## FR-08: Evidence Relationships

The application should support relationships between evidence items and suspects.

For example:
- A chat message contradicts a suspect's statement.
- A digital log places a suspect at a particular location.
- A call record establishes a relevant timeline.
- An image contains an object connected to the incident.

The backend should preserve these relationships in structured case data.

At least three evidence items should contribute meaningfully to the final explanation.

Red herrings are allowed, but they must not make the solution logically impossible or contradict essential facts without explanation.

## FR-09: Accusation

After reviewing the case, the user must be able to select a suspect and submit a final accusation.

The accusation screen must:
- Display the available suspects.
- Allow exactly one suspect to be selected for the final accusation.
- Provide an optional explanation for the user's reasoning.
- Require a suspect selection before submission.
- Ask for confirmation before the final submission.

The correct answer must be evaluated on the backend.

The frontend must not receive the hidden culprit ID before the accusation is submitted.

The MVP should allow one final accusation per case. If multiple attempts are desired later, implement them as a separate configurable gameplay rule.

## FR-10: Solution Reveal

After the accusation, display:
- Whether the user identified the correct culprit.
- The actual culprit's profile.
- The motive.
- How the incident occurred.
- The relevant timeline.
- The decisive evidence.
- The explanation connecting each decisive clue to the conclusion.
- An explanation of important red herrings.
- A button to play another case.

The explanation must reference evidence IDs or titles from the actual case.

The final reveal must be derived from the stored case solution, not generated independently in a way that could contradict the original case.

## FR-11: Scoring

Use the difficulty-based scoring formula defined in section 20.4. Scores are calculated and stored by the backend from the accusation result, discovered clues, and hints used.

Do not claim that a user's optional written explanation was assessed by AI unless that assessment is actually implemented.

## FR-12: Case Persistence

Generated cases must be stored in MongoDB.

The application should:
- Assign each case a unique ID.
- Save the original scenario.
- Save the structured case data.
- Save the hidden solution separately from the public case payload.
- Track generation status.
- Store the user's accusation and completion status.
- Allow an active case to be reopened using its case ID.

If user authentication is not implemented, use a temporary anonymous session or a secure case access mechanism. Do not expose sensitive solution data through guessable public IDs.

# 8. AI Case Generation and Consistency Rules

These rules are mandatory because the quality of the product depends on coherent mysteries.

## 8.1 Fixed-Solution-First Approach

Gemini must determine the following before generating public evidence:

1. What actually happened.
2. Who caused the incident.
3. Why the culprit did it.
4. How the incident was carried out.
5. Which facts establish the culprit's responsibility.
6. Which facts explain the innocent suspects' suspicious behavior.

Only after these are established should the AI generate the suspect profiles, timeline, statements, and evidence.

## 8.2 Evidence Consistency

The backend must validate:
- Every suspect ID referenced in evidence exists.
- The culprit ID references a valid suspect.
- All evidence IDs are unique within the case.
- All decisive clues reference existing evidence.
- The timeline does not contain impossible chronological relationships.
- Evidence does not accidentally reveal the solution before accusation.
- The final explanation matches the actual case facts.
- The scenario's constraints have been respected.

If validation fails, retry or repair the generated case a limited number of times. If generation still fails, show a useful error and allow the user to retry.

## 8.3 Difficulty Levels

**Easy**
- 3 suspects by default.
- Clear clues.
- A relatively straightforward timeline.
- Few red herrings.

**Medium**
- 4 suspects by default.
- Multiple plausible suspects.
- Contradictory statements that can be resolved using evidence.
- A moderate number of red herrings.

**Hard**
- 5 suspects by default.
- Interconnected clues across multiple evidence items.
- More subtle contradictions.
- Greater emphasis on timeline reconstruction and deduction.

These are generation guidelines rather than guarantees. The backend must validate the actual generated suspect count.

## 8.4 Structured Output

Request JSON from Gemini using a defined schema. Do not depend on free-form prose alone.

The backend must parse and validate the output before saving it.

Never treat the AI-generated text as trusted instructions for the application. It is content data, not executable code.

# 9. Data Model

Use MongoDB collections with schemas equivalent to the following.

## 9.1 Case

Fields:
- `_id`
- `title`
- `scenarioInput`
- `category`
- `difficulty`
- `status`
- `summary`
- `incident`
- `timeline`
- `suspects`
- `evidence`
- `hints` (private; delivered through the authorized hint endpoint only)
- `solution`
- `createdAt`
- `updatedAt`

The `solution` field contains confidential game data, including the culprit ID, motive, explanation, and decisive clues.

Public API responses must explicitly exclude this field until the user has submitted an accusation.

## 9.2 Suspect

Each suspect object contains:
- `id`
- `name`
- `background`
- `relationshipToIncident`
- `possibleMotive`
- `alibi`
- `profileImage`
- `publicDescription`

Do not include a public `isCulprit` flag.

## 9.3 Evidence

Each evidence object contains:
- `id`
- `title`
- `type`
- `description`
- `content`
- `createdAtInStory`
- `relatedSuspectIds`
- `assetUrl`, if applicable
- `isDecisive`, stored only in protected solution data or an otherwise inaccessible internal field
- `metadata`

The user-facing API must never expose hidden fields.

## 9.4 Solution

Fields:
- `culpritSuspectId`
- `motive`
- `method`
- `trueTimeline`
- `decisiveEvidenceIds`
- `reasoning`
- `redHerringExplanations`
- `finalReveal`

The solution must be accessible only through protected server-side operations.

## 9.5 Investigation Session

Fields:
- `_id`
- `caseId`
- `sessionId` or `userId`
- `viewedEvidenceIds`
- `discoveredEvidenceIds`
- `hintsUsed`
- `deliveredHints`
- `accusation`
- `accusationExplanation`
- `score`
- `completed`
- `createdAt`
- `updatedAt`

Use appropriate indexes for case IDs, session IDs, and common lookups.

# 10. API Specification

Implement REST endpoints under `/api`.

## Case Generation

**POST `/api/cases/generate`**

Input:
- `scenario`
- `category`
- `difficulty`
- `suspectCount`
- Optional additional preferences.

Behavior:
- Validate input.
- Generate the case through Gemini.
- Validate case structure and logical consistency.
- Store the case and hidden solution.
- Return the case ID and public case data.

## Get Case

**GET `/api/cases/:caseId`**

Behavior:
- Return case briefing, public suspect profiles, timeline information, and other allowed case metadata.
- Never return the hidden culprit or protected solution.

## Get Evidence

**GET `/api/cases/:caseId/evidence`**

Behavior:
- Return the evidence list without hidden solution fields.

**GET `/api/cases/:caseId/evidence/:evidenceId`**

Behavior:
- Return the requested evidence item.
- Validate that the evidence belongs to the requested case.

**POST `/api/cases/:caseId/clues/:clueId/discover`**

Behavior:
- Verify case and session authorization.
- Add the clue ID once to `discoveredEvidenceIds`.
- Award 5 provisional points for a newly discovered clue; repeated discovery does not award more points.

**POST `/api/cases/:caseId/hints`**

Behavior:
- Return the next progressive hint for the authorized session.
- Enforce the difficulty-specific hint limit.
- Deduct 10 points for each hint requested; do not expose unused hints through other endpoints.

## Submit Accusation

**POST `/api/cases/:caseId/accuse`**

Input:
- `suspectId`
- Optional `reasoning`

Behavior:
- Verify the case and session.
- Verify that the suspect exists.
- Enforce the one-final-attempt rule.
- Compare the selected suspect with the stored culprit ID.
- Mark the case complete.
- Return the result and permitted solution explanation.

The backend must prevent repeated submissions from bypassing the attempt rule.

## Investigation Progress

**GET `/api/cases/:caseId/progress`**

Behavior:
- Return progress for the authorized session.
- Include discovered clue IDs, hints used and delivered, and provisional score.
- Do not expose hidden solution data.

**PATCH `/api/cases/:caseId/progress`**

Input:
- Evidence viewed or other supported progress updates.

Behavior:
- Validate and save progress.
- Prevent unauthorized session access.

Use appropriate HTTP status codes, input validation, and consistent error responses.

# 11. UI and Visual Design

## 11.1 Design Direction

Use a modern digital detective or forensic investigation aesthetic.

Suggested design characteristics:
- Dark navy or charcoal background.
- Muted grey surfaces.
- White or light-grey primary text.
- One restrained accent color, such as cyan, amber, or muted red.
- Clean typography.
- Subtle borders and shadows.
- Readable cards and evidence panels.
- Clear visual hierarchy.

Avoid excessive animations, unnecessary visual clutter, and overly theatrical effects that reduce readability.

## 11.2 Main Pages

### Page 1: Landing
- Hero section.
- Brief product description.
- Create a Mystery CTA.
- Optional sample case preview.

### Page 2: Create Case
- Scenario form.
- Category and difficulty controls.
- Suspect count setting.
- Generate button.
- Validation messages.

### Page 3: Generating
- Progress indicator.
- Clear status messages.
- Error and retry state.
- No fake progress claims that imply the model has completed work when it has not.

### Page 4: Case Briefing
- Case details.
- Incident summary.
- Suspect cards.
- Investigation objectives.
- Enter Investigation CTA.

### Page 5: Evidence Room
- Evidence cards.
- Filters by evidence type.
- Suspect list or navigation panel.
- Timeline access.
- Evidence details.
- Accuse Culprit CTA.

### Page 6: Accusation
- Suspect selection.
- Optional reasoning field.
- Confirmation step.
- Submit button.

### Page 7: Final Reveal
- Correct or incorrect result.
- Actual culprit.
- Motive and incident explanation.
- Decisive clues.
- Red herring explanation.
- Play Again CTA.

## 11.3 Responsive Requirements

The application must:
- Work on current desktop and mobile browsers.
- Adapt the evidence room to narrow screens.
- Avoid horizontal overflow.
- Keep text readable.
- Provide accessible labels for interactive elements.
- Support keyboard navigation and visible focus indicators.

# 12. Security and Privacy

Mandatory requirements:
- Store Gemini API credentials in backend environment variables.
- Never expose secrets in frontend code or source control.
- Validate all incoming requests.
- Apply request size limits and rate limiting.
- Protect case and session access.
- Keep hidden solution data out of public responses, logs, and frontend state.
- Avoid unsafe HTML rendering of AI-generated content.
- Use secure configuration for CORS and production deployment.
- Do not send real personal information or real private communications to the AI provider as part of the fictional mystery workflow.

Use fictional characters and fictional communications by default.

# 13. Error Handling

The application must handle:
- Empty or invalid scenarios.
- Gemini API failures.
- Gemini rate limits.
- Invalid JSON output.
- Inconsistent generated cases.
- Database connection errors.
- Missing or invalid case IDs.
- Missing evidence IDs.
- Invalid suspect selections.
- Duplicate accusations.
- Missing media assets.
- Network interruptions.

Errors shown to users should be understandable and actionable.

Do not expose API keys, stack traces, internal prompts, or database details in user-facing error messages.

If generation fails, preserve the user's submitted scenario where possible so they can retry without entering it again.

# 14. Environment Configuration

Use a `.env` file for local development and an appropriate secret manager or environment configuration in production.

Required configuration:
- `MONGODB_URI`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `PORT`
- `CLIENT_URL`
- `NODE_ENV`

Include a `.env.example` containing placeholder values only.

Add `.env` to `.gitignore`.

Never commit actual credentials.

# 15. Suggested Project Structure

```text
ai-mystery-investigation/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── geminiService.js
│   │   │   ├── caseGenerationService.js
│   │   │   └── caseValidationService.js
│   │   ├── validators/
│   │   ├── utils/
│   │   └── app.js
│   └── package.json
├── specs/
│   ├── SPEC.md
│   ├── DATA_MODEL.md
│   ├── API_SPEC.md
│   └── ACCEPTANCE_TESTS.md
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

This is a suggested structure. The final implementation may adjust filenames while preserving the separation of responsibilities.

# 16. Testing Requirements

Test the following scenarios:

1. A valid scenario generates a playable investigation.
2. An empty scenario is rejected.
3. Invalid Gemini output does not create a playable broken case.
4. Every generated case has a valid culprit who appears in the suspect list.
5. Every referenced evidence ID exists.
6. The public case endpoint does not expose the culprit.
7. Evidence can be opened individually.
8. A valid accusation is evaluated correctly.
9. An invalid suspect ID is rejected.
10. A second final accusation is rejected.
11. The solution is revealed only after submission.
12. The final explanation references actual case evidence.
13. A case can be reopened using its authorized case ID.
14. Gemini or database failure produces a recoverable error.
15. The main workflow works on desktop and mobile.

# 17. Acceptance Criteria

The MVP is considered complete when all the following conditions are satisfied:

- [ ] A user can submit a scenario through the frontend.
- [ ] The backend can generate a structured mystery using Gemini.
- [ ] Generated cases are stored in MongoDB.
- [ ] Every playable case has one fixed culprit.
- [ ] Suspect profiles are coherent and accessible.
- [ ] The evidence room displays generated evidence.
- [ ] The difficulty-specific clue count is generated (5 Easy, 7 Medium, 9 Hard).
- [ ] Clue counts match the selected difficulty: Easy 5, Medium 7, Hard 9.
- [ ] Hint counts match the selected difficulty: Easy 2, Medium 3, Hard 3.
- [ ] Discovering a clue awards 5 points once per clue.
- [ ] Requesting a hint costs 10 points and enforces the difficulty limit.
- [ ] Difficulty-based accusation score is calculated on the server.
- [ ] Evidence items have unique IDs and consistent references.
- [ ] The user can inspect evidence and select a suspect.
- [ ] The user can submit one final accusation.
- [ ] The server evaluates the accusation.
- [ ] The actual culprit remains hidden before submission.
- [ ] The solution reveal explains the answer using existing evidence.
- [ ] Error states and retry behavior work.
- [ ] API credentials remain on the backend.
- [ ] The application is responsive and usable.
- [ ] Setup and run instructions are documented.
- [ ] Core validation and gameplay tests pass.

# 18. Codex Development Instructions

Codex must treat this specification as the authoritative reference for implementation.

## Required workflow

1. Read `specs/SPEC.md` and the related specification files before coding.
2. Inspect the existing repository before creating or replacing files.
3. Identify missing requirements and implementation dependencies.
4. Create a concise implementation plan.
5. Implement the application in small, testable stages.
6. Validate the frontend, backend, database models, and AI integration separately.
7. Run tests and fix failures before considering a feature complete.
8. Update documentation and specification files when an approved requirement changes.

## Implementation order

**Phase 1: Foundation**
- Initialize the MERN project.
- Configure environment variables.
- Connect MongoDB.
- Create the base application layout and routing.

**Phase 2: Core Interface**
- Build the landing page.
- Build the scenario submission page.
- Build case briefing, suspect, and evidence components.
- Add loading, empty, and error states.

**Phase 3: AI Backend**
- Implement Gemini integration.
- Define structured case schemas.
- Implement case generation and validation.
- Store generated cases securely.

**Phase 4: Gameplay**
- Implement the evidence room.
- Implement accusation submission.
- Implement protected solution reveal.
- Save investigation progress.

**Phase 5: Quality Assurance**
- Test case consistency.
- Test API security and hidden-solution protection.
- Test error handling.
- Verify responsive behavior.
- Complete setup documentation.

## Non-negotiable coding rules

- Do not hardcode the actual culprit into frontend code.
- Do not expose the hidden solution in public API responses.
- Do not use frontend-only logic as the authority for scoring.
- Do not create unrelated features outside the approved scope.
- Do not fabricate successful AI generation when the API call fails.
- Do not leave essential gameplay buttons nonfunctional.
- Do not replace Gemini with a different AI provider without approval.
- Do not silently change the database, API contracts, or core user journey.
- Do not mark untested functionality as complete.

If a requirement is ambiguous, choose the simplest implementation consistent with this specification and document the assumption. Ask for clarification when the ambiguity materially affects the product's behavior or architecture.

# 19. Definition of Done

A feature is complete only when:
- Its behavior matches this specification.
- Its frontend and backend integration works.
- Input validation is implemented.
- Relevant errors are handled.
- Sensitive data is protected.
- Appropriate tests pass.
- The feature can be run using the documented setup instructions.

A visually complete interface without working core functionality is not considered a finished MVP.

# 20. Confirmed MVP Decisions

## 20.1 Fictional Evidence and Media

The first version must use lightweight, fictional evidence representations.

- **Chat messages:** Render fictional WhatsApp-style conversations using custom UI components.
- **Images:** Use illustrative placeholders or suitable static assets. Clearly label them as fictional evidence.
- **Call recordings:** Display fictional call transcripts with participants, timestamps, and relevant dialogue. Actual audio generation and playback are not required.
- **Call records:** Display fictional call logs with timestamps, durations, and participants.
- **Documents and digital logs:** Render fictional emails, reports, login records, and activity logs using readable interface components.

All evidence must be generated or assembled from the case data. The interface must not claim that these items are genuine communications or actual records.

The evidence room must remain fully playable without any external media-generation service.

## 20.2 Guest Mode Without Registration

The MVP must not require users to register, log in, or provide an email address.

Users must be able to:
1. Open the website.
2. Submit a scenario.
3. Generate a mystery.
4. Investigate the case.
5. Submit an accusation.
6. View the final reveal.

### Session handling

- Create an anonymous investigation session when a user begins a case.
- Associate the case and gameplay progress with that session.
- Use a secure, opaque session identifier.
- Do not expose the hidden culprit or solution in the session data sent to the frontend.
- Allow users to reopen a case during the supported session lifetime.
- Handle expired sessions with a clear message and a way to start a new case.

### Persistence

Store cases and investigation progress in MongoDB, but do not associate them with registered user accounts.

For the MVP, case recovery is guaranteed only within the supported session lifetime. Cross-device access, permanent personal case libraries, and account-based synchronization are out of scope.

### Security

- Protect session identifiers from unauthorized access.
- Validate that the session is authorized to access the requested case.
- Enforce the one-final-accusation rule on the backend.
- Apply rate limits to case generation and other costly endpoints.
- Avoid storing unnecessary personal information.

## 20.3 Updated Acceptance Criteria

- [ ] The entire core workflow works without registration.
- [ ] Fictional chat evidence renders correctly.
- [ ] Image evidence works with placeholders or static assets.
- [ ] Call transcripts and call logs render correctly.
- [ ] The game does not depend on generated audio or images.
- [ ] Cases and progress persist for the supported session lifetime.
- [ ] Users cannot access another session's protected case data.
- [ ] The hidden solution remains confidential until accusation submission.

## 20.4 Difficulty, Hints, and Scoring

The project submission guide adds these fixed generation counts:

| Difficulty | Suspects | Clues | Hints | Correct accusation base |
| --- | ---: | ---: | ---: | ---: |
| Easy | 3 | 5 | 2 | 100 |
| Medium | 4 | 7 | 3 | 150 |
| Hard | 5 | 9 | 3 | 200 |

Clues are the case's evidence items. Opening an evidence detail discovers that clue and awards 5 points once. A requested hint is delivered progressively and costs 10 points; the number of hints is capped by difficulty. Final score is `max(0, base + 5 × discovered clues − 10 × hints used)`. The base is awarded only for a correct accusation. An incorrect accusation receives no base points but retains clue points less hint costs, with a minimum score of zero. The server is authoritative for discoveries, hint usage, and final score. Unrequested hints remain confidential and are never included in public case responses.

Updated API endpoints:

- `POST /api/cases/:caseId/clues/:clueId/discover`
- `POST /api/cases/:caseId/hints`
- `GET /api/cases/:caseId/result` (only for a completed, authorized session)

## 20.5 Deployment topology

- Deploy the Vite client to Vercel with output directory `client/dist`.
- Deploy the Express API to Render from `render.yaml`.
- Route Vercel `/api/*` calls through `api/[...path].js` to the Render API origin so session cookies remain first-party on the Vercel domain.
- Require a shared `PROXY_SECRET` on Render for all production API routes except `/api/health`; configure the same secret only in Vercel's server-side environment.
- Keep `MONGODB_URI` and `GEMINI_API_KEY` in Render's secret environment variables. Never place these values in Vercel's public client variables or commit them.
- Add Render's current outbound CIDR ranges to the MongoDB Atlas IP access list.


---

# Final Product Definition

**AI Mystery Investigation is a MERN-based web application powered by Google Gemini that converts user-provided fictional scenarios into interactive, evidence-driven mystery cases. Users examine AI-generated suspects, messages, images, call records, timelines, and other clues before accusing a culprit. The backend maintains the true solution, evaluates the accusation, and reveals an evidence-based explanation after submission.**

This document is the primary product specification and must remain the Single Source of Truth throughout development.
