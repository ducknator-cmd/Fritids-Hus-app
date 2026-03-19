# Product Requirements Document: Fritidshus Finder – MVP

## Overview
Fritidshus Finder is a personal decision-support tool for finding and choosing a holiday home (fritidshus) in Denmark. Unlike standard property search sites (e.g., Boligsiden), this app acts as a decision assistant: it filters, scores, organises, and compares properties based on the user's personal priorities — helping them make a confident, well-reasoned purchase decision rather than endlessly browsing.

The MVP is a focused, single-user web application backed by a simple database. Properties can be added manually. The app is primarily used in the evenings and weekends, sometimes together with a partner.

## Goals
- Reduce time wasted on irrelevant listings by applying travel-time and lifestyle-based filters.
- Surface which properties best match the user's priorities via a weighted Match Score.
- Provide structure for saving, categorising, and annotating properties of interest.
- Enable direct side-by-side comparison of shortlisted properties.

## Target User Profile
- Looking for a holiday/leisure home (fritidshus or flexbolig) in Denmark.
- Lives in or near Vejle; wants properties within ~30 minutes' drive.
- Top priorities (in order): Quiet/no noise → Distance from home → Low maintenance → Price.
- Dealbreakers: road noise, traffic nearby, high maintenance (e.g., wood cladding, painted masonry).
- Wants: rural setting, large plot, few neighbours, good heating source (heat pump, district heating, ground source preferred; oil boiler / pellet boiler are negatives).
- Also values: possibility of flexbolig status if not already a year-round holiday home.

## Features (MVP Scope)
1. **Manual Property Entry** – Add properties by URL or by filling in a form with key attributes.
2. **Travel Time Filter** – Filter properties by driving time from a home address.
3. **Match Score** – Weighted score (0–100) per property reflecting the user's priorities.
4. **Shortlist Management** – Save properties with categories (Top pick / Maybe / No-go) and free-text notes.
5. **Side-by-Side Comparison** – Compare 2–3 properties across key attributes.
6. **Property List with Sorting** – Sort by Match Score, distance, or price.

## Out of Scope for MVP
- Automated scraping or real-time sync with Boligsiden / DBA.
- AI chat interface.
- Multi-user / sharing features.
- Push notifications.
- Native mobile app (web-first is sufficient).
- Automatic noise/traffic data retrieval.

## Tech Stack (Recommended)
| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React (Vite) | Fast setup, good ecosystem, easy to vibe-code |
| Styling | Tailwind CSS | Rapid UI, no custom CSS needed |
| Backend / DB | Supabase (PostgreSQL) | Auth, DB, and REST API out of the box |
| Maps / Travel time | Google Maps JavaScript API + Distance Matrix API | Best travel-time accuracy in DK |
| Hosting | Vercel | One-click deploy from GitHub |

## Data Model

### `properties` table
| Column | Type | Description |
|---|---|---|
| id | uuid PK | Auto-generated |
| created_at | timestamp | Auto-generated |
| title | text | E.g. "Søvej 12, Juelsminde" |
| source_url | text | Link to original listing (Boligsiden etc.) |
| address | text | Full address for geocoding |
| lat | float | Latitude (resolved from address) |
| lng | float | Longitude (resolved from address) |
| price | integer | Asking price in DKK |
| living_area_m2 | integer | Living area in m² |
| plot_area_m2 | integer | Plot/ground size in m² |
| rooms | integer | Number of rooms |
| build_year | integer | Year built |
| heating_source | text | E.g. "Varmepumpe", "Fjernvarme", "Oliefyr" |
| heating_score | integer | 1–5 (derived: 5=heat pump/district, 1=oil) |
| is_flexbolig | boolean | Already approved as flexbolig? |
| flexbolig_possible | boolean | Zoning allows flexbolig application? |
| condition | text | "Indflytningsklar" / "Let renovering" / "Større renovering" |
| condition_score | integer | 1–5 (5=move-in ready, 1=major work needed) |
| rural_score | integer | 1–5 (5=very rural, few neighbours) |
| noise_score | integer | 1–5 (5=very quiet, 1=noisy road) |
| drive_time_minutes | integer | Driving time from home address (cached) |
| match_score | float | Calculated weighted score 0–100 |
| category | text | "top_pick" / "maybe" / "no_go" / null |
| notes | text | Free-text user notes |
| status | text | "active" / "sold" / "archived" |

### `settings` table (single row)
| Column | Type | Description |
|---|---|---|
| id | integer PK | Always 1 |
| home_address | text | User's home address for travel time |
| max_drive_minutes | integer | Default max travel time filter |
| weight_quiet | float | Match score weight (default 0.40) |
| weight_distance | float | Match score weight (default 0.30) |
| weight_condition | float | Match score weight (default 0.20) |
| weight_price | float | Match score weight (default 0.10) |
| max_budget | integer | Budget ceiling in DKK |

## Build Order
1. **Scaffold & DB** – Set up Vite + React + Tailwind, connect Supabase, run migrations to create tables.
2. **Manual Property Entry** – Form to add/edit a property with all fields. List view with basic sort.
3. **Match Score calculation** – Compute and display score on list and detail views.
4. **Shortlist features** – Category badge, notes field, filter by category.
5. **Travel time integration** – Resolve drive time via Google Distance Matrix; add travel-time filter.
6. **Comparison view** – Select 2–3 properties and compare side by side.
7. **Settings screen** – Edit home address, weights, budget.

## Non-Functional Requirements
- **NFR1**: Page load under 3 seconds on a standard broadband connection.
- **NFR2**: Works in Chrome, Firefox, Edge (desktop).
- **NFR3**: Responsive layout — usable on a tablet (iPad) as well as desktop.
- **NFR4**: Google Maps API key stored in environment variables, never committed to source.

## Acceptance Criteria
- User can add a property with all relevant fields and see it appear in the list.
- Match Score is displayed on every property card and updates when weights change in Settings.
- User can filter the list to only show properties within X minutes' drive.
- User can assign a category and write notes on any property.
- Comparison view shows at least 6 key attributes side by side for 2–3 selected properties.
- App is deployable to Vercel with a single command.
