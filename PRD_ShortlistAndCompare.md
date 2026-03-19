# Product Requirements Document: Fritidshus Finder – Shortlist & Comparison

## Overview
This PRD covers the features that turn browsing into decision-making: saving properties to a structured shortlist with categories and notes, and comparing selected properties side by side. These features directly address the user's pain points of having no good way to organise saved properties and no easy way to compare them.

## Goals
- Allow the user to capture and organise their thinking about each property while it is fresh.
- Provide a clear, structured view for comparing 2–3 shortlisted properties on the attributes that matter.
- Prevent the "I looked at 40 houses and can't remember anything" problem.

## Dependencies
- Requires MVP data model from PRD_MVP (`properties` table: `category`, `notes`, `status` columns).
- Match Score must be implemented (PRD_MatchScore) so comparisons include the score.

## User Stories
- As a user, I want to mark a property as "Top pick", "Maybe", or "No-go" so that I can quickly see the status of my shortlist.
- As a user, I want to write free-text notes on a property so that I can record what I liked or was worried about.
- As a user, I want to select 2–3 properties and compare them side by side so that I can make a final decision with confidence.
- As a user, I want to archive sold or withdrawn properties so that they don't clutter my list.

---

## Feature 1: Category Assignment

**Description:** Each property can be assigned one of four categories. Categories are shown as a badge on property cards and can be used as a filter.

| Category value | Display label | Colour |
|---|---|---|
| `top_pick` | ⭐ Top pick | Green |
| `maybe` | 🤔 Maybe | Yellow |
| `no_go` | ✗ No-go | Red |
| null | — Unsorted | Grey |

**Requirements:**
- **FR1.1**: Category can be set from the property card (one-tap/click) and from the property detail screen.
- **FR1.2**: On the property card, show the category badge prominently (top-right corner).
- **FR1.3**: The property list can be filtered by category (see PRD_TravelTimeSearch Feature 2).
- **FR1.4**: Changing the category updates `properties.category` in the DB immediately.
- **FR1.5**: A "No-go" property is not hidden, but is visually de-emphasised (muted card style) unless the "No-go" category filter is explicitly selected.

---

## Feature 2: Notes

**Description:** Each property has a free-text notes field where the user can record observations, concerns, and impressions.

**Requirements:**
- **FR2.1**: The notes field is located on the property detail screen below the score breakdown.
- **FR2.2**: Notes are auto-saved (debounced, 1 second after last keystroke) — no explicit save button needed.
- **FR2.3**: If a property has notes, show a small note icon (📝) on its card in the list view as a visual indicator.
- **FR2.4**: Notes support plain text only (no markdown rendering needed for MVP).
- **FR2.5**: Notes are included in the comparison view (truncated to ~150 characters with "Show more").

**Prompt suggestions (shown as placeholder text in the notes field):**
> "What did you like about this property? What concerns you?"

---

## Feature 3: Side-by-Side Comparison

**Description:** The user can select 2–3 properties and view them in a comparison table. This is the primary decision-making screen.

### Entering comparison mode
- Each property card has a checkbox or "Compare" toggle.
- When 2 or more are selected, a sticky banner appears at the bottom: "2 properties selected — [Compare]".
- Maximum 3 properties can be compared at once. If a 4th is selected, show a toast: "Maximum 3 properties can be compared at once."

### Comparison table layout
Rows = attributes. Columns = selected properties (max 3).

The winning value in each row is highlighted (bold + light background).

| Row | Attribute | Notes |
|---|---|---|
| — | Property photo (if available) | First image from listing URL, or placeholder |
| — | Address + title | — |
| — | **Match Score** | Colour-coded badge |
| — | Category | Badge |
| 1 | Asking price | Format: "2.450.000 kr." Lowest = winner |
| 2 | Drive time | Format: "28 min". Lowest = winner |
| 3 | Noise score | ★☆☆☆☆ to ★★★★★. Highest = winner |
| 4 | Rural score | ★☆☆☆☆ to ★★★★★. Highest = winner |
| 5 | Heating source | Show value + heating_score badge |
| 6 | Flexbolig | Yes / Possible / No |
| 7 | Living area | m². Largest = winner |
| 8 | Plot area | m². Largest = winner |
| 9 | Condition | Show label + condition_score |
| 10 | Build year | — (no winner) |
| 11 | Notes | Truncated, "Show more" link |
| — | [View details] button | Links to property detail screen |

**Requirements:**
- **FR3.1**: Comparison view is a separate screen/route: `/compare`.
- **FR3.2**: Selected property IDs are stored in `localStorage` so the selection survives navigation.
- **FR3.3**: The "winner" highlight is applied per row: the best value is highlighted. For metrics where lower is better (price, drive time), the lowest value wins. For metrics where higher is better (scores, area), the highest wins. In case of a tie, both are highlighted.
- **FR3.4**: A "Remove from comparison" (×) button on each column header removes that property from the comparison without leaving the screen.
- **FR3.5**: A "Clear all" button deselects all and returns to the list view.
- **FR3.6**: The comparison table is scrollable horizontally on narrow screens. On desktop it fits comfortably with 3 columns.

---

## Feature 4: Archive / Status Management

**Description:** Properties that are sold, withdrawn, or no longer relevant can be archived to remove them from the default view without deleting data.

| status value | Meaning |
|---|---|
| `active` | Visible by default |
| `sold` | Property has been sold / listing removed |
| `archived` | User has manually archived it |

**Requirements:**
- **FR4.1**: "Archive" and "Mark as sold" actions are available in a context menu (⋮) on the property card and on the detail screen.
- **FR4.2**: Archived and sold properties are hidden from the default list view. The filter panel includes a "Show archived" toggle to reveal them.
- **FR4.3**: Archived properties are excluded from the comparison selector.
- **FR4.4**: No hard delete in MVP — data is always recoverable by unarchiving.

---

## UI Flow Summary
```
List view
  ├─ Category badge on card (tap to cycle: Unsorted → Top pick → Maybe → No-go)
  ├─ Compare checkbox on card
  └─ Tap card → Detail screen
        ├─ Match Score + breakdown
        ├─ All property attributes
        ├─ Notes field (auto-save)
        ├─ Category selector
        └─ Archive / Mark as sold (⋮ menu)

Sticky comparison banner (appears when ≥2 selected)
  └─ [Compare] → Comparison screen (/compare)
        ├─ Side-by-side table (winner cells highlighted)
        └─ [View details] per column
```

## Acceptance Criteria
- Category can be changed from both the card and the detail screen; change is persisted immediately.
- Notes auto-save within 1 second of the user stopping typing.
- Note icon appears on a property card if it has any notes.
- Selecting 2 properties and tapping Compare opens a comparison table with all 12 rows populated.
- Winning values in each row are visually highlighted.
- A 4th property cannot be added to the comparison; a toast message explains the limit.
- Archived/sold properties are hidden from the default list view and excluded from comparison.
- Property selection for comparison survives navigating away and returning.

## Non-Functional Requirements
- **NFR1**: Comparison table must render within 300ms (all data is already in memory).
- **NFR2**: Auto-save debounce must not fire so frequently that it creates excessive DB writes. 1-second debounce is the minimum.
