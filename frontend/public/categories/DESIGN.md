# Design System Strategy: The Editorial Architect

## 1. Overview & Creative North Star

This design system is built upon the "Creative North Star" of **The Digital Philanthropist**. We are moving away from the cluttered, frantic energy of traditional crowdfunding platforms and toward a high-end editorial experience. The goal is to make every campaign feel like a feature story in a premium magazine.

To break the "template" look, we employ **Intentional Asymmetry**. Instead of centered, rigid grids, we use the spacing scale to create rhythmic "breathing room." Hero sections should use overlapping elements—such as a title-lg heading partially overlapping a primary-container image frame—to create a sense of tactile depth. This approach transforms a functional platform into a sophisticated, trustworthy environment that inspires high-value contributions.

---

## 2. Colors & Tonal Depth

The palette is rooted in a deep, authoritative forest green (`primary: #003426`), balanced by a breathable, organic background (`background: #f8faf6`).

### The "No-Line" Rule
To maintain a premium feel, **1px solid borders are prohibited for sectioning.** Structural boundaries must be defined solely through background color shifts. For example, a "Related Projects" section should transition from `surface` (#f8faf6) to `surface-container-low` (#f2f4f1) to denote a change in context without the visual noise of a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create "nested" importance:
*   **Base Level:** `surface` (#f8faf6)
*   **Secondary Content:** `surface-container-low` (#f2f4f1)
*   **High-Priority Cards:** `surface-container-lowest` (#ffffff) sitting on top of `surface-container` (#edeeeb).

### The Glass & Gradient Rule
For floating navigation bars or "Quick Invest" sticky buttons, use **Glassmorphism**. Apply `surface` at 80% opacity with a `backdrop-filter: blur(12px)`. To add "soul" to the primary CTA, use a subtle linear gradient from `primary` (#003426) to `primary_container` (#0f4c3a) at a 135-degree angle. This prevents the deep green from feeling "flat" or "heavy."

---

## 3. Typography: The Manrope Scale

We utilize **Manrope** for its geometric clarity and modern humanist touch. It conveys both professional stability and a forward-thinking attitude.

*   **Display (lg, md):** Used for campaign impact numbers (e.g., "$2.4M Raised"). Use `on_surface` with a `-0.02em` letter-spacing to feel tight and authoritative.
*   **Headline (lg, md, sm):** The voice of the campaign title. These should have ample line-height (1.4x) to ensure the "Editorial" feel.
*   **Title (lg, md, sm):** Used for card headers and section labels.
*   **Body (lg, md):** The narrative. Use `on_surface_variant` (#404944) for secondary body text to reduce visual weight and increase the perceived "whitespace."
*   **Label (md, sm):** Reserved for metadata (e.g., "Days Remaining"). Always uppercase with `+0.05em` letter-spacing for a sophisticated, "spec-sheet" aesthetic.

---

## 4. Elevation & Depth

We eschew traditional drop shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on a `surface-container-high` (#e7e9e5) background. The 4% shift in luminance creates a natural, soft "lift" that mimics high-quality paper.
*   **Ambient Shadows:** If a card must float (e.g., a hover state), use an ultra-diffused shadow: `box-shadow: 0 12px 40px rgba(25, 28, 27, 0.06)`. The shadow color is a tint of `on_surface` to ensure it feels like ambient light, not digital soot.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use a `1px` stroke of `outline-variant` (#bfc9c3) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** `primary` background with `on_primary` text. Use `roundedness-md` (0.375rem) for a modern, sharp-yet-approachable edge.
*   **Secondary:** `secondary_container` background with `on_secondary_container` text. No border.
*   **Tertiary:** Ghost style. `on_surface` text with no background. Interaction state uses a `surface-variant` subtle fill.

### Cards (The "Editorial Frame")
**Forbid divider lines.** Separate the campaign image, title, and progress bar using spacing units `4` (1.4rem) and `6` (2rem). The "Funded" percentage should be a `primary` filled bar on a `primary_fixed` background for a lush, monochromatic look.

### Input Fields
Avoid the "boxed" look. Use a `surface-container-low` background with a bottom-only `outline` (#707974) at 20% opacity. Upon focus, transition the bottom border to `primary` at 100% and slightly shift the background to `surface-container-lowest`.

### Progress Indicators (The Impact Bar)
For a crowdfunding platform, the progress bar is the "hero" of the data. Use a `2.5` (0.85rem) height. The container should be `primary_fixed`, and the active fill should be a gradient of `primary` to `surface_tint`.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. For example, a campaign description might have a larger left margin than the title to create an editorial "pull-quote" effect.
*   **Do** use `surface-container-highest` for inactive states rather than grey-scale, to keep the color temperature consistent (slightly warm/greenish).
*   **Do** prioritize typography over icons. Let the Manrope typeface do the heavy lifting for the brand's personality.

### Don't
*   **Don't** use black (#000000). Always use `on_surface` (#191c1b) to maintain the sophisticated, organic tone.
*   **Don't** use standard "Success Green" (#00FF00) for "Goal Reached" states. Use our `primary` or `primary_fixed_dim` to stay within the signature forest-green world.
*   **Don't** use 1px dividers to separate list items. Use a `1.5` (0.5rem) vertical gap and a slight background color shift on hover.