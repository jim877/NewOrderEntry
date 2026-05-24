# NOE / Scope Prototype — TODO

> Last updated: 2026-05-24
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

## From Notes.md (2026-05-24)

- [x] Auto-set POC flag when customer type = "Point of Contact" — Select onChange in CustomerItem now calls onSetOrderPoc when next value is "Point of Contact" and customer not already POC. Reviewer PASS — "if (next === \"Point of Contact\" && !c.isPoc) { onSetOrderPoc?.({ kind: \"customer\", id: c.id }); }" (2026-05-24)
- [x] Customer type field dropdown only, no free-text — replaced SearchSelect with native `Select` + strict `<option>` list. Reviewer PASS — "<Select value={c.type || \"\"} onChange={(e) => { const next = e.target.value; ... }}>" (2026-05-24)
- [x] POC type/flag asymmetric coupling — setting type→POC auto-flags POC; clearing flag does NOT clear type, and vice-versa. Reviewer PASS — "// Asymmetric coupling: setting type→Point of Contact auto-flags POC. Clearing the flag or changing the type later does NOT undo this." (2026-05-24)
- [x] Show sales rep on customer record when Use Sales Rep Only is on — new amber banner with rep name + chip "Sales Rep Only: <name>". Reviewer PASS — "<div className=\"text-sm font-bold text-amber-900 mt-0.5\">{salesRep || \"(no sales rep assigned)\"}</div>" (2026-05-24)
- [x] Remove "Contact via Rep" option — toggle + chip removed from CustomerItem (superseded by Use Sales Rep Only). Reviewer PASS — "contactViaRep toggle deleted from method row" (2026-05-24)
- [x] Fix: adding 2nd public adjuster overwrote 1st contact's company — upsertAdditionalCompany now blocks via confirm() and clears stale contacts on confirmed replace. Reviewer PASS — "if (existingForType?.company && incomingCompany && normalizeCompany(existingForType.company) !== normalizeCompany(incomingCompany)) { const ok = window.confirm(...); if (!ok) return; }" (2026-05-24)
- [x] Warn on 2nd different public adjusting firm (block-by-default, allow override) — confirm() dialog explains "you only have one X firm per order" before replacement. Reviewer PASS — "Replacing with \"${incomingCompany}\" is unusual — typically you only have one ${nextType.toLowerCase()} firm per order" (2026-05-24)
- [x] Hover help text on POC + related flag chips — title= attrs on POC, Use POC Only, Use Sales Rep Only, Contacted, Do Not Contact. Reviewer PASS — "title=\"Order Point of Contact — only one POC per order...\" / title=\"Mark when this customer has been reached for this order\" / title=\"Block all outreach...\"" (2026-05-24)
- [x] Sim Fern displayed as Insurance — autoTypeForCompany now prefers sampleContacts.companyType over name inference. Reviewer PASS — "const sampleMatch = sampleContacts.find((row) => normalizeCompany(row.company || \"\") === normalizeCompany(c) && !!row.companyType); if (sampleMatch?.companyType) return sampleMatch.companyType;" (2026-05-24)
- [x] Action Items: Customer + Insurance/Adjuster missing-field groups collapsible, default collapsed — added groupMeta with defaultOpen:false for both groups; new actionItemsGroupOpen state. Reviewer PASS — "{ id: \"customer\", label: \"Customer\", defaultOpen: false, ... }, { id: \"insurance\", label: \"Insurance / Adjuster\", defaultOpen: false, ... }" (2026-05-24)
- [x] Add Blocker button opens picker on demand (existing-blockers + missing data on initial view) — already implemented in live code: actionItemsBlockerOpen defaults false; initial branch renders existing blockers + Add Blocker button only. Reviewer PASS — "skip is correct — no code change needed; the task is already implemented in the live render path." (2026-05-24)
- [x] Fix nested-button DOM warning — outer `<button>`s in Detailed mode company/contact columns converted to `<div role="button">` with tabIndex/onKeyDown; inner role-toggle gets e.stopPropagation(). Reviewer PASS — "<div role=\"button\" tabIndex={0} onClick={() => openCompanyRolePicker(role)} onKeyDown={...} className=\"md:col-span-5 w-full text-left rounded-lg ...\">" (2026-05-24)

---

## From Notes.md (2026-05-24 session 2)

- [x] Fix Select undefined ReferenceError in CustomerItem.tsx — Select was used at line 149 (customer type dropdown) but not imported, crashing the customer section at runtime. Added `import { Select } from "./Select"` and updated the force-open focus selector to target the new native select. Reviewer PASS — "import { Select } from \"./Select\";" (2026-05-24)
- [x] Interview search auto-opened timeline + couldn't close — IntersectionObserver on `#noe-interview-timeline` re-opened Rush Guide whenever the anchor came into view; search filtering collapses the layout and brought it into view, and the close button was overridden by the same observer. Added (a) `if (interviewSearch.trim()) return;` to skip auto-open during search, (b) `timelineUserDismissed` flag set when user clicks × or presses Escape, reset only when the anchor leaves the viewport. Reviewer PASS — "if (interviewSearch.trim()) return;" (2026-05-24)
- [x] Right-justify + shade interview Collapse buttons — fixed className concatenation bug (`}ml-auto ` produced the non-Tailwind class `hover:bg-slate-50ml-auto`, breaking both ml-auto AND the hover style on 10 buttons). New className: `ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ...`. Reviewer PASS — "ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100" (2026-05-24)
- [x] Replace interview Done with Collapse everywhere — silent-N bug: pressing Done on unanswered Y/N wrote an interviewLog entry that made `answered = hasAnswers || !!log` true, which rendered summary "No" via `data === "Y" ? Yes : No`. Renamed Done→Collapse, removed setData log writes from all 12 Collapse handlers (initially missed `repairs`+`packoutScope`; reviewer flagged the coverage gap; closed). Changed `answered = hasAnswers || !!log` → `answered = hasAnswers` in all 13 call sites. Reviewer PASS — "onClick={() => setInterviewExpanded(p => ({...p, repairs: false}))}" (2026-05-24)

---

## From Notes.md (2026-05-24 session 3)

- [x] Add POC to contact role badges — added `{id:"poc", title:"POC"}` to contactRoleBadges in config.json; mapped poc→Star icon in RoleIcon; wired option through getRolePromptOptions, applyRoleAssignments (selects → flagContactAsPoc), toggleRoleForContact. Reviewer PASS — "{ \"id\": \"poc\", \"title\": \"POC\" }" (2026-05-24)
- [x] Soften PA second-firm warning to confirm-warning — wording changed from "Replacing... is unusual" block-style to "Are you sure you want to add another active <type> firm to this order?" Reviewer PASS — "Are you sure you want to add another active ${nextType.toLowerCase()} firm to this order?" (2026-05-24)
- [x] Hide Insurance badge for Public Adjuster contacts — getRolePromptOptions filters out the insurance role when companyTypeHint includes "public adjust"; toggleRoleForContact rejects insurance for PA with a toast. Reviewer PASS — "if (companyTypeHint.includes(\"public adjust\")) { setToast(\"Public Adjuster contacts cannot be assigned the Insurance role.\"); return; }" (2026-05-24)
- [x] POC button in referrer entry utility — satisfied by adding POC to the role-assignment prompt that fires when adding any contact (referrer included). Reviewer PASS — "if (role.id === \"poc\") return true;" (2026-05-24)
- [x] Red-color the Add Blocker picker — wrapped picker in `border-2 border-rose-300 bg-rose-50/40` container with "Assign a Blocker" header, × close, rose-200 group cards, and replaced Done with "Close Add Blocker". Reviewer PASS — "<div className=\"rounded-2xl border-2 border-rose-300 bg-rose-50/40 p-3 space-y-3\">" (2026-05-24)
- [x] Bug: timeline × button not closing — root cause was the IntersectionObserver auto-reopening Rush Guide after × because the timeline anchor was still in view. Removed the auto-open IntersectionObserver entirely (plus the related state). Rush Guide now opens only via explicit user action (View Timeline button, Action Items "Rush Guide not ready" link). Reviewer PASS — "Timeline (Rush Guide) is opened only by explicit user action ... Manual only." (2026-05-24)
- [x] Order-level POC/sales-rep apply to all customers — moved `useSalesRepOnly` from per-customer (c.useSalesRepOnly) to order-level (data.useSalesRepOnly). CustomerItem receives new orderUseSalesRepOnly prop. Removed per-customer "Use POC Only" / "Use Sales Rep Only" toggles. Added order-level toggle in Source subsection (shown when data.salesRep is set). Reviewer PASS — "onClick={() => update(\"useSalesRepOnly\", !(data as any).useSalesRepOnly)}" (2026-05-24)
- [x] Simplify POC display on customer record — removed the violet POC banner, the amber sales-rep banner, the "Use POC Only" warning, and the per-row Mark-POC ToggleMulti. Kept the chip + new "Contact via …" routing chip. Phone/email inputs get `!text-slate-500 line-through decoration-amber-500/70 decoration-[1.5px]` when contactRestricted, so contact info is visible but visually marked as not for direct use. Reviewer PASS — "const restrictedInputClass = contactRestricted ? \"!text-slate-500 line-through decoration-amber-500/70 decoration-[1.5px]\" : \"\";" (2026-05-24)
- [x] Y/N Collapse doesn't toggle when unanswered — changed expanded computation: explicit user preference (Collapse click) wins, falls back to `!answered || needsFollowUp` only when unset. Reviewer PASS — "const expanded = userPref !== undefined ? !!userPref : (!answered || needsFollowUp);" (2026-05-24)
- [x] Last interview Q auto-opens timeline; Open Full Interview broken — same root cause as the × bug; removing the auto-open IntersectionObserver fixes both. Reviewer PASS — "Timeline (Rush Guide) is opened only by explicit user action" (2026-05-24)
- [x] Interview search RFD doesn't scroll to match — added useEffect on interviewSearch that scrolls the first `<mark>` element inside `#noe-interview-scroll` into view with smooth/center 60ms after typing. Reviewer PASS — "const firstMark = container.querySelector(\"mark\"); if (firstMark) firstMark.scrollIntoView({ behavior: \"smooth\", block: \"center\" });" (2026-05-24)

---

## From Notes.md (2026-05-24 session 4)

- [x] Surface POC inline in referrer source workflow — added a POC ToggleMulti chip to ReferrerRoleAssignment alongside Referrer/Bill To/Insurance; wired orderPoc + flagContactAsPoc through LeadInfoFields and through both Quick (line ~3764) and Detailed (line ~9965) call sites. Reviewer PASS — "orderPoc={orderPoc} flagContactAsPoc={flagContactAsPoc}" (2026-05-24)
- [x] Coordinate POC chip colors — CustomerItem's routing chip is violet when reason is "Contact via Order POC" (matches POC chip), amber when reason is "Contact via Sales Rep"; strike-through decoration color matches. Reviewer PASS — "const routingDecorationColor = restrictedByPoc ? \"decoration-violet-500/70\" : \"decoration-amber-500/70\";" (2026-05-24)
- [x] Don't default-select POC for Public Adjuster — openRoleAssignmentPrompt's single-option fallback skips POC; selectedDefaults filters POC. Reviewer PASS — "if (!suggested.length && options.length === 1 && options[0].id !== \"poc\") suggested.push(options[0].id);" plus filter (2026-05-24)
- [x] Confirm when reassigning POC — both setOrderPoc and flagContactAsPoc show "POC is presently <name>, are you sure you want to change it?" before replacing. Reviewer PASS — "if (!window.confirm(\`POC is presently ${orderPoc.name || \"set\"}, are you sure you want to change it?\`)) return;" (2026-05-24)
- [x] Remove red border on blocker choice buttons — choice button border now neutral slate-200/300; outer container's rose-300 border + bg-rose-50/40 unchanged. Reviewer PASS — "w-full text-left rounded-lg border px-3 py-2.5 ... ${active ? \"border-slate-300 bg-rose-100 text-rose-800\" : \"border-slate-200 bg-white text-slate-700 hover:bg-rose-50\"}" (2026-05-24)
- [x] Rename interview question titles — medical→"Medical Issues", allergies→"Allergies", selfClean→"Self-Cleaning", dryCleaner→"Dry Cleaner", laundry→"Drying Preference", living→"Staying in Home", events→"Trips / Events", considerations→"Considerations". Reviewer PASS — "{ key: \"medical\", ... title: \"Medical Issues\" }, { key: \"allergies\", ... title: \"Allergies\" }, ..." (2026-05-24)
- [x] Default all interview questions to collapsed — changed every `interviewExpanded.X !== false` to `=== true` (12 static questions) and the dynamic Y/N section to `const expanded = userPref === true;`. Reviewer PASS — "const userPref = interviewExpanded[q.key]; const expanded = userPref === true;" (grep `!== false` returns zero matches) (2026-05-24)
- [x] Interview search not scrolling to match — added `noe-iq` class to all 13 question outer wrappers; search effect now does `container.querySelector(\".noe-iq\")?.scrollIntoView({block:\"start\"})` first, then mark fallback, then top. Reviewer PASS — "const firstQuestion = container.querySelector(\".noe-iq\"); if (firstQuestion) { firstQuestion.scrollIntoView({ behavior: \"smooth\", block: \"start\" }); return; }" (2026-05-24)

---

## From Notes.md (2026-05-24 session 5)

- [x] Fix referrer POC chip selectability — ReferrerRoleAssignment compared `orderPoc?.contact === data.referrer`, but orderPoc.name holds the contact (no `contact` field exists). Toggling worked but the chip never appeared checked. Fixed to `orderPoc?.name`. Reviewer PASS — "orderPoc?.company === data.referringCompany && orderPoc?.name === data.referrer;" (2026-05-24)
- [x] Replace strikethrough with inline chip — Phone/Email fields no longer strike through values when contact is restricted. Instead, Field's `action` prop renders a small "via Order POC" (violet) or "via Sales Rep" (amber) chip beside the field label. Value text stays plain. Reviewer PASS — "<Field label=\"Phone\" action={contactRestricted ? <span ...>{routingShortChip}</span> : null}>" (2026-05-24)
- [x] Shorten PA second-firm warning + flip default — message reduced to two sentences; Cancel is framed as the safe path ("Cancel to keep it (and mark it inactive separately before switching)") and OK only fires when user explicitly means to replace. Reviewer PASS — "Cancel to keep it (and mark it inactive separately before switching). Click OK only if you mean to replace it now with \"${incomingCompany}\"." (2026-05-24)
- [x] Cancel PA warning suppresses role-assign prompt — upsertAdditionalCompany now returns true (applied) or false (user canceled). Both addCompanyFromSearch and addCompanyDirect check the return value and short-circuit before openRoleAssignmentPrompt + flash/toggles. Reviewer PASS — "const applied = upsertAdditionalCompany(...); if (!applied) return;" (2026-05-24)
- [x] Living question default to collapsed — replaced the hard-coded `const expanded = true; // Always open` with `interviewExpanded.living === true` (and the search override). Reviewer PASS — "const expanded = !!interviewSearch.trim() || interviewExpanded.living === true;" (2026-05-24)
- [x] Auto-expand matched questions on search — every `const expanded = ...` computation now prefixed with `!!interviewSearch.trim() ||` so matching questions auto-expand when the search filter is active. Reviewer PASS — "const userPref = interviewExpanded[q.key]; const expanded = !!interviewSearch.trim() || userPref === true;" (2026-05-24)

---

## From Notes.md (2026-05-24 session 6)

- [x] Remove Scope Status banner from top of Detailed — the "Scope Status: YELLOW/RED/GREEN" + blockers chip + Auth/Scope milestones row at App.tsx ~9651-9699 was confusing ("yellow" had no inline meaning, info already in Action Items). Replaced with a one-line comment marker. Reviewer PASS — "{/* Scope Status banner and Contact-instructions inline alert removed — blockers" (2026-05-24)
- [x] Remove Contact-instructions inline alert — dropped the inlineAlert renderer, the useEffect that fired it on unseen orderAttentionAlerts, the orderAttentionAlerts useMemo, the inlineAlert state, and the unused seenAttentionAlertKeysRef. `markInstructionKeysSeen` kept (still used by company/contact children). Reviewer PASS — "Grep for `inlineAlert`, `setInlineAlert`, `orderAttentionAlerts`, `seenAttentionAlertKeysRef` in src/App.tsx returned zero matches" (2026-05-24)
- [x] Add Open Blockers section to Save Summary — rose-themed list above Missing Fields shows `scopeBridgeState.pendingIssues` with count; only renders when blockers exist. Action Items panel already exposed them, this gives the save-flow parity. Reviewer PASS — "{(scopeBridgeState.pendingIssues || []).length > 0 && (" (2026-05-24)

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
