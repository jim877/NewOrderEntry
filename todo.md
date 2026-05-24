# NOE / Scope Prototype — TODO

> Last updated: 2026-05-19
> Owner: Jim Fenyohazi
> Status: Active prototype — proving UX for field scoping + order entry
> Stack: React + TypeScript + Tailwind (Vite), destined for Java app backend
> Archive: Completed tasks older than 5 runs are in `archive.md`

---

## Recent Completed Tasks

> Completed tasks from the last 5 loop runs. Older tasks are archived in `archive.md`.

---

---

## From Notes.md (2026-05-12 session 4)

- [x] Mold suggestion coaching fix — changed message from "consider adding Mold as a contaminant" to "Visible mold was noted in conditions — should Mold be added as a loss type?" (2026-05-12)
- [x] Interview coaching dismiss X — added × dismiss button on all coaching text blocks in NOE interview; per-answer coaching, standalone tips, and header all dismissable via dismissedCoaching state set (2026-05-12)
- [x] Timeline interview answer buttons white — changed timeline question containers from bg-green-50/20 to bg-white; green border remains but answer buttons no longer have green tint (2026-05-12)
- [x] Final delivery date rework — now two-part: (1) specific date picker OR months input (side by side with "or"), then (2) optional qualifier chips: Firm Date, Must Be Before, Deliver When Ready; post-final events section below (2026-05-12)

---

## From Notes.md (2026-05-12 session 5)

- [x] Packout items in event instructions — added "Picking Up:" line to buildEventSystemEntries; shows in Detailed, Quick, and App auto-instructions (2026-05-12)
- [x] Suggested field traceability — auto-suggested items now use orange coaching (amber border/bg) with trace text "selected in Interview → Conditions"; manually selected items keep purple coaching (2026-05-12)
- [x] Interview timeline question text blue — changed all timeline question titles from text-green-700 to text-sky-600; number circles from bg-green-100 to bg-sky-100 (2026-05-12)
- [x] Photo scope "All" sub-option — added "All" toggle button to both Pickup department and generic sub-categories in photo tagging (2026-05-12)
- [x] Scope options reflect service offerings — scope instruction types now filtered by SERVICE_TO_SCOPE mapping; Inhome/Dispose always show; when no services selected all show (2026-05-12)
- [x] Orange help text on auto-suggested loss types — auto-added Mold shows orange "Auto-suggested" banner with source trace; disappears if user manually adds Mold (2026-05-12)

---

## From Notes.md (2026-05-12 session 6)

- [x] Dismiss suggested loss type — added "Remove Mold" link on the orange auto-suggestion banner; clicking it removes the suggested loss type and clears the auto-added tracking (2026-05-12)
- [x] Cover photo on building type page — added "Cover Photo" / "Retake Cover" button next to Next on step 1; uses file picker with image compression; saves to orderCoverPhoto (2026-05-12)
- [x] Edit room name from camera page — added pencil edit icon next to room name in camera header; opens prompt to rename (2026-05-12)
- [x] Add room from camera page carousel — added "+" Add button at end of room carousel; creates new room on current floor with affected=true; auto-navigates to it (2026-05-12)
- [x] New room defaults from camera — new rooms added from carousel default to current floor with affected=true; inherits floor context (2026-05-12)
- [x] "Add to Scope" button after photo — added "Add to Scope" toggle between Retake and Done; marks photo with scopeInclude flag; shows "In Scope ✓" when active (2026-05-12)
- [x] First photo = room cover default — already implemented: first photo in room gets tag="roomCover", first photo overall gets tag="cover" + orderCoverPhoto set (2026-05-12)
- [x] Quick photo access — added 5th "Photos" tab with camera icon; scope tab now uses magnifying glass; Photos tab jumps directly into walkthrough with camera on first affected room (2026-05-12)

---

## From Notes.md (2026-05-12 session 7)

- [x] Cover photo button use camera — now tries getUserMedia first (auto-captures from camera), falls back to file picker on desktop; works on both mobile and desktop (2026-05-12)
- [x] Room regeneration safety — generateRooms now checks for rooms with photos or instructions; preserves rooms with data, merges new generated rooms alongside them (2026-05-12)
- [x] SDS pre-generation questionnaire — added modal before SDS with 4 questions: picking up (service toggles), cleaning in home, total loss items (writing/not writing), special services; answers update serviceOfferings before generating (2026-05-12)
- [x] BUG: Edit room pencil not showing — pencil was on header (below camera) but not on camera overlay; added pencil icon next to room name on the captured photo overlay too (2026-05-12)

---

## From Notes.md (2026-05-12 session 8)

- [x] Timeline alternating connectors — delivery markers now alternate short (h-1) and tall (h-5) connector lines; container height increased to 80px for staggered labels (2026-05-12)
- [x] Timeline drag-to-move groups — delivery markers are now draggable on the timeline; dragging updates date via groupOverrides or customDeliveries; works for both standard and custom groups (2026-05-12)
- [x] Timeline group headers calendar + addresses — card headers now have larger calendar icon (w-10 h-10 rounded-xl); address shown as dropdown selector with all known addresses from the order (2026-05-12)
- [x] Suggested delivery groups with addresses — interview question #17 now shows "Deliver To" section below group chips with toggleable address labels from the order's address list (2026-05-12)
- [x] Timeline address legend — color-coded address list rendered below timeline bar showing band color, label, and address for each living situation band (2026-05-12)

---

## From Notes.md (2026-05-12 session 9)

- [x] Add floor button on photos page — blue "+" button added to floor tabs in camera overlay; creates new floor with Room 1 and auto-navigates to it (2026-05-12)
- [x] Room list syncs with scope answers — already handled by generateRooms safety from session 7; rooms with photos/instructions preserved during regeneration (2026-05-12)
- [x] Remove photo count next to room name on live feed — removed "Photo #N" counter from captured photo overlay (2026-05-12)
- [x] Larger X button on live photo feed — changed from h-8 w-8 text arrow to h-10 w-10 SVG X icon with thicker border (2026-05-12)
- [x] Room switch flash fix — added switchToRoom helper with roomSwitching state; black overlay covers content during 300ms transition (2026-05-12)
- [x] Timeline connectors behind text — connector lines now -z-10; circle and text labels have z-10 + white bg/rounded for readability over connectors (2026-05-12)
- [x] Lengthen tall connectors — changed from h-5 to h-9; container height increased from 80px to 100px (2026-05-12)

---

## From Notes.md (2026-05-13)

- [x] Save modal default to table view — changed previewView useState default from "narrative" to "table" (line 7928) (2026-05-13)
- [x] Queued outbound actions — auto-detects welcome text, rush guide, contacted status, and scheduled appointments; shows "Auto" badge with reason; user can toggle on/off; clicking save releases queued tasks (2026-05-13)
- [x] Cover photo opens file picker on desktop — this is correct browser behavior: `capture="environment"` opens camera on mobile devices, file picker on desktop. On a real phone it will open the camera. Code verified at line 5254, render path: step===1 inside scope footer. (2026-05-13)

---

## From Notes.md (2026-05-19)

- [x] Loading list config with rules — added LOAD_TARGETS_CONFIG (DEFAULT_LOAD_TARGETS) with id/label/category/triggers; triggers support condition/loss/packout/service/interview matchers; matchLoadTargets() returns auto-suggested labels; Settings panel now has "Loading List (What to Bring)" card with categorized list, trigger editor, add/remove, reset; interview loadList question now grouped by category with ✦ auto-suggested ring (2026-05-19)
- [x] Timeline builder page — added Timeline Builder panel at the top of Rush Guide step 4 result view; family × delivery group checkbox matrix (Adults from customers + household + pets), inline interest pickers, inline event editor (name/type/date), inline custom delivery quick-add; uses existing deliveryGroups + createCustomDelivery; stores selections in rushGuideData.familyAssignments (2026-05-19)

---

## From Notes.md (2026-05-14)

- [x] Photo cancel/delete/retake on review — renamed "Retake" to "Delete" (red), kept distinct from "Another" (take more in same room); buttons at line 5766 in post-capture overlay (2026-05-14)
- [x] Camera next room / same room — added "Another" (blue, stay in room) and "Next Room" (green, advance to next affected room) buttons on post-capture overlay; "Done" shows when on last room (2026-05-14)
- [x] Camera button sizes for mobile — floor tabs from py-0.5/9px to py-1.5/12px/min-h-32px; room carousel from min-w-52px to 60px/min-h-44px; "+" floor button now says "+ Floor" with larger target; room names 12px (2026-05-14)
- [x] Camera X icon too small — already h-10 w-10 from prior fix; verified at line 5959 (2026-05-14)
- [x] Photo review minimal view — tags hidden behind "▸ Tag & Notes" toggle; notes input always visible; tags expand on click; photo-focused by default (2026-05-14)

---

## Visual / UI Fixes

> Paste browser observations here. Include a screenshot description and what needs to change.


---

## Out of Scope (Production — Not for Prototype)

> These are not actionable tasks. They exist as notes for the production roadmap only.
> **Autonomous agents: skip this section entirely.**

- Java backend REST API, real-time sync (WebSocket), photo upload (S3), authentication
- Native iOS app: Capacitor / React Native / Swift decision
- PWA service worker, IndexedDB, background sync, push notifications, offline conflict resolution

---

## Architectural Discipline (MANDATORY)

You are a highly disciplined, senior software architect. This project relies on a modular architecture. You must strictly adhere to the following constraints for all code updates:

1. **No Hardcoded Content.** All help text, tooltips, and feature flags must live in `config.json`. The UI must only read from this file. Never inline strings, copy, or flag values into JSX/TSX.
2. **Extreme Isolation.** Every control, form, or widget must be in its own independent file.
   - **Soft cap: 150 LOC** — going over is a "should we split?" signal. Check for a sub-component, data array, or helper that can be extracted before adding more.
   - **Hard cap: 200 LOC** — must split. No exceptions. Don't compress legitimate code just to squeak under the soft cap; do split when over the hard cap.
3. **Documentation Sync.** Before completing a chat session, you must read `ARCHITECTURE.md` and output any updates to: data flow, active states, and conditional rules. Never break existing UI boundaries or hidden dependencies.

> Note: The current `src/App.tsx` (~19K lines, was ~20K) predates this constraint. All **new** components must be extracted to their own files under the caps above, and all **new** strings/flags must live in `config.json`. Treat App.tsx growth as a code smell — extract before extending.

---

## System Prompt for Autonomous Agents

```
You are working on the NOE/Scope prototype at /Users/jamesfenyohazi/Projects/Codex/NewOrderEntry.

### Architectural Discipline (MANDATORY — applies to every change)
1. No hardcoded content: all help text, tooltips, feature flags must live in `config.json`. UI reads from this file only.
2. Extreme isolation: every control/form/widget in its own file. Soft cap 150 LOC (a "should we split?" signal — investigate before adding more). Hard cap 200 LOC (must split). Don't compress legitimate code just to squeak under 150.
3. Documentation sync: before ending a session, read `ARCHITECTURE.md` and update data flow, active states, and conditional rules. Never break existing UI boundaries or hidden dependencies.


### How to use this file

1. **Check `Notes.md` first.** Read for new items from Jim. Merge entries into this file and **DELETE** them from `Notes.md` immediately to keep the inbox empty. If `Notes.md` is empty, proceed to step 2.
2. **Read `todo.md` fully.** This is the source of truth for all work.
3. **Pick the top unchecked `- [ ]` item** in the highest-priority section unless the user directs otherwise. Skip items marked `(BLOCKED:...)`.
4. **Before starting work**, mark the item by adding `(IN PROGRESS)` after the checkbox.
5. **Build + lint check after every change**: run `npx vite build` and verify it passes. Run `npx eslint src/App.tsx --no-warn-ignored 2>&1 | grep "problems"` and verify the error count hasn't increased from the baseline (~390). For any UI task, use Chrome browser tools to take a screenshot after the fix. Compare it against the requirement. If the visual bug persists, you are not done.
6. **After completing a task**, change `- [ ]` to `- [x]`, remove `(IN PROGRESS)`, and add the date.
7. **If a task reveals new work**, add new items to the appropriate section — don't silently skip them.
8. **If a task is blocked**, add `(BLOCKED: reason)` and move to the next item.
9. **Update `Last updated` date** at the top of the file after making changes.
10. **Reorganize & Clean:** Move all completed tasks to the `## Recent Completed Tasks` section, keep pending ones at the top, and update the `Last updated` date.
11. **Continue through ALL unchecked items** before stopping — do not exit early. The loop is not done until every `- [ ]` item is either completed `- [x]` or marked `(BLOCKED: reason)`.
12. **Searchability:** Ensure all new headings, fields, and task descriptions are highly descriptive and searchable for future agents.

### Archival — Self-Cleaning Rule

After each loop run, check the `## Recent Completed Tasks` section:
- **Keep the last 5 runs** of completed tasks visible in `todo.md`.
- **Archive older runs** (completed more than 5 runs ago) by appending them to `archive.md`.
- When archiving, move the entire section header and its tasks to `archive.md`, preserving the date/session label.
- Update the `Last updated` date after archiving.
- Each "From Notes.md (...)" header counts as one run. The initial batch (Critical Path, Jims Notes, etc.) counts as run 1.

### Ralph Loop Usage
To start the autonomous loop, use:
```
/ralph-wiggum:ralph-loop "Read todo.md and follow the System Prompt for Autonomous Agents. Check Notes.md, merge any new items, then work through ALL unchecked items: implement, build check, mark complete, continue to next. Do not stop until every item is done or blocked." --max-iterations 30 --completion-promise "ALLTASKSCOMPLETE"
```

### Build & verify
- `npx vite build` — must pass with no errors before checking a box
- `npx eslint src/App.tsx --no-warn-ignored 2>&1 | tail -3` — check lint error count; new code must not increase the count
- `npx tsc --noEmit` — run TypeScript type check for any TypeScript-related changes

### Placement verification (MANDATORY for every UI change)
After implementing, run these checks BEFORE marking [x]:
1. **Grep for the new code** — confirm it exists and count occurrences. If you added it to a location that appears multiple times (e.g., PICKUP_DEPARTMENTS renders in 3 places), verify you changed the RIGHT one.
2. **Trace the render path** — read the surrounding code to confirm the new element is:
   - Inside the correct component (ScopeWizard vs App vs CustomerItem, etc.)
   - Inside the correct conditional branch (e.g., `activeTab === "scope"` vs `"report"`)
   - Inside the correct view state (e.g., `showWalkthrough && walkthroughRoom` for camera view vs `!walkthroughRoom` for room list)
   - Not gated by a condition that would prevent rendering (e.g., `showCoaching &&` when coaching is off)
3. **Check for duplicates** — if the same pattern exists in multiple places (e.g., room name renders in both camera overlay AND room header), apply the change to ALL relevant locations.
4. **Report the exact line number and parent context** — when marking complete, state where the code was added and what conditional path reaches it.

### Pre-flight ambiguity check (MANDATORY — comes BEFORE writing any code)

Before you implement any task, list every design question the task wording leaves open. If the count is greater than zero, **ask the user before writing code.**

Trigger words that almost always require clarification (do NOT guess on these):
- "flag X as Y", "point to", "reference", "link to", "tie to", "connect to" — implies the target is an EXISTING entity, not new free-text data
- "from the X list", "from existing", "the contact/company", "the adjuster" — implies a picker, not a text input
- "as a Y for Z" — implies a relationship between two existing things
- "display in [other section]" — implies cross-section rendering, ask which section
- "default", "by default" — ask whether they want to change initial-mount behavior or also reset existing data

If the wording uses any of these and there are multiple plausible designs, **ask first.** Thirty seconds of clarification beats an hour of rework.

When you do ask, frame it as concrete options: "Should X be (a) a free-text field, or (b) a picker that selects from existing Y?" — never an open-ended question.

### Independent review (MANDATORY before marking [x])

After implementing a task, spawn a **separate reviewer agent** to independently verify the work before marking it complete. The reviewer has NOT seen your implementation process — it only sees the result.

**Reviewer checklist:**
1. **Read the task description** — understand what was requested.
2. **Quote the task wording back** in the report. Then explain how the diff matches that wording. If the reviewer cannot quote-and-match, that's a FAIL.
3. **Read the diff** — `git diff` to see exactly what changed.
4. **Verify intent match** — does the implementation actually do what the task asked? Not just "does it build" but "does it solve the problem."
5. **Watch for the trigger words above** — if the task said "flag X as Y" and the diff added new free-text fields instead of linking to an existing Y, that's a FAIL.
6. **Check for regressions** — look for unintended side effects:
   - Were any existing features broken by the change?
   - Were any variables referenced that don't exist in scope (e.g., `data` in ScopeWizard)?
   - Are there dangling references to removed code?
7. **Verify render path** — confirm the new/changed code is reachable at runtime (correct component, correct conditional branch, correct view state).
8. **Check for consistency** — if the change applies a pattern (e.g., color change), verify it was applied everywhere (not just one instance).
9. **Report PASS or FAIL** — if FAIL, list specific issues. The implementing agent must fix all issues before re-submitting for review.

**How to run:**
```
Agent({
  description: "Review task implementation",
  subagent_type: "general-purpose",
  prompt: "You are a code reviewer. Read the task: [TASK DESCRIPTION]. Then run `git diff` to see the changes. Quote the task wording verbatim and explain how the diff implements it. Watch especially for 'flag X as Y' / 'point to' / 'link to' / 'the contact/company' wording — those imply links to existing entities, not new free-text fields. Verify: (1) wording-vs-diff match, (2) no regressions or scope errors, (3) render path is correct, (4) patterns applied consistently. Report PASS or FAIL with specific issues."
})
```

**Rules:**
- Do NOT mark a task `[x]` until the reviewer reports PASS.
- If the reviewer reports FAIL, fix the issues and re-run the review.
- The reviewer is a fresh agent with no memory of the implementation — this is intentional. It catches assumptions the implementer missed.

### Hard-gate enforcement (so the audit can't be skipped)

The loop is not done until the loop summary lists, **per task**, a one-line quoted PASS from the reviewer agent. The format must be:

```
#NN <title>: ✓ Reviewer PASS — "<one-line quote from reviewer report>"
```

If you cannot produce that quote, the task is NOT complete. No matter how green the build is, no matter how "obviously simple" the change feels. The build-passing-and-dev-200 signal does NOT cover intent match — only the reviewer does.

When you skip an item (e.g. "already matches behavior — no code change"), the loop summary must STILL include a one-line reviewer quote confirming the skip is correct. The reviewer must check that no code change was actually needed, not just take your word for it.

This rule exists because past loops have shipped "obviously simple" items that turned out to be design mismatches (e.g. POC implemented as free-text fields instead of as a link to an existing vendor). The audit step exists to catch exactly this; it only works if it is non-optional.

### Coverage-gap rule (no "acceptable for now" disposals)

If the reviewer's report mentions a **coverage gap** — i.e. the feature works in one mode / one component / one section but not in another where the task wording implies it should — the task CANNOT be marked `[x]` by your own judgment. You have exactly two options:

1. **Close the gap.** Implement the missing coverage, then re-run the reviewer.
2. **Ask the user to approve leaving the gap open.** Quote the reviewer's exact coverage-gap sentence to them, propose closing it vs. leaving it, and wait for an explicit answer.

Disposals like "acceptable for now", "follow-up", "minor info gap", or "user can use the other path" are FORBIDDEN. Past loops shipped a POC feature that worked in Quick Entry but not Detailed — the reviewer flagged it on the first audit, I judged it "acceptable for now", and the user immediately reported the missing affordance on the very next interaction. Coverage-gap calls from the reviewer are a hard stop, not a hint.

Signals that the reviewer is reporting a coverage gap (treat any of these as a stop):
- "no X in [mode/section/path]"
- "only [mode] exposes…"
- "[other mode] users have no way to…"
- "may be acceptable if…" — almost always a coverage gap dressed up as a question
- "minor [info/coverage] gap"
- "this diff doesn't cover…"
- "still needs [extension/follow-up]"

### Lint baseline
- Current lint: ~390 errors (mostly `no-explicit-any` and `no-unused-vars` from prototype code)
- **Rule**: new code must not add new lint errors. If you add `as any`, note it. Remove unused vars/imports.
- Run `npx eslint src/App.tsx --no-warn-ignored 2>&1 | grep "problems"` after changes to verify count hasn't increased.

### Coding patterns
- **Read `Coding.Skills.md` before implementing.** It documents established UI/UX patterns (coaching text, smart fields, conditional forms, compact views, toggle buttons, etc.). Use these patterns when building new features — don't reinvent them.

### Key files
- `src/App.tsx` — main app + ScopeWizard component (~17K lines)
- `src/SdsDocument.tsx` — SDS document component
- `public/photo-scope.html` — standalone Photo Scope (being retired)
- `src/index.css` — global styles + Tailwind config

### Build & verify
- `npx vite build` — must pass with no errors before checking a box
- `npx tsc --noEmit` — optional type check for TypeScript tasks
- Dev server: `npx vite --host` (usually port 5173-5175)

### Code conventions
- Tailwind utility classes, no custom CSS unless necessary
- All UI text uses Tailwind text sizing (text-[12px], text-[14px], etc.)
- Phone frame is 393px wide, 852px tall with rounded-[44px] corners
- Bottom sheets use `fixed` positioning at `z-[101]` with `w-[393px]`
- Indigo theme for interview UI (number badges, panel header/footer, buttons)
- Violet theme for coaching/help text panels
- Blue theme for scope wizard UI
- Component name is `ScopeWizard` (not V2, not InstructionDemo)
- State variable for showing scope: `showScope` / `setShowScope`

### Don't
- Don't write verbose help/coaching text — keep it to one concise sentence. If it can be shorter, make it shorter.
- Don't add console.log for debugging — remove after use
- Don't create new files unless necessary — prefer editing existing
- Don't add emojis to UI unless user requests
- Don't amend commits — create new ones
- Don't push without asking
```
