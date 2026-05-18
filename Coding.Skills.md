# Coding Skills & Patterns

Reusable patterns established in the NOE prototype. Reference these when building new features.

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
