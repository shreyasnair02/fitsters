---
name: Obsidian Peak
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#383939'
  surface-container-lowest: '#0d0e0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#292a2a'
  surface-container-highest: '#343535'
  on-surface: '#e3e2e2'
  on-surface-variant: '#d3c5ac'
  inverse-surface: '#e3e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#9c8f78'
  outline-variant: '#4f4633'
  surface-tint: '#f9bd14'
  primary: '#ffd782'
  on-primary: '#3f2e00'
  primary-container: '#f2b705'
  on-primary-container: '#644a00'
  inverse-primary: '#785900'
  secondary: '#c9c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#dcdcdc'
  on-tertiary: '#303030'
  tertiary-container: '#c0c0c0'
  on-tertiary-container: '#4e4e4e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdf9d'
  primary-fixed-dim: '#f9bd14'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5b4300'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c9c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#121414'
  on-background: '#e3e2e2'
  surface-variant: '#343535'
typography:
  display-lg:
    fontFamily: Anton
    fontSize: 80px
    fontWeight: '400'
    lineHeight: 84px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 52px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: 0.04em
  headline-sm:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0.05em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-lg: 80px
  stack-md: 48px
  stack-sm: 24px
---

## Brand & Style

The visual identity is defined by "Cinematic Performance"—a fusion of luxury hospitality and elite athletic intensity. It targets a discerning clientele in Bengaluru who view fitness not just as a routine, but as a prestigious lifestyle. 

The aesthetic draws heavily from **Minimalism** and **High-Contrast** movements, utilizing deep blacks and aggressive typography to create an environment that feels private, exclusive, and high-stakes. The presence of gold hairline rules and high-performance photography adds a layer of "editorial" sophistication, ensuring the digital experience feels as premium as the physical club.

The emotional response should be one of focused determination and quiet confidence. Use "true black" (#000000) to ground the interface and "near-black" (#0D0D0D) to create subtle structural depth.

## Colors

The palette is strictly nocturnal, designed to make the gold accents pop with intense clarity.

- **Primary Backgrounds:** Use #000000 for the main canvas to achieve infinite depth.
- **Surface Containers:** Use #0D0D0D for cards and section breaks to provide a soft separation from the primary background.
- **Signature Accent:** #F2B705 is reserved for high-impact CTAs, progress indicators, and "Success" states. It represents the "Gold Standard" of the club.
- **Typography:** #F5F5F5 provides high-legibility contrast for body copy, while #9A9A9A is used for metadata and secondary labels to maintain a sophisticated hierarchy.

## Typography

The typography strategy relies on the tension between the aggressive, condensed forms of **Anton** and the refined, technical precision of **Hanken Grotesk**.

- **Headlines:** Must always be uppercase with tight tracking to mimic the "FITSTERS" wordmark. Use `display-lg` for heroic moments like membership tier names or transformation headers.
- **Body:** Use `hankenGrotesk` for all long-form text. It provides a contemporary, high-tech feel that balances the raw power of the headlines.
- **Rhythm:** Maintain generous vertical rhythm. Headlines should have ample space above them to feel like editorial titles in a premium magazine.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain an "editorial" look with controlled line lengths. On mobile, it transitions to a fluid 4-column system.

- **Margins:** Desktop margins are intentionally wide (64px) to create an atmosphere of luxury and breathing room.
- **Stacking:** Use `stack-lg` (80px) between major sections to emphasize the "Cinematic" flow. 
- **Negative Space:** Do not fear empty space. In a premium system, whitespace (or "blackspace") is a signal of quality. 
- **The "Gold Line":** Use 1px #F2B705 horizontal rules sparingly to separate premium content or to anchor "Call to Action" sections.

## Elevation & Depth

This design system avoids traditional shadows in favor of **Tonal Layering** and **Gold Accents**.

1. **Base Layer:** #000000 (The Void).
2. **Surface Layer:** #0D0D0D. Used for cards and modals.
3. **Ghost Borders:** Instead of shadows, use 1px solid borders in #1A1A1A (darker grey) to define card edges against the black background.
4. **Rim Lighting:** For high-priority elements, use a 1px #F2B705 top-border to simulate the effect of studio lighting hitting an object from above.
5. **Backdrop Blurs:** When modals are active, use a heavy 20px blur on the background layer with a 60% black overlay to maintain focus on the foreground content.

## Shapes

The shape language is **Sharp (0)**. 

To evoke a sense of high-performance machinery and architectural precision, every element—from buttons to cards to input fields—must have 90-degree corners. Sharp corners convey a more serious, professional, and "elite" tone than rounded ones. 

The only exception is the "Club Logo" itself, which is circular. All other UI containers must remain strictly rectangular.

## Components

- **Buttons:** Primary buttons are solid #F2B705 with black #000000 text, uppercase `label-caps`. Secondary buttons are "Ghost" style: 1px #F5F5F5 border with white text. No rounded corners.
- **Cards:** Background #0D0D0D. No shadow. 1px border of #1A1A1A. Use high-contrast, desaturated photography as card backgrounds where possible, with a 40% black gradient overlay at the bottom to ensure text legibility.
- **Input Fields:** Bottom-border only (1px #9A9A9A). When focused, the border transitions to #F2B705. Label is `label-caps`.
- **Chips/Badges:** Small, rectangular containers with a #1A1A1A background and #F5F5F5 text. Used for "Class Intensity" or "Equipment Type."
- **Lists:** Clean lines separated by 1px #1A1A1A rules. Ensure generous padding (24px) between items to maintain the premium feel.
- **Progress Bars:** Thin 2px lines. The track is #1A1A1A and the fill is #F2B705.
- **Imagery:** Use high-contrast, low-key photography (deep shadows, bright highlights). Avoid stock-style bright fitness photos; favor "moody" gym floor shots and close-ups of equipment textures.