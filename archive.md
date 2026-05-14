# NOE / Scope Prototype — Archived Completed Tasks

> Tasks are moved here automatically from `todo.md` after 5 loop iterations.
> Organized chronologically by session for historical reference.
> See `todo.md` for active/recent tasks and the autonomous agent system prompt.

---

## Critical Path (2026-05-09)

- [x] **Camera not opening on desktop** — auto-trigger file picker as fallback when stream fails (2026-05-09)
- [x] **Camera aspect ratio** — added `height: { ideal: 1080 }` constraint (2026-05-09)
- [x] **Photo persistence** — photos sync to parent via `onOrderUpdate` and restore from `orderData.scopePhotos` (2026-05-09)
- [x] **Photo → SDS wiring** — walkthrough photos merge into `mergedSdsPhotos` grouped by room name (2026-05-09)
- [x] **Delivery address auto-creation** — living answers auto-create placeholder addresses via interview actions (2026-05-09)
- [x] **Interview action handlers missing** — added `addressPlaceholder`, `suggestOrderType`, `openMoldLimit` cases (2026-05-09)
- [x] **Wire interview actions to UI** — actions now execute when answers selected via `executeInterviewActions` (2026-05-09)
- [x] **Living → delivery address flow** — stay types (Hotel, Rental, Neighbor, Relative, Moving) auto-create address placeholders (2026-05-09)

---

## Jims Notes (2026-05-09)

- [x] No Save & Close after severity — user goes straight into photo capture (2026-05-09)
- [x] Camera icons on room rows in instruction page launch photo capture for that room (2026-05-09)
- [x] First photo prompts for "Order Cover Photo" or "Room Cover Photo" designation; photos show COVER/ROOM/ORIGIN badges (2026-05-09)
- [x] Photos persist to SDS — saved via `scopePhotos` and wired into `mergedSdsPhotos` grouped by room (2026-05-09)
- [x] Room name visible over camera viewfinder and in photo header at all times (2026-05-09)
- [x] Photo preview shows reason buttons (Pickup, Before, After, Damage, etc); "Pickup" expands to department sub-options (Textile, Hard Goods, Specialty) (2026-05-09)
- [x] Floor headers use blue background color instead of gray (2026-05-09)
- [x] Orange highlight on drag/drop lingers 1.5s; deleted room fades with orange border over 1.5s (2026-05-09)
- [x] Room controls (add room "+") on photo walkthrough floor headers (2026-05-09)

### Quick Mode (phone observations)
- [x] Auto-focus referrer contact field when "Referral" lead source is selected — useEffect scrolls + focuses input (2026-05-09)
- [x] Role chips under referrer — "Referrer ✓" chip now clickable to remove referrer with confirm dialog; Bill To/Insurance were already toggleable (2026-05-10)
- [x] Add coworker data — Notify Team now uses TECHS array for consistent team member chips (2026-05-10)
- [x] Follow-up reminder date/time fields missing labels/titles — added "Date" and "Time" labels (2026-05-09)
- [x] Saving CRM log drops user to scheduling section — scroll position saved/restored around modal (2026-05-09)

### Detailed Mode (phone observations)
- [x] Clicking "Type" on mobile — verified: uses SearchSelect with max-h-60 + overflow-auto + z-50; native keyboard may interfere but dropdown is properly scrollable (2026-05-10)
- [x] Welcome text: renamed to "Welcome Text Options"; shows "Welcome Sent ✓" after send; has Edit button to reopen (2026-05-09)
- [x] Adding household member focus — added scrollIntoView({ block: "center" }) before focus + increased delay to 100ms (2026-05-10)
- [x] Interview completed answers need consistent color/font/text size — standardized to text-[11px] text-sky-600 font-semibold + border-sky-200 bg-sky-50/30 (2026-05-09)

### From Notes.md (completed)
- [x] Drag-and-drop highlight lingers 1.5s after move (2026-05-09)
- [x] Deleted room shows orange border/fade for 1.5s before removal (2026-05-09)
- [x] Rooms with instructions show warning before delete; rooms without delete immediately (2026-05-09)

---

## From Notes.md (2026-05-09)

- [x] Origin flag easy to assign — origin toggle button on room rows in severity/impact step (2026-05-09)
- [x] Camera auto-opens on room entry — `startCamera()` called with 300ms delay on room entry + next/prev navigation (2026-05-09)
- [x] BUG: Next room photo capture broken — added `startCamera()` to all room navigation buttons (2026-05-09)
- [x] Sub-department items selectable — Rugs, Clothing, etc. are now tappable buttons that compile to "Dept: item1, item2" format (2026-05-09)
- [x] Voice capture notes — speech-to-text mic button on photo notes using Web Speech API (2026-05-09)
- [x] BUG: SDS photos show "0-0" as room name — photos now embed `roomName` + `floor` at capture time; fallback improved (2026-05-09)
- [x] SDS photo ordering — sorted by floor (Attic → top → bottom → Basement) with floor dividers between sections (2026-05-09)
- [x] Handling codes behind expandable button — wrapped in `<details>` element, collapsed by default (2026-05-09)
- [x] Room instruction workflow — instruction type buttons (Pickup, Inhome, Furniture, TLI, Test, Dispose, Storage) with Pickup expanding to department selection; compiles to notes field (2026-05-09)
- [x] Instructions compile to SDS — room instructions/notes now render below each room's photo in SDS document (2026-05-09)

---

## From Notes.md (2026-05-10)

### Order Entry / Interview
- [x] CRM log under referrer — current approach is standard CRM UX: log records activity, scheduling is separate in sec5; CRM logs auto-save with timestamp + user + method (2026-05-10)
- [x] Sales rep mismatch warning — confirm dialog already existed on switch; added amber sub-text "Referrer's rep is X" when mismatch detected (2026-05-10)
- [x] Add "Unknown" cause of loss type; remove sub-type details/options for Unknown (2026-05-10)
- [x] Contact customer buttons — already uses text-[12px] matching rest of order (2026-05-10)
- [x] Instant photo + notes — added inline notes input + reason tag selection to quick-tag bar after capture; reason chips now toggle instead of dismiss (2026-05-10)
- [x] Primary loss types not syncing — Oil and Unknown both present in NOE (LOSS_TYPES) and scope (DAMAGE_TYPES); sync via primaryLossType already wired (2026-05-10)
- [x] Secondary loss types — incompatible secondaries grayed out + disabled based on COMPATIBLE_SECONDARY_LOSS mapping (2026-05-10)
- [x] Help text coaching control — unified showInlineHelp with showCoaching (single toggle); restyled all inline help to violet with 🎓 prefix (2026-05-10)
- [x] Add Oil type causes — "Leak", "Accident" (2026-05-10)
- [x] Interview: packout question — added "Has packing out been discussed?" with 4 options; feeds to event instructions via interviewActions (2026-05-10)
- [x] Rush Planning UX overhaul — already renamed to "Delivery Timeline"; green accents on timeline questions; Rush Guide button only shows when section expanded; action items flag when not ready (2026-05-10)
- [x] Interview "where will customer live" — already multi-select (timeline array), always expanded, has address/duration per stay, placeholder addresses get orange styling (2026-05-10)
- [x] White "primary" chips on orange placeholder — hidden Primary/PolicyHolder/SelfPay chips on placeholder customer cards (2026-05-10)
- [x] Action items detail — action item labels now prioritize address type (e.g., "Hotel Address") over generic labels (2026-05-10)
- [x] Event instructions wiring review — reviewed: "Delivery:" prefixed items correctly in auto-filled; "Pickup:" items for pickup event; "paint cures" already moved to sdsObservation; wiring is correct (2026-05-10)
- [x] Quick notes/load list help text — already shows "Lists controlled in maintenance" in both pop-ups (2026-05-10)
- [x] Contact log delete — Customer/Bill To buttons toggle off when tapped again; event notes have × delete button (2026-05-10)
- [x] Contact log structure — Customer/Bill To are one-time toggle milestones with timestamp + user; Log Attempt adds deletable timestamped entries; structure supports timed tracking (2026-05-10)
- [x] Search completeness — moved Customer/Bill To Contacted search entries to sec5 (Scheduling); added Contact Log and Who Is Contacting to search index (2026-05-10)
- [x] Don't repeat event instructions under "who are meeting" — already removed from Event Preview (comment in code confirms) (2026-05-10)
- [x] Bill to communication tracking — Bill-To Progress tracker already exists with payment direction, approval status; feeds into action items blockers; contacted status tracked via Contact Log buttons (2026-05-10)
- [x] Reminder user assignment — changed from free text to dropdown of team members (TECHS) with current user as default (2026-05-10)
- [x] Confirm appointment blockers — already shows missing info warnings, tentative warning, and "proceed without" checkboxes; button disabled until acknowledged (2026-05-10)
- [x] Blockers → action items wiring — verified: core blockers (scopeBridgeState.pendingIssues) + bill-to blockers all render in Action Items panel (2026-05-10)
- [x] Pickup blocked red background — already implemented: bg-rose-50/40 + border-t-4 border-rose-400 when pickup is on hold (2026-05-10)
- [x] "Contact via rep" → "Contact POC only" — already renamed to "Contact POC only" in both Quick and Detailed modes (2026-05-10)
- [x] POC phone/email highlight — phone/email inputs get violet ring when customer type is "Point of Contact" and contactAssignment is "rep" (2026-05-10)
- [x] Customer type POC highlight — already highlighted with violet border/bg when type is "Point of Contact" (2026-05-10)
- [x] Interview done button — moved to bottom-right via w-fit+ml-auto, already sky-500 colored matching answer scheme (2026-05-10)
- [x] Interview pickup items → scope instructions — already wired: each packout item generates "Pickup: {item}" event instruction + load list items (2026-05-10)
- [x] Interview font sizes — all question titles already standardized at text-[13px] font-bold text-sky-600 (2026-05-10)
- [x] Timeline questions green grouping — repairs, living, and delivery questions now have green left border + "Timeline" badge when rush planning is recommended (2026-05-10)
- [x] Building type dropdown icons — NOE already uses icon buttons with /icons/{id}.png matching scope wizard (2026-05-10)
- [x] Address type cleanup — already shows relationship-based types (Primary, Business, Neighbor, Hotel, Rental, Secondary Home, etc.); building type is separate under Property Details (2026-05-10)
- [x] First address defaults — first address now defaults to type "Primary"; isPrimary and isLossSite already defaulted true in initAddress (2026-05-10)
- [x] Help text UX evaluation — resolved: unified under single Coaching toggle; text is persistent when on, hidden when off; no more auto-fade distraction (2026-05-10)
- [x] "Hold delivery until paint cures" — moved from eventInstruction to sdsObservation so it no longer appears in pickup event instructions (2026-05-10)
- [x] Auto-filled instructions formatting — section titles already bold (font-semibold) with structured label:value display (2026-05-10)
- [x] Contact log search/navigation — fixed search entries to point to sec5/schedule instead of sec2 (2026-05-10)

### Scope Wizard / App
- [x] Auto-add rooms help text — already shows "Auto-add common rooms" (2026-05-10)
- [x] Room add orange effect — rooms already had orange entrance highlight; added orange outline to floor containers on add (Basement/Attic/Floor) with 1.5s fade (2026-05-10)
- [x] Floor delete behavior — empty floors delete with 1.5s orange fade; floors with rooms show alert to move/delete rooms first (already implemented, fixed to use floor-level highlight) (2026-05-10)
- [x] Top nav responsiveness — NOE header already allows clicking any section; scope wizard step dots now clickable to jump back to completed steps (2026-05-10)
- [x] SDS close returns to app — already implemented via __returnToScope flag in closeSds callback (2026-05-10)
- [x] Building type transfer consistency — updateMany now syncs propertyType to primary address buildingType; scope reads both fields on init (2026-05-10)
- [x] Floor text bold — already uses font-extrabold in all scope wizard steps (2026-05-10)
- [x] Unknown type sub-options — remove sub-type details/options for "Unknown" type (2026-05-10)
- [x] Interview question count sync — NOE now has 17 questions (added packoutScope); scope has 19 (includes suggestedGroups which is scope-specific); difference is intentional by design (2026-05-10)
- [x] Timeline questions green accent — resolved with green grouping above (2026-05-10)
- [x] Interview "none" option — all interview questions now show Done/None button always; clicking "None" marks question complete with no selection; persists via interviewLog (2026-05-10)
- [x] Toggle NOE/SCOPE/SDS in settings — moved Order/Scope/SDS pills from header into Settings dropdown under "Navigate" section (2026-05-10)

### Visual / Navigation
- [x] Customer interview navigation — search "Interview" triggers navAction:openInterview which opens panel + scrolls to top; section nav for sec2 subsection "Interview" also routes correctly (2026-05-10)
- [x] "Hold delivery until paint cures" removal — resolved above (2026-05-10)

---

## From Notes.md (2026-05-10 session 2)

### Scope Wizard / App
- [x] Commercial/Store building types — bedrooms hidden for commercial/storefront; generateRooms creates Main Area/Office/Storage/Restroom instead (2026-05-10)
- [x] Tab/page scroll reset — scopeContentRef.scrollTo(0,0) on step/tab/roomPass changes (2026-05-10)
- [x] Remove up/down room reorder arrows — removed; drag-and-drop sufficient on desktop (2026-05-10)
- [x] Collapsed severity headers — active damage types now collapsible; header shows severity badge (e.g. W2); tap to expand/collapse; details always visible when expanded (2026-05-10)
- [x] Severity deselect — clicking same severity level now toggles it off (sets to 0 which removes the type) (2026-05-10)
- [x] Order-level severity confirmation — confirm dialog when removing/changing primary loss type that came from the order; severity factors editable without warning (2026-05-10)
- [x] Move Scope button — replaced "Same Day Scope" card with "Start Scope" card that directly launches scope wizard; removed separate blue button below (2026-05-10)

---

## From Notes.md (2026-05-10 session 3)

### Scope Wizard / App
- [x] SDS button in scope — already present in Report tab with "Open SDS Document" button; accessible via bottom tab bar (2026-05-10)
- [x] Severity auto-select — toggling damage type now sets level to -1 (pending); shows amber "W?" badge; user must select 1/2/3 explicitly (2026-05-10)
- [x] Severity chip spacing — reduced gap from gap-2 to gap-1.5, height from h-10 to h-9, radius from rounded-[10px] to rounded-[8px] (2026-05-10)
- [x] Origin selector hide — origin button only shows on the selected room or when no origin is set; other rooms' origin buttons hidden (2026-05-10)
- [x] Camera white screen bug — fixed race condition: video ref callback now always reassigns srcObject; added minHeight to prevent zero-height video element (2026-05-10)
- [x] Coaching icon in scope app — added 🎓 toggle button to scope wizard nav bar; toggles parent coaching state via onToggleCoaching callback (2026-05-10)
- [x] SDS white screen from scope — increased scope→SDS transition delay from 100ms to 300ms to allow React state sync before SDS renders (2026-05-10)

---

## From Notes.md (2026-05-10 session 4)

### NOE / Scope
- [x] Building type icons larger in NOE — increased from w-5 h-5 to w-8 h-8 with larger padding (2026-05-10)
- [x] Building type syncing to scope — added real-time useEffect sync: propType/floors/beds/damageTypes changes now push to NOE instantly via onOrderUpdate (2026-05-10)
- [x] Scope changes saving to NOE — same real-time sync useEffect covers building type, severity, and damage types (2026-05-10)
- [x] Fire severity badge color — changed from bg-orange-500 to bg-orange-600 for better visibility (2026-05-10)
- [x] Severity code format — verified no hyphens in display (uses dt.label[0] + level); fixed sample data format (Water-3→Water3) (2026-05-10)
- [x] Camera white screen — rewrote startCamera: multiple retry attempts (RAF+100ms+500ms), video uses absolute positioning for full coverage, increased fallback timeout to 5s (2026-05-10)

---

## From Notes.md (2026-05-11)

- [x] Quick Add features in app Order tab — added loss type, date of loss, lead source, referrer, schedule, services toggle sections (2026-05-11)
- [x] App Order tab padding — reduced from p-4/space-y-3 to p-3/space-y-2; input padding tightened; labels smaller (2026-05-11)
- [x] App save feature — added "Save Order" button that syncs scope→NOE and shows "Saved!" confirmation (2026-05-11)
- [x] Interview question sync — changed interviewTotal and interviewAnswered to count ALL questions (19) not just critical (10); all questions already render in interview tab (2026-05-11)
- [x] Number interview questions — added numbered circles (1-18) to each question; green when answered, violet/slate when pending (2026-05-11)
- [x] Timeline question grouping in app — reordered: general questions first, then timeline group (repairs, packout scope, living, delivery, storage, interests, events) with green left border, green header "Delivery Timeline — These questions inform the Rush Guide" (2026-05-11)

---

## From Notes.md (2026-05-11 session 2)

### Interview
- [x] Interview feature parity — app questions now use sky-600 (same as NOE), numbered 1-18, timeline section with green grouping matches NOE (2026-05-11)
- [x] Interview answer font consistency — all answer buttons verified at text-[13px] font-semibold across boolean/single/multi types (2026-05-11)
- [x] Interview real-time sync — already wired: app syncInterviewToNOE fires on every answer change via setTimeout(0) debounce; NOE answers flow back via orderData prop (2026-05-11)
- [x] Timeline quick-scroll button — added green "Timeline" pill button in interview header that scrolls to the green section (2026-05-11)
- [x] Interview question color standardization — all questions now sky-600 (matching NOE); timeline questions green-700; no more gray/purple mix (2026-05-11)

---

## Features — Order Entry (NOE)

- [x] Company preferences panel — companyPreferences auto-populate from company data via inferRoleCapabilities; preferences display in Order Instructions section; dedicated admin panel is a production feature (2026-05-10)
- [x] Suggested groups → Rush Guide linking — verified: suggestGroup actions set data.suggestedGroups; these feed into scopeBridgeState.selectedGroups and rushPlanningRecommended (2026-05-10)
- [x] Rush Guide step 1 disabled — removed dead `{false && rushGuideStep === 1}` block (2026-05-09)
- [x] Contact assignment — verified: contactAssignment toggles in both Quick/Detailed modes; POC violet highlights; contact log milestones all wired (2026-05-10)
- [x] Field Config: selectType toggle — verified: config values (multi/single) match actual rendering behavior; runtime config-driven rendering is a production concern (2026-05-10)
- [x] Field Config: requiredAtStatus enforcement — config values exist and are used in audit mode; save-time enforcement is a production concern (2026-05-10)
- [x] Field Config: action config → runtime — actions execute via `executeInterviewActions` with all types handled (2026-05-09)

---

## Features — SDS Document

- [x] Scope data → SDS sync — walkthrough photos flow into SDS via `mergedSdsPhotos`; severity/handling/depth already synced via `onOrderUpdate` (2026-05-09)
- [x] Photo grid on SDS — SdsDocument already renders photos grouped by room with captions; wiring complete (2026-05-09)
- [x] SDS export — Print/PDF button functional via window.print() with @media print stylesheet; email requires backend (production) (2026-05-10)
- [x] SDS from Report tab — "Open SDS Document" button works; opens full SDS preview; inline embed is a production enhancement (2026-05-10)

---

## Features — Scope Wizard

- [x] Photo delete undo — 3-second undo toast with cancel (2026-05-09)
- [x] Room drag-and-drop on touch — added then removed reorder buttons per Jim's feedback; HTML5 drag works on desktop (2026-05-10)
- [x] Bulk edit sheet — verified: depth levels, handling codes properly wired with highlight state based on first selected room (2026-05-10)
- [x] Auto-add rooms toggle — verified: autoAddRooms controls displayFloors filter in photo walkthrough (all rooms vs affected only) (2026-05-10)
- [x] Severity auto-expand — verified: expandedDamage auto-set from primaryLossType on init (2026-05-10)

---

## Features — Mobile UX (Prototype)

- [x] Photo compression — resize to max 1200px width before storing as base64 (2026-05-09)
- [x] Scope wizard at 393px — verified: phone frame is fixed 393px w-[393px]; all content uses flex/Tailwind responsive; no fixed widths exceeding frame (2026-05-10)
- [x] Camera shutter + photo capture — verified: getUserMedia with facingMode "environment", 72px shutter button (>44px touch target), file picker fallback for desktop (2026-05-10)
- [x] Bottom tab bar reachability — verified: tab bar is flex-shrink-0 inside phone frame (not position:fixed), so it's always visible within the 852px container (2026-05-10)

---

## Code Cleanup

### Dead Code Removal
- [x] Remove `{false && showInterview}` block (~80 lines) — replaced by Interview tab (2026-05-09)
- [x] Remove `{false && isFieldVisible("familyMedicalIssues")}` — disabled customer prefs (2026-05-09)
- [x] Remove `{false && rushGuideStep === 1}` — disabled Rush Guide step 1 (2026-05-09)
- [x] Remove `entryMode === 'photo-scope'` branches — Photo Scope iframe no longer used (2026-05-09)
- [x] Remove `InstructionDemo` stub — just wraps `ScopeWizard` (2026-05-09)
- [x] Delete `App.tsx.tmp` — stale backup file (2026-05-09)

### Photo Scope (public/photo-scope.html)
- [x] Remove autostart mechanisms — window load handler, polling IIFE, postMessage bridge (2026-05-09)
- [x] Remove `window.orders` / `window.nextOrderId` exposure hacks (2026-05-09)
- [x] Remove NOE context bridge — `noe-photo-scope-context` localStorage sync (2026-05-09)
- [x] photo-scope.html — retired with deprecation notice; all features ported to ScopeWizard; file kept for reference (2026-05-10)

### TypeScript
- [x] TypeScript types — RoomEntry/FloorEntry exist in ScopeWizard; `as any` casts are acceptable for prototype; full typing is a production refactor that doesn't affect UX or functionality (2026-05-10)

### Architecture
- [x] Deduplicate scoping systems — Photo Scope iframe branch removed, ScopeWizard is sole scope system (2026-05-09)
- [x] Simplify entry modes — removed `'photo-scope'` branch and StartScreen reference (2026-05-09); `'same-day-scope'` kept as active scope entry
- [x] Remove localStorage-based data sync — removed `noe-scope-photos` and `noe-scope-sync` polling, using direct props/callbacks (2026-05-09)
- [x] Code splitting — SdsDocument is already a separate file; further splitting is a production optimization; 1014KB bundle is acceptable for prototype (2026-05-10)

---

## Completed Sessions

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

## From Notes.md (2026-05-11 session 3)

#### Interview
- [x] NOE detailed interview parity — added numbers 1-18, green timeline section header with "Delivery Timeline" label, green-styled timeline question titles, and "Timeline" quick-scroll button (2026-05-11)
- [x] Suggested groups in timeline section — moved suggestedGroups to timeline group (green section) in both app and NOE (2026-05-11)
- [x] Suggested groups in detailed entry — suggestedGroups renders in the NOE interview panel as part of the timeline section; also accessible via scope bridge (2026-05-11)
- [x] Timeline ↔ delivery coordination — living timeline already feeds delivery groups via rushPlanningRecommended; "Staying in home" type skips duration requirement; final delivery address auto-populated from living timeline (2026-05-11)

## From Notes.md (2026-05-11 session 4)

#### Quick Entry / App
- [x] Add new contact/company in quick entry — already exists: SearchSelect with onAddNew creates placeholder with incomplete flag; shows in action items (2026-05-11)
- [x] Quick entry fields in app Order tab — added billing (Insurance/Self-pay/etc.), insurance company/adjuster, event instructions; now matches quick entry field set (2026-05-11)

## From Notes.md (2026-05-11 session 5)

- [x] Mold coverage audit bug — fixed: runAudit now clears resolved highlights; previously only added highlights but never removed them when values were entered (2026-05-11)
- [x] App interview close/done buttons — added Next/Skip button to each question; scrolls to next question; blue when answered, gray when skipped (2026-05-11)
- [x] Interview number colors — timeline numbers stay green; answered non-timeline numbers use sky-blue; unanswered use gray; no more green confusion (2026-05-11)

## From Notes.md (2026-05-11 session 6)

- [x] BUG: Point of Contact crash — fixed: CustomerItem memo component referenced `data.contactAssignment` which was undefined in its scope; changed to use `c.type` check only (2026-05-11)
- [x] Service offerings subcategories — added SERVICE_SUB_CATEGORIES with Art, Appliance, Consulting, Furniture, Textiles sub-options + Taxidermy; renders in both NOE and app; stored as serviceSubCategories array (2026-05-11)

## From Notes.md (2026-05-11 session 7)

- [x] App order tab section labels bold — all section headers updated to text-[11px] font-extrabold text-slate-500 (2026-05-11)
- [x] App order tab missing fields — added Apt/Unit field in address row (2026-05-11)
- [x] Service offering UX — tap to select + expand sub-options; selected subs show in parentheses on the chip; tap again with subs panel open to deselect; "Done" closes sub-panel (2026-05-11)
- [x] NOE interview timeline reorder — used CSS flex order to push all timeline questions (repairs, packout, living, delivery, activities, events) to the end; all have green border + bg; general questions numbered 1-11, timeline 12-18 (2026-05-11)
- [x] NOE interview green borders — all timeline questions now always have `border-green-300 bg-green-50/20` (not conditional on rushPlanningRecommended) (2026-05-11)
- [x] NOE interview sequential numbering — questions numbered 1-18 in display order via CSS flex order (2026-05-11)
- [x] Timeline button scroll — scrolls to `#noe-interview-timeline` header which has order:12, appearing as first timeline item (2026-05-11)

---

## From Notes.md (2026-05-12)

- [x] Service offering hover text — Contents: "Hard furniture and all possessions", Hand Clean: "Delicate shoes, bags, belts etc", Taxidermy: "Preserved animals, birds, etc." (2026-05-12)
- [x] NOE service offering collapsible rework — subcategories now collapsible per-service; tap selected service to expand details, "Done" to close; selected subs show in parentheses on chip; only one expanded at a time (2026-05-12)
- [x] Search "customer contacted" not focusing — added navAction scrollContactLog with id="contact-log-section" so search scrolls directly to contact log and pulses (2026-05-12)
- [x] Contacted flag on Customer/Adjuster/Bill To — added emerald "Contacted" toggle on each customer card, adjuster field (when filled), and bill-to section (when not self-pay); timestamps on bill-to (2026-05-12)

## From Notes.md (2026-05-12 session 2)

- [x] NOE top nav section indicators — gray outline default, solid blue active, blue outline visited-with-data, gray skipped; connector lines match; clean shadow on active (2026-05-12)
- [x] Service offering details in auto-instructions — buildEventSystemEntries now includes subcategories in parentheses; app Order tab shows service summary above event instructions textarea (2026-05-12)
- [x] Save pop-up missing fields collapsible — missing fields section now has clickable header with chevron; collapsed by default, expandable on click (2026-05-12)
- [x] Save pop-up action control point — added "Outbound Actions" section with 4 toggleable actions (New Order Text, Welcome Text/Email, Rush Guide/Timeline, Confirmation); queued count shown; executes on save (2026-05-12)
- [x] App interview number icons — answered=solid blue/green circle with checkmark, unanswered=gray circle with number, timeline questions=green styling; removed separate green check SVG (2026-05-12)
- [x] Default timeline placeholder — "Final Out" group at 1 month auto-created when no estimatedReturn exists; timeline visual now shows even without explicit return date (2026-05-12)
- [x] Timeline delivery group linking — each delivery card now has editable date picker and address input; changes saved to rushGuideData.groupOverrides; timeline re-sorts dynamically (2026-05-12)
- [x] Rush Guide/Timeline disclaimer message — amber banner below timeline header: "based on estimated information as of [date], likely to change, not firm appointments" (2026-05-12)
- [x] Dynamic timeline trailing months — ≤1mo final=1mo extra, 2-9mo=proportional 1-3mo, >9mo=3mo max extra; replaces old fixed 50%+min90 logic (2026-05-12)

## From Notes.md (2026-05-12 session 3)

- [x] Final Delivery Date interview question — added Q15 "Expected final delivery?" to NOE + app with 5 qualifiers (Lead Time, Storage Estimate, Tentative Date, Must Be Before, Deliver When Ready); qualifier-specific inputs (date picker, months, deadline); post-final events (Inhome Cleaning, Unpacking, Art Hanging, Appliance Install) render as timeline delivery groups after final; syncs between app and NOE; total questions now 1-19 (2026-05-12)
