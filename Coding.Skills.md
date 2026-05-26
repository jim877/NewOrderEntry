# Coding Skills & Patterns

Reusable patterns established in the NOE prototype. Reference these when building new features.

---

## Component Size Caps (Two-Tier)

Every control / form / widget lives in its own file under `src/components/`.

- **Soft cap: 150 LOC** — crossing this is a *signal*, not a failure. Ask: is there a sub-component, data array, or helper to extract? If yes, do that. If no (legitimate hook + JSX complexity), proceed.
- **Hard cap: 200 LOC** — must split. No exceptions.

**Why two tiers:** a single hard limit either gets gamed (cosmetic compression to squeak under) or rejected as unrealistic. The soft/hard pattern catches real growth while not punishing already-clean files at the boundary.

**When to split a component over the soft cap, in order of preference:**
1. Extract its static data to `config.json` (lists, labels, keywords, icon maps)
2. Extract sub-components that are independently usable
3. Extract pure helpers to `src/utils/`
4. As a last resort, split the JSX tree itself

**When NOT to compress:** if your file is 162 LOC because it has 8 hooks and a real form layout, leave it. Tightening prettier's multi-line useEffects is fine; collapsing readable branches into ternaries to hit a number is not.

---

## Centralized Coaching / Help Text

Inline guidance shown next to fields and sections, sourced from a single config object.

- All strings live in `DEFAULT_COACHING` (keyed by `"category.item"` e.g. `"loss.Fire"`, `"section.repairs"`)
- Accessor function `getCoaching(key, overrides)` checks user overrides first, then defaults
- User overrides stored in `localStorage` and editable via a Settings panel
- Coaching panels are dismissable per-session via a `dismissedCoaching` Set
- Categories (`COACHING_CATEGORIES`) drive the Settings UI automatically

**Conciseness rule:** All coaching/help text must be as concise as possible. One short sentence is ideal. Avoid filler, jargon, or restating what the UI already shows. If it can be said in fewer words, rewrite it.

**When to use:** Any time a field, section, or option benefits from contextual explanation — especially during intake or training scenarios.

---

## Configurable Settings

Let users customize behavior without code changes.

- Coaching text is editable per-key in a categorized Settings panel
- Overrides persist in `localStorage`, defaults are always the fallback
- "Export merged config" generates a code snippet with all defaults + overrides
- Search/filter across all coaching entries

**When to use:** Any user-facing text, thresholds, or option lists that power users may want to tune.

---

## Smart Fields (Auto-Derive & Auto-Correct)

Fields that infer values from context or fix common input errors.

Examples:
- **Auto-fill name from type**: selecting "Cold Weather / Ski Trip" auto-fills the name field with that label
- **Auto-bump past dates**: if user enters a past date for an "upcoming" event, bump the year forward
- **Auto-derive work type from schedule**: if a Pickup is scheduled, pre-select "Pickup" work type
- **Auto-generate order name**: `LastName-TownST` derived from contact + address fields
- **`min` attribute on date inputs**: prevent past-date selection in the calendar picker

**When to use:** Anywhere the system can reasonably guess a value or prevent an obvious mistake without blocking the user.

---

## Conditional Forms (Progressive Disclosure)

Only show fields/sections that are relevant based on prior answers.

Examples:
- "Where first?" stay-type buttons only appear after selecting "No, staying elsewhere"
- Staying-home coaching only shows when "Yes, staying home" is selected
- Rush delivery details only expand after confirming rush is needed
- Contaminant levels appear only after selecting a loss type

**Pattern:**
```tsx
{data.someField === "triggering_value" && (
  <ConditionalSection />
)}
```

**When to use:** Multi-step intake forms, wizard flows, any form where early answers determine which later questions are relevant.

---

## Compact View (Collapse After Selection)

Reduce visual noise by collapsing UI once the user has made their choice.

Examples:
- Event type picker: shows full button grid initially, collapses to `Type Label + "change" link + date` after selection
- Interview questions: collapse to a one-line summary with user/timestamp after answering
- Scope wizard steps: completed steps show summary, not the full form

**Pattern:**
```tsx
{!hasSelection ? (
  <FullPickerUI onSelect={...} />
) : (
  <CompactSummary value={selection} onReset={...} />
)}
```

**When to use:** Any picker or multi-option selection where the expanded state is only needed during the decision moment.

---

## Toggle Buttons Over Dropdowns

Replace `<select>` dropdowns with visible button arrays for better scannability and touch targets.

Examples:
- Work type selection (Pickup, In-Home Cleaning, Consult, Desk Consult)
- Repair types, packout scope, delivery groups
- Event type picker (Warm Weather, Cold Weather, Wedding, etc.)

**Pattern:**
```tsx
<div className="flex flex-wrap gap-1.5">
  {OPTIONS.map(opt => (
    <button
      key={opt.key}
      onClick={() => toggle(opt.key)}
      className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all ${
        isActive ? "border-sky-400 bg-sky-50 text-sky-700"
                 : "border-slate-200 bg-white text-slate-600 hover:border-sky-300"
      }`}
    >{opt.label}</button>
  ))}
</div>
```

**When to use:** 2-8 options where seeing all choices at once helps the user decide faster. Use dropdowns for 10+ options or when space is very tight.

---

## Interview Question Pattern

Numbered, expandable question cards with built-in audit logging.

Structure:
- **Header**: question number badge + question text + collapsed summary
- **Expanded body**: answer options (toggles/buttons/inputs) + coaching + collapse/skip button
- **Audit log**: `interviewLog[key]` stores `{ user, timestamp }` on first interaction
- **Search**: `matchesInterviewSearch(keywords)` filters questions by search query
- **Visibility**: `isFieldVisible(key)` controls which questions appear based on config

**When to use:** Structured intake workflows, checklists, guided conversations — anywhere answers need to be tracked and the form is long enough to benefit from progressive collapse.

---

## Toast Notifications for Auto-Actions

Show brief feedback when the system takes an action on the user's behalf.

- Toast templates in `DEFAULT_COACHING` with `{value}` placeholder (e.g. `"toast.suggestGroup": "Suggested {value} group"`)
- Fired when interview answers trigger auto-actions (add group, set handling code, etc.)
- Non-blocking, auto-dismiss

**When to use:** Any auto-derived action the user should be aware of but doesn't need to confirm.

---

## Living Situation Timeline

Ordered sequence of stays with drag-to-reorder, address linking, and duration tracking.

- Each stay: type, end date, address (linked to order addresses or placeholder)
- "Add Their Home" prompt when no terminal stay exists
- Final stay determines storage duration
- Reorder via up/down buttons

**When to use:** Any scenario modeling a sequence of locations or phases over time.

---

## Rule-Driven Config (Triggered Suggestions)

Config-driven lists where each item declares the conditions under which it should auto-suggest.

Example: `DEFAULT_LOAD_TARGETS` (what to bring on a job)

- Each item: `{id, label, category, triggers: LoadTrigger[]}`
- Triggers are tagged unions: `condition` (flag in data.conditions), `loss` (loss type), `packout` (packout item), `service` (service offering), `interview` (interview answer label)
- A `matchXxx(data, items)` helper walks triggers and returns matched labels
- Auto-suggested items render with a distinct ring/badge (e.g. amber ✦) in the question UI
- Settings panel exposes an editor: add/remove items, change category, add/remove triggers
- User customizations persist to localStorage under a stable key

**When to use:** Any picker where a backing dataset should evolve over time AND the system can reasonably predict which items the user wants based on prior answers. Avoid hardcoding both the list and the matching rules in disparate places — keep them together so they evolve together.

---

## Family × Group Assignment Matrix

A two-axis checkbox grid where rows are household/family members and columns are delivery groups (or any phase/stage). Used in the Timeline Builder to capture per-person delivery commitments.

- Rows derived from existing data (customers + household), with icons by kind (adult/child/baby/pet)
- Columns are computed delivery groups with date + label
- Cells store a boolean in `rushGuideData.familyAssignments[memberId][groupId]`
- Sticky first column so member names stay visible while scrolling columns
- Empty-state messaging when household or groups are missing

**When to use:** Any scenario where multiple entities (people, items, vehicles) need to be assigned to one or more phases, and the assignment is best visualized as a quick scan rather than per-row dropdowns.
