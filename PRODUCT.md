# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, JavaScript, plain CSS), confirmed by the user. Runs with `npm install && npm run dev`, no external services. Data lives in a JSON file on the server (`data/db.json`), seeded on first run.

## Users

- Everyday driver: wants price, location and the next free time, fast, on a phone.
- Busy professional: books ahead, pays online, wants no waiting and a reminder.
- Fleet / company manager: many cars, monthly invoice, bulk or recurring bookings.
- Center staff & manager: sees the day's bookings, assigns bays, edits prices, reads reports.

## Product Purpose

Moses Detailing is a dry-ice car wash and detailing center. The site is a booking system, not a brochure: it must turn visitors into bookings, cut the phone and WhatsApp back-and-forth, and fill quiet hours while keeping customers coming back (memberships, offers, reminders).

## Positioning

Dry-ice technology: grime is lifted at −78 °C without water or scratches. The logo carries "Dry Ice Technology".

## Capabilities and Constraints

- Book a Wash wizard: branch → vehicle → package → add-ons → date & time (only free slots per bay) → details (login, sign up or guest) → review & pay (InstaPay / mobile wallet transfer, confirmed by staff, or pay at the center; promo code) → confirmation with booking ID + QR → reminders 24 h and 1 h before with reschedule/cancel link → QR check-in with live status (queued, washing, ready) → rate & rebook.
- Admin dashboard edits everything on the site (user requirement): booking calendar, capacity & slots, staff & bays, services & prices, customers (CRM), memberships & payments, notifications, reports, and all site content.
- Arabic and English with full RTL/LTR; Arabic is the default.
- Mobile-first: most visitors are on phones.
- Two branches, both in Sheikh Zayed. No at-home (mobile) washing.
- Online payment is InstaPay or a mobile wallet transfer (Egypt); there is no card gateway.
- Won't have in v1: native apps, online shop, AI damage scan.

## Brand Commitments

- Name: Moses Detailing. Logo: MD monogram with a polisher, "Dry Ice Technology" (user-supplied, `public/brand/`).
- Palette from the brief: Copper #C07A31, Charcoal #181818, Black #000000, White #FFFFFF.
- Type from the brief: Bebas Neue (English display), Readex Pro (Arabic + English body; stand-in for Aeonik Arabic).
- Layout grid: 12 columns / margin 80 / gutter 24 desktop; 8 / 40 / 24 tablet; 4 / 20 / 16 mobile. Radius scale 0 / 4 / 8 / 12 / 16 / 32 / pill.

## Evidence on Hand

No real prices, branches, hours, reviews or photos yet. All of these are labelled sample data (user-approved) in `lib/seed.js`, editable from the admin. A demo banner says so on the site until the admin turns it off.

## Product Principles

1. Price, place and the next free time are never more than one tap away.
2. Every page leads to Book a Wash.
3. Quiet hours are sold, not hidden: off-peak slots carry their discount in the time picker.
4. Staff run the day from the admin, not from WhatsApp.

## Accessibility & Inclusion

WCAG 2.1 AA contrast, large touch targets (≥44 px), full keyboard support, `prefers-reduced-motion` respected, correct `lang`/`dir` per language.
