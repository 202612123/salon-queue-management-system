# Development Reflection & Technical Challenges

**Project:** Trim & Tone Salon Queue Management System (ટ્રિમ અને ટોન સલૂન કતાર વ્યવસ્થાપન)  
**Developer:** Neha Tadvi (Student ID: 202612123)  
**Course:** MSc IT — Vibe Coding Lab Project  
**Institute:** DAU (DAIICT)  

---

### 1. Database Schema Divergence & Data Preservation
During the initial inspection of the uploaded repository, a critical architectural discrepancy was identified between the specification documents and the live database. The documentation frequently referenced a table named `tokens`, but querying the cloud Supabase PostgreSQL instance revealed that the active production table was named `queue_entries`, containing existing customer records with an integer `token_number` column. Attempting to drop or recreate tables would have violated the safety directive to never delete working database data. 

**Solution:** I implemented a resilient data-mapping adapter (`mapRowToToken`) in `src/lib/queueService.ts`. This layer translates database rows into strongly-typed `TokenItem` models, dynamically synthesizing formatted token numbers (`A-101` for online self-check-ins and `W-102` for reception walk-ins) while writing updates back to `queue_entries` without schema disruption.

### 2. Node.js 20 Headless WebSocket Transport in Vitest
When executing automated unit tests via Vitest in the Node.js 20 environment, the Supabase client threw an immediate fatal error: `Error: Node.js 20 detected without native WebSocket support`. While modern browsers possess native `window.WebSocket`, Node 20's WebSocket implementation is experimental and caused tests to fail before execution.

**Solution:** In `src/lib/supabase.ts`, I introduced an environment-aware transport configuration. When running server-side or in the test runner (`typeof window === 'undefined'`), the client dynamically injects the `ws` library transport into Supabase Realtime options, ensuring seamless test execution and server-side rendering while letting browser clients leverage native WebSockets.

### 3. Grace Period Reset Bug & Timestamp Immutability
A common flaw in queue systems is relying on in-memory JavaScript `setInterval` timers that restart back to 10:00 every time a user refreshes their mobile browser or unlocks their phone.

**Solution:** I bound the 10-minute grace period computation directly to the database `called_at` timestamp using the formula:
$$\text{Remaining Seconds} = \max\left(0, 600 - \left\lfloor\frac{\text{Date.now()} - \text{called\_at}}{1000}\right\rfloor\right)$$
This deterministic approach guarantees that whether a customer reloads their mobile status screen or the salon TV display reconnects, the grace timer reflects the exact ground truth with zero drift.

### 4. Atomic Concurrency & Barber Preference Locking
Handling race conditions where two stylists tap "Call Next" simultaneously required safeguards to prevent double-summoning. Furthermore, business rule TC-06 mandated that customers requesting a specific barber cannot be reassigned to another stylist.

**Solution:** I implemented optimistic concurrency in `callNextCustomer` that updates status with an atomic condition check (`status = 'WAITING'`). If another barber claims the customer in the same millisecond, the service re-fetches and selects the next earliest FIFO client. For barber preference locking, tokens with a specific stylist set `isLockedToBarber: true`, disabling reassignment controls on the reception dashboard with an informative alert.

### 5. Reactive Waiting-Time Recalculation
Implementing the standard formula $\frac{\text{Ahead Duration}}{\text{Working Barbers}}$ required live responsiveness whenever a barber toggled a 15-minute chai break. By modeling barber break states in reactive Zustand storage and real-time event subscriptions, any change to a stylist's duty status instantly recalculates estimated wait times across the Home, Join, Status, and TV screens.
