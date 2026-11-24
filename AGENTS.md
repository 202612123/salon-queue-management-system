# AGENTS.md — AI Developer & Contributor Guide

**Project Name:** Trim & Tone Salon Queue Management System (ટ્રિમ અને ટોન સલૂન કતાર વ્યવસ્થાપન)  
**Academic Context:** MSc IT — Vibe Coding Lab Project  
**Repository Root:** `/home/neha/.gemini/antigravity/scratch/salon-queue-system`  
**Current Milestone:** Phase 1 — Specification & Architecture Documentation (Pre-Implementation)  
**Version:** 1.3.0 (Production Architecture, Atomic RPC & Academic Credits)  

---

## 1. Project Overview & Student Academic Credits

This repository contains the architecture, specifications, and upcoming implementation for a real-time, mobile-first **Salon Queue Management System** tailored for Indian barber salons and grooming studios (specifically optimized for urban centres in Gujarat such as Ahmedabad, Surat, and Vadodara).

### 1.1 Student Developer Profile
- **Developer Name:** Neha Tadvi
- **Student ID:** 202612123
- **Course:** MSc IT
- **Institute:** DAU (DAIICT) — Dhirubhai Ambani University (formerly DA-IICT)

### 1.2 Universal "Project Credits" UI Requirement
Every single screen (all 7 screens) of the application MUST incorporate a small, elegant **Project Credits** footer displaying the student details:
```
Developed by: Neha Tadvi
Student ID: 202612123
Course: MSc IT
Institute: DAU (DAIICT)
```
- **Styling Rules:**
  - Follow the boutique Cherry & Cream theme (Warm Cream background, Blush Pink borders `#E8C7CC`, Deep Cherry developer name `#702D3D`, Dark Text `#38252B`).
  - Fully responsive and clearly readable on both desktop and mobile viewports.
  - Positioned subtly at the bottom of each view to avoid interfering with salon operational flows.

---

## 2. Core Documentation Index

All developers, subagents, and contributors MUST study and adhere to the three foundational specification documents located in the `/docs` folder before proposing or writing code:

1. **[docs/01-brief.md](file:///home/neha/.gemini/antigravity/scratch/salon-queue-system/docs/01-brief.md)**
   - Problem definition, user personas, core 8 features, anti-requirements, and Cherry & Cream boutique design system.
2. **[docs/02-screens.md](file:///home/neha/.gemini/antigravity/scratch/salon-queue-system/docs/02-screens.md)**
   - UI specifications, buttons, layout, and bilingual Gujarati/English labels across all 7 screens.
   - Incorporates the universal Project Credits footer across all views.
3. **[docs/03-flows-rules.md](file:///home/neha/.gemini/antigravity/scratch/salon-queue-system/docs/03-flows-rules.md)**
   - Queue state machine with 6 canonical statuses, atomic `call_next_customer` RPC, database `called_at` grace period calculation, and 12 end-to-end test cases.

---

## 3. Technology Stack Specification

The technology stack is strictly standardized across the entire application:

| Layer | Standardized Technology Choice | Justification & Architectural Role |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14 (App Router)** | Provides native file-system routing matching all 7 required screen endpoints (`/`, `/join`, `/status/[tokenId]`, `/reception`, `/barber`, `/tv`, `/owner`), optimized SSR/Client Component split, and instant Vercel deployment. |
| **Language** | **TypeScript 5.x (Strict Mode)** | Enforces strict compile-time types for tokens, queue state machine transitions, and billing models. |
| **Styling & CSS** | **Tailwind CSS 3.4+** | Custom theme extensions for Boutique Cherry & Cream color tokens and responsive utility classes. |
| **Component Icons** | **Lucide React (`lucide-react`)** | Lightweight, modern icon set for salon chairs, scissors, timers, clocks, and alerts. |
| **Cloud Database** | **Supabase (Cloud PostgreSQL)** | Managed relational database providing durable persistence, ACID transactions, and native SQL constraints (such as partial unique indices on active phone numbers). |
| **Cross-Device Sync** | **Supabase Realtime (WebSockets)** | Near-real-time synchronization (typically sub-second) delivering PostgreSQL Change Data Capture (CDC) events to all subscribed devices over secure WebSockets (`wss://`). |
| **Local Client State** | **Zustand 4.x** | Client-side reactive state cache synchronizing Supabase realtime payloads into React components without unnecessary re-renders. |
| **Localization (i18n)** | **Custom JSON Dictionaries** | Native bilingual translation module supporting English (`en`) and Gujarati (`gu`) with instant reactive switching and zero layout shift. |
| **Test Runner** | **Vitest 1.x** | Fast unit test execution for queue algorithms, wait-time calculations, and concurrency rules. |

---

## 4. Final Architecture & Database Security Rules

### 4.1 Canonical Database Status Names
All screens, queries, Zustand stores, and database rows MUST strictly use the following six (6) canonical status strings. Legacy names like `COMPLETED` are deprecated:
- **`WAITING`**: Customer is queued in FIFO order awaiting a chair.
- **`CALLED`**: Customer has been summoned to a chair; `called_at` timestamp is set; 10-minute grace countdown active.
- **`IN_SERVICE`**: Customer is seated in the chair; service timer active.
- **`DONE`**: Service is successfully finished; chair is liberated (replaces legacy `COMPLETED`).
- **`CANCELLED`**: Customer voluntarily cancelled their token from mobile before service started.
- **`NO_SHOW`**: Customer failed to arrive within the 10-minute grace window calculated from `called_at`.

### 4.2 Near-Real-Time Synchronization (Supabase WebSockets)
- Describe Supabase Realtime strictly as **near-real-time synchronization** (typically sub-second, resilient to network fluctuations, cellular handover, and device sleep states).
- **Do NOT guarantee delivery under 100ms** in documentation or UI promises.
- Reconnection logic: The Supabase client automatically reconnects and re-fetches the latest queue snapshot if mobile network connectivity blips.

### 4.3 Database Security & Row Level Security (RLS) Policies
- **Strict Key Separation:** The Supabase `service_role` key must **NEVER** be bundled, imported, or exposed in client-side frontend code. Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is utilized on client devices.
- **RLS Policies (`supabase/schema.sql`):**
  - `tokens`:
    - `SELECT`: Public read access (anon) for active tokens.
    - `INSERT`: Public insert allowed only with `status = 'WAITING'` and initial timestamp fields null.
    - `UPDATE`: Public update restricted strictly to self-cancellation (`status = 'WAITING' -> 'CANCELLED'`). Staff operations (call, seat, done, no-show) are performed via secure stored procedures or authenticated staff roles.
  - `barbers`, `services`, `salon_settings`: Public `SELECT` allowed; modifications restricted.

### 4.4 Atomic "Call Next" Stored Procedure (Concurrency Protection)
To ensure two staff devices never summon the same customer concurrently, the "Call Next" action MUST execute the database RPC function `call_next_customer`:
```sql
CREATE OR REPLACE FUNCTION call_next_customer(p_barber_id TEXT)
RETURNS SETOF tokens AS $$
DECLARE
  v_token_id UUID;
BEGIN
  -- Atomically select and lock the earliest eligible FIFO customer
  SELECT id INTO v_token_id
  FROM tokens
  WHERE status = 'WAITING'
    AND (barber_preference = 'ANY' OR barber_preference = p_barber_id)
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- Atomically transition token to CALLED with current timestamp
  IF v_token_id IS NOT NULL THEN
    RETURN QUERY
    UPDATE tokens
    SET 
      status = 'CALLED',
      assigned_barber_id = p_barber_id,
      called_at = NOW()
    WHERE id = v_token_id
    RETURNING *;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.5 Database-Driven 10-Minute Grace Period
- Whenever a token transitions to `CALLED`, the database writes `called_at = NOW()`.
- The 10-minute grace period countdown is computed dynamically from this database timestamp:
  $$\text{Remaining Seconds} = \max\left(0, 600 - (\text{Current Time} - \text{called\_at})\right)$$
- **Guarantees:** Survives browser refreshes, smartphone screen locks, and device restarts with 100% precision.

---

## 5. Mandatory Business Rules & Operational Safeguards

1. **Strict FIFO Queue Ordering:** Strict First-In, First-Out sequence determined by `created_at ASC`.
2. **Earliest Eligible Dispatch:** When calling for a specific barber, select the earliest FIFO customer who chose that barber or chose "Any Available".
3. **Specific Barber Immutability:** Customers who requested a specific barber cannot be reassigned to another barber (`is_locked_to_barber: true`).
4. **Standard Wait-Time Formula:**
   $$\text{Estimated Wait Time} = \frac{\text{Total Estimated Service Duration of Customers Ahead}}{\text{Number of Working Barbers}}$$
   (Excludes on-break and off-duty barbers from denominator).
5. **30-Minute Online Cutoff:** Online queue registration (`/join`) closes 30 minutes before salon closing (at 8:30 PM). Walk-ins at reception remain open until 9:00 PM closing.
6. **Single Active Token Per Phone:** A mobile number can hold only one active queue entry (`WAITING`, `CALLED`, `IN_SERVICE`), enforced by PostgreSQL partial unique index:
   ```sql
   CREATE UNIQUE INDEX unique_active_phone ON tokens (phone_number) 
   WHERE status IN ('WAITING', 'CALLED', 'IN_SERVICE');
   ```
7. **Returning No-Shows Join at End:** If a customer returns after being marked `NO_SHOW`, they must join at the end of the queue as a fresh entry.

---

## 6. UI Guidelines & Design System Tokens

### 6.1 Color Tokens & Tailwind Configuration (Cherry & Cream)
```javascript
// tailwind.config.ts theme extension
colors: {
  cherry: {
    DEFAULT: '#702D3D', // Deep Cherry Burgundy (Headings & Primary Buttons)
    hover: '#5B2431',
    light: '#8B384B',
    dark: '#481D27',
  },
  blush: {
    DEFAULT: '#E8C7CC', // Blush Pink (Cards & Subtle Accents)
    light: '#FAF1F3',
    card: '#F9ECEE',
    border: '#DCB5BB',
  },
  cream: {
    DEFAULT: '#FFF8F2', // Warm Cream (Canvas Background)
    surface: '#FFFFFF', // Clean White Cards
    border: '#EEDFD5',
  },
  rose: {
    DEFAULT: '#B77A85', // Dusty Rose (Icons & Secondary Details)
    light: '#CF99A3',
  },
  darkText: {
    DEFAULT: '#38252B', // Dark Text (Primary Typography)
    muted: '#684E55',
    subtle: '#8C7077',
  },
  status: {
    waiting: '#D97706',  // Warm Amber
    called: '#702D3D',   // Deep Cherry (Grace Active)
    serving: '#15803D',  // Deep Emerald
    done: '#702D3D',     // Cherry Burgundy
    cancelled: '#BE123C',// Crimson Rose
    noshow: '#8C7077',   // Muted Slate Rose
  }
}
```

### 6.2 Mobile-First & Ergonomic Standards
- Design mobile-first at 375px viewport with thumb-friendly touch zones (minimum 48×48px).
- The Waiting Lounge TV display (`/tv`) is landscape-first (1920×1080) with 96px+ typography for long-distance viewing.
- English typography uses clean modern sans-serif (`Inter` or `Outfit`); Gujarati typography uses `Noto Sans Gujarati` with matching font weights.

---

## 7. Pre-Implementation Directives

- **CRITICAL:** Do NOT write application source code, components, or API endpoints until explicitly instructed by the user in subsequent turns.
- Keep all documentation files perfectly synchronized with these final architecture decisions.
