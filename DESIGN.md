# Design

The visual system of Moses Detailing, documented from the built site. Product truth lives in PRODUCT.md.

## World

Version 2 follows the client's reference ("Speed Wash" style): deep graphite panels with big rounded corners float on a near-black page. Vivid orange is used for actions, prices and two diagonal slashes behind the hero car. Headings are a heavy, sporty italic. One light "paper" panel (About) breaks up the dark page, and water spray is the only cool note.

## Color

| Token | Value | Role |
|---|---|---|
| `--copper` (orange) | #F5922F | Primary action, prices, active state, hero slashes |
| `--copper-hover` | #FFA64D | Hover |
| `--copper-press` | #D9781A | Pressed |
| `--copper-ink` | #FFB066 | Orange text on dark at small sizes |
| `--black` | #0B0C0E | Page background |
| `--charcoal` | #15171A | Panels, header on scroll |
| `--charcoal-2` | #101114 | Alternate bands |
| `--raised` | #1F2125 | Cards, choice tiles |
| `--line` / `--line-strong` | #26292E / #363A41 | Borders |
| `--text` / `--text-2` / `--muted` | #FFF / #D5D7DB / #A9ADB4 | Text tiers |
| `--paper` / `--ink` / `--ink-2` | #F4F3F3 / #141518 / #4A4D53 | Light About panel |
| `--frost` | #E6EEF2 | Water spray, booked status |

Text on orange is near-black #111 (≈9:1).

## Type

- English display: Kanit ExtraBold Italic (800). The hero is uppercase; section titles are in sentence case with an orange dash before them.
- English numbers and card titles: Kanit 600–800, upright.
- Arabic headings: Readex Pro 700, upright, with no italics or tracking in Arabic.
- Body (both scripts): Readex Pro, 16/1.5 in English and 16/1.75 in Arabic.

## Layout

12 / 8 / 4 columns at ≥1200 / ≥768 / below. Margins 80 / 40 / 20, gutters 24 / 24 / 16, max content 1280. Spacing scale 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96. Section padding is 96 on desktop and 64 on mobile. The layout uses logical properties throughout, so it mirrors in RTL.

## Radius

0 · 4 (tags) · 8 · 12 (inputs, slots) · 20 (cards, choice tiles, package cards) · 32 (panels: hero, About, CTA, ticket, stepper) · pill (all buttons, chips, segmented controls, booking bar on desktop).

## Components

- **Buttons:** pill shaped. Primary is orange with dark text, an arrow and a soft orange glow, plus a shine sweep; there are also ghost (white outline), dark (on orange) and round arrow buttons.
- **Hero panel:** copy on one side; on the other, a car carousel (one slide per car size, showing its price) with two orange slashes and a water splash; the feature row with dividers and the dot/arrow controls sit underneath.
- **Booking bar:** branch, car size, next free slot and Book in one pill on desktop; stacked on phones.
- **Choice tiles:** dark cards. Selected means an orange border plus a round orange check badge on the corner, and icon tiles (crown for packages, pin for branches).
- **Circle stepper:** done steps are orange with a check, the current step is a ring with a dot, and connecting lines fill orange as you go.
- **Tracking card:** avatar, ETA chip, dark street map with a dashed orange route, and a car row with a round call button.
- **Mobile bar:** a light app bar with a raised round orange Book button.

## Motion

- Hero cars slide and fade between sizes, and the water spray bursts in.
- The shine streak crosses orange buttons.
- The top-view car sways slowly in the About panel.
- The map route dashes along.
- Steps reveal from the inline-start edge.
- Reduced motion keeps state changes and removes travel.
