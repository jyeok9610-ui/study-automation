# Japanese word explanation popovers — 2026-10-30

The user confirmed that a complete word, such as 学生, should be one target and show its whole-word kana reading and meaning plus the Korean names of its constituent kanji (学—배울 학, 生—날 생).

## Implementation
- Reuse the current book glossary (123 entries) for word reading, meaning and existing learning notes. A shared bundled map contains the 107 kanji used in these entries: 84 character names reused from the existing learning dictionary and 23 standard character names added as supplementary teaching data. The original learning notes and public book JSON were not changed.
- Longest registered word wins, so 携帯電話 is one target. Unknown Han compounds and numeric counters are not mislabeled as shorter dictionary nouns. Do not split compound kana readings to invent per-character pronunciations.
- WordText handles prose, examples, tables, question prompts/revealed explanations and relevant interactive activity text. Answer-option and control buttons retain their original action without nested buttons. Unregistered words remain plain text.
- WordHelpProvider presents one anchored, viewport-clamped native popover; outside click, close and Escape dismiss it. Explicit keyboard focus restoration supports WebKit. On scroll/resize the box follows its anchor. Definitions are reused in the existing dictionary panel.
- No new dependencies, external services, storage/schema changes or modified learning IDs. Progress, notes and bookmarks remain unchanged; answers remain temporary.

## Validation
- Unit tests: 12 passed, including longest matching, text preservation, unknown compounds/counters, all glossary words and full constituent-kanji coverage.
- Typecheck, content validation and Pages build passed. A final rebuild also verified the character map under the tracked src/content path rather than the repository's ignored data directory.
- Browser suite: 52/52 across Chromium/WebKit desktop/mobile. Tests verify the complete word, kana, meanings, constituent kanji, viewport fit, outside dismissal, close, Escape focus, preserved selected answer, table terms, dictionary reuse, navigation dismissal and reduced motion, together with existing app regressions.
- Initial Chromium tests revealed that delayed scroll events after automatically revealing a clicked word dismissed the popup immediately; following the anchor on scroll fixed this. Popup content is retained during its closing transition for stable rapid reopening.
- Visual evidence: .impeccable/review/liquid-glass/word-help/ (18 screenshots, 12 popup checks at 1920x1080, 1440x900 and 390x844 in both engines). No reported clipping, horizontal overflow, console or page errors. Manually inspected desktop/mobile 学生 and mobile 携帯電話 captures. Additional checks confirmed the global header/menu stays at the viewport top after deep table scrolling.

Physical iPhone verification of this new feature remains pending. To run locally use npm install and npm run dev. Existing master Pages workflow publishes with PAGES_BASE=/study-automation/.
## Visibility and complete current-lesson coverage — 2026-10-30
The user could not see the word targets. A freshly opened production reader had 36 word buttons on the first page, but their dotted underline used only 55% blue. The existing Aside tab still displayed an older app shell; reloading that tab revealed the current shared menu without clearing any learner storage. This establishes a stale PC tab, not the state of a separate physical iPhone.

Word targets now use Readable Blue text, a solid underline and Blue Wash background; the hint says to tap blue words. The dictionary is expanded with 124 shared supplements (247 total entries including the original 123). Missing lesson vocabulary includes 会社員, 日本語, 友達, 何時 and 読みます. Existing date/time tables supply irregular readings, and the quantity activity supplies full numeric-counter readings. The last audit added 20分 and 2000年 from comparison questions; these are searchable in the dictionary while answer buttons preserve selection behavior. Constituent labels now cover 116 kanji. Original book entries take priority and public book JSON remains unchanged.

Native Japanese word boundaries allow adjacent words such as 一番 / 好き while still avoiding fragments of unregistered compounds. A source-wide unit check verifies that no Han-bearing text in the eight current lesson block datasets lacks dictionary coverage. This is a data coverage check; answer choices and other controls still intentionally avoid nested word buttons.

Validation: the full browser suite passed 56/56 before the last two data-only additions. After those additions, focused tests passed 4/4 across Chromium/WebKit desktop/mobile, including their dictionary lookup. Final unit tests 14/14, typecheck, content validation and Pages build passed. Source book data, learning IDs, notes, bookmarks and progress storage are unchanged. Visual QA: .impeccable/review/liquid-glass/word-visibility/ — 24 screenshots and 18 popup checks across two engines and three viewport sizes; no clipping, horizontal overflow, console or page errors. Mobile text was visually inspected to confirm the persistent blue styling is obvious without hover. Existing browser tabs must reload to load the new application bundle; do not clear browser data.
