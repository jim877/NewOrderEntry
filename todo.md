# NOE / Scope Prototype — TODO

> Last updated: 2026-05-09
> Owner: Jim Fenyohazi
> Status: Active prototype — proving UX for field scoping + order entry
> Stack: React + TypeScript + Tailwind (Vite), destined for Java app backend

---

## Critical Path

- [ ] **Camera not opening on desktop** — `getUserMedia` succeeds but video may not render; auto-trigger file picker as fallback when stream fails
- [ ] **Camera aspect ratio** — no height constraint in getUserMedia; add `height: { ideal: 1080 }` to prevent distortion
- [ ] **Photo persistence** — photos stored only in React state (lost on refresh); wire to `onOrderUpdate` or IndexedDB
- [ ] **Photo → SDS wiring** — walkthrough photos need to flow into SDS document grouped by room with reason/note captions
- [ ] **Delivery address auto-creation** — "living" answers (Hotel, Temp, Business) should auto-create placeholder addresses on the order
- [ ] **Interview action handlers missing** — `executeInterviewActions` needs cases for: `addressPlaceholder`, `suggestOrderType`, `openMoldLimit`
- [ ] **Wire interview actions to UI** — actions configured in Field Config but never triggered when answers selected
- [ ] **Living → delivery address flow** — addresses entered in "where will customer live" should populate delivery options + create NOE placeholders

---

## Features — Order Entry (NOE)

- [ ] Company preferences panel — refine search/selection UX
- [ ] Suggested groups → Rush Guide delivery groups linking — interview suggestions (RD, RFD, LTD) don't connect to delivery groups
- [ ] Rush Guide step 1 disabled — `{false && rushGuideStep === 1}` block; enable or remove
- [ ] Contact assignment — "who contacts customer" end-to-end test
- [ ] Field Config: selectType toggle — unclear if single/multi switch controls interview rendering
- [ ] Field Config: requiredAtStatus enforcement — no validation at save time
- [ ] Field Config: action config → runtime — actions editable but never execute

---

## Features — SDS Document

- [ ] Scope data → SDS sync — room photos, severity overrides, handling codes, depth levels need mapping
- [ ] Photo grid on SDS — display walkthrough photos grouped by room with captions
- [ ] SDS export — email, PDF generation, print-friendly view (buttons exist, placeholder)
- [ ] SDS from Report tab — "Open SDS Document" button functional; add inline preview option

---

## Features — Scope Wizard

- [ ] Photo delete undo — currently instant; add 3-second undo toast
- [ ] Room drag-and-drop on touch — test cross-floor moves on mobile
- [ ] Bulk edit sheet — verify all buttons respond and highlight correctly
- [ ] Auto-add rooms toggle — verify it controls photo walkthrough room pre-population
- [ ] Severity auto-expand — verify first active type opens when pre-populated from order

---

## Features — Mobile UX (Prototype)

- [ ] Photo compression — resize to max 1200px width before storing as base64 to reduce memory
- [ ] Test all scope wizard steps at 393px width on real mobile browser
- [ ] Test camera shutter + photo capture flow on iOS Safari and Android Chrome
- [ ] Verify bottom tab bar is reachable (not hidden behind mobile browser chrome)

---

## Visual / UI Fixes

> Paste browser observations here. Include a screenshot description and what needs to change.

- [ ] _example: "Interview panel clips at bottom on iPhone SE — needs scroll padding"_
- [ ] 
- [ ] 
- [ ] 

---

## Code Cleanup

### Dead Code Removal
- [ ] Remove `{false && showInterview}` block (~80 lines) — replaced by Interview tab
- [ ] Remove `{false && isFieldVisible("familyMedicalIssues")}` — disabled customer prefs
- [ ] Remove `{false && rushGuideStep === 1}` — disabled Rush Guide step 1
- [ ] Remove `entryMode === 'photo-scope'` branches — Photo Scope iframe no longer used
- [ ] Remove `InstructionDemo` stub — just wraps `ScopeWizard`
- [ ] Delete `App.tsx.tmp` — stale backup file

### Photo Scope (public/photo-scope.html)
- [ ] Remove autostart mechanisms — window load handler, polling IIFE, postMessage bridge
- [ ] Remove `window.orders` / `window.nextOrderId` exposure hacks
- [ ] Remove NOE context bridge — `noe-photo-scope-context` localStorage sync
- [ ] Decide: keep photo-scope.html for standalone use or retire entirely

### TypeScript
- [ ] Reduce `as any` casts (40+ instances) — create interfaces for order, customer, address, room
- [ ] Type interview answers — `Record<string, string | string[] | boolean | null>` too loose
- [ ] Type room/floor structures — many accesses bypass existing `RoomEntry`/`FloorEntry` types

### Architecture
- [ ] Deduplicate scoping systems — retire Photo Scope iframe, keep only ScopeWizard
- [ ] Simplify entry modes — remove `'photo-scope'` and `'same-day-scope'` from mode union
- [ ] Remove localStorage-based data sync — use direct props/callbacks only
- [ ] Code splitting — App.tsx is ~990KB bundled; split ScopeWizard, SDS, Field Config into lazy chunks

---

## Out of Scope (Production — Not for Prototype)

> These are not actionable tasks. They exist as notes for the production roadmap only.
> **Autonomous agents: skip this section entirely.**

- Java backend REST API, real-time sync (WebSocket), photo upload (S3), authentication
- Native iOS app: Capacitor / React Native / Swift decision
- PWA service worker, IndexedDB, background sync, push notifications, offline conflict resolution

---

## Completed

### Session: 2026-05-09
- [x] Rename V2 → Scope throughout codebase
- [x] 4-tab bottom nav (Order, Interview, Scope, Report)
- [x] Mobile-optimized Order tab with editable fields
- [x] Interview tab (replaces bottom sheet, violet theme)
- [x] Report tab with SDS link + summary stats
- [x] Native photo walkthrough (replaced Photo Scope iframe entirely)
- [x] Live camera via getUserMedia with shutter button
- [x] Photo reason tags + notes per photo
- [x] Unaffected rooms in photo list with "Not Affected" auto-tagging
- [x] Step reorder: Building → Size → Rooms → Severity
- [x] Severity Primary/Secondary badges with tap-to-promote
- [x] Interview consolidated to 17 questions from NOE + Photo Scope
- [x] Real-time interview sync between Scope and NOE via onOrderUpdate
- [x] Delivery options: Primary, Hotel, Temporary, Business, New Home, TBD
- [x] Repairs options expanded to 9 (includes Gut/Rebuild)
- [x] Living address capture + final delivery address selector
- [x] Duration control: tappable chips replace dropdown
- [x] Timeline stay reordering with up/down arrows
- [x] Guidance toasts per step (auto-dismiss 6s)
- [x] Event context panel (collapsible order summary in scope header)
- [x] Save & Scope button on Review & Save modal
- [x] Bottom sheets constrained to phone width (393px)
- [x] Auto-expand severity when pre-populated from order
- [x] Step label "Space" → "Size"

### Session: 2026-05-07 / 2026-05-08
- [x] ScopeWizard V2 — 4-step guided wizard with building types, rooms, severity, instructions
- [x] 9 building type icons (PNG) with per-icon sizing
- [x] Photo Scope integration via iframe (later replaced with native React)
- [x] Bi-directional NOE sync via orderData/onOrderUpdate
- [x] Interview system with 14→17 questions
- [x] Room management: add, delete, rename, drag between floors
- [x] Per-room severity overrides, handling codes, quality codes, reason codes
- [x] Floor-level severity cascading (order → floor → room)
- [x] Depth levels (1-5: Specific → Everything)
- [x] Origin room flag
- [x] Contact edit modal
- [x] Rush Guide with Gantt timeline, delivery groups, storage/repair sync
- [x] Date of Loss allowing past dates
- [x] Multiple address placeholders with purpose labels

---

## System Prompt for Autonomous Agents

```
You are working on the NOE/Scope prototype at /Users/jamesfenyohazi/Projects/Codex/NewOrderEntry.

### How to use this file

1. **Read `todo.md` at the start of every session.** This is the source of truth.
2. **Pick the top unchecked item** in the highest-priority section unless the user directs otherwise.
3. **Before starting work**, mark the item by adding `(IN PROGRESS)` after the checkbox.
4. **Build check after every change**: run `npx vite build` and verify it passes before moving on.
5. **After completing a task**, change `- [ ]` to `- [x]`, remove `(IN PROGRESS)`, and add the date: `(2026-05-10)`.
6. **If a task reveals new work**, add new items to the appropriate section — don't silently skip them.
7. **If a task is blocked**, add `(BLOCKED: reason)` and move to the next item.
8. **Update `Last updated` date** at the top of the file after making changes.

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
- Violet theme (#7c3aed) for interview UI
- Blue theme for scope wizard UI
- Component name is `ScopeWizard` (not V2, not InstructionDemo)
- State variable for showing scope: `showScope` / `setShowScope`

### Don't
- Don't add console.log for debugging — remove after use
- Don't create new files unless necessary — prefer editing existing
- Don't add emojis to UI unless user requests
- Don't amend commits — create new ones
- Don't push without asking
```
