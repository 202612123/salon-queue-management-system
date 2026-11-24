# Prompts Log — Salon Queue Management System

**Project Name:** Trim & Tone Salon Queue Management System (ટ્રિમ અને ટોન સલૂન કતાર વ્યવસ્થાપન)  
**Developer:** Neha Tadvi (Student ID: 202612123)  
**Course:** MSc IT — Vibe Coding Lab Project  
**Institute:** DAU (DAIICT)  

---

## Chronological Prompts

### Prompt 1 — Project Initialization & Specification Analysis
```
I have uploaded my existing Salon Queue Management System project.
I want you to COMPLETE my existing project according to the original requirements. Do not rebuild it from scratch.

STEP 1 — UNDERSTAND THE PROJECT
- Read AGENTS.md and every file inside docs/.
- Inspect the entire existing codebase.
- Understand the current technology stack, database and working features.
- Compare the implementation with the original requirements.

STEP 2 — COMPLETE ALL 7 SCREENS
1. Home
2. Join Queue
3. My Status
4. Reception Dashboard
5. Barber View
6. Waiting Area TV Display
7. Owner Settings

STEP 3 — IMPLEMENT ALL REQUIRED FUNCTIONALITY
Ensure that:
- Customers can join the queue using their phones.
- Token generation, queue position and estimated waiting time work correctly.
- Customers can see their live status.
- Receptionists can add walk-ins, call next, cancel and mark no-shows.
- Barbers can start and finish customers and manage their break status.
- TV display updates automatically.
- Owner can manage services, prices, timings, barbers and queue opening/closing.
- English and Gujarati language switching works on every screen.

Follow ALL business rules in docs/03-flows-rules.md, including FIFO, barber preferences, duplicate phone prevention, no-show rejoining at the end with a new token, closing online joining 30 minutes before closing, and one customer per barber at a time.

STEP 4 — FIX AND TEST
- Preserve existing working functionality.
- Fix all incomplete or broken features.
- Ensure all buttons and forms actually work.
- Verify database operations and synchronization between screens.
- Check mobile, tablet and TV layouts.
- Run the production build and available tests.
- Fix errors before declaring the project complete.
- Do not claim anything works unless you have tested it.

STEP 5 — DESIGN
Keep my existing theme, colours, layout and overall design. Improve only what is necessary for usability and responsiveness. Do not redesign the entire application.

STEP 6 — SUBMISSION PREPARATION
Prepare:
- Updated README.md with setup instructions and a live demo link placeholder at the top.
- prompts.md containing the prompts used, in order.
- A 3-minute demo video checklist.
- A half-page reflection draft based on actual development mistakes and fixes.
- Clear instructions for GitHub and Vercel deployment.

STEP 7 — IMPORTANT SAFETY
- Never delete existing working code or database data.
- Never expose .env.local, API keys, passwords or credentials.
- Never replace the existing database unnecessarily.
- Do not add features outside the original requirements.
- Do not create fake functionality or fake success messages.
- If manual credentials or actions are required, clearly tell me.

FINAL DELIVERY
At the end, provide:
1. Completed functionality summary.
2. Exact list of changed files.
3. Build and test results.
4. Any remaining issues or manual actions.
5. Updated complete project files in a downloadable ZIP.
```

### Prompt 2 — Database Investigation & Architecture Alignment
```
Inspect existing Supabase database tables to discover active schema, permissions, and row-level structures. Identify table naming discrepancies (e.g. queue_entries vs tokens), column definitions (token_number, customer_name, phone_number, service_ids, total_duration_minutes, total_price, barber_preference, assigned_barber_id, chair_number, status, called_at, started_at, done_at), and test public access permissions.
```

### Prompt 3 — Core Service & State Layer Implementation
```
Create src/lib/queueService.ts to encapsulate all queue business logic:
- Dynamic estimated wait time calculation using the standard formula: (Total Duration Ahead) / (Working Barbers).
- 10-Minute grace period computation: max(0, 600 - (Now - called_at)).
- 30-minute online queue cutoff validation before salon closing.
- Single active phone token verification.
- Atomic FIFO Call Next customer dispatch with barber preference matching.
- Service start, completion (status DONE), cancellation, no-show marking, and barber reassignment with preference immutability locks.
- Real-time Supabase WebSockets change subscription and synthesized Web Audio API dual-chime announcement.
- Update Zustand store (src/lib/store.ts) with localStorage persistence for barbers, services, settings, and activeTokenId.
```

### Prompt 4 — All 7 Screens Completion & Bilingual Localization
```
Complete all 7 screens with real interactive functionality, live data binding, and comprehensive English and Gujarati translations:
1. Home: Real-time wait time, customer count, barber count, and active token resumption.
2. Join Queue: Input validation, dynamic wait preview, 30m cutoff enforcement, barber preference locking.
3. My Status: Real-time status sync, live 10-minute grace timer countdown, wait position, cancellation, and re-join flow.
4. Reception: Fast walk-in entry (< 15s), live FIFO queue table, status filters, chair matrix, barber reassignment modal.
5. Barber View: Stylist selector, 64px tap targets for Call Next, Start Service, Mark Done, active service stopwatch, chai/lunch break toggles.
6. TV Display: High-contrast 16:9 widescreen layout, live clock, Now Serving chair stations with pulsing rings, Up Next queue, audio chime, ticker.
7. Settings: Real daily metrics (served, avg wait time, no-shows, revenue), staff roster, editable service pricing/duration, queue operational rules.
```

### Prompt 5 — Comprehensive Testing, Production Build & Packaging
```
Write unit test suite (src/tests/queue.test.ts) covering test cases TC-01 to TC-12.
Run vitest test suite and Next.js 14 production build (next build).
Generate updated submission package, README.md, reflection.md, demo-video-checklist.md, and downloadable project ZIP.
```
