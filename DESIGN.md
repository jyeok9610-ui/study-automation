---
name: "나의 지식 서재"
description: "A light personal learning library with a macOS navigation layer and an opaque reading surface."
colors:
  paper: "#f5f5f7"
  surface: "#fff"
  ink: "#1d1d1f"
  muted: "#6e6e73"
  accent: "#007aff"
  accent-text: "#0063ce"
  accent-strong: "#0068d9"
  line: "#dedee3"
  wash: "#eaf3ff"
  error: "#b42332"
  correct: "#167244"
  glass-fill: "rgb(255 255 255 / 64%)"
  glass-border: "rgb(255 255 255 / 88%)"
typography:
  display:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
    fontSize: "clamp(32px, 2.6vw, 44px)"
    fontWeight: 720
    lineHeight: 1.2
    letterSpacing: "-.04em"
  headline:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
    fontSize: "clamp(28px, 2.4vw, 38px)"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-.035em"
  title:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
    fontSize: "23px"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-.025em"
  body:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.95
  label:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.6
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
spacing:
  compact: "8px"
  control-gap: "12px"
  base: "16px"
  group: "20px"
  panel: "24px"
  section: "32px"
  page-gutter: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent-strong}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "11px 18px"
  button-primary-hover:
    backgroundColor: "#005dc8"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent-text}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "11px 18px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.sm}"
    padding: "8px 10px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "11px 14px"
  navigation-item:
    backgroundColor: "transparent"
    textColor: "#565963"
    rounded: "{rounded.sm}"
    padding: "11px 14px"
  navigation-item-active:
    backgroundColor: "#fffffff2"
    textColor: "{colors.accent-text}"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  filter-chip-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent-text}"
  reading-paper:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "44px 52px 40px"
  reader-toolbar:
    backgroundColor: "{colors.glass-fill}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    padding: "6px 12px 6px 22px"
---

# Design System: 나의 지식 서재

## Overview

**Creative North Star: "A macOS learning library"**

A light, quiet workspace gives each subject its own book identity while keeping the controls familiar. System typography, cool neutral surroundings, white content and restrained blue actions follow the user's Apple macOS / Liquid Glass direction.

Translucency belongs to the navigation and helper layer. The sidebar, toolbars, mobile dock and helper sheets use reflected edges and soft depth; article text sits on opaque white paper. The reading surface remains calm through long explanations, Japanese examples and interactive exercises.

**Key Characteristics:**
- Light-only workspace with opaque white reading content.
- System fonts throughout the shell and reading experience.
- Blue actions and selected states; preserved subject colors identify books.
- Restrained glass navigation with accessible opaque fallbacks.
- Compact controls around a generously spaced reading column.

## Colors

A cool neutral foundation carries a blue interaction accent. The normative values and references are in the frontmatter.

### Primary

- **System Blue** (`accent`) identifies focus, selection and small interface accents.
- **Readable Blue** (`accent-text`) carries links, selected navigation and secondary actions.
- **Action Blue** (`accent-strong`) fills primary actions with white labels.

### Secondary

- **Correct Green** (`correct`) and **Error Red** (`error`) communicate learning feedback. Their associated tinted backgrounds and borders remain specific to feedback components.
- Subject and book colors come from existing library data. They identify content, rather than replacing the interface accent; preserve their data-driven relationship.

### Neutral

- **Workspace Mist** (`paper`) separates the application frame from the content.
- **Reading White** (`surface`) supports the article, cards, fields and selected controls.
- **Graphite Ink** (`ink`) carries headings and primary text.
- **Quiet Graphite** (`muted`) carries secondary interface text.
- **Soft Divider** (`line`) separates groups without heavy frames.
- **Blue Wash** (`wash`) supports selected and hovered controls.
- **Glass Fill** and **Reflected Edge** (`glass-fill`, `glass-border`) form the translucent chrome.

**The Reading Paper Rule.** Article text uses an opaque white surface. Glass belongs to navigation, toolbars and helper overlays.

**The Single Interface Accent Rule.** Use blue for interface actions and selected states; retain subject colors for their existing content identities.

## Typography

The user's chosen system stack serves both display and body roles. It resolves to the platform UI face, with Korean system fallbacks and sans-serif as the final fallback. No downloaded font is required.

### Hierarchy

- **Display:** the opening title uses the fluid display role with a tight line height.
- **Headline:** route titles use the fluid headline role; reader page titles use a separate observed range (`clamp(27px, 2.3vw, 34px)`, line height `1.45`).
- **Title:** learning section headings use the title role. Compact section headings commonly use `20–21px`.
- **Body:** learning paragraphs use the body role and become `16px` on mobile while retaining `1.95` line height. Introductory and supporting prose commonly uses `13–15px` with `1.85–1.9` line height.
- **Label:** action labels use the label role. Navigation uses `14px` with weight `550`; quiet metadata commonly uses `11–12px`.
- **Japanese examples:** prominent example sentences use `22px`, weight `550`, and `.01em` tracking; mobile uses `21px`.

Headings preserve Korean word groups, allow emergency wrapping and use balanced text where supported. Reading paragraphs also preserve word groups while allowing long content to wrap. Progress and chapter numbers use tabular numerals.

**The Platform Type Rule.** Continue the approved system font stack in new surfaces, including headings.

## Layout

The desktop shell reserves a rail (`252px`) for an inset sidebar (`220px` wide, `16px` from the viewport edges). The route toolbar is sticky above the workspace. Standard content is centered within `1320px`, with desktop padding of `32px 48px 72px`. Repeated gaps and padding use the frontmatter spacing steps; the layout is deliberately less dense than the surrounding controls.

The subject shelf has four equal columns. The catalog uses three columns and retains recognizable book covers. Reader layout combines a `220px` sticky contents column, a `28px` gap and a reading column up to `840px`; the opaque paper's internal padding narrows the actual text measure.

- At `1240px` and below, the rail becomes `232px`, sidebar becomes `204px`, page gutters reduce and reading paper uses `36px` padding.
- At `1080px` and below, subject shelves and catalog grids become two columns; the reader becomes a single main column and contents move into a toggleable overlay.
- At `760px` and below, the rail disappears. A compact top brand and four-destination floating bottom dock frame single-column pages. Safe-area insets and bottom padding protect content from fixed controls. The desktop route toolbar is hidden.
- Mobile reading paper uses `28px 22px 24px` padding and a `20px` radius. Its sticky helper toolbar remains above the article. Helper sheets become modal overlays with a scrim.

Use `minmax(0, 1fr)`, shrinking flex/grid children and wrapping text for narrow layouts. Wide learning tables scroll inside their own container. Do not allow a whole page to scroll horizontally.

## Elevation & Depth

Depth is restrained and structural. White content relies on tonal separation from the workspace; glass chrome adds a bright inner edge, a soft ambient shadow and backdrop blur. The shared glass layer uses `blur(24px) saturate(155%)`. The mobile dock uses slightly stronger saturation (`160%`). Helper sheets use a more opaque fill so their contents remain readable.

### Shadow Vocabulary

- **Ambient surface:** the shared `--shadow` token supplies low diffuse lift for floating utility surfaces.
- **Glass chrome:** `--glass-shadow` combines reflected inner edges with soft distant falloff.
- **Helper sheet:** a brighter inner edge and a broader shadow establish an overlay above the reader.
- **Book lift:** book covers move upward slightly and deepen their shadow on hover. They do not tilt.

Exact shadow values live in the sidecar because the frontmatter component schema does not support shadows.

**The Scroll Depth Rule.** After the window scroll exceeds `16px`, the route toolbar gains opacity, a lower edge and a diffuse shadow; the mobile top chrome similarly becomes more opaque.

State changes generally take `140–220ms`; helper entry uses `240ms` with the shared ease curve. Pressed controls shift by `1px`. Reduced motion removes meaningful animation and cover transforms. Reduced transparency and increased contrast remove blur and use opaque surfaces; unsupported backdrop filtering receives an opaque fallback. Preserve these CSS media and feature-query paths.

## Shapes

The reused radius scale distinguishes controls, groups and larger surfaces: small controls use the small radius, grouped containers use the medium radius, and major paper/glass surfaces use the large radius. The values are normative in the frontmatter.

Book silhouettes retain a narrow spine and asymmetric cover corners (`6px 16px 16px 6px`); subject covers use the medium radius and a subtle binding stripe. These are book identities, not generic glass cards. The mobile dock uses a `22px` outer radius and `16px` destination corners. Close controls use circular hit areas. Borders are thin and quiet, with stronger outlines for fields and interaction states.

## Components

### Buttons

Compact, legible controls with soft corners. Primary actions use Action Blue and white text; secondary actions use white with Readable Blue text and a quiet divider border. Text buttons remove the filled surface and reveal Blue Wash on hover. Preserve the shared `44px` base minimum height, pressed shift and disabled state. The desktop helper toolbar deliberately uses a more compact `40px` button height; mobile restores `44px`.

All keyboard-interactive elements receive a visible blue focus outline (`3px`, offset `4px`). Primary hover deepens the fill and shadow; secondary hover adds a pale blue surface.

### Chips and Segmented Controls

Filter chips are quiet at rest; selection adds a white fill, Readable Blue label and small ambient shadow. Segmented controls sit within a pale cool-gray track, with a raised white selected segment. Wrap filter rows instead of squeezing labels.

### Cards and Reading Paper

Reading paper and ordinary content containers are opaque white. The article itself has no decorative glass blur. Examples and exercises use opaque cool-gray or blue-tinted inset containers; status colors appear with borders and explanatory text. Search results and route lists use dividers rather than one raised card per row.

Book covers preserve subject identity, spine treatment and title hierarchy. Their restrained hover lift supports discovery without introducing motion into the article.

### Inputs and Fields

White fields use the small radius, `11px 14px` padding, a clear neutral stroke and a blue caret. Placeholder text uses Quiet Graphite. The search assembly places the icon, borderless text entry and primary submit action in a single white rounded container; focus within adds a blue border and outer indication. Mobile helper inputs use `16px` text.

### Navigation

The sidebar uses muted labels with icons, white selected rows and Readable Blue active labels. Subject links retain small data-colored dots. The mobile dock preserves the four existing destinations and pairs each icon with its text label. Settings remains accessible in the top brand area.

### Reader Toolbar and Helper Sheets

The sticky reader toolbar is a compact glass group outside the paper. Active helper controls become white with blue text. The sheet is more opaque than the sidebar, scrolls internally, has a clearly visible close button and retains white input surfaces. Mobile uses the existing dialog and scrim behavior. Closing a helper preserves the reading and activity context.

## Do's and Don'ts

### Do:
- **Do** keep article text on opaque white paper.
- **Do** use the approved system font stack throughout.
- **Do** reserve glass for navigation, toolbars and helper overlays.
- **Do** preserve subject-colored book identities and existing semantic feedback colors.
- **Do** carry keyboard focus, safe-area spacing, reduced-motion and opaque fallback behavior into new surfaces.
- **Do** wrap narrow layouts and keep wide tables inside local scrolling containers.

### Don't:
- **Don't** introduce a dark visual mode into this light-only system.
- **Don't** restore the former warm-paper, green-ink or display-serif theme.
- **Don't** put reading paragraphs on translucent or blurred backgrounds.
- **Don't** replace books with unrelated decorative image cards.
- **Don't** use motion or stronger glass as a substitute for clear text hierarchy.

