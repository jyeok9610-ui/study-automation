# Liquid Glass redesign — application shell and reader

## Direction contract

THESIS: A Korean personal learning library with a macOS-quality navigation layer and an Apple Notes-like reading surface. Existing learning content and every route remain intact.

OWN-WORLD: Light only. #F5F5F7 workspace, white content, #1D1D1F ink, #6E6E73 secondary text, #007AFF accent. System fonts. A restrained translucent sidebar, toolbar, and helper sheet carry reflected edges and soft layered shadows. Books retain their subject identity; article text never sits on glass.

STORY: Choose a subject, open the real book, read and manipulate examples, save a note or reading position. Existing search, routes, map and backup remain accessible. No fictional progress or features.

FIRST VIEWPORT: Desktop: an inset 220px sidebar, quiet route toolbar and generously spaced library. Four subject books align on one shelf below the actual introduction. Reader: persistent book contents, opaque readable column and a compact helper toolbar. Mobile: compact top brand, existing four destinations in a floating bottom dock, single-column content and modal helper sheet.

FORM: User-pinned Apple Liquid Glass/macOS Light/Apple Notes direction, implemented directly in the existing React application. No alternative aesthetic selection or generated mockup is needed for this detailed implementation brief. Signature interaction: the toolbar gains opacity and depth after content scrolls beneath it; controls respond within 180–250ms, with reduced-motion and reduced-transparency fallbacks.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Preservation boundary

No edits to content JSON, IDs, route paths, IndexedDB schema or storage logic. Preserve the old theme preference in storage without reading it; the visual app is fixed light. No external SDK, new runtime dependency, remote push or deployment. Capture baseline and three actual evaluation cycles at 1920×1080, 1440×900 and 390×844. Inspection rounds and findings are recorded in docs/liquid-glass-redesign.md.

## Follow-up scope
2026-10-30: The user approved a reference-led Home dashboard and real page bookmarks. The newer home-dashboard.md contract governs that extension. Bookmarks add namespaced rows and an optional backup field while preserving DB version1/stores and existing records. The original no-storage-edit boundary applies to the initial visual redesign, not this explicitly approved feature.
