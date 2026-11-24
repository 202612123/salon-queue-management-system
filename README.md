# Trim & Tone Salon Queue Management System (ટ્રિમ અને ટોન સલૂન કતાર વ્યવસ્થાપન)

> **Live Production Demo:** https://salon-queue-management-system-9s72wa9q0.vercel.app/  
> **Academic Project:** MSc IT — Vibe Coding Lab Project  
> **Developer:** Neha Tadvi (Student ID: 202612123)  
> **Institute:** DAU (DAIICT) — Dhirubhai Ambani University  
> **Theme:** Boutique Cherry & Cream Aesthetic (`#702D3D` Burgundy & `#FFF8F2` Cream)  
> **Bilingual Support:** Full English & Gujarati (ગુજરાતી) reactive toggle across all screens  

---

## 1. Project Overview

**Trim & Tone** is a real-time, mobile-first Salon Queue Management System built for grooming studios and barber salons. It digitizes the physical waiting room, prevents walk-aways, ensures fairness through strict FIFO scheduling, and synchronizes state near-real-time across customer mobile phones, receptionist terminals, mirror station tablets, and lounge televisions.

### Complete 7-Screen Architecture:
1. **Home / Welcome Screen (`/`)**: Real-time salon health glance (clients waiting, estimated wait time, stylists on duty), salon operating status, 30-minute online queue cutoff notice, and token lookup.
2. **Customer Join Queue Screen (`/join`)**: Self-check-in form with customer name, 10-digit mobile number, multi-service selection with ₹ INR pricing & durations, and stylist preference ("Any Available" vs. locked preferred barber).
3. **Customer "My Status" Screen (`/status/[tokenId]`)**: Real-time personal token tracker showing assigned token ID (e.g. `A-101`), status badge, count of people ahead, dynamic estimated wait time, and live 10-minute grace timer countdown when called.
4. **Reception Dashboard (`/reception`)**: Front-desk command center with fast walk-in entry (< 15 seconds), live FIFO queue table with status filters (`ALL`, `WAITING`, `CALLED`, `IN_SERVICE`, `DONE`), chair station status matrix, reassign barber modal (enforcing specific barber immutability), and no-show / cancel controls.
5. **Barber / Stylist Workstation View (`/barber`)**: Distraction-free station view for mirror tablets featuring stylist selection, tactile 64px tap buttons for "Call Next Customer" (atomic FIFO dispatch), "Start Service", and "Mark Done" (service completion), active service stopwatch, 10-minute grace timer, break management (`Available`, `15m Chai Break`, `30m Lunch Break`, `Off Duty`), and upcoming eligible clients queue.
6. **Waiting Lounge Smart TV Display (`/tv`)**: High-contrast widescreen 16:9 lounge TV display featuring live digital clock, "NOW SERVING" chair matrix with pulsing callout ring and grace countdown, "UP NEXT" vertical FIFO queue, audio chime announcement, and bottom ticker with salon Wi-Fi credentials.
7. **Owner Settings & Analytics (`/settings`)**: Back-office dashboard with daily analytics metrics (Total Served, Average Wait Time, No-Shows/Cancelled, Gross Revenue ₹), barber staff roster manager, editable service menu & pricing, and queue operational rules (salon open/close toggle, 30m cutoff, 10m grace period).

---

## 2. Core Business Rules Implemented

All business rules defined in `docs/03-flows-rules.md` are strictly implemented and verified by automated unit tests:

1. **Strict FIFO Queue Ordering:** Customer priority is strictly determined by `created_at ASC`.
2. **Barber Preference & Immutability:** Customers who select a specific stylist (e.g. Ramesh) are locked to that stylist (`is_locked_to_barber: true`). Receptionists cannot reassign them to another barber. Customers selecting "Any Available Barber" receive the fastest eligible turn and can be reassigned if needed.
3. **Single Active Phone Number Constraint:** A mobile number can hold only one active queue token (`WAITING`, `CALLED`, `IN_SERVICE`). Duplicate submissions are blocked with a clear warning. Returning customers after `DONE`, `CANCELLED`, or `NO_SHOW` are permitted to re-enter.
4. **Returning No-Shows Join at Tail:** If a customer returns after being marked `NO_SHOW`, they must join at the end of the queue with a fresh token.
5. **Database-Driven 10-Minute Grace Window:** Calculated directly from `called_at` timestamp:
   $$\text{Remaining Seconds} = \max\left(0, 600 - (\text{Current Time} - \text{called\_at})\right)$$
   Survives page reloads, browser refreshes, and phone screen sleep.
6. **Standard Wait-Time Formula:**
   $$\text{Estimated Wait Time} = \frac{\text{Total Estimated Service Duration of Customers Ahead}}{\text{Number of Working Barbers}}$$
   Barbers on chai break (`ON_BREAK`) or off duty (`OFF_DUTY`) are excluded from the denominator.
7. **30-Minute Online Cutoff:** Online queue registration (`/join`) automatically closes 30 minutes before salon closing (e.g., 8:30 PM for 9:00 PM close). Walk-ins at reception desk (`/reception`) remain open until closing.
8. **One Customer Per Barber:** A barber cannot summon another customer while currently serving or calling a client.

---

## 3. Technology Stack

- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript 5.x (Strict Type Safety)
- **Styling:** Tailwind CSS 3.4 (Cherry & Cream Luxury Boutique Theme)
- **Icons:** Lucide React (`lucide-react`)
- **State Management:** Zustand 4.5 with LocalStorage persistence
- **Database & Realtime:** Supabase Cloud PostgreSQL & WebSockets
- **Audio:** Web Audio API (Synthesized boutique dual chime: C5 523.25 Hz & E5 659.25 Hz)
- **Localization:** Custom JSON bilingual dictionary (`en` & `gu`)
- **Test Runner:** Vitest 1.x / 4.x

---

## 4. Local Setup & Installation

### Prerequisites:
- Node.js 18+ (tested on Node v20.20.2)
- npm 9+

### 1. Clone or Extract the Project:
```bash
cd salon-queue-system
```

### 2. Install Dependencies:
```bash
npm install
```

### 3. Environment Configuration:
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
*(The application includes resilient fallback mechanisms to ensure 100% operation even during network interruptions or offline testing).*

### 4. Run Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Production Build:
```bash
npm run build
npm start
```

### 6. Run Automated Test Suite:
```bash
npm test
```
All 7 queue business logic and concurrency tests will execute via Vitest.

---

## 5. Deployment Guide (GitHub & Vercel)

### Step A: Push to GitHub
```bash
git init
git add .
git commit -m "Complete Salon Queue Management System v1.3.0"
git branch -M main
git remote add origin https://github.com/<your-username>/salon-queue-system.git
git push -u origin main
```

### Step B: Deploy on Vercel
1. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Select your `salon-queue-system` GitHub repository.
3. Framework Preset: **Next.js** (auto-detected).
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Key
5. Click **Deploy**. Vercel will build and deploy the production site in under 60 seconds.

---

## 6. Academic Project Credits

Every screen includes the required academic footer:
```
Developed by: Neha Tadvi  •  Student ID: 202612123
Course: MSc IT            •  Institute: DAU (DAIICT)
```
