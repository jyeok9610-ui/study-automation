# Home reference layout verification — 2026-10-30

The user accepted the Liquid Glass visual treatment but requested the supplied image's composition. Changed only the homepage shell and shared navigation: one app frame, spanning header, left menu and opaque right panel. The mobile homepage retains the left menu. Actual content, storage schema, routes, notes, bookmarks and reading progress are preserved.

Validation: npm test (10 tests), npm run typecheck, npm run validate, Pages-base npm run build, and Playwright (40/40 across Chromium and WebKit desktop/mobile) passed. The initial run found two obsolete mobile bottom-dock assertions; these now verify left navigation placement and no horizontal scrolling. Chromium visual QA: 61 captures / 48 page checks / no reported issues. WebKit: 60 captures / 48 page checks / no reported issues. Manually inspected reference-size and mobile captures in both engines. Physical iPhone confirmation remains limited to the previous release's normal visual display; persistence and connectivity checks remain unconfirmed.

Local screenshots (ignored by Git):
- Before: .impeccable/review/liquid-glass/dashboard-final/
- After: .impeccable/review/liquid-glass/reference-layout/ (includes reference.png at 1170x1247)
- Safari engine: .impeccable/review/liquid-glass/reference-webkit/

No runtime dependencies or external services were added. Run npm install and npm run dev for local use. Publishing is handled by the existing Pages workflow on master pushes; production base is /study-automation/.
## Collapsible homepage menu — 2026-10-30
The header menu button now toggles the existing home navigation as a light-dismiss popover. Outside click, item selection, the trigger and Escape close it; Escape explicitly restores focus for WebKit. The closed state gives the content the full panel width. Other routes retain their navigation. No storage, route or dependency changes.

The first checks exposed an outside-click test targeting content covered by the mobile panel, WebKit Escape focus restoration, and one transient backup test failure during overlapping test runs. The test now clicks an unobstructed footer, focus restoration is explicit, and the final standalone full suite passed 40/40. Unit tests (10), typecheck, content validation and Pages build passed. Final screenshots: .impeccable/review/liquid-glass/collapsible-menu/ — 12 open/closed captures across Chromium/WebKit at 1920x1080, 1440x900 and 390x844, with report.json showing no overflow or console/page errors. Menu surface opacity and blur were strengthened after visual inspection to keep background text from competing with navigation.

## Viewport-edge sliding drawer — 2026-10-30
The user clarified that the menu must slide horizontally from the entire left edge, rather than appear as a small header popover. The home menu now opens at x=0/y=0, fills 100dvh, and has a 320px width capped to leave at least 48px of outside area. It includes safe-area padding, an internal close button and a quiet backdrop. Outside click, item selection and Escape still dismiss it. Native popover is retained only as the dismissal mechanism; the visual treatment is a full-height drawer.

Final full E2E: 40/40. Typecheck, unit tests (10), content validation and Pages build passed. Screenshots and report: .impeccable/review/liquid-glass/left-drawer/ (12 images across Chromium/WebKit and desktop/laptop/mobile). All six viewport checks recorded x=0, y=0, full viewport height, no horizontal overflow and no console/page errors. Browser animation keyframes were verified as translateX(-100%) to translateX(0px) in both engines.

## Shared navigation on every page — 2026-10-30
The user requested direct navigation from book/reader pages without returning home. AppHeader now owns the same trigger, full-height sliding drawer, search and settings tools on every route. The regular-page header remains visible while scrolling. Existing reading-path, map and subject links move into the common drawer, replacing the former desktop rail and mobile bottom dock. Reader TOC, notes, bookmarks and learning content retain their existing behavior; storage and routes are unchanged. Drawer selection and route changes dismiss it.

Validation: typecheck, unit tests (10), content validation and Pages build passed; full Playwright suite 44/44 across Chromium/WebKit desktop/mobile. The added test visits 12 routes (library, book introduction, reader, provenance, bookmarks, progress, search, subject, paths, map, settings and missing page), opens the drawer after scrolling, verifies full height, and navigates directly to the library. It also follows the preserved map and subject links. Screenshots: .impeccable/review/liquid-glass/global-drawer/ — 42 captures/checks across six surfaces, three resolutions and two engines, including reader menu after scrolling. No reported horizontal overflow, console or page errors; desktop and mobile reader/menu and mobile book introduction were visually inspected.
