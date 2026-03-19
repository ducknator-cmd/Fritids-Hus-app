# Product Requirements Document: Fritidshus Finder – Match Score

## Overview
The Match Score is the central differentiator of Fritidshus Finder. Every property receives a score from 0 to 100 that reflects how well it matches the user's personal priorities. The score makes it immediately clear which properties deserve attention — without the user having to mentally weigh every attribute themselves.

The score is calculated from four weighted dimensions. The user can adjust the weights in Settings, but sensible defaults are pre-configured based on the user's stated priorities.

## Goals
- Give each property a single, meaningful score that the user can trust.
- Make the score transparent: show which factors are helping or hurting each property.
- Allow the user to tune the weights so the score reflects evolving priorities.

## Dependencies
- Requires MVP data model from PRD_MVP (specifically `properties` and `settings` tables).
- `drive_time_minutes` must be populated (see PRD_TravelTimeSearch).

## Scoring Model

### Formula
```
match_score = (quiet_score    * weight_quiet)
            + (distance_score * weight_distance)
            + (condition_score_norm * weight_condition)
            + (price_score    * weight_price)
```
All component scores are normalised to **0–100** before weighting. The weights must sum to 1.0.

### Default weights (from user priorities)
| Dimension | Default weight |
|---|---|
| Quiet / no noise | 0.40 |
| Distance (drive time) | 0.30 |
| Condition / low maintenance | 0.20 |
| Price | 0.10 |

---

### Dimension 1: Quiet Score (weight: 0.40)
Combines `noise_score` and `rural_score` to proxy for how quiet and secluded the property is.

```
quiet_component = (noise_score * 0.6) + (rural_score * 0.4)
quiet_score = ((quiet_component - 1) / 4) * 100
```

`noise_score` and `rural_score` are integers 1–5 entered manually by the user per property.

**Scoring guide (shown in the property form as helper text):**

| noise_score | Meaning |
|---|---|
| 5 | No road nearby, completely quiet |
| 4 | Occasional distant traffic |
| 3 | Noticeable road noise at times |
| 2 | Persistent road noise |
| 1 | Heavy traffic / highway nearby |

| rural_score | Meaning |
|---|---|
| 5 | Isolated, no neighbours visible |
| 4 | Few scattered neighbours |
| 3 | Small village / loose settlement |
| 2 | Noticeable density |
| 1 | Suburban or urban |

---

### Dimension 2: Distance Score (weight: 0.30)
Based on `drive_time_minutes` from home address.

```
if drive_time_minutes <= 20:  distance_score = 100
if drive_time_minutes <= 30:  distance_score = 85
if drive_time_minutes <= 45:  distance_score = 60
if drive_time_minutes <= 60:  distance_score = 35
if drive_time_minutes <= 90:  distance_score = 15
if drive_time_minutes >  90:  distance_score = 0
```

If `drive_time_minutes` is null: distance_score = 50 (neutral, pending resolution).

---

### Dimension 3: Condition Score (weight: 0.20)
Combines the property's physical condition and its heating source quality.

```
condition_component = (condition_score * 0.6) + (heating_score * 0.4)
condition_score_norm = ((condition_component - 1) / 4) * 100
```

`condition_score` is an integer 1–5 entered manually.

| condition_score | condition field value |
|---|---|
| 5 | Indflytningsklar (move-in ready) |
| 3 | Let renovering (light renovation) |
| 1 | Større renovering (major renovation) |

`heating_score` is derived automatically from `heating_source`:

| heating_source | heating_score |
|---|---|
| Varmepumpe (luft/luft or luft/vand) | 5 |
| Jordvarme (ground source heat pump) | 5 |
| Fjernvarme (district heating) | 5 |
| Naturgas | 3 |
| Elvarme | 3 |
| Pillefyr (pellet boiler) | 2 |
| Oliefyr (oil boiler) | 1 |
| Andet / Unknown | 2 |

---

### Dimension 4: Price Score (weight: 0.10)
Based on how the asking price compares to `settings.max_budget`.

```
if price <= max_budget * 0.75:  price_score = 100
if price <= max_budget * 0.90:  price_score = 80
if price <= max_budget:         price_score = 60
if price <= max_budget * 1.10:  price_score = 30
if price >  max_budget * 1.10:  price_score = 0
```

If `max_budget` is 0 or null: price dimension is excluded and weights for remaining three dimensions are renormalised proportionally.

---

## Score Badges
Display the Match Score as a colour-coded badge on every property card and on the detail screen:

| Score range | Colour | Label |
|---|---|---|
| 80–100 | Green | Strong match |
| 60–79 | Yellow/amber | Good match |
| 40–59 | Orange | Partial match |
| 0–39 | Red | Poor match |

---

## Score Breakdown (Transparency)
On the property detail screen, show a breakdown panel below the score badge:

```
Match Score: 78  [Good match]

┌───────────────────────────────────────────────────┐
│ Quiet / no noise     ████████░░  82  (×0.40 = 33) │
│ Distance             █████░░░░░  54  (×0.30 = 16) │
│ Condition            ████████░░  80  (×0.20 = 16) │
│ Price                █████████░  90  (×0.10 = 9)  │
│                                       Total: 74   │
└───────────────────────────────────────────────────┘
Tip: Drive time of 44 min is pulling the distance score down.
```

**Requirements:**
- **FR1**: Each dimension shows its raw sub-score, its weight, and its weighted contribution.
- **FR2**: A plain-language tip is generated for the lowest-scoring dimension:
  - quiet < 50: "Noise or traffic nearby is reducing this property's score."
  - distance < 50: "Drive time of X min is pulling the distance score down."
  - condition < 50: "The heating source or renovation need is reducing this score."
  - price < 50: "Asking price is above your budget, reducing the score."

---

## Recalculation Triggers
The `match_score` column in the DB is a cached value. Recalculate and persist whenever:
- A property's scored attributes change (any of: `noise_score`, `rural_score`, `drive_time_minutes`, `condition_score`, `heating_source`, `price`).
- Any weight changes in `settings`.
- `max_budget` changes in `settings`.

Recalculation can be done client-side and then written back to `properties.match_score` via an upsert.

---

## Settings Screen – Weight Adjustment
The Settings screen must include a "Match Score Weights" section:

- Four sliders (one per dimension), each 0–100 in increments of 5.
- Sliders are linked: when one changes, the others adjust proportionally so the total always equals 100.
- A live preview shows the re-ordered top-5 properties after the weight change.
- A "Reset to defaults" button restores 40/30/20/10.

---

## User Stories
- As a user, I want every property to show a single score so that I can quickly see which ones deserve attention.
- As a user, I want to understand why a property scored the way it did so that I can decide whether to investigate further.
- As a user, I want to adjust the weights so that the score reflects what matters most to me at this point in my search.
- As a user, I want the score to update automatically when I change settings so that my shortlist stays accurate.

## Acceptance Criteria
- Every property in the list shows a colour-coded Match Score badge.
- The score breakdown panel on the detail screen shows all four dimensions with weights and contributions summing to the displayed total (±1 rounding).
- A plain-language tip is shown for the weakest dimension.
- Changing weights in Settings immediately re-orders the property list.
- Score is recalculated and persisted to DB after any relevant field update.
- If max_budget is not set, the price dimension is excluded and the other three weights renormalise correctly.

## Non-Functional Requirements
- **NFR1**: Score calculation is pure client-side arithmetic — no API call needed. Must be instant.
- **NFR2**: The scoring formula and default weights are documented in a `matchScore.js` utility file with inline comments so any developer can understand and modify the logic.
