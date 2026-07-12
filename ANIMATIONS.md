# Fitsters Athletic Club — Animation & Transition Spec (Handoff)

Restore ALL of the following animations exactly. They are the identity of the site — a cinematic, "premium gym" feel. Global rules first, then section-by-section.

## Global rules (apply everywhere)

- **Shared easing token:** `--ease: cubic-bezier(0.22, 1, 0.36, 1)` (an "ease-out-expo"-ish curve). Almost every transition/animation uses this. Define it once on `:root` and reuse.
- **Respect `prefers-reduced-motion: reduce`:** every animation below must have a reduced-motion fallback that jumps to the final/visible state with no motion (opacity 1, no transform, no infinite loops). This is already implied in each section — do not skip it.
- **Two capture/print guards used throughout:**
  - `html.reveals-forced` — a class the JS adds when it detects the page is being screenshotted/printed or is backgrounded (transitions not advancing). When present, ALL reveal/entrance animations must be forced to their final visible state instantly (`opacity:1 !important; transform:none !important; transition:none !important`) and infinite/canvas loops stopped.
  - `@media print` — same idea: everything visible, no motion, intro veil hidden.
- **Brand gold:** root `--gold: #f2b705` (`--gold-rgb: 242,183,5`); the hero re-scopes to an antique gold `--gold: #d4af5a` (`--gold-rgb: 212,175,90`).
- Performance: all scroll/pointer listeners are `{ passive: true }` and coalesced through a single `requestAnimationFrame`; canvas/loop work pauses on `visibilitychange` (hidden) and when the element is offscreen (IntersectionObserver).

---

## 1. Intro veil (unveiling screen)

Full-screen `#introVeil` (`z-index:3000`, bg `#080706`) over everything on load. `<html>` gets `intro-hold` which pauses hero entrances until the veil lifts.

**Contents, animated in sequence (reduced-motion: all skip to final):**
- **Logo badge** `.iv-mark` — `iv-logo-in` 1.1s `cubic-bezier(0.22,1,0.36,1)` 0.12s delay: `from { opacity:0; transform:scale(1.14); filter:blur(14px); }` → settle. Logo `clamp(158px,34vw,250px)`, circular clip.
- **Halo behind logo** `.iv-mark::before` — `iv-halo` 4.4s ease-in-out infinite alternate: opacity 0.72→1, scale 0.96→1.05 (soft breathing bloom). Plus a crisp static gold rim via `.iv-mark::after`.
- **Kicker** "Athletic Club — Bengaluru" `.iv-kicker` — `iv-fade` 0.9s ease 1.05s delay (opacity 0→1). Letter-spacing 0.44em, gold.
- **Progress bar** `.iv-line i` — `iv-fill` 1.7s `cubic-bezier(0.65,0,0.35,1)` 0.5s delay: `scaleX(0)` → `scaleX(1)`, transform-origin left. Gold gradient fill with glow.
- (Legacy note: there used to be an animated `FITSTERS` wordmark with per-letter `iv-letter` rise — it has been removed. Do NOT reintroduce it. Logo + kicker + bar only.)
- **Ember canvas** `.iv-fx` — a `<canvas>` painting rising embers/fire particles behind the lockup (same particle system as the hero, see §3). Runs until lift.

**Lift / exit:**
- Minimum on-screen time `MIN = 2600ms` (1100ms if reduced motion), measured from load; a hard cap `setTimeout(lift, 5000)` guarantees it never strands the visitor.
- On lift: add `.lift` to the veil. Default exit is a **curtain wipe up** — `clip-path: inset(0 0 100% 0)` transitioned over **1s** `cubic-bezier(0.76,0,0.24,1)`. Simultaneously the lockup slides up `translateY(-46px)` + fades (transform 0.9s, opacity 0.55s, same curve).
- On lift, remove `intro-hold` from `<html>` so hero entrances begin **as the curtain clears** (they overlap slightly — intentional).
- 1150ms after lift, stop the ember canvas and remove the veil from the DOM.
- There are optional alternative exits keyed by `data-exit` on the veil (`iris` = circle collapse `circle(141%)`→`circle(0%)` over 1.05s; others). Default is the up-wipe. Keep the `data-exit` hook.
- reduced-motion: no clip-path; just fade veil out over 0.45s.

---

## 2. Sticky navigation

- `.nav` is fixed. On scroll past 24px add `.scrolled` → background fades to `rgba(0,0,0,0.92)` + `backdrop-filter: blur(14px)`, transitioned `background/backdrop-filter 0.4s var(--ease)`. A gold hairline underline (`::after`) fades opacity 0.45→1.
- **Nav links** `.nav-links a` — animated gold underline: `::after` width `0 → 100%` over `0.3s var(--ease)` on hover; color→gold 0.3s. `.active` link stays gold (set by scroll-spy).
- **Wordmark knockout on scroll** (`.nav-v2 .wm-track`): a vertical roll — two stacked lines translate `translateY(-26px)` over `0.7s var(--ease)` when `.kn` toggles (swaps full wordmark ↔ compact form). Alt variant uses `wm-out` (0.42s: fade+rise+blur) / `wm-in` (0.5s: rise+unblur) keyframes.
- **Burger → X:** `.nav-burger.open` — top bar `translateY(7px) rotate(45deg)`, middle bar `opacity:0`, bottom bar `translateY(-7px) rotate(-45deg)`, each `0.3s var(--ease)`.
- **Mobile menu** `.mobile-menu` — full-screen overlay, slides down from `translateY(-100%)` → `0` over `0.5s var(--ease)`; body scroll locked while open; closes on link click.
- **Language toggle EN/KN** (if present): knob slides `translateX(24px)` 0.3s; hero title swaps with `#heroTitle.ht-out` (0.42s: fade + `translateY(-14px)` + `blur(12px)`) then `.ht-in` (0.55s: rise from `translateY(18px)` + unblur). Wordmark does the `wm-out`/`wm-in` swap in parallel.

---

## 3. Hero (cinematic stage)

Layered background with several concurrent effects. On mobile a portrait video source is swapped in via `data-src-mobile` (JS picks source by `matchMedia("(max-width:640px)")`).

- **Background video** `.hero-stage.video .hero-video` — two stacked animations: `hero-video-in` 1.6s var(--ease) (opacity 0→1 fade-in) **and** `hero-video-drift` 44s ease-in-out infinite alternate (slow push-in: `scale(1.06) translate(-0.7%,0)` → `scale(1.13) translate(0.7%,-0.5%)`). Keeps the frame alive between loop cuts.
- **Lion image variant** `.hero-lion img` — `lion-arrive` 2.4s var(--ease): `from { opacity:0; transform:scale(1.04); }`. Paused during `intro-hold`.
- **God-ray** `.hero-ray` — `god-ray` 17s ease-in-out infinite alternate: a diagonal light beam rotating ~24° and sweeping `translateX(-52px)`→positive with opacity pulsing 0.13→0.3.
- **Film grain** `.hero-grain` — `grain-shift` 1.1s steps(2) infinite: jitters `translate3d` between a few offsets for analog grain.
- **Ember/fire particle canvas** (`__heroBurst` system) — a `<canvas>` behind the hero content rendering rising embers with weighted "fire classes" (core/body/edge colors), haze plates, DPR-aware sizing. Runs via rAF; **pauses when hero offscreen (IntersectionObserver threshold 0.02) or tab hidden**; a 1s watchdog interval recovers it. On fine pointers, embers react to cursor position (`pointermove` feeds a target point).
- **Headline reveal — "slam":** `.slam` text wipes in via `clip-path: inset(-0.3em -0.25em 100% -0.25em)` → full, plus `translateY(0.38em)` → 0, over **0.95s var(--ease)** (0.06s delay), gated behind `.reveal.in` and released after the veil lifts.
- **Headline slam impact:** when the title's `transform` transition ends, add `.impact` to `.hero` → **stage quake** `hero-quake` 0.55s `cubic-bezier(0.36,0.07,0.19,0.97)`: a decaying ~4px shudder of `.hero-stage`. Simultaneously fire an **ember shockwave** via `window.__heroBurst(fx, fy, 26)` centered near the headline (recycles back-plate embers into a flared burst). Skipped in "calm" energy mode / reduced motion / forced.
- **Eyebrow rule draw-in:** `.eyebrow::before` (and centered variant `::after`) `scaleX(0)→1` over 1s var(--ease) 0.2s delay, from left (center variant from right).
- **Hero copy cinematic pull-away (scroll):** while `scrollY < 1.2×vh`, `.hero-inner` translates up at `-scrollY*0.08px` and fades opacity `1 → ~0.1` (faster than scroll). Driven by the shared rAF loop.
- **Magnetic CTAs** (fine pointer only): `.hero-actions .btn` and `.cta-gold .cta-actions .btn` follow the cursor up to `±5px x / ±4px y` on `pointermove`; on leave, spring back `transform:''` with a `0.45s cubic-bezier(0.22,1,0.36,1)` transition. Disabled in calm mode.

---

## 4. Scroll-progress bar

`.scroll-progress i` — fixed 2px gold gradient bar at top (`z-index:130`), `transform: scaleX(progress)` where progress = `scrollY / (scrollHeight - innerHeight)`, updated on scroll/resize. Glow shadow. **Works even under reduced motion** (informational). Hidden in print.

---

## 5. Scroll-reveal system (used by most sections)

- Base: `.reveal { opacity:0; transform:translateY(26px); transition: opacity 1s var(--ease), transform 1s var(--ease); }` → `.reveal.in { opacity:1; transform:none; }`.
- Stagger helpers: `.reveal.d1/.d2/.d3/.d4` add `transition-delay` 0.08 / 0.16 / 0.24 / 0.32s.
- **Trigger:** scroll-position based (NOT purely IntersectionObserver — must survive screenshot/print). Element gets `.in` when its `getBoundingClientRect().top < innerHeight * 0.92`. Coalesced via rAF; also runs on load + resize; once revealed the element is removed from the watch list.
- During `intro-hold`, revealed elements are held at their pre-animation state (so they animate fresh after the veil lifts).

---

## 6. Stats / "Iron Numbers" band

- **Count-up:** `[data-count]` numbers animate from 0 to target over **1500ms** with cubic ease-out (`1 - (1-p)^3`), supporting decimals + suffix. Triggered by IntersectionObserver at `threshold: 0.6`, once.
- **Hover:** `.stat::after` gold left-edge bar grows `height 0 → 100%` over 0.6s var(--ease); number `.s-num b` shifts to gold 0.4s.
- Mobile: grid collapses to 2×2 (see §11).

---

## 7. Environment / Facilities & Programs (image cells)

- `.cell img/video` and `.program img` — on hover: `transform: scale(1.05)` over **0.8s var(--ease)** + opacity 0.66→0.78 (cells) / 0.62→0.74 (programs) over 0.6s. Slow, cinematic zoom.
- Cells/programs enter via the §5 reveal system (often staggered with `.d1..d4`).

---

## 8. Membership tiers

- `.tier` — hover lifts `transform: translateY(-4px)` over `0.4s var(--ease)`. Featured tier `.feat` has a gold top border + subtle gold gradient wash.
- Enter via §5 reveals.

---

## 9. Testimonials wall (desktop: auto-drift + parallax)

Multi-column marquee wall. **Desktop only** (`return` if `matchMedia("(max-width:640px)")`):
- Each `.tw-track` column's cards are **duplicated** (clones marked `aria-hidden`) so it wraps seamlessly.
- Continuous vertical **drift** per column at its own `speed`/`dir`; wraps at half the track height.
- **Scroll-linked parallax:** column offset also shifts by `dir * (scrollProgress - 0.5) * halfHeight * 0.5`, where scrollProgress is the wall's position through the viewport (0..1).
- **Hover slows** the drift to 0.3× (`mouseenter`/`mouseleave`).
- One shared rAF loop; `dt` clamped to 0.05s.
- Mobile replaces all of this with a swipe carousel (see §11).

---

## 10. Kinetic type strips ("Power strips")

Big scrolling word-strips (`.power-strip` → `.ps-track` → group). Desktop, non-calm, non-forced:
- The group is **cloned** until it fills `innerWidth + groupWidth` for a seamless loop.
- Motion = idle drift (`drift += 0.32 * dt`) + scroll drive (`scrollY * speed`), wrapped modulo group width, per `data-speed` / `data-dir`.
- **Velocity skew:** the strip skews `skewX` up to `±7deg` proportional to scroll velocity (`-vel * 0.16`), giving a "speed lean." Velocity is a smoothed delta of scrollY.
- Honors `data-energy="calm"` (motion off) and reduced-motion (strips static).

Also in this same rAF loop:
- **Creed backdrop de-zoom:** `.creed-bg video/img` scales `1.18 → 1.0` as the section passes through the viewport (`scale(1.18 - 0.18*progress)`).
- (Hero copy pull-away and magnetic CTAs from §3 live in this loop too.)

---

## 11. Mobile-specific chrome (≤640px)

Injected by JS; CSS-hidden on desktop. Everything null-guarded so desktop grids (which don't scroll) stay inert.

- **Swipe rails:** Facilities `.bento`, Trainers `.squad`, Membership `.tiers`, Testimonials `.testi-wall` become horizontal scroll-snap carousels with an edge-bleed peek of the next card.
- **Rail progress chrome:** under each rail, JS inserts `.m-railnav` = a gold progress track `.m-railtrack i` (thumb width `100/n%`) + a live counter `01 / 0N`. On rail `scroll` (rAF-coalesced), it finds the card nearest the left snap edge (sorting by visual position so Membership's `order:-1` Elite-first mapping stays correct), updates the counter, and slides the thumb `translateX(best * 100%)` with `transform 0.4s var(--ease)`.
- **Sticky action bar** `.m-actionbar` (Call + Start Free Trial): fixed bottom, `translateY(150%)` hidden → `.show` `translateY(0)` over **0.5s var(--ease)**. Shows once hero bottom is above `0.55×vh`; hides when the contact section is near/in view or the mobile menu is open. Re-checks on scroll/resize and on menu open/close. Backdrop blur + gold top border; safe-area inset padding.
- reduced-motion: bar + thumb transitions off.

---

## Keyframe reference (names → summary)

- `iv-logo-in` — logo scale/blur/opacity in
- `iv-halo` — logo halo breathe (infinite alternate)
- `iv-fade` — kicker fade in
- `iv-fill` — intro progress bar scaleX
- `hero-video-in` — hero video opacity in
- `hero-video-drift` — hero video slow push-in (infinite alternate)
- `lion-arrive` — lion image scale/opacity in
- `god-ray` — hero light beam sweep (infinite alternate)
- `grain-shift` — film grain jitter (steps, infinite)
- `hero-quake` — stage shudder on headline slam
- `wm-out` / `wm-in` — nav wordmark language swap
- `ht-out` / `ht-in` — hero title language swap
- `hm-scroll` — (marquee) track translateX 0 → -50% (64s linear infinite)

## JS-driven (no @keyframes) reference

- Scroll-progress bar scaleX
- Scroll-reveal `.in` toggling (position-based)
- Count-up stats (rAF, 1500ms, cubic ease-out)
- Testimonial drift + scroll parallax + hover-slow
- Power-strip drift + scroll drive + velocity skew (+ creed de-zoom, hero pull-away, magnetic CTAs)
- Hero ember canvas + `__heroBurst` shockwave
- Intro veil ember canvas + timed lift
- Mobile rail progress counter/thumb + sticky action bar
- Hero video source swap by viewport
