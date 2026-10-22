// Static site copy, lifted from the design. Competitions/sponsors/consents move to the DB in the admin phase.

export const NAV = [
  ["/", "Home"],
  ["/workshops", "Workshops"],
  ["/inaugural", "Inaugural"],
  ["/photowalk", "Photo Walk"],
  ["/competitions", "Competitions"],
  ["/exhibition", "Exhibition"],
] as const;

export const PAGE_META: Record<string, { eyebrow: string; title: string; lead: string; chips: string[] }> = {
  "/workshops": {
    eyebrow: "Workshops · 27–30 Oct",
    title: "Four workshops with working creators",
    lead: "Photography, filmmaking, motion design and graphic design. This page is information only; everyone registers once on the registration page.",
    chips: ["2–3 hours each", "NIT Delhi + limited outside seats", "Free for outside students"],
  },
  "/inaugural": {
    eyebrow: "Inaugural · 26 Oct",
    title: "Inaugural Ceremony",
    lead: "Explains the format of Radiance and the workshops line-up, followed by a stand-up comedy show.",
    chips: ["Monday 26 Oct", "5:30–7:30 PM", "NIT Delhi students only"],
  },
  "/photowalk": {
    eyebrow: "Photo Walk · 31 Oct",
    title: "Delhi Photo Walk",
    lead: "A multi-location walk through Delhi by institute bus, with 4–5 stops across the city.",
    chips: ["Saturday 31 Oct", "Entire day", "90 NIT Delhi students"],
  },
  "/competitions": {
    eyebrow: "Competitions",
    title: "Compete across India, or on campus",
    lead: "A total prize pool of ₹25K+ across Unstop, in-campus and other prizes.",
    chips: ["Unstop · free · open to all students", "In-campus · NIT Delhi only"],
  },
  "/register": {
    eyebrow: "Registration",
    title: "Register for Radiance 2026",
    lead: "One registration, one ticket. Visit once, then show the QR or token ID at every event.",
    chips: [],
  },
};

export const SCHEDULE = [
  { day: "26", mon: "Oct", dow: "Mon", title: "Inaugural Ceremony", sub: "Plus stand-up comedy by Vaibhav Kant", time: "5:30–7:30 PM", who: "NIT Delhi only", href: "/inaugural" },
  { day: "27", mon: "Oct", dow: "Tue", title: "Photography Workshop", sub: "Powered by Nikon", time: "5:30–7:30 PM · 2 hrs", who: "NIT Delhi + outside (limited)", href: "/workshops" },
  { day: "28", mon: "Oct", dow: "Wed", title: "Cinematic Filmmaking Workshop", sub: "By Shoot Guru", time: "3:30–6:30 PM · 3 hrs", who: "NIT Delhi + outside (limited)", href: "/workshops" },
  { day: "29", mon: "Oct", dow: "Thu", title: "Motion Design Workshop", sub: "By Motion Nation (Abhishek)", time: "5:30–7:30 PM · 2 hrs", who: "NIT Delhi + outside (limited)", href: "/workshops" },
  { day: "30", mon: "Oct", dow: "Fri", title: "Graphic Design Workshop", sub: "By Gaurav Dholia", time: "5:30–7:30 PM · 2 hrs", who: "NIT Delhi + outside (limited)", href: "/workshops" },
  { day: "31", mon: "Oct", dow: "Sat", title: "Delhi Photo Walk", sub: "Multi-location, by institute bus", time: "Entire day", who: "90 selected NIT Delhi students", href: "/photowalk" },
  { day: "4", mon: "Nov", dow: "Wed", title: "Grand Exhibition, Day 1", sub: "Halloween theme", time: "3:30–10:00 PM", who: "Everyone · no registration", href: "/exhibition" },
  { day: "5", mon: "Nov", dow: "Thu", title: "Grand Exhibition, Day 2", sub: "Plus the closing of Radiance", time: "5:30–10:00 PM", who: "Everyone · no registration", href: "/exhibition" },
];

// admin-editable later (settings table)
export const NOTES = [
  { k: "Refreshments", t: "Provided to attendees of the inaugural ceremony and all four workshops." },
  { k: "SRHC campus bus", t: "NIT Delhi students based at the SRHC campus get a separate bus at 7:45 PM on 26, 27, 28, 29 and 30 Oct." },
];

export const STATS = [
  { n: "1000+", l: "Past participants" },
  { n: "₹25K+", l: "Prize pool this year" },
  { n: "200K+", l: "Social views across past editions" },
];

export const DISCIPLINES = ["Photography", "Filmmaking", "Motion Design", "Graphic Design"];
export const SPEAKERS = ["Ayush Kumar Tripathi", "Gaurav Dholia", "Shivam", "Anurag Roy", "Nitin Chandra"];
export const COLLABS = [
  { n: "Dice Academy", s: "logo" },
  { n: "Olympus Cameras", s: "logo" },
  { n: "Unstop", s: "logo" },
  { n: "Fabs", s: "Kirori Mal College, DU" },
  { n: "Pixels", s: "Hansraj College, DU" },
];
export const SLIDES = ["Inaugural", "Workshops", "Photo walk", "Exhibition", "Winners"];

export const WORKSHOPS = [
  { n: "01", date: "Tue 27 Oct", time: "5:30–7:30 PM · 2 hrs", title: "Photography Workshop", by: "Powered by Nikon", speaker: "Speaker to be announced", bio: "The speaker name and bio for the Nikon-powered photography workshop will be added here.", big: "Nikon", bigLabel: "Powered by", points: [] as string[], social: "Speaker social links", photo: "Nikon speaker" },
  { n: "02", date: "Wed 28 Oct", time: "3:30–6:30 PM · 3 hrs", title: "Cinematic Filmmaking Workshop", by: "By Shoot Guru", speaker: "Shoot Guru", bio: "Shoot Guru teaches cinematography and basic video editing and has 207K followers on Instagram.", big: "207K", bigLabel: "Instagram followers", points: ["Cinematography", "Basic video editing", "Participants are split into crews and make a short film on a given topic", "The best film wins prizes"], social: "Shoot Guru on Instagram", photo: "Shoot Guru" },
  { n: "03", date: "Thu 29 Oct", time: "5:30–7:30 PM · 2 hrs", title: "Motion Design Workshop", by: "By Motion Nation", speaker: "Abhishek · Motion Nation", bio: "Abhishek runs Motion Nation, a YouTube channel with 250K+ subscribers, and teaches motion designing.", big: "250K+", bigLabel: "YouTube subscribers", points: ["Motion designing"], social: "Motion Nation on YouTube", photo: "Abhishek" },
  { n: "04", date: "Fri 30 Oct", time: "5:30–7:30 PM · 2 hrs", title: "Graphic Design Workshop", by: "By Gaurav Dholia", speaker: "Gaurav Dholia", bio: "Gaurav Dholia is an expert graphic designer with many years of experience. He also spoke at a previous Radiance.", big: "Returning", bigLabel: "Past Radiance speaker", points: [] as string[], social: "Gaurav Dholia on Instagram", photo: "Gaurav Dholia" },
];

export const INAUG_STEPS = [
  { n: "01", t: "The format of Radiance", d: "How the eight days are organised and how the Universal Pass works." },
  { n: "02", t: "The workshops line-up", d: "A walkthrough of the four workshops and their speakers." },
  { n: "03", t: "Stand-up comedy by Vaibhav Kant", d: "The evening closes with a comedy show." },
];
export const INAUG_FACTS = [
  { k: "Date", v: "Monday 26 Oct" },
  { k: "Time", v: "5:30–7:30 PM" },
  { k: "Who can attend", v: "NIT Delhi students only" },
  { k: "Venue", v: "To be announced" },
  { k: "Refreshments", v: "Provided" },
  { k: "SRHC campus bus", v: "7:45 PM" },
];

export const WALK_SESSIONS = [
  { n: "01", t: "Inaugural", d: "26 Oct" },
  { n: "02", t: "Photography", d: "27 Oct" },
  { n: "03", t: "Filmmaking", d: "28 Oct" },
  { n: "04", t: "Motion Design", d: "29 Oct" },
  { n: "05", t: "Graphic Design", d: "30 Oct" },
];
export const WALK_INFO = [
  { k: "Locations", v: "To be revealed soon", d: "4–5 stops across Delhi, boarded by institute bus." },
  { k: "Collaborating colleges", v: "To be revealed soon", d: "Partner institutes join the walk." },
  { k: "Date and time", v: "31 Oct · Entire day", d: "Saturday, for the selected students." },
];

// placeholder competitions; become a DB table (admin-managed) in the admin phase
export const ONLINE_COMPS = [
  { genre: "Photography", title: "Theme-Based Photography Competition", desc: "A national-level photography competition for students from colleges across India.", prize: "₹8,000" },
  { genre: "Filmmaking", title: "Film Making Competition", desc: "A short film competition open to filmmakers and film clubs across India.", prize: "₹10,000" },
  { genre: "Graphic design", title: "Poster Design Competition", desc: "A poster design competition for student designers.", prize: "₹4,000" },
];
export const CAMPUS_COMPS = [
  { genre: "Photography", title: "In-Campus Photography Contest", desc: "Open to NIT Delhi students. Submit your entry through the Google Form.", prize: "₹3,000" },
  { genre: "Short video", title: "In-Campus Short Video Contest", desc: "Open to NIT Delhi students. Submit your entry through the Google Form.", prize: "₹3,000" },
];

export const EX_DAYS = [
  { k: "Day 1", date: "Wed 4 Nov", time: "3:30 PM – 10:00 PM", note: "Halloween theme" },
  { k: "Day 2", date: "Thu 5 Nov", time: "5:30 PM – 10:00 PM", note: "Closing of Radiance" },
];
export const EX_SECTIONS = [
  ["Activities & Games", "Snakes and ladders and other games, plus a Polaroid and photo booth."],
  ["Food Stalls", "Food stalls open through both evenings."],
  ["Movie Screenings", "Screenings in the LT."],
  ["Performances", "Live performances on stage."],
  ["Best Photographs", "A display of the best photographs from Radiance."],
  ["Best Films", "The best films from the in-house film competition."],
  ["Prizes", "Prizes for the best work across Radiance."],
].map(([t, d], i) => ({ n: "0" + (i + 1), t, d }));

export const WORKSHOP_OPTIONS = [
  { key: "photo", name: "Photography", d: "27 Oct · 5:30–7:30 PM" },
  { key: "film", name: "Cinematic Filmmaking", d: "28 Oct · 3:30–6:30 PM" },
  { key: "motion", name: "Motion Design", d: "29 Oct · 5:30–7:30 PM" },
  { key: "graphic", name: "Graphic Design", d: "30 Oct · 5:30–7:30 PM" },
] as const;
// Sessions that count toward photo walk selection.
export const CORE = ["inaugural", "photo", "film", "motion", "graphic"] as const;
export type WorkshopKey = (typeof WORKSHOP_OPTIONS)[number]["key"];

// admin-editable later (settings table)
export const CONSENTS = {
  nit: [
    { key: "comedy", t: "Stand-up Comedy Show Guidelines", d: "I understand the show may contain mature or edgy humour and accept the audience conduct rules: no recording, no heckling, respectful behaviour." },
    { key: "walk", t: "Photo Walk Undertaking", d: "I accept responsibility for my personal safety, will follow bus and group discipline and the organizers' instructions, will not leave the group, and understand the institute is not liable for personal belongings." },
  ],
  outside: [
    { key: "norms", t: "Institute Norms Guideline", d: "I agree to follow NIT Delhi's institute rules and code of conduct while on campus." },
  ],
};
