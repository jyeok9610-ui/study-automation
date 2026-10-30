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