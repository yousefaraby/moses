# Moses Detailing: dry-ice car wash booking system

A bilingual (Arabic / English) car wash website and booking system, built with Next.js (App Router, JavaScript and plain CSS). It includes the customer site, the 7-step Book a Wash flow with live slots, QR check-in and live status, customer accounts, memberships and gift cards, and an admin dashboard where staff can edit everything on the site.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. It opens in Arabic (`/ar`); switch to English (`/en`) from the header.

- **Admin:** http://localhost:3000/ar/admin. The demo password is `moses-admin`. To change it, copy `.env.example` to `.env.local` and set `ADMIN_PASSWORD` and `SESSION_SECRET`.
- **Customer login:** use any Egyptian mobile number, for example `01001112233`, which is a sample customer that already has bookings. In demo mode the 4-digit code appears on screen.
- **InstaPay demo:** pick InstaPay at the payment step, then confirm it from Admin › Booking calendar.
- **Promo codes to try:** `WELCOME10` (first booking only), `SHINE100`, and the gift card `GIFT-DEMO-1000`.
- **Reset the demo data:** use Admin › Settings › Reset demo data, or run `npm run reset-data`.

You need Node.js 20.9 or newer. There is no database or other setup: data is saved to `data/db.json`, which is created from `lib/seed.js` on the first request.

## What's inside (mapped to the brief)

| Brief | Where |
|---|---|
| Business goals, users, MoSCoW, sitemap, booking flow, design system | `/[lang]/design-system`, linked in the footer; the content is editable in Admin › Site content › Project brief |
| Header nav, sticky Book a Wash, footer links | `components/site/*`. On phones, a bottom bar puts Book a Wash in the thumb zone |
| Services, Pricing & packages, Memberships (plans, bundles, fleet, gift cards) | `app/[lang]/(site)/services`, `pricing`, `memberships` |
| Locations with live wait time, hours, facilities, map | `app/[lang]/(site)/locations` |
| About (story, before/after gallery, reviews, eco, careers), Contact, FAQ, legal pages | `about`, `contact`, `faq`, `legal/[slug]` |
| Book a Wash: branch → car → package → add-ons → date & time (free slots only) → details (log in or guest) → review & pay (InstaPay / wallet or at the center, promo code) | `components/book/BookingWizard.js` |
| Confirmation with booking ID and QR, reminders, reschedule or cancel by link, check-in, live status, rate & rebook | `app/[lang]/(site)/booking/[id]` and `components/book/BookingLive.js` |
| My account: bookings, saved cars, membership & points, invoices | `components/AccountApp.js` |
| Admin: dashboard, booking calendar, capacity & slots, staff & bays, services & prices, customers (CRM), memberships & payments, notifications, reports, inbox, site content, settings | `app/[lang]/admin/*` |

### How the system works

- **Branches:** two, both in Sheikh Zayed (sample names and addresses; edit them in Admin › Capacity & slots). At-home washing is switched off.
- **Slots** (`lib/engine.js`): each booking is placed in a specific bay. A start time is offered only if a bay is free for the full wash time. The wash time comes from the package and car size plus the add-ons. Opening hours, blocked times, lead time and how many days ahead customers can book are all set in Admin › Capacity & slots.
- **Pricing:** the price comes from a package × car size table plus add-ons. A quiet-hours discount (by default Sunday–Wednesday, 12–4 pm, −20%) is applied automatically and shown on those slots in the time picker. A promo code or gift card replaces it only when it's worth more.
- **Messages:** confirmations, reminders and the "car is ready" message are written into Admin › Notifications › Sent messages, using templates you can edit there. To send them for real, connect an SMS / WhatsApp / email provider in `lib/notify.js`.
- **Payments:** customers choose **InstaPay / mobile wallet** or **Pay at the center**. With InstaPay they see your InstaPay address and wallet number (set them in Admin › Settings), transfer the amount, and can add the transfer reference. The booking is held as "Awaiting InstaPay confirmation" until staff press **Confirm InstaPay received**: in the booking calendar for bookings, and in Memberships & payments for plans and gift cards.
- **Login codes:** to send real SMS codes, connect a provider in `app/api/auth/otp/route.js` and remove `demoCode` from that route's response.

## Design decisions

**Version 2 follows the reference you sent ("Speed Wash" style).**

- **Hero:** a rounded graphite panel. The headline is a heavy italic with the last words in orange, followed by a subtitle and Book Now / See prices pill buttons. Next to it is a car carousel: one slide per car size with its starting price, two orange diagonal slashes behind it, and a water splash. Underneath are a feature row with dividers and the dot/arrow controls.
- **Booking bar** under the hero: branch, car size and the next free slot, with a Book button.
- **About panel:** a light panel. "About Moses Detailing" with the orange dash, three stats taken from the real data (branches, average rating, days open), Book Now and "How it works", and a top-view car on an orange circle with a ring of water drops.
- **Packages:** cards with crown icons, the price on the right, an orange border and a round check badge on the most-booked one.
- **Booking flow:** like the reference app. A circle stepper (orange check for done steps), dark choice cards with icon tiles and a check badge when selected, and a full-width orange Continue pill.
- **Booking page:** a "Tracking your wash" card with an avatar, an ETA chip, a street map with an orange route, and a call button.
- **Phones:** a light bottom app bar with a raised round orange Book button, as in the reference.
- **Other pages:** orange slashes on the page headers, an orange closing panel with a dark button, and pill buttons everywhere.
- **Motion:**
  - car slides and the splash between sizes
  - the shine across orange buttons
  - a slow sway on the top-view car
  - the dashed route moving on the map
  - the mist page transition, kept from version 1

  All of it respects `prefers-reduced-motion`.
- **Colours:** orange `#F5922F` (hover `#FFA64D`, pressed `#D9781A`) on graphite `#15171A` and night `#0B0C0E`, with the light panel `#F4F3F3`. Text on orange is near-black (≈9:1 contrast).
- **Fonts** (self-hosted, no Google calls):
  - **Kanit ExtraBold Italic** for English headings and numbers. The reference's heavy, slanted, sporty lettering is matched best by Kanit among free fonts, and it suits cars. Montserrat was the other close option, but it's on most sites already.
  - **Readex Pro** for Arabic and body text: the closest free match to Aeonik Arabic, and one family covers both scripts. Arabic headings stay upright (Readex Pro Bold), because Arabic shouldn't be slanted.
- **Grid & radius:** the brief's grid is kept (12/80/24 desktop, 8/40/24 tablet, 4/20/16 phone). Radius is larger now: 32 for panels, 20 for cards, pills for every button.
- **RTL:** the whole site mirrors in Arabic, including the slashes, the car and the stepper.

## Images to replace with real photos

All current images are drawn placeholders, so nothing breaks before you have photos.

| Placeholder | File | Replace with |
|---|---|---|
| Hero car carousel | `components/home/HeroCars.js` (draws `CarArt` + `Splash`) | A cut-out car photo per size (transparent PNG/WebP, about 960×420), like the silver car in the reference. Swap `<CarArt>` for `<img>` |
| About top-view car | `components/home/TopViewCar.js` | A top-down car photo on the orange circle |
| Gallery before/after pairs | `components/CarArt.js` (used by `components/BeforeAfter.js`) | Real before/after photo pairs (same angle). Put them in `public/images/` and render `<img>` in the two layers of `BeforeAfter.js` |
| Tracking map | `components/book/BookingLive.js` (`TrackCard`) | A live map (Google Maps / Mapbox) when you track mobile-wash vans |
| Service illustrations | `app/[lang]/(site)/services/page.js` (the `ART` map) | One photo per service |
| Branch map | `components/BranchMap.js` | An embedded Google Map / Mapbox. Each branch already has a Google Maps link for directions |
| Top-down car in the add-ons step | `components/book/TopCar.js` | Can stay as a drawing; it's interactive UI |
| Reviews, team, prices, branches, hours | `lib/seed.js`, or edit from Admin | Real data. The "demo site" banner can be turned off in Admin › Settings |
| Logo | `public/brand/logo-mark.png`, `logo-full.png` | Made from your logo; swap them if you have vector (SVG) files |

## Project structure

```
app/
  [lang]/(site)/…      customer pages (home, services, pricing, memberships, book, booking/[id], account…)
  [lang]/admin/…       staff login and dashboard
  api/…                route handlers (slots, quote, bookings, auth, account, messages, admin…)
  globals.css          tokens, fonts, base, type
  ui.css site.css book.css admin.css
components/            UI building blocks (site shell, booking, admin editors, car art, icons)
lib/
  engine.js            slots, durations, pricing, wait times (pure, shared client/server)
  db.js seed.js        JSON file store + sample data
  dict.js i18n.js      interface strings (AR/EN) and formatting
  adminSchema.js       what every admin editor can edit
proxy.js               sends / to /ar or /en
```

## Going to production

- **Database:** `data/db.json` suits a single server, such as a VPS run with `npm run build && npm start`. Serverless hosts like Vercel don't keep files between requests, so move to a real database (Postgres, SQLite, Supabase…) behind the same functions in `lib/db.js`.
- **Settings:** set `ADMIN_PASSWORD` and `SESSION_SECRET`.
- **Providers:** connect SMS, WhatsApp, email and payment providers at the points listed under "How the system works".
