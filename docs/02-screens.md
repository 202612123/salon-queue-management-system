# Salon Queue Management System — Screen Specifications

This document provides detailed design and interface specifications for all seven (7) core screens of the **Trim & Tone Salon Queue Management System** (ટ્રિમ અને ટોન સલૂન કતાર વ્યવસ્થાપન).

Every screen follows a **mobile-first**, boutique **Cherry & Cream** visual theme, comprehensive **English and Gujarati** bilingual support, and incorporates an elegant **Project Credits** footer honoring the academic project requirements.

---

## Universal Design Elements (Present on All Screens)

### 1. Canonical Database Statuses
All screens, status badges, filters, and queries use the six (6) standardized database statuses:
- **`WAITING`** (Warm Amber `#D97706` / Amber Badge) — In queue awaiting barber.
- **`CALLED`** (Deep Cherry Burgundy `#702D3D` / Blush Badge) — Summoned to chair; 10-minute grace timer active.
- **`IN_SERVICE`** (Deep Emerald `#15803D` / Emerald Badge) — Client actively being groomed in chair.
- **`DONE`** (Deep Cherry Burgundy `#702D3D` / Soft Rose Badge) — Service finished; chair liberated (replaces legacy `COMPLETED`).
- **`CANCELLED`** (Crimson Rose `#BE123C` / Rose Badge) — Self-cancelled before service began.
- **`NO_SHOW`** (Muted Slate Rose `#8C7077`) — Client did not appear within the 10-minute grace window.

### 2. Universal Project Credits Footer
Every screen includes a small, elegant academic footer designed to honor the developer credits without interfering with core salon operations:
```
┌────────────────────────────────────────────────────────────────────────┐
│  Developed by: Neha Tadvi  •  Student ID: 202612123                    │
│  Course: MSc IT            •  Institute: DAU (DAIICT)                  │
└────────────────────────────────────────────────────────────────────────┘
```
- **Appearance:** Crisp white/cream surface, delicate blush pink border (`#E8C7CC`), deep cherry typography (`#702D3D`), and dark text (`#38252B`).
- **Responsiveness:** Single-line flex container on desktop; stacked 2-column or centered block on mobile.
- **Placement:** Positioned at the bottom of the viewport/scroll flow, below main action cards.

---

## Screen Catalog Overview

1. **Screen 1:** Home / Welcome Screen (`/`)
2. **Screen 2:** Customer Join Queue Screen (`/join`)
3. **Screen 3:** Customer "My Status" Screen (`/status/[tokenId]`)
4. **Screen 4:** Receptionist Queue Controller Dashboard (`/reception`)
5. **Screen 5:** Barber / Stylist Workstation View (`/barber`)
6. **Screen 6:** Waiting Lounge Smart TV Display (`/tv`)
7. **Screen 7:** Owner Management & Settings Screen (`/owner` or `/settings`)

---

## Screen 1: Home / Welcome Screen (`/`)

### 1.1 Purpose & Target Users
- **Purpose:** Public landing page serving as the digital entry portal to the boutique salon. Enables customers to instantly join the virtual queue, look up an active token, or view overall salon operating status.
- **Target Users:** First-time walk-in visitors, returning clients standing near the salon entrance, and lounge guests checking general wait times.

### 1.2 Layout & Visual Appearance
- **Theme:** Warm Cream canvas (`#FFF8F2`) with elegant Deep Cherry Burgundy headings (`#702D3D`) and soft Blush Pink highlights (`#E8C7CC`).
- **Header:** Salon logo badge (*Trim & Tone Boutique* / *ટ્રિમ અને ટોન બુટિક*), current operating status pill (`Open Now` / `હવે ખુલ્લું છે`), and prominent top-right Language Toggle pill (`EN | ગુજરાતી`).
- **Hero Card:** Clean white elevated card (`#FFFFFF`) with cream border (`#EEDFD5`) and soft cherry shadow (`shadow-cherry`), displaying live salon health metrics:
  - Current Queue Length: e.g., "6 Customers Waiting" ("૬ ગ્રાહકો પ્રતીક્ષામાં છે").
  - Current Estimated Wait: Calculated via $\frac{\text{Ahead Duration}}{\text{Working Barbers}}$, e.g., "~25 Mins Wait" ("~૨૫ મિનિટ પ્રતીક્ષા સમય").
  - Active Stylists: e.g., "4 Barbers On Duty" ("૪ વાળંદ સેવામાં છે").
- **Action CTAs:** Thumb-friendly Deep Cherry buttons (`#702D3D` hover `#5B2431`) with crisp white text.
- **Operating Hours Notice:** Mentions daily timings (9:00 AM – 9:00 PM) and highlights that **Online queue registration closes 30 minutes before salon closing (at 8:30 PM)**. Walk-ins at reception remain open until 9:00 PM.
- **Footer:** Project Credits card and links to "Lounge TV Screen Preview" and "Staff Login Access".

### 1.3 UI Elements & Bilingual Labels
| UI Component | English Label | Gujarati Label (ગુજરાતી) | Description |
| :--- | :--- | :--- | :--- |
| **Header Status** | `Open Today: 9:00 AM - 9:00 PM` | `આજે ખુલ્લું: સવારે ૯:૦૦ થી રાત્રે ૯:૦૦` | Real-time salon opening hours |
| **Online Cutoff Pill** | `Online Queue Closes at 8:30 PM` | `ઓનલાઇન કતાર રાત્રે ૮:૩૦ વાગ્યે બંધ થશે` | 30-min online cutoff notice |
| **Language Switcher** | `English / ગુજરાતી` | `ગુજરાતી / English` | Single-tap switch updating all text strings |
| **Primary CTA Button** | `Join Queue Now` | `કતારમાં જોડાઓ` | Bold cherry button leading to `/join` |
| **Secondary CTA Button**| `Track Existing Token` | `મારું ટોકન સ્ટેટસ જુઓ` | Outlined card with phone/token lookup modal |
| **Project Credits** | `Developed by: Neha Tadvi (202612123)` | `ડેવલપર: નેહા તડવી (202612123)` | Academic credits footer |

### 1.4 Buttons & Interactive Functionality
1. **`Join Queue Now` (કતારમાં જોડાઓ):** Navigates to Screen 2 (`/join`) if current time is before the 30-minute closing cutoff (before 8:30 PM). If within 30 minutes of closing, displays a notice directing the customer to register as a walk-in at reception.
2. **`Track Existing Token` (મારું ટોકન સ્ટેટસ જુઓ):** Opens a modal asking for Token Number (e.g., `A-102`) or 10-digit Mobile Number. On submission, redirects to Screen 3 (`/status/[tokenId]`).
3. **`Language Toggle` (EN / GU):** Persists selection in `localStorage` and immediately updates application UI strings.
4. **`Staff & TV Portal Links`:** Footer links providing navigation to `/tv`, `/reception`, and `/barber`.

### 1.5 Responsiveness
- **Mobile (360px - 480px):** Stacked vertical layout, sticky bottom action bar containing the primary `Join Queue` CTA.
- **Tablet (768px - 1024px):** Centered card container (max-width 560px), generous whitespace, elevated tactile cards.
- **Desktop & TV (1200px+):** Centered hero view with a live side-by-side preview of currently serving chairs.

---

## Screen 2: Customer Join Queue Screen (`/join`)

### 1.1 Purpose & Target Users
- **Purpose:** Self-check-in form allowing customers to enter contact details, select services, choose a stylist preference, and receive a digital queue token.
- **Target Users:** Walk-in customers scanning the entrance QR code on their smartphone before the 30-minute closing cutoff.

### 1.2 Layout & Visual Appearance
- **Structure:** Multi-step single-scroll form with clear step indicators:
  - Step 1: Customer Identification (Name & 10-Digit Mobile Number).
  - Step 2: Service Selection (Category chips & service cards with ₹ prices and duration).
  - Step 3: Stylist Preference (Any Available vs. Specific Barber).
  - Step 4: Summary Card & Instant Wait Time Preview.
  - Footer: Project Credits card.
- **Visuals:** Warm Cream canvas with clean white cards, soft blush pink borders, and cherry accent buttons.

### 1.3 UI Elements & Service Catalog
Each service card displays the service name, duration in minutes, and price in Indian Rupees (₹):
- **Men's Classic Haircut (હેરકટ):** ₹250 (25 mins)
- **Beard Trim & Precision Styling (દાઢી ટ્રીમ અને શેપિંગ):** ₹150 (15 mins)
- **Royal Shave with Hot Towel (રોયલ હોટ ટુવાલ શેવ):** ₹180 (20 mins)
- **Relaxing Ayurvedic Head Massage (માથાની માલિશ - ચંપી):** ₹300 (20 mins)
- **D-Tan Face Glow Pack (ડી-ટેન ફેશિયલ પેક):** ₹600 (35 mins)
- **Hair Color & Beard Camouflage (હેર કલર / ડાઈ):** ₹800 (45 mins)

### 1.4 Buttons & Interactive Functionality
1. **Service Selection Chips:** Multi-select toggle. Updates duration, bill, and instant estimated wait time via $\frac{\text{Ahead Duration}}{\text{Working Barbers}}$.
2. **Barber Selection Radio/Pill Group:**
   - Option A: *Any Available Barber (Fastest FIFO)* (*કોઈપણ ઉપલબ્ધ વાળંદ*) — Recommended default.
   - Option B: *Select Preferred Stylist* (Dropdown: Ramesh, Amit, Jignesh, Nilesh). A badge notes: *"You selected a specific barber. Reassignment to another barber is not permitted."*
3. **`Confirm & Get Token` (ટોકન મેળવો) Button:**
   - Enforces Single Active Phone Rule.
   - Inserts token record in Supabase with status `WAITING`, caches token ID in `localStorage`, and navigates to Screen 3 (`/status/[tokenId]`).

---

## Screen 3: Customer "My Status" Screen (`/status/[tokenId]`)

### 1.1 Purpose & Target Users
- **Purpose:** Personal live dashboard for the customer to track real-time position in line, estimated wait time, assigned chair, and 10-minute grace period when called.
- **Target Users:** Waiting customers seated in the lounge or waiting nearby.

### 1.2 Layout & Visual Appearance
- **Header:** Salon branding, language toggle, and connectivity badge (`● Near-Real-Time Sync Active`).
- **Token Hero Display:**
  - Oversized Token Identifier: e.g., **A-104** (in 56px Deep Cherry font).
  - Status Badge with pulsating status indicator:
    - `Waiting in Queue` (`WAITING` — પીળા રંગમાં પ્રતીક્ષા)
    - `Called to Chair — 10 Min Grace Timer Active` (`CALLED` — તૈયાર રહો!)
    - `Serving Now at Chair 2` (`IN_SERVICE` — ચેર ૨ પર સેવા ચાલુ છે)
    - `Service Done` (`DONE` — સેવા પૂર્ણ થઈ)
    - `Marked No-Show` (`NO_SHOW` — ગેરહાજર નોંધાયેલ)
- **Database-Driven 10-Minute Grace Window Callout (when `CALLED`):**
  - Displays remaining grace time calculated directly from database timestamp `called_at`:
    $$\text{Remaining Time} = \max\left(0, 10\text{ minutes} - (\text{Current Time} - \text{called\_at})\right)$$
  - Survives browser refreshes, phone screen locks, and device restarts.
- **Metrics Breakdown Grid:**
  - Card 1: *Estimated Wait Time Remaining* ($\frac{\text{Ahead Duration}}{\text{Working Barbers}}$).
  - Card 2: *People Ahead of You* (Count of FIFO tokens ahead).
  - Card 3: *Assigned Barber / Preference* (Shows assigned stylist or "Any Available").
  - Card 4: *Requested Services & Bill Summary* (e.g., "Haircut + Beard Trim — ₹400").
- **Footer:** Project Credits card.

---

## Screen 4: Receptionist Queue Controller Dashboard (`/reception`)

### 1.1 Purpose & Target Users
- **Purpose:** Front-desk command center for registering walk-ins, managing FIFO queue dispatch, handling no-shows after the 10-minute grace period, and viewing barber availability.
- **Target Users:** Salon receptionist (e.g., Neeta) and floor managers.

### 1.2 Layout & Visual Appearance
- **Boutique Split View:**
  - **Left Panel (Fast Walk-In Entry):** Clean white form allowing customer name, 10-digit mobile, service checkmarks, and barber preference. Walk-ins allowed until 9:00 PM closing.
  - **Center Panel (Live FIFO Queue Table):** Ordered strictly by `created_at ASC`.
    - Columns: Token #, Customer, Phone, Services, Barber, Status Badge (`WAITING`, `CALLED`, `IN_SERVICE`, `DONE`, `NO_SHOW`, `CANCELLED`), Wait Time, and Actions.
    - Status Filters: `All`, `WAITING`, `CALLED`, `IN_SERVICE`, `DONE`.
  - **Right Panel (Barber Chair Matrix):** 4 active chairs showing status (`Serving`, `Idle`, `On Break`), active client, and grace timer for called tokens.
  - **Footer:** Project Credits card.

---

## Screen 5: Barber / Stylist Workstation View (`/barber`)

### 1.1 Purpose & Target Users
- **Purpose:** Distraction-free station view mounted at the barber's mirror for calling clients, tracking service time, and managing breaks.
- **Target Users:** Barbers and hair stylists (Ramesh, Amit, Jignesh, Nilesh).

### 1.2 Layout & Visual Appearance
- **Design:** Boutique Cherry & Cream styling with oversized 64px tap targets.
- **Header:** Stylist Profile Selector (e.g., "Amit - Chair 2") and Status Toggle Pill:
  - `🟢 Available for Clients` (સેવા માટે ઉપલબ્ધ)
  - `☕ 15m Tea Break` (૧૫ મિ ચા બ્રેક)
  - `🍱 30m Lunch Break` (૩૦ મિ લંચ બ્રેક)
  - `🔴 Off Duty` (કામ પૂરું / રજા)
- **Active Client Card (Hero):**
  - Current Token: **A-103 — Bhavin Patel**
  - Services: *Haircut + Beard Shaping (40 mins)*
  - Timer: Elapsed Service Time stopwatch.
- **10-Minute Grace Window Banner (when client is CALLED):**
  - Displays remaining grace time based on database `called_at` timestamp.
- **Buttons:** Giant Deep Cherry buttons for `Call Next Customer` (atomic dispatch selection), `Start Service`, and `Mark Done`.
- **Footer:** Project Credits card.

---

## Screen 6: Waiting Area TV Display (`/tv`)

### 1.1 Purpose & Target Users
- **Purpose:** Public 16:9 widescreen display for lounge TVs showing live serving chairs, upcoming tokens, and audio announcements.
- **Target Users:** Waiting lounge guests and accompanying family members.

### 1.2 Layout & Visual Appearance
- **Aspect Ratio:** Fixed 16:9 widescreen landscape layout.
- **Palette:** Warm Cream (`#FFF8F2`), Deep Cherry Burgundy (`#702D3D`), Blush Pink (`#E8C7CC`), Dusty Rose (`#B77A85`), and Dark Text (`#38252B`).
- **Screen Partitioning:**
  - **Top Banner (10% height):** Deep Cherry banner with Salon Logo, Clock (`4:35 PM`), and bilingual date.
  - **Main Left Section - "NOW SERVING" (58% width):** High-impact grid of active chairs (Chairs 1 to 4).
    - If chair is in service (`IN_SERVICE`): Shows Token #, Barber Name, and Service.
    - If chair is calling (`CALLED`): Shows **CALLING NOW** with pulsing blush/cherry ring and remaining grace timer calculated from `called_at`.
  - **Main Right Section - "UP NEXT" (42% width):** Vertical FIFO list of tokens in `WAITING` status with wait times computed using the standard formula ($\frac{\text{Ahead Duration}}{\text{Working Barbers}}$).
  - **Bottom Ticker (6% height):** Soft blush scrolling marquee with Wi-Fi details and salon announcements.
  - **Bottom Credits Bar (4% height):** Sleek, non-intrusive display of Project Credits:
    `Developed by: Neha Tadvi | Student ID: 202612123 | Course: MSc IT | Institute: DAU (DAIICT)`

---

## Screen 7: Owner Management & Settings Screen (`/owner` or `/settings`)

### 1.1 Purpose & Target Users
- **Purpose:** Back-office administrative dashboard for salon configuration, queue parameters, barber rosters, and daily throughput metrics.
- **Target Users:** Salon Owner (e.g., Kiritbhai Patel) and academic evaluators.

### 1.2 Layout & Appearance
- **Theme:** Boutique Cherry & Cream dashboard with deep cherry navigation tabs.
- **Tab 1: Daily Analytics Metrics:**
  - Total Customers Served Today (tokens with status `DONE`).
  - Average Wait Time (calculated from actual timestamps).
  - No-Show / Cancelled Count (`NO_SHOW` and `CANCELLED`).
  - Gross Services Completed (₹ INR).
- **Tab 2: Queue Configuration Parameters:**
  - Standardized Status Mapping: `WAITING`, `CALLED`, `IN_SERVICE`, `DONE`, `CANCELLED`, `NO_SHOW`.
  - No-Show Grace Period: Fixed at **10 minutes** (calculated from `called_at`).
  - Online Queue Cutoff Before Closing: Set to **30 minutes** before closing (8:30 PM).
- **Tab 3: Barber Staff Roster Manager:** Table of barbers and status.
- **Tab 4: Service Menu & Price Configuration:** Editable service pricing and durations.
- **Footer:** Project Credits card.
