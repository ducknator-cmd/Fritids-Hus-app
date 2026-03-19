# Product Requirements Document: Fritidshus Finder – Travel Time Search & Filtering

## Overview
This PRD covers the search, filtering, and sorting capabilities of Fritidshus Finder. The core insight from user research is that standard property sites (Boligsiden) lack travel-time-based filtering and meaningful sorting for holiday home buyers. This feature set replaces "scroll-and-hope" browsing with focused, relevant results.

## Goals
- Let the user instantly filter out properties that are too far away (by driving time, not straight-line distance).
- Support filtering on the attributes that matter most: quiet location, heating source, plot size, flexbolig.
- Offer multiple sort options so the user can view properties in the order most useful to their current thinking.

## Dependencies
- Requires MVP data model (`properties` and `settings` tables) from PRD_MVP.
- Requires Google Maps Distance Matrix API for travel time resolution.
- `home_address` and `max_drive_minutes` must be set in `settings`.

## User Stories
- As a user, I want to filter properties by maximum driving time from my home address so that I only see properties I would realistically consider.
- As a user, I want to filter by heating source so that I can exclude properties with undesirable heating (oil boiler, pellet boiler).
- As a user, I want to filter by minimum plot size so that I can find properties with a large garden.
- As a user, I want to filter by flexbolig status so that I can include or exclude properties based on zoning.
- As a user, I want to sort by Match Score, driving time, or price so that the most relevant properties appear first.
- As a user, I want to see my active filters clearly so that I know why certain properties are hidden.

## Features

### Feature 1: Travel Time Filter (Critical)
**Description:** Filter the property list to only show properties whose `drive_time_minutes` is ≤ the selected maximum.

**Requirements:**
- **FR1.1**: A slider or input field in the filter panel accepts a maximum drive time (0–120 minutes, default from `settings.max_drive_minutes`).
- **FR1.2**: When a property is added or its address is changed, the app calls Google Distance Matrix API to calculate `drive_time_minutes` from `settings.home_address`. The result is cached in the DB column.
- **FR1.3**: Properties where `drive_time_minutes` is null (not yet resolved) are shown at the bottom of the list with a "Calculating…" badge, not hidden.
- **FR1.4**: The filter is applied in real time as the slider moves (client-side, using cached values).
- **FR1.5**: The filter panel shows the current value: e.g. "Within 35 min".

**API details:**
- Endpoint: `https://maps.googleapis.com/maps/api/distancematrix/json`
- Mode: `driving`
- Departure time: `now` (to get realistic traffic estimate)
- Origin: `settings.home_address`
- Destination: `properties.address`
- Store `duration_in_traffic.value / 60` (rounded) in `drive_time_minutes`.

### Feature 2: Attribute Filters
**Description:** A collapsible filter panel on the property list screen with the following filters. All filters are combined with AND logic.

| Filter | Type | Options |
|---|---|---|
| Max drive time | Slider | 0–120 min |
| Max price | Slider | 0–10 000 000 DKK |
| Min plot area | Input (m²) | Numeric |
| Heating source | Multi-select | Varmepumpe, Fjernvarme, Jordvarme, Naturgas, Elvarme, Oliefyr, Pillefyr, Andet |
| Flexbolig | Toggle | All / Yes only / Possible too |
| Condition | Multi-select | Indflytningsklar, Let renovering, Større renovering |
| Category | Multi-select | Top pick, Maybe, No-go, Unsorted |

**Requirements:**
- **FR2.1**: Each filter defaults to "show all" (no restriction).
- **FR2.2**: A "Reset filters" button restores all defaults.
- **FR2.3**: An active filter count badge on the filter toggle button shows how many filters are active (e.g. "Filters (3)").
- **FR2.4**: Filter state is persisted in `localStorage` so it survives page refresh.

### Feature 3: Sorting
**Description:** A sort dropdown on the property list header.

| Sort option | Description |
|---|---|
| Match Score ↓ (default) | Highest scoring first |
| Drive time ↑ | Closest first |
| Price ↑ | Cheapest first |
| Price ↓ | Most expensive first |
| Plot area ↓ | Largest plot first |
| Recently added ↓ | Newest entry first |

**Requirements:**
- **FR3.1**: Sort is applied after filters.
- **FR3.2**: Sort selection is persisted in `localStorage`.

### Feature 4: Result Count & Empty State
- **FR4.1**: The list header shows "Showing X of Y properties".
- **FR4.2**: If filters produce zero results, display: "No properties match your current filters. Try adjusting the drive time or other filters." with a "Reset filters" button.

## UI Layout
```
┌─────────────────────────────────────────────────┐
│  [🔍 Filters (2)]        Sort: Match Score ↓ ▾  │
│─────────────────────────────────────────────────│
│  Showing 7 of 12 properties                     │
│─────────────────────────────────────────────────│
│  [Property Card] [Property Card] [Property Card]│
│  ...                                            │
└─────────────────────────────────────────────────┘

Filter panel (slide-in or collapsible section above list):
┌────────────────────────────┐
│ Max drive time  [──●──] 35 min │
│ Max price       [──●──] 3.5M  │
│ Min plot        [____] m²     │
│ Heating         [✓] Varmepumpe [✓] Fjernvarme … │
│ Flexbolig       (•) All  ( ) Yes  ( ) Possible  │
│ Condition       [✓] Indfl. [✓] Let …            │
│                 [Reset filters]                  │
└────────────────────────────┘
```

## Acceptance Criteria
- Filtering by max drive time hides properties with higher `drive_time_minutes` in real time.
- Newly added properties automatically get their `drive_time_minutes` populated via the API before the next list render.
- All attribute filters work individually and in combination.
- Sort order changes are reflected immediately.
- Active filter count badge is accurate.
- Filter and sort state survive a page refresh.
- Zero-result empty state is shown with a reset option.

## Non-Functional Requirements
- **NFR1**: Distance Matrix API is called at most once per property address (result cached in DB). Never called on every list render.
- **NFR2**: Google API key is stored in a server-side environment variable; the Distance Matrix call is proxied through a Supabase Edge Function or similar to avoid exposing the key in the browser.
- **NFR3**: Filter operations are purely client-side (no DB round-trip) since the full property list fits in memory.
