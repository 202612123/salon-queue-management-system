# 3-Minute Demo Video Checklist

**Project Name:** Trim & Tone Salon Queue Management System  
**Developer:** Neha Tadvi (Student ID: 202612123)  
**Target Duration:** Exactly 3 Minutes (180 Seconds)  
**Recommended Recording Setup:** OBS Studio or Loom, Screen recording with audio microphone, 1920×1080 resolution.

---

## Video Timeline & Script Guide

### 0:00 – 0:30 (30s) — Introduction & Home Screen Overview
- [ ] **Visual:** Open Home page (`/`).
- [ ] **Points to highlight:**
  - Introduce developer: Neha Tadvi, MSc IT, DAU (DAIICT).
  - Point to the universal **Project Credits** footer card at the bottom.
  - Showcase the **Cherry & Cream** boutique luxury aesthetic (`#702D3D` Burgundy & `#FFF8F2` Cream).
  - Click the **English / ગુજરાતી Language Toggle** in the header to demonstrate zero-delay bilingual switching.
  - Show live salon indicators: "Open Today: 9:00 AM – 9:00 PM" and "Online Queue Closes at 8:30 PM (Walk-ins until 9:00 PM)".
  - Point to live metrics: Currently Waiting count, Estimated Wait Time, and Stylists on Duty.

---

### 0:30 – 1:05 (35s) — Customer Join Queue & Live "My Status" Screen
- [ ] **Visual:** Click **"Join Queue Now"** to open `/join`.
- [ ] **Points to highlight:**
  - Enter Customer Name: `"Bhavin Patel"`.
  - Enter 10-Digit Mobile Number: `"9825012345"`.
  - Demonstrate service multi-selection (Classic Haircut + Beard Trim); show instant ₹ INR bill & duration summation.
  - Demonstrate Barber Preference: Select a specific stylist (e.g., Ramesh); point out the lock badge: *"Customer requested a specific barber. Reassignment is not permitted."*
  - Demonstrate Single Active Phone constraint: (Optionally enter an existing phone to show the warning banner).
  - Click **"Confirm & Get Token"**; show instant redirect to `/status/[tokenId]`.
  - On `/status/[tokenId]`: Show assigned token number (e.g. `A-101`), `WAITING` status badge, people ahead counter, and estimated wait time.

---

### 1:05 – 1:45 (40s) — Receptionist Desk: Walk-in & Queue Controller
- [ ] **Visual:** Switch to Receptionist Dashboard (`/reception`).
- [ ] **Points to highlight:**
  - Fast Walk-in Entry (< 15s): Type name `"Aarav Shah"`, select services, click "Issue Token (Enter)". Show walk-in token (`W-102`) appearing instantly in the live queue.
  - Show the **Live FIFO Queue Table** sorted strictly by arrival timestamp (`created_at ASC`).
  - Demonstrate Status Filters: `ALL`, `WAITING`, `CALLED`, `IN_SERVICE`, `DONE`.
  - Demonstrate Barber Reassignment Rule:
    - Attempt to reassign Bhavin Patel (locked to Ramesh) -> Show locked tooltip / error: *"Customer requested a specific barber. Reassignment is not permitted."*
    - Show that customers with "Any Available" can be reassigned freely.
  - Point to the 4 Chair Station status cards on the right.

---

### 1:45 – 2:20 (35s) — Barber Workstation View & 10-Minute Grace Countdown
- [ ] **Visual:** Switch to Stylist View (`/barber`) on a split screen or separate tab.
- [ ] **Points to highlight:**
  - Select stylist profile: `"Rameshbhai - Chair 1"`.
  - Show break toggles: Toggle `"15m Chai Break"` -> note that working barbers count decreases and wait time recalculates across all screens.
  - Toggle back to `"🟢 Available"`.
  - Tap the giant 64px **"Call Next Customer"** button.
  - Observe atomic FIFO dispatch selecting Bhavin Patel.
  - **Audio Chime:** Hear the synthesized boutique lounge chime ring!
  - Point to the live **10-Minute Grace Timer** countdown ticking synchronously:
    $$\text{Remaining Seconds} = \max(0, 600 - (\text{now} - \text{called\_at}))$$
  - Refresh the customer status page (`/status/[tokenId]`) to prove the grace timer survives page refresh!
  - On Barber view: Click **"Start Service"** (transitions to `IN_SERVICE`, active stopwatch begins).
  - Click **"Mark Done"** (transitions to `DONE`, liberating Chair 1).

---

### 2:20 – 2:45 (25s) — Waiting Lounge Smart TV Display
- [ ] **Visual:** Switch to Lounge TV Display (`/tv`).
- [ ] **Points to highlight:**
  - Fixed 16:9 widescreen layout with large typography designed for wall-mounted smart TVs.
  - Top banner with live digital clock, boutique logo, and Near-Real-Time connectivity pill.
  - Left section **"NOW SERVING"**: Displays Chair 1 to 4 with serving badges and calling animations.
  - Right section **"UP NEXT"**: Displays FIFO waiting tokens with individual wait times computed via the formula:
    $$\text{Estimated Wait Time} = \frac{\text{Duration Ahead}}{\text{Working Barbers}}$$
  - Soft blush scrolling ticker with Wi-Fi details (`SalonGuest` | `TrimTone2026`).
  - Bottom academic credits bar.

---

### 2:45 – 3:00 (15s) — Owner Settings, Analytics & Conclusion
- [ ] **Visual:** Switch to Owner Settings (`/settings`).
- [ ] **Points to highlight:**
  - Point to real analytics metrics: Clients Served (`DONE` count), Average Wait Time, No-Shows, and Gross Revenue (₹).
  - Show Barber Roster, editable Service Pricing/Durations, and Queue Operational parameters (30m cutoff, 10m grace period, Salon Open/Closed toggle).
  - Conclude with student sign-off: Neha Tadvi, Student ID: 202612123, MSc IT, DAU (DAIICT).

---

## Pre-Recording Checklist
- [x] Run `npm run build` to ensure clean production build with zero warnings.
- [x] Run `npm test` to verify all 7 unit tests pass.
- [x] Open tabs in Chrome: `/`, `/join`, `/reception`, `/barber`, `/tv`, `/settings`.
- [x] Check that audio output is enabled so the Web Audio chime is captured in recording.
- [x] Verify resolution is 1920×1080 (16:9).
