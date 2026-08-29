# TalentHub México — Style Reference

> Design language for a job board in the Mexican IT sector. Light by default,
> dark as an accent band, one interaction colour, and glass used as a lens
> rather than a texture.
>
> Tokens map one-to-one to `frontend/tailwind.config.js`. A reference written
> as `{colors.accent}` is the Tailwind key `accent`; `{typography.h2}` is the
> `fontSize` key `h2`. The system is portable to any Tailwind project and to
> NativeWind with the exception noted under *Elevation & Depth*.

---

## Overview

TalentHub is a **light-first product interrupted by deliberate dark bands**.
Content lives on white; the dark register appears at the top of every page, at
the closing call to action, in the floating navigation, and across the entire
authentication flow. The transition between the two is always a hard edge —
never a gradient — and that edge is load-bearing: the signature surface of the
system is a translucent panel mounted across it, refracting black above and
page below in a single pane.

Restraint carries the character, because the palette no longer can. A light,
minimal job board is the most crowded visual territory that exists, so what
distinguishes this one is discipline: every control is a full pill, elevation
shadows are forbidden, display type never exceeds weight 540 while the rest of
the web pushes 700, and exactly one colour means "you can touch this."

Density shifts by surface. Marketing pages breathe at 64–80px between
sections with display type up to 72px; application screens compact to 32–40px
and cap headings at 36px. Same tokens, different tempo.

**Key Characteristics:**
- Light canvas punctuated by full-bleed dark bands at hard edges; the colour
  change is itself the section divider.
- One interaction colour — ultramarine `{colors.accent}` (#3355ff) — on
  buttons, links and focus rings, and nowhere else.
- State colour marks **resolution, not activity**: two colours only, teal for
  resolved-in-favour and red for resolved-against. Work in progress carries
  full ink, never a hue.
- Glass panels straddle the light/dark seam. The gradient across them is not
  painted; it is one pane refracting two backgrounds.
- No elevation shadows anywhere. Depth comes from translucency, 1px hairlines
  and surface contrast.
- Full pill (`{rounded.pill}`) on every control — the silhouette that holds
  the system together.
- Display type at weight 500–540 with negative tracking; body at 460.
- Every button that executes or navigates carries an icon; the ones that
  cancel do not. Identity through form, which survives colour blindness.
- Motion is orchestrated from one module, not scattered per component, and
  every effect degrades under `prefers-reduced-motion`.

---

## Colors

> Contrast figures below were measured, not estimated. Every pairing meets
> WCAG AA at minimum; the ratio is stated where it constrains use.

### Brand & Accent

- **Ultramarine** (`{colors.accent}` — #3355ff): The single interactive
  colour. Fills primary actions, colours links on light surfaces, and drives
  the focus ring. **5.41:1 with white on top.** Deliberately not Tailwind's
  #2563EB, which sits at 221° and 83% saturation and is the default blue of
  half the web; this one is 230° at 100% and reads as pigment rather than
  hyperlink.
- **Ultramarine Pressed** (`{colors.accent-hover}` — #2544e6): Hover and
  active fill. 6.89:1 with white.
- **Ultramarine on Dark** (`{colors.accent-on-dark}` — #9db0ff): The same
  accent resolved for dark bands. **9.51:1 on `{colors.night}`.** The accent
  needs two resolutions: #3355ff as text on black gives 3.4:1 and fails,
  #9db0ff on white gives 2.0:1 and fails. One semantic token, two values,
  never the other register's.
- **Wash** (`{colors.accent-wash}` — #4a66ff): Halos and gradients only.
  **Never text.**

### Surface

- **Canvas** (`{colors.canvas}` — #ffffff): Content ground. The base plane of
  the light register.
- **Surface** (`{colors.surface}` — #f5f6f8): Off-white with a cool bias.
  Alternating bands, table row hover, segmented control troughs.
- **Night** (`{colors.night}` — #0a0a0a): Dark bands — hero, closing section,
  authentication, checkout. Not pure black; #0a0a0a keeps the glare down.
- **Elevated** (`{colors.elevated}` — #161616): Floating navigation and opaque
  cards sitting on a dark band.

**The substrate is not decoration.** `mesh-page` paints four minimum-saturation
halos behind the page — warm at top-left, cool at top-right, teal at bottom.
Without it glass refracts nothing and a translucent card looks identical to an
opaque one. The halos supply variation in **hue**, not merely in light, which
is the difference between glass and frosted plastic. It uses
`background-attachment: fixed` so the halo stays put while content scrolls, at
no repaint cost.

### Text

| Token | Value | Contrast | Use |
|---|---|---|---|
| `{colors.ink}` | #161616 | 18.1:1 on canvas · AAA | Primary text, light register |
| `{colors.ink-2}` | #3f4045 | AAA | Supporting text; anything over the dark half of a glass panel |
| `{colors.muted}` | #6b6b6b | 5.33:1 · AA | Metadata, hints, timestamps |
| `{colors.ink-d}` | #ededed | 16.9:1 on night · AAA | Primary text on dark. **Never pure white** — it cuts glare |
| `{colors.ink-2d}` | #c2c2c2 | AAA | Supporting text on dark |
| `{colors.muted-d}` | #8a8a8a | 5.4:1 · AA | Metadata on dark |

### State

**Colour marks resolution, not activity.** There are exactly two.

- **Resolved in favour** (`{colors.ok}` — #0f766e, `{colors.ok-d}` — #5eead4):
  Accepted, published, remote, active account.
- **Resolved against** (`{colors.danger}` — #dc2626, `{colors.danger-d}` —
  #f87171): Rejected, error, destructive action.
- **Form warning** (`{colors.warn}` — #a16207, `{colors.warn-d}` — #fcd34d):
  Reserved for form-level notices. **Never dresses a state.**

Anything still in progress carries full `{colors.ink}` and a reinforced
hairline instead of a hue; anything inactive goes grey.

> **Why amber is not a state colour.** It was originally assigned to "under
> review" while red marked "rejected" — opposite meanings. Simulated under
> deuteranopia the two sit **15 units apart on a 441-unit scale**:
> indistinguishable. Teal against red measures **171**, because they differ in
> hue *and* luminance. Confusing "still alive" with "you were rejected" is not
> an acceptable failure, so progress is carried by position in
> `{component.process-track}` rather than by tone.

### Hairlines & Borders

- `{colors.hairline}` — rgba(0,0,0,0.10): 1px border on light.
- `{colors.hairline-strong}` — rgba(0,0,0,0.20): hover, emphasised dividers.
- `{colors.hairline-d}` — rgba(255,255,255,0.10): 1px border on dark.
- `{colors.hairline-d-strong}` — rgba(255,255,255,0.18): hover on dark.

**Glass never takes a plain `border`.** In either register it uses
`{component.edge-l}` / `{component.edge-d}`. An even ring traces the whole
rectangle, and at these contrasts the eye reads the outline before the content.

---

## Typography

### Font Family

- **Display**: `Bricolage Grotesque, DM Sans, system-ui, sans-serif` — carries
  `h1` and `h2` at page and section level, and nothing smaller. Deliberately
  irregular widths and a real optical axis (`opsz` 12–96), so a 72px headline
  and a 24px heading are two different drawings rather than one scaled letter.
- **Body / UI**: `DM Sans, system-ui, sans-serif` — everything from `h3` down,
  plus all interface text. Geometric, quiet, wide language coverage for
  Spanish diacritics.
- **Numerals**: `font-variant-numeric: tabular-nums` via the `.tabular` class
  on any figure that updates in place — salaries, counters, metrics.

### Hierarchy

| Token | Size | Line Height | Letter Spacing | Face | Use |
|---|---|---|---|---|---|
| `{typography.display}` | 72px | 1.0 | −0.035em | Display | Hero headline |
| `{typography.h1}` | 48px | 1.0 | −0.02em | Display | Page title |
| `{typography.h2}` | 36px | 1.11 | −0.015em | Display | Section title |
| `{typography.h3}` | 24px | 1.33 | −0.01em | Body | Card and panel headings |
| `{typography.sub}` | 18px | 1.5 | — | Body | Lead paragraph, list titles |
| `{typography.body}` | 16px | 1.5 | — | Body | Body copy, controls |
| `{typography.caption}` | 13px | 1.5 | +0.025em | Body | Eyebrows, labels, metadata |

Weights: `{weight.book}` 460 · `{weight.mid}` 500 · `{weight.demi}` 540.

### Principles

- **Display never exceeds 540.** Restraint is the signature, not a suggestion.
  No `font-bold` in a headline anywhere in the system.
- 460 and 540 are intentional intermediate weights. Do not round them to
  400/500/600 — they require the variable fonts to be loaded.
- Negative tracking on display and headings only. At 13–16px, tracking goes
  **positive**.
- Headline sizes use `clamp()`, so the display face rule is one of **role, not
  pixels**: on mobile a section title drops to 26px and is still the display
  tier of that screen.
- **The display face never touches figures.** The salary range on the job
  detail page reaches 32px and still uses the body face, because it carries
  `tabular-nums` — a typeface with irregular widths undoes exactly what that
  property exists to provide. It is data, not a headline.

### Note on Font Substitutes

Both faces load from Google Fonts with `display=swap`, which paints a system
fallback first and then swaps. If the two differ in width the headline
re-wraps on swap and everything below it jumps.

Fallback faces are therefore declared with measured `size-adjust`: DM Sans is
**7.0% narrower than Arial** (`size-adjust: 93%`) and Bricolage Grotesque
**2.5% wider** (`size-adjust: 102.51%`). This cuts the mismatch from roughly
8% to under 1%.

It cannot reach zero — the ratio between two typefaces is not constant and
varies with the glyphs in each phrase. To eliminate the shift entirely, either
self-host the fonts or switch to `font-display: optional`, which gives up the
real face on first visit.

`ascent-override` and `descent-override` are deliberately absent: the system
pins `line-height` everywhere, so line box height does not come from font
metrics and badly-computed overrides would break what currently works.

---

## Layout

### Spacing System

Base 4px. Scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80`.

| Context | Value |
|---|---|
| Section gap, marketing | 64–80px |
| Section gap, application | 32–40px |
| Card padding, marketing | 28px |
| Card padding, application | 16–20px |
| Element gap | 8–16px |

### Grid & Container

- **Page width**: `{layout.page}` — 1200px max, 24px gutters, 28px from `md`.
- **Document width**: 4xl (896px) on reading-heavy screens — profile, job
  detail, privacy notice.
- **Navigation width**: 940px. At 1200px on a 1280px viewport it left 40px
  margins and read as a bar rather than a floating pill.
- **Nav flow height**: `--nav-flow` — 58px on mobile, 75px from `md`. Dark
  bands mount under the navigation with a negative margin of exactly this
  value. It is a CSS variable rather than a literal precisely because a fixed
  number is wrong at one breakpoint or the other.

### Band Architecture

Every page is a stack of full-bleed bands cut at hard edges.

**Marketing** runs in acts: dark hero → light body → dark closing band. The
section heading that introduces a group of glass panels lives at the *end* of
the dark band, so the panels below it can straddle the seam.

**Application screens** share one composition: dark band carrying the eyebrow,
title and count → glass summary panel mounted ~96px over the seam → body on
`mesh-page`. Repeating it is not laziness; it is what makes the company
dashboard and the validator panel feel like one product.

---

## Elevation & Depth

**There is no elevation shadow in this system.** Depth is built from:

1. Surface contrast (`{colors.canvas}` → `{colors.surface}`,
   `{colors.night}` → `{colors.elevated}`)
2. A 1px edge — `{colors.hairline}`, or `{component.edge-l}` /
   `{component.edge-d}` on glass
3. Translucency plus `backdrop-filter`
4. Overlap: summary panels mount ~96px over the dark band above them

The only two shadows in the system are the focus halos
(`{shadow.focus-accent}` — `0 0 0 3px rgba(51,85,255,0.22)` and
`{shadow.focus-accent-d}` — `0 0 0 3px rgba(157,176,255,0.24)`). They signal
state, not elevation.

### Decorative Depth

Dark bands carry a white radial halo bleeding from off-canvas, at 12–17%
opacity with a 6–10px blur. The authentication screens add a slow drifting
aurora — white, ultramarine and teal blobs on 34/38/42-second cycles, phase
offset so the pattern never repeats — because glass over flat black refracts
nothing.

> **Porting note.** The glass panel depends on `backdrop-filter`, which React
> Native has no equivalent for. `expo-blur` provides a `BlurView` that blurs
> what is behind it but cannot refract a seam between two bands. On native,
> substitute opaque surfaces and contrast; keep every other token.

---

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.pill}` | 9999px | Every button, tag, chip and avatar |
| `{rounded.ui}` | 10px | Inputs, selects, textareas, inline notices |
| `{rounded.icon}` | 4px | Icon containers |
| `{rounded.nav}` | 19px | Floating navigation |
| `{rounded.card}` | 24px | Cards and glass panels |
| `{rounded.cardlg}` | 40px | Large cards, mockups |
| `{rounded.panel}` | 42px | Full-width containers |

The full pill is not a style choice among others. Once the palette went light
and minimal, the silhouette became the thing carrying the system's identity.

---

## Motion

### Curves

- `{motion.ease-base}` — `cubic-bezier(0.22, 0.61, 0.36, 1)`. The only easing
  curve in CSS.
- `{motion.spring}` — spring, stiffness 420 / damping 32 / mass 0.9. Lives in
  `lib/motion.ts` and is applied by framer-motion only to things with physics.
- Durations: fast 0.18s · base 0.42s · slow 0.75s.

> A CSS `spring` easing was removed. A bounce curve in CSS applies to the
> entire transition list, so it overshot colours too — every hover pushed the
> fill past its target and came back.

### Rules

- All motion originates from `lib/motion.ts`. Twelve scattered effects read as
  a template; one orchestrated sequence reads as a product.
- Entrances stagger from a parent container rather than firing independently.
- Scroll reveals fire **once**. Repeating them is nauseating.
- Card hover lifts by border, background and translation — **never shadow**.
- Everything sits behind `prefers-reduced-motion`. This is not optional.
- **Glass surfaces animate position only.** See *Implementation Notes*.

---

## Components

### Buttons

**`button-primary`** — Always inverts its band: solid `{colors.ink}` with white
text on light, solid white with `{colors.ink}` text on dark.
`{rounded.pill}`, padding 11px × 22px, `{weight.mid}`. **One per section.**

**`button-accent`** — Fill `{colors.accent}`, text white, same geometry. The
committing action in a form: sign in, create account, pay, add.

**`button-ghost`** — Transparent, 1px `{colors.hairline}` (or
`{colors.hairline-d}`), `{rounded.pill}`. Secondary actions. The only button
allowed coloured text — `!text-ok`, `!text-danger` — because there the colour
describes the *effect*, not the fact that it is clickable; the silhouette
already says that.

**Sizes**: `sm` 14px text, padding 8px × 18px · `md` 15px text, padding
11px × 22px. Press state `scale(0.96)`.

### Icons in Buttons — system rule

**Every button that executes or navigates carries an icon. The ones that
cancel do not.**

An action's identity comes from its shape, not its colour: a glyph is
recognisable without colour vision and does not spend the system's chromatic
budget. Five actions in five colours is noise; five actions in five glyphs is
a vocabulary.

| Icon | Meaning |
|---|---|
| `ArrowRight` | Advance to a listing or next step |
| `ExternalLink` | Open one specific record |
| `Plus` · `Pencil` · `Trash2` | Create · edit · destroy |
| `Check` · `Save` | Confirm · persist |
| `Send` | Send something to another person |
| `RotateCcw` · `EyeOff` | Repeat or revert · hide from public |
| `Ban` | Suspend an account |
| `LogIn` · `LogOut` · `UserPlus` | Session |

**Intentionally without an icon:** "Cancel" in forms and dialogs, and the nav
CTA. Cancel must be the quiet exit — a glyph puts it at the same visual weight
as the action it is avoiding.

**Sizing**: 14px on `sm`, 15px on `md`. `strokeWidth` 1.8, except `Check` at
2.0 — at 14px a thin check disappears.

### Cards & Surfaces

**`card`** — `{rounded.card}`, 28px padding, no shadow. With `glass`:
translucent plus `backdrop-blur` **and `backdrop-saturate`**. The saturation is
not optional; it is what separates glass from frosted plastic, because it
saturates the hue passing through the panel instead of merely diffusing it.

**`card-solid`** — `{colors.canvas}` or `{colors.elevated}`, 1px hairline. For
dense surfaces where blur would cost performance — tables above all.

**`glass-panel`** — **The signature component.** A translucent panel mounted
across the seam between the dark band and the light body.

The gradient visible across it is **not painted**. It is one pane refracting
two different backgrounds: its upper portion sits over `{colors.night}`, its
lower over `mesh-page`. Without a seam to cross, glass has nothing to do and
the panel is indistinguishable from a white card — which is why the overlap is
the component's reason for existing rather than a detail of its position.

Three constraints follow, all measured:

1. **Density 0.68, not 0.46.** Card glass runs at 46%, but a panel crossing the
   seam has its top third over black, and `{colors.ink}` at 46% white gives
   **4.02:1** — below AA. At 68% it gives 8.4:1. Transparency has a ceiling and
   the text sets it.
2. **The overlap is proportional, not absolute.** What matters is that the seam
   crosses the panel's upper half. At a fixed 96px a 110px panel ends up **87%
   over the black** — it stops straddling and starts floating. Hence two
   measures: `{layout.overlap}` 96px for panels 160px and taller, and
   `{layout.overlap-sm}` 52px for metric rows and three-fact strips. Both land
   near 48%.
3. **`{colors.muted}` may not enter the dark zone.** #6b6b6b over the grey the
   panel produces on black gives **2.47:1**. Secondary text in the upper third
   uses `{colors.ink-2}` (4.80:1); `muted` only below the seam. No density
   fixes this — even at 90% white, `muted` reaches only 4.19:1.

**`edge-l` / `edge-d`** — The glass edge. **Glass takes no even border.** A
flat ring draws the whole rectangle and the eye reads it before the content;
at 60% white against #0a0a0a that is near the maximum contrast the screen can
produce. A real edge is not uniform — it catches light at the top and fades
away around the curve.

Two layers: a very faint hairline on all four sides, and an `inset` light line
on the top edge only. `edge-l-hot` / `edge-d-hot` tint the edge with the accent
on hover.

### Inputs & Forms

**`input`** — 1px `{colors.hairline}` (**not 2px**), `{rounded.ui}`, padding
10px × 14px. Focus: `{colors.accent}` border plus `{shadow.focus-accent}`.
Accepts `tone="dark"` for the authentication register, which swaps surface,
text and focus halo.

**Placeholder in `{colors.muted}`, never `{colors.ink-2}`** — it must be
distinguishable from a real value.

**`field`** — label plus control plus help. Errors are announced with
`role="alert"`, not merely painted.

**`choice-cards`** — Replaces a native `<select>` when there are two or three
mutually exclusive options. The native dropdown is drawn by the operating
system and no amount of CSS gives it the dark register everywhere; more
importantly, with two options a select hides half the decision behind a click,
and when that decision **branches the form** it deserves to be visible.

It remains a real `radiogroup` with `sr-only` radios, so arrow-key navigation
comes free and the form serialises as usual. **The selection frame travels**
between cards via `layoutId` — not two borders switching on and off, but one
object changing place, which is what makes the exclusivity legible.

### Navigation

**`nav-floating`** — Dark translucent pill floating over light content, 940px
max, `{rounded.nav}`, `backdrop-blur` 16px with saturation. Sticky. Over the
dark hero it dissolves; over light content it contrasts. That crossing is the
most recognisable element in the system.

**`footer`** — Dark closing band. Brand block plus role-aware link columns.
Hidden on closed surfaces — sign-in, registration, password recovery,
checkout — where the only useful exit is the one the page itself provides.

### Pills, Tags and Status

**`tag`** — Outline pill, no fill. Colour lives in the text and in the border
at ~35% alpha, never in a saturated background competing with content. Tones:
`neutro` · `curso` · `bien` · `mal` · `marca`.

**`process-track`** — **Replaces the dot-and-label status badge**, which was
rejected as generic: that pattern appears on every AI-generated SaaS landing
page.

The four application states are a **sequence**, not loose categories:
Sent → Under review → Accepted / Rejected. The component renders three
segments filled to the position actually reached, and **only the last reached
segment carries colour**. It encodes the structure instead of decorating it,
and it works without colour vision because position already communicates
progress.

**`tabs`** — Segmented control with tab semantics. The indicator is a pill that
**travels** between segments rather than a border switching on and off.
Implements roving tabindex: only the active tab is reachable by Tab, arrows
move between tabs.

### Signature Components

**`mesh-page`** — The page substrate. Four minimum-saturation halos, fixed
attachment. Required wherever glass appears.

**`auth-shell`** — The four session screens. **Dark register throughout**, not
a light plate on a dark canvas. Adds the drifting aurora, `[color-scheme:dark]`
on selects so the native dropdown is not white, and a Chrome autofill patch
without which the dark band breaks exactly where the browser tries to help.

---

## Do's and Don'ts

### Do

- Cut dark and light bands at a hard edge, always.
- Mount summary panels across the seam — that overlap is the composition.
- Give every executing or navigating button an icon from the vocabulary above.
- Use `{colors.accent}` for interaction and nothing else.
- Reserve colour for resolution; leave work-in-progress in full ink.
- Give every list a loading state, an empty state and an error state with a
  retry action.
- Keep table rows opaque; glass belongs in the chrome.
- Verify contrast against the **effective** background, which on a glass panel
  differs between its top and its bottom.
- State the consequence in a confirmation dialog instead of asking "are you
  sure?".

### Don't

- No `box-shadow` for elevation. Ever.
- No `font-bold` in a headline; nothing above 540.
- No even border on glass — use `{component.edge-l}` / `{component.edge-d}`.
- No `{colors.muted}` in the dark third of a glass panel.
- No state colour on a clickable control.
- No amber as a state colour.
- No emoji as icons. Everything comes from `lucide-react`.
- No announcement pill with a dot above the headline. It is the single most
  recognisable element of AI-generated landing pages.
- No `backdrop-filter` on table rows — it forces a full stack recomposition on
  every scroll.
- No navigation pinned to the viewport edge; it always floats.

---

## Responsive Behavior

| Breakpoint | Behaviour |
|---|---|
| **< 640px** | Single column. Navigation collapses to a menu button; nav flow drops to 58px. Glass panels still straddle but at a smaller proportion. Optional side panels are hidden rather than stacked. |
| **640–1024px** | Two-column grids. Tables scroll horizontally inside their own container; the page body never scrolls sideways. |
| **≥ 1024px** | Full composition: hero grids at 1.15fr / 0.85fr, three-column feature rows, side panels visible, sticky in-page indexes. |
| **≥ 1440px** | Content stops at 1200px; bands stay full-bleed. |

Headlines use `clamp()` throughout, so the display tier scales continuously
rather than stepping at breakpoints.

---

## Implementation Notes

Traps found while building this. Each cost real debugging time and none is
obvious from the rendered result.

**`opacity` breaks `backdrop-filter`.** An element with `opacity < 1` — itself
or any ancestor — becomes a *backdrop root*, so the filter loses the page
behind it and the glass paints flat, then snaps in when opacity reaches 1. Any
entrance animation on a glass surface must animate position only.

**No ancestor of a straddling panel may set `overflow: hidden`.** The panel
lives inside the light section and rises 96px above its box; any clipping in
the chain removes exactly the half sitting over the black, heading included.

**A band that paints its own background needs `flow-root`.** The panel's
negative margin **collapses upward** through any ancestor without top padding
or border, dragging the section's top edge — and therefore its background —
along with it. The panel stays put, the light band rises behind it, and the
seam disappears. It looks identical to the effect not being applied at all.

**Do not use `mask-composite` for the glass edge.** A masked gradient ring
looks better and breaks in Firefox: `-webkit-mask` is accepted there as an
alias of the standard shorthand and, being a shorthand, resets
`mask-composite` to `add`; `-webkit-mask-composite: xor` then does not exist
to restore it. The pseudo-element ends up painting the **entire rectangle** over
the card. An `@supports (mask-composite)` guard does not protect against this,
because Firefox does support the property — it is the following line that
fails.

**Chrome autofill ignores `background-color`.** On a dark input the only
override it honours is an inset `box-shadow`. Without the patch the dark band
breaks precisely when the browser is being helpful.

**Native `<select>` dropdowns are drawn by the OS.** Without
`[color-scheme:dark]` the option list renders white over a dark card.

**Measuring layout is not the same as seeing it.** `getBoundingClientRect`
reports where an element *is*, not what is *painted* there. Both the overflow
and margin-collapse bugs above passed every positional check while being
completely invisible on screen.
