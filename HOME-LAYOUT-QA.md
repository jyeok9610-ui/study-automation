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
