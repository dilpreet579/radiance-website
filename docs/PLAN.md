# Radiance 2026 — Website & Registration System (Build Spec)

> Hand this file to Claude (or any developer) as the full context for building the Radiance 2026 website. Items marked **[ASSUMPTION]** are my best guess and can be changed. Items marked **[OPEN]** are still to be confirmed by the organizers. Items marked **[PLACEHOLDER]** will be replaced with real content later.

---

## 1. About the Event

**Radiance** is the annual Creative Fest of **NIT Delhi**. **2026 is the 3rd edition.**

**Title Sponsor: Bharat Petroleum (BPCL).** Radiance 2026 is presented in association with Bharat Petroleum, the title sponsor of the entire event. Their name must be visible across the site (see §7.9).

**Stats to show (homepage):**
- 1000+ past participants
- ₹25K+ prize pool (this year)
- 200K+ social views (past editions) *(confirmed: 200K, not 2000K)*

**Past collaborators:** Dice Academy, Olympus Cameras, Unstop, Fabs (Kirori Mal College, DU), Pixels (Hansraj College, DU). Show as a logo strip **[PLACEHOLDER logos]**.

**Past speakers (names only, "Past Speakers" section):** Ayush Kumar Tripathi, Gaurav Dholia, Shivam, Anurag Roy, Nitin Chandra.

**Past Radiance 2025:** a photo carousel **[PLACEHOLDER random photos; organizers will upload real ones]**.

**Tagline idea:** students get hands-on experience with industry creators across photography, filmmaking, motion design and graphic design.

---

## 2. Event Schedule (8 days, not continuous)

| Date | Day | Event | Time | Who can attend |
|---|---|---|---|---|
| 26 Oct | Mon | **Inaugural Ceremony** + Stand-up comedy by **Vaibhav Kant** | 5:30–7:30 PM | NIT Delhi only |
| 27 Oct | Tue | **Photography Workshop** powered by **Nikon** | 5:30–7:30 PM (2 hrs) | NIT Delhi + outside (limited) |
| 28 Oct | Wed | **Cinematic Filmmaking Workshop** by **Shoot Guru** | 3:30–6:30 PM (3 hrs) | NIT Delhi + outside (limited) |
| 29 Oct | Thu | **Motion Design Workshop** by **Motion Nation** (Abhishek) | 5:30–7:30 PM (2 hrs) | NIT Delhi + outside (limited) |
| 30 Oct | Fri | **Graphic Design Workshop** by **Gaurav Dholia** | 5:30–7:30 PM (2 hrs) | NIT Delhi + outside (limited) |
| 31 Oct | Sat | **Delhi Photo Walk** (multi-location, institute bus) | **Entire day** (show only "Entire day"; never show clock times. Internally it starts ~5 AM) | 90 selected NIT Delhi students |
| 1–3 Nov | | *Gap: exhibition preparation (do not list as events)* | | |
| 4 Nov | Wed | **Grand Exhibition, Day 1** (Halloween theme) | 3:30 PM–10:00 PM | Everyone, no registration |
| 5 Nov | Thu | **Grand Exhibition, Day 2** + closing of Radiance | 5:30–10:00 PM | Everyone, no registration |

All on-campus events are at **NIT Delhi**.

**Notes:**
- Stand-up comedy is tentatively at ~6:30 PM on 26 Oct. **Do NOT show the comedy time on the site.** Just mention it as part of the inaugural day.
- Inaugural: explains the format of Radiance and the workshops line-up.
- Comedy show is **NIT Delhi students only**.
- Unstop competitions and in-campus Google Form competitions **go live on the inaugural day (26 Oct)**. The website must launch before that, with those sections ready to be switched on.
- **Refreshments** are provided to attendees of the **inaugural ceremony and all four workshops**. Mention this as a small info line on the schedule, inaugural and workshops pages.
- **SRHC campus bus:** NIT Delhi students based at the **SRHC campus** get a separate bus at **7:45 PM** on the **inaugural day and all workshop days** (26, 27, 28, 29, 30 Oct). Show as a small info note on the schedule and workshops pages. Make the text admin-editable.

---

## 3. Audience Types & Tickets

### 3.1 NIT Delhi students: "Universal Pass"
- One registration → one **universal ticket** valid for: Inaugural + comedy, all four workshops, photo walk (if selected), exhibition.
- No per-workshop registration.

### 3.2 Outside students (other institutes): "Workshop Pass"
- Can register only for **workshops** (multi-select checkboxes: Photography / Filmmaking / Motion Design / Graphic Design).
- **Cap: 15 outside-student seats per workshop** (organizers said 15–20; build as an admin-editable number, default 15).
- Not allowed: inaugural, comedy show, photo walk.
- Exhibition: they can come on **4 Nov** (and in practice it's open to everyone, no registration needed).
- Workshops are **free** for them.
- Only the institute-norms guideline checkbox applies (see §6).
- If a workshop is full, disable that option and show "Seats full".

### 3.3 Exhibition visitors
- **No registration needed.** Exhibition is open to everyone on both days.

### 3.4 Partner-college students in the photo walk
- Two partner institutes (to be revealed later) join the photo walk. **They are not part of this system.** No QR codes for them.

---

## 4. Registration Form

**Fields (all required unless noted):**
1. Full name
2. Gender (select: Male / Female / Other / Prefer not to say)
3. Institute: dropdown with "NIT Delhi" first, plus "Other" (then a free-text institute name)
4. Roll number
5. Year (1st/2nd/3rd/4th/Other)
6. Branch
7. Phone number
8. Email ID
9. *If Institute ≠ NIT Delhi:* workshop multi-select (checkboxes)
10. Consent checkboxes (see §6), which depend on institute

**Rules:**
- **No identity verification on the website.** NIT Delhi students are verified physically at the venue.
- Optional soft hint only (no blocking): NIT Delhi emails end with `@nitdelhi.ac.in`; roll numbers start with `2`. Do not enforce.
- **Duplicate detection** (same email OR phone OR roll number): do not create a second record. Show: *"You have already registered with these details."* and re-send the existing ticket email / show the existing ticket. **[ASSUMPTION]**
- Store the **submission timestamp** (this is the consent timestamp too). No per-checkbox timestamps.
- Expected volume: ~100–300 registrations total.

**On success:**
1. Generate a unique **Token ID** (e.g. `RAD26-0001` or short random string **[ASSUMPTION]**).
2. Generate a **QR code** encoding the token ID.
3. Show a polished on-screen **ID card** with: **Name, Token ID, QR code**, ticket type (Universal / Workshop Pass), and selected workshops for outside students.
4. Email the same ID card (name + token ID + QR image) to the student.
5. Show advice: *"Take a screenshot of this ticket or keep the email handy; you'll need to show the QR / token at every event."* The student should only need to visit the site once.

**Email delivery:** left to the developer's choice (any reliable provider with a free tier; volume is tiny). Sender: something like a Radiance or club address. **[OPEN: sender address]**

---

## 5. Attendance & Admin System

### 5.1 Roles **[ASSUMPTION: reconciling "5 admin IDs" and "single super admin"]**
- **5 scanner admin accounts** (organizers use these on **phones** to scan QR codes). Simple email/password or shared-code login is fine.
- **1 super admin** (on **laptop**) for the dashboard, tables, CSV export, shortlist and settings.
- No volunteer role.

### 5.2 Scanning
- Mobile-friendly **QR scanner page** (uses phone camera).
- Admin picks the **session** being scanned (Inaugural, Photography, Filmmaking, Motion Design, Graphic Design, Photo Walk checkpoint X, Exhibition optional) and then scans.
- On scan: look up the token → mark attendance **present** for that session.
- **Duplicate scan:** show a clear "Already marked" flag (with name and time). Verify against the database, never double-count.
- **Not eligible** (e.g. outside student at inaugural, outside student at a workshop they didn't pick, non-selected student at photo walk): show a clear red "Not eligible" message.
- **Fallback if QR/scan fails:** admin can type the **Token ID** manually. Also lets organizers note the token and mark it later.
- Internet outage handling: not required beyond manual token entry; offline-sync is optional.

### 5.3 Attendance database
- Every scan stored with: token, session, timestamp, scanning admin.
- Per-day attendance for all workshops and the inaugural.
- Per-checkpoint attendance for the photo walk (bus boarding at each location).

### 5.4 Photo walk checkpoints
- Super admin can **add/rename/remove checkpoints later** (locations will be revealed afterwards). Expect **4–5 locations**. Past locations for reference: Yamuna Ghat, Chandni Chowk, Purana Qila, Sundar Nursery, Qutub Minar.
- Students are scanned when boarding the bus at each checkpoint.

### 5.5 Photo walk selection (manual, not auto)
- **Max 90 students.** NIT Delhi only. Institute bus; expenses handled by the institute.
- Eligibility basis: attendance across the **5 sessions** (Inaugural + 4 workshops). Higher attendance ranks higher.
- **Tiebreaker:** engagement score (attention + interaction with speakers).
- **Admin Leaderboard table** (super admin, laptop) with columns: Name, Roll no, Branch, Year, Sessions attended (X/5), per-session ticks, **Engagement score (editable)**, **Remarks (editable)**, **Selected for photo walk (toggle/override)**.
- **Sortable** by any column; **CSV export** of the table and of the final shortlist.
- Do **not** auto-generate the final list. Organizers pick manually using the sorted table and export CSV, then handle communication offline. **[ASSUMPTION: no waitlist feature]**

### 5.6 Reports
- **No live dashboard required.** Near-real-time is a nice-to-have, but being up to date within ~30 minutes of the last scan is fine. Simple "refresh to see latest" is acceptable.
- End-of-day views: attendance count per session, list of who attended, registrations count by type, workshop seat usage for outside students.
- CSV export everywhere (registrations, attendance per session, leaderboard).
- **In-house film competition** (crews formed at the filmmaking workshop) is run offline. Just provide the **CSV export** of filmmaking workshop attendees.

---

## 5A. Morning Reminder Emails (customizable)

- On each event day, automatically email registered students a **reminder at 9:30 AM IST** (e.g. on 26 Oct the inaugural-day email arrives at 9:30 AM).
- The email includes the **exact venue inside the NIT Delhi campus**, the event time, and a reminder to bring the ticket (QR / token ID).
- **Fully customizable by the super admin:** a template per event day (subject, body, venue text, any extra notes such as refreshments or the SRHC bus info), editable from the admin panel before it sends. Support placeholders like `{name}`, `{token}`, `{venue}`, `{event}`.
- **Recipients per day [ASSUMPTION]:**
  - Inaugural (26 Oct): all NIT Delhi registrants.
  - Workshop days (27–30 Oct): all NIT Delhi registrants, plus outside students who selected that workshop.
  - Photo walk (31 Oct): only the students marked as selected for the photo walk.
- Include a manual **"Send now"** and **"Send test email"** button, plus a log of what was sent.
- Needs a scheduled job (cron or equivalent) that runs at 9:30 AM IST on the event days.

---

## 6. Consents / Undertakings (collected at registration, checkbox only)

All text below is **[PLACEHOLDER]**; organizers will supply final wording. Build them as an easily editable config. No parent/guardian signature needed.

**NIT Delhi students must tick:**
1. **Stand-up Comedy Show Guidelines:** acknowledges the show may contain mature or edgy humour, accepts the audience conduct rules (no recording, no heckling, respectful behaviour, etc.).
2. **Photo Walk Undertaking:** accepts responsibility for personal safety, follows bus and group discipline, follows instructions of the organizers, no leaving the group, institute not liable for personal belongings.

**Outside students must tick:**
1. **Institute Norms Guideline:** agrees to follow NIT Delhi's institute rules and code of conduct while on campus.

Store boolean flags plus the single submission timestamp.

---

## 7. Website Pages & Sections

### 7.1 Home
- Hero: Radiance 2026, "3rd edition", NIT Delhi Annual Creative Fest, dates (26 Oct – 5 Nov), with a clear **"Title Sponsor: Bharat Petroleum"** line and logo near the event name.
- Stats strip (1000+ participants, ₹25K+ prize pool, 200K+ social views).
- Schedule overview (8 days timeline).
- CTA: **Register** button, plus the Unstop competitions link.
- **Title Sponsor section** (see §7.9), placed prominently above the past collaborators strip.
- Past collaborators logo strip.
- Past Radiance 2025 photo carousel.
- Past speakers (names).
- Footer: contacts, social links **[PLACEHOLDER]**.

### 7.2 Workshops (single page, **no per-workshop registration buttons**)
One page, one section per workshop, each with speaker photo + bio side by side. Info only; registration happens via the single registration page.

1. **Photography Workshop, powered by Nikon**: 27 Oct, 5:30–7:30 PM. **[OPEN: Nikon speaker name/bio]**
2. **Cinematic Filmmaking, Shoot Guru**: 28 Oct, 3:30–6:30 PM. Teaches **cinematography and basic video editing**. **207K Instagram followers.** Also: students get split into **crews** at this workshop and make a short film on a given topic; the best film wins prizes.
3. **Motion Design, Motion Nation (Abhishek)**: 29 Oct. YouTube channel with **250K+ subscribers**. Teaches **motion designing**.
4. **Graphic Design, Gaurav Dholia**: 30 Oct, 5:30–7:30 PM. Expert graphic designer with many years of experience (also a past Radiance speaker).

All speaker photos, bios, and social links are **[PLACEHOLDER dummy data]** now; the organizers will provide real ones.

### 7.3 Inaugural Day
- 26 Oct, 5:30–7:30 PM: explains the format of Radiance and the workshops. Includes a stand-up comedy show by **Vaibhav Kant** (no time listed). Short bio card for him **[PLACEHOLDER]**.
- Mention it's for NIT Delhi students.

### 7.4 Photo Walk
- 31 Oct, **entire day** (do not display start/end times). Multi-location Delhi photo walk by institute bus, 4–5 locations.
- **Collaborating colleges: "To be revealed soon."** (Most likely DU colleges, but do not state this on the site.)
- **Only 90 NIT Delhi students** are selected, by attendance across the Inaugural + all 4 workshops (tiebreak: engagement/interaction with speakers).
- Locations: "To be revealed soon."

### 7.5 Exhibition (Halloween-themed page; distinct spooky design)
- 4 & 5 Nov at NIT Delhi, evening to **10 PM**. Open to everyone, no registration.
- Sections: **Activities & Games** (e.g. snakes & ladders and other games, Polaroid/photo booth), **Food Stalls**, **Movie Screenings / LT screenings**, **Performances**, **Best Photographs display** from Radiance, **Best films** from the in-house film competition, **Prizes**.
- Halloween visuals: dark, orange/purple, pumpkins/bats/fog, spooky fonts.

### 7.6 Competitions (Unstop + in-campus)
Total prize pool **₹25K+ across everything** (all Unstop, in-campus and other prizes).

- **Online via Unstop (all-India, free, open to all students):** about 3 competitions (e.g. photography, filmmaking; the exact number is flexible 2–3).
  - Card per competition: title, genre/category, prize, theme, deadline, short description, **"Go to Unstop"** button (external link).
  - URLs not available yet; **must be admin-editable**.
- **In-campus (NIT Delhi only):** 2 competitions, with submissions via **Google Forms** (external link, admin-editable).
- Everything is **admin-manageable**: add / edit / delete / reorder competitions, set links, and toggle live/"Coming soon".
- Show "Coming Soon" until the inaugural day (26 Oct), when links go live.

### 7.7 Registration page
- The form in §4, plus the ID card success screen.

### 7.9 Title Sponsor (Bharat Petroleum)
- Announce **Bharat Petroleum as the Title Sponsor** of Radiance 2026.
- **Homepage:** a dedicated, prominent section ("Title Sponsor") with the Bharat Petroleum logo, a short line such as "Radiance 2026 is proudly presented by Bharat Petroleum" **[PLACEHOLDER wording]**, and an optional link to their website.
- **Site-wide:** show "Title Sponsor: Bharat Petroleum" with the logo in the **header or navbar area** and in the **footer** of every page.
- **Other touchpoints:** registration ID card (small "Title Sponsor" strip), confirmation and reminder emails (footer line with logo), and the Halloween exhibition page footer.
- Sponsor name, logo, tagline and link should be **admin-editable** so more sponsors (associate sponsors, etc.) can be added later without code changes. The title sponsor always ranks first.
- Follow Bharat Petroleum's brand guidelines for logo usage if provided **[OPEN]**.

### 7.8 Admin area (login required)
- Scanner page (mobile), super admin dashboard (laptop), leaderboard, registrations table, competitions manager, checkpoints manager, **reminder email editor (§5A)**, settings (outside seat caps, consent text, venue text, SRHC bus note), **sponsors manager (name, logo, link, tier)**.

---

## 8. Design Direction

- **Festival theme:** creative and bold (photography, film, design, motion). **[OPEN: brochure and background images to be shared; match their palette and fonts]**.
- **Exhibition page:** Halloween-themed, distinctly different.
- Mobile-first (most students will use phones); admin scanner especially.
- The **ID card** should look polished: Radiance branding, name, token ID, QR.
- Dummy photos and links wherever real content is missing.

---

## 9. Technical Notes (stack left to the builder)

- Stack and hosting are the builder's call. Scale is small (100–300 registrations), so any simple modern stack with a database, email sending and QR generation works. Prefer a free-tier friendly setup.
- Needs: database (registrations, sessions, attendance scans, competitions, checkpoints, settings), QR generation, transactional email, camera-based QR scanning, auth for admins, CSV export.
- Registration, ticket and scan logic must be **idempotent** (no duplicates).

---

## 10. Open Items Summary

1. **Exact venues inside campus** for each event day (needed for the 9:30 AM reminder emails and the website).
2. Nikon speaker name and bio.
3. Real photos, bios, social links for all speakers; logo; brochure and background images (organizers will send these).
4. Final consent wording (comedy guidelines, photo walk undertaking, institute norms).
5. Unstop URLs, Google Form links, and the final list of competitions (title, prize, theme, deadline).
6. Email sender address and domain.
7. Admin login details (5 scanners + 1 super admin).
8. Photo walk collaborating colleges and locations: "To be revealed soon" until announced.
9. **Bharat Petroleum logo** (high-resolution), preferred wording for the title sponsor line, website link, and any brand guidelines.
