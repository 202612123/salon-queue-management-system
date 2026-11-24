# Salon Queue Management System — Project Brief

**Project Name:** Trim & Tone Salon Queue Management System (ટ્રિમ અને ટોન સલૂન કતાર વ્યવસ્થાપન)  
**Academic Context:** MSc IT — Vibe Coding Lab Project  
**Student Developer:** Neha Tadvi  
**Student ID:** 202612123  
**Course:** MSc IT  
**Institute:** DAU (DAIICT) — Dhirubhai Ambani University (formerly DA-IICT)  
**Target Environment:** Mobile-First Web Application & Lounge TV Display  
**Version:** 1.3.0 (Production-Ready Architecture & Academic Credits)  

---

## 1. Executive Summary & Problem Definition

### 1.1 The Industry Problem
In contemporary Indian urban and semi-urban salon establishments (such as those in Ahmedabad, Surat, Vadodara, and Rajkot), walk-in client management represents an operational bottleneck characterized by:
1. **Unpredictable Waiting Times:** Customers frequently arrive at peak hours (Friday evenings, Saturdays, and Sundays) and are met with vague verbal assurances such as *"10 minute ma tamaro number aavshe"* (Your turn will come in 10 minutes), when the actual wait exceeds 45 to 75 minutes.
2. **Lounge Congestion and Crowded Waiting Areas:** Physical waiting lounges become overcrowded, causing claustrophobia and creating a perceived barrier that turns away high-value walk-by customers.
3. **Walk-Aways and Lost Revenue:** Customers who step outside for tea, snacks, or shopping lose their position in the queue, resulting in friction with other waiting clients and salon staff upon return.
4. **Staff Workload Imbalance & Burnout:** Without a centralized queue dispatch, some popular barbers are overwhelmed with consecutive clients while others remain idle, leading to uneven tip distribution and fatigue.
5. **Language & Usability Barrier:** Many existing salon POS systems are monolingual English desktop applications that intimidate junior floor staff and Gujarati-speaking clients.

### 1.2 The Solution
The **Salon Queue Management System** is a lightweight, mobile-first, bilingual (English & Gujarati) web application designed to digitize the physical waiting line. Customers can join the queue via a quick QR code scan on their smartphone or through a receptionist kiosk, track their live queue position and estimated remaining wait time from anywhere within 500 meters, and receive clear visual and audio notifications when their barber chair is ready.

The application leverages **Supabase Cloud PostgreSQL** and **Near-Real-Time WebSockets** to maintain distributed state synchronization across smartphones, receptionist terminals, mirror tablets, and lounge televisions.

---

## 2. Target Stakeholders & User Personas

| Role | Persona Representative | Key Motivations & Needs | Primary Pain Points |
| :--- | :--- | :--- | :--- |
| **Customer** (ગ્રાહક) | **Bhavin Patel (32)** & **Aarav Shah (22)** | Wants frictionless queue entry, transparent wait times, ability to step out for a quick coffee with a fair 10-minute grace window calculated from the database `called_at` timestamp, and bilingual access. | Blind waiting, guessing remaining minutes, losing turn if outside, awkward verbal disputes with reception. |
| **Receptionist** (રિસેપ્શનિસ્ટ) | **Neeta Sharma (26)** | Needs ultra-fast walk-in token generation (< 15 seconds), clear overview of all waiting/serving chairs, and structured 10-minute no-show management. | Paper token chaos, angry customers asking "How much longer?", manual tracking of which barber is free. |
| **Barber / Stylist** (વાળંદ / સ્ટાઈલિસ્ટ) | **Rameshbhai (38)** & **Amit (28)** | Needs a clean, distraction-free mobile/tablet interface to click "Call Next" (executing an atomic database transaction that prevents duplicate calls), "Start Service", and "Complete", plus tea/lunch break controls. | Reception pushing clients before previous haircut is finished, miscommunication on customer's requested services. |
| **Salon Owner** (સલૂન માલિક) | **Kiritbhai Patel (48)** | Needs daily throughput reports (clients served, revenue, average wait time), barber performance insights, and easy pricing/service menu configuration. | Revenue leakage from walk-aways, lack of data on peak hour bottlenecks, slow staff onboarding. |

---

## 3. Essential Features (Core Scope: 8 Features)

The project focuses strictly on eight high-impact, achievable core features designed for maximum real-world reliability:

1. **Digital Self-Service Queue Entry (with Strict Safeguards):**
   - Customers scan an entrance QR code or open the web app to enter their Name, Mobile Number, select desired salon services with transparent Indian Rupee (₹) pricing, and select a Barber preference (*Any Available* or specific stylist).
   - **Phone Number Restriction:** A phone number can have only **one active queue entry** (`WAITING`, `CALLED`, or `IN_SERVICE`) at any time.
   - **Operating Cutoff:** Online queue joining closes **30 minutes before salon closing** (e.g., 8:30 PM for a 9:00 PM close). Walk-ins at reception remain allowed until closing time.
2. **Live "My Status" Mobile Tracking:**
   - Real-time token tracking screen showing assigned Token ID (e.g., `A-102`), current queue status (`WAITING`, `CALLED`, `IN_SERVICE`, `DONE`, `NO_SHOW`), count of people ahead, and live estimated wait time in minutes.
3. **Receptionist Fast-Entry Desk & Queue Controller:**
   - Desktop and tablet-optimized dashboard allowing the receptionist to log offline walk-in customers in under 15 seconds, call next customers, and manage no-shows.
   - **Reassignment Rule:** Receptionists can reassign barbers *only* for customers who selected "Any Available Barber". Customers who chose a specific preferred barber **cannot be reassigned** to another barber.
4. **Stylist Workstation View with Atomic FIFO Dispatch:**
   - Simplified touch-optimized UI for barbers at each station to view their queue and call the next client.
   - **Atomic Dispatch:** Tapping "Call Next Customer" executes a secure PostgreSQL RPC function using row-level locking (`FOR UPDATE SKIP LOCKED`), ensuring two barbers never summon the same customer concurrently.
5. **Stylist Break & Availability Management:**
   - Barbers can toggle their operational state between *Available*, *On 15-min Chai Break*, *On 30-min Lunch Break*, or *Off Duty*, automatically pausing queue assignment and recalculating wait times based on active working barbers.
6. **Dynamic Wait-Time Prediction Engine (Standard Formula):**
   - Implements the standard salon queue formula:
     $$\text{Estimated Wait Time} = \frac{\text{Total estimated service duration of customers ahead}}{\text{Number of working barbers}}$$
7. **Waiting Lounge Smart TV Display Board:**
   - High-contrast, large-screen landscape interface designed for wall-mounted smart TVs in the lounge, displaying large-font "Now Serving" tokens, "Up Next" queue, and animated callouts with audio chime.
8. **Bilingual Localization (English & Gujarati / ગુજરાતી):**
   - Seamless one-click language toggle across all user-facing screens, ensuring intuitive comprehension for local Gujarati clientele and staff.

---

## 4. Standardized Database Statuses & Lifecycle Rules

### 4.1 Canonical Status Names
To eliminate state mismatches across frontend screens, queries, and database records, the system strictly uses the following six (6) canonical statuses everywhere:
- **`WAITING`**: Customer is queued in FIFO order awaiting a chair.
- **`CALLED`**: Customer has been summoned to a chair; `called_at` timestamp is set; 10-minute grace countdown active.
- **`IN_SERVICE`**: Customer is seated in the chair; service timer active.
- **`DONE`**: Service is successfully finished; chair is liberated (replaces legacy `COMPLETED`).
- **`CANCELLED`**: Customer voluntarily cancelled their token from mobile before service started.
- **`NO_SHOW`**: Customer failed to arrive within the 10-minute grace window calculated from `called_at`.

### 4.2 Grace Period & Return Policy
- **Database-Driven Grace Calculation:** The 10-minute grace period is calculated directly from `called_at`:
  $$\text{Remaining Grace Time} = \max\left(0, 10\text{ minutes} - (\text{Current Time} - \text{called\_at})\right)$$
  Survives browser reloads, phone screen locks, and device restarts.
- **No-Show Return Policy:** If a customer returns after being marked `NO_SHOW`, they **must join at the end of the queue** as a new entry.

---

## 5. Visual Design, Aesthetic Theme & Project Credits

### 5.1 Design Philosophy: "Boutique Luxury Salon — Cherry & Cream Aesthetic"
The visual identity reflects an elegant, high-end boutique salon and grooming studio. It adopts a warm, inviting **Cherry & Cream** palette featuring rich cream backgrounds, deep cherry burgundy headings and primary buttons, delicate blush pink cards, and crisp white surfaces with subtle shadows.

### 5.2 Color Palette Specifications
- **Warm Cream (Canvas Background):** `#FFF8F2` — Creates a warm, welcoming, boutique atmosphere.
- **Deep Cherry Burgundy (Headings & Primary CTAs):** `#702D3D` — Rich, authoritative accent used for major titles, primary buttons, and hero indicators.
- **Blush Pink (Cards & Subtle Accents):** `#E8C7CC` — Soft, premium tint used for card borders, badge backgrounds, and highlights.
- **Dusty Rose (Secondary Neutral & Icons):** `#B77A85` — Used for secondary accents, icons, and subtle dividers.
- **White (Elevated Surface Cards):** `#FFFFFF` — Clean, crisp cards with delicate shadows (`shadow-cherry-sm`).
- **Dark Text (Typography):** `#38252B` — Deep warm espresso tone providing maximum contrast and readability.
- **Functional / Semantic Accents:**
  - *Active / Serving (`IN_SERVICE`):* Deep Emerald `#15803D`.
  - *Waiting (`WAITING`):* Warm Amber `#D97706`.
  - *Urgent / Called (`CALLED`):* Deep Cherry Burgundy `#702D3D` (10-minute timer active).
  - *Completed (`DONE`):* Deep Cherry Burgundy `#702D3D` with Blush Badge.
  - *Cancelled / No-Show (`CANCELLED` / `NO_SHOW`):* Crimson Rose `#BE123C` / Muted Slate Rose `#8C7077`.

### 5.3 Academic Project Credits Section
To fulfill academic presentation standards, every screen features a subtle, elegant **Project Credits** footer card:
```
Developed by: Neha Tadvi
Student ID: 202612123
Course: MSc IT
Institute: DAU (DAIICT)
```
- Styled with the Cherry & Cream boutique aesthetic (warm cream/white background, blush pink border, deep cherry developer name, and dark text).
- Designed to be readable on desktop, tablet, and mobile without obstructing core operational buttons or salon interactions.

---

## 6. Project Success Metrics (Lab Evaluation Criteria)

1. **Walk-In Entry Speed:** Receptionist can register a customer and generate a token in under 15 seconds.
2. **Customer Visibility:** A customer can check their exact queue position and estimated wait time within 1 tap from their mobile screen.
3. **Queue Turnaround Efficiency:** Barbers can complete a service and call the next eligible FIFO customer with an atomic single tap.
4. **Bilingual Completeness:** 100% of customer and barber facing UI elements, button labels, and system status messages translate accurately between English and Gujarati.
5. **Realtime Cross-Device Sync:** Near-real-time synchronization (typically sub-second) across mobile devices, reception PCs, and lounge TVs powered by Supabase WebSockets.
6. **Grace Period Integrity:** 10-minute grace countdown calculated from the database `called_at` timestamp survives browser reloads.
