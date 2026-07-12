/* FITSTERS — interactions: nav scroll, mobile menu, reveals, marquee dup,
   testimonial carousel, counters, smooth anchor scroll, booking form validation */
(function () {
  "use strict";

  /* ---------- sticky nav state ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector(".nav-burger");
  var menu = document.querySelector(".mobile-menu");
  function closeMenu() { burger.classList.remove("open"); menu.classList.remove("open"); document.body.style.overflow = ""; }
  if (burger) {
    burger.addEventListener("click", function () {
      var open = burger.classList.toggle("open");
      menu.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  }

  /* ---------- smooth anchor scroll (account for fixed nav) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  /* ---------- scroll reveal (scroll-position based — robust across
     screenshot/print contexts where IntersectionObserver may not fire) ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var ticking = false;
  function checkReveals() {
    ticking = false;
    var trigger = window.innerHeight * 0.92;
    for (var i = reveals.length - 1; i >= 0; i--) {
      var el = reveals[i];
      if (el.getBoundingClientRect().top < trigger) {
        el.classList.add("in");
        reveals.splice(i, 1);
      }
    }
  }
  function onReveal() { if (!ticking) { ticking = true; requestAnimationFrame(checkReveals); } }
  window.addEventListener("scroll", onReveal, { passive: true });
  window.addEventListener("resize", onReveal, { passive: true });
  window.addEventListener("load", checkReveals);
  checkReveals();

  /* If the document isn't actually being painted (offscreen iframe, capture/print
     tooling), CSS transitions freeze at their start value — content would be stuck
     invisible. Actively probe whether transitions advance; if not, force the final
     state. Live, visible tabs animate normally and never get forced. */
  function forceReveals() { document.documentElement.classList.add("reveals-forced"); }
  try {
    var probe = document.createElement("div");
    probe.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;transition:opacity .25s linear;pointer-events:none;";
    document.body.appendChild(probe);
    void probe.offsetHeight;
    probe.style.opacity = "1";
    setTimeout(function () {
      var v = parseFloat(getComputedStyle(probe).opacity);
      if (!(v > 0.05)) forceReveals();
      probe.parentNode && probe.parentNode.removeChild(probe);
    }, 120);
  } catch (e) { forceReveals(); }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible") forceReveals();
  });

  /* ---------- duplicate marquee track for seamless loop ---------- */
  var track = document.querySelector(".proof-track");
  if (track) { track.innerHTML += track.innerHTML; }

  /* ---------- count-up stats ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var dec = (el.dataset.count.indexOf(".") > -1) ? 1 : 0;
    var suffix = el.dataset.suffix || "";
    var start = performance.now(), dur = 1500;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(step);
  }
  var countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { animateCount(en.target); countIO.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(function (el) { countIO.observe(el); });

  /* ---------- testimonial wall: continuous drift + scroll-linked parallax ---------- */
  (function () {
    var wall = document.querySelector(".testi-wall");
    if (!wall) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || document.documentElement.classList.contains("reveals-forced")) return;
    // phones show a native swipe carousel (CSS) — skip cloning + the rAF drift
    if (window.matchMedia("(max-width: 640px)").matches) return;

    var tracks = Array.prototype.slice.call(wall.querySelectorAll(".tw-track")).map(function (track) {
      // duplicate cards so the column can wrap seamlessly
      Array.prototype.slice.call(track.children).forEach(function (c) {
        var clone = c.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });
      var col = track.parentNode;
      var dir = col.getAttribute("data-dir") === "down" ? 1 : -1;
      var speed = col.classList.contains("tw-col-3") ? 26 : 20; // px/sec continuous drift
      return { el: track, dir: dir, speed: speed, half: 1, base: 0 };
    });

    function measure() { tracks.forEach(function (t) { t.half = Math.max(1, t.el.scrollHeight / 2); }); }
    measure();
    window.addEventListener("resize", measure);

    var hoverSlow = 1;
    wall.addEventListener("mouseenter", function () { hoverSlow = 0.3; });
    wall.addEventListener("mouseleave", function () { hoverSlow = 1; });

    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var rect = wall.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // progress: 0 as the wall enters bottom, 1 as it exits top
      var progress = (vh - rect.top) / (vh + rect.height);
      progress = Math.max(0, Math.min(1, progress));
      tracks.forEach(function (t) {
        t.base += t.dir * t.speed * dt * hoverSlow;
        var parallax = t.dir * (progress - 0.5) * t.half * 0.5; // scroll reactivity
        var y = (t.base + parallax) % t.half;
        if (y > 0) y -= t.half; // keep within (-half, 0] for a seamless wrap
        t.el.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* ---------- booking form validation ---------- */
  var form = document.querySelector("#bookForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[data-required]").forEach(function (field) {
        var wrap = field.closest(".field");
        var val = (field.value || "").trim();
        var bad = !val;
        if (field.type === "email") bad = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
        if (field.type === "tel") bad = val.replace(/\D/g, "").length < 7;
        wrap.classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) return;
      form.querySelector(".form-body").style.display = "none";
      form.querySelector(".form-success").classList.add("show");
    });
    form.querySelectorAll("[data-required]").forEach(function (field) {
      field.addEventListener("input", function () { field.closest(".field").classList.remove("invalid"); });
    });
  }

  /* ---------- current year ---------- */
  var yr = document.querySelector("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();

/* ============================================================
   CINEMATIC HERO ENGINE — two spark plates
   - BACK plate (dense, z1): behind the lion cutout — fills the
     whole width incl. the left copy area; occluded by the lion's
     opaque strokes, visible through its transparent gaps
   - FRONT plate (sparse, ~50% intensity, z4): drifts over the
     lion's face and mane so it sits immersed in the atmosphere
   - fiery embers: elongated hot-core streaks (white-hot → amber →
     burnt orange → ember red, hotter = rarer), fast flicker with
     occasional flares, motion trails, cooling fade near the top
   - cursor stirs sparks on both plates (soft push + swirl);
     lion and copy stay pinned (lion: breathing scale only)
   ============================================================ */
(function () {
  "use strict";
  var hero = document.querySelector(".hero");
  var lion = document.getElementById("heroLion");
  var cvBack = document.getElementById("heroFx");
  var cvFront = document.getElementById("heroFxFront");
  if (!hero || !lion || !cvBack || !cvBack.getContext) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0;
  var running = false, raf = 0, t0 = performance.now(), lastT = t0;

  /* cursor field (canvas coords) — position eased, motion decays */
  var hasPtr = false;
  var tpx = 0, tpy = 0, px = 0, py = 0, mvx = 0, mvy = 0;
  var RADIUS = 300, PUSH = 0.05, SWIRL = 0.032, STIR = 0.055;

  /* fire spectrum — hotter is rarer: 8% white-hot, 27% bright amber,
     42% burnt orange, 23% deep ember red */
  var FIRE = [
    { w: 0.08, core: [255, 246, 224], body: [255, 217, 143], edge: [255, 154, 61] },
    { w: 0.27, core: [255, 233, 194], body: [255, 181, 71],  edge: [224, 102, 42] },
    { w: 0.42, core: [255, 217, 160], body: [224, 102, 42],  edge: [194, 58, 26]  },
    { w: 0.23, core: [255, 181, 71],  body: [194, 58, 26],   edge: [143, 36, 16]  }
  ];
  function fireClass() {
    var r = Math.random(), acc = 0;
    for (var i = 0; i < FIRE.length; i++) { acc += FIRE[i].w; if (r < acc) return FIRE[i]; }
    return FIRE[FIRE.length - 1];
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* plates: density/alpha/haze per layer */
  var plates = [
    { cv: cvBack, ctx: cvBack.getContext("2d"), embers: [], hazes: [],
      density: 1, alpha: 1, hazeCount: 6, spread: 0.62 }
  ];
  if (cvFront && cvFront.getContext) {
    plates.push({ cv: cvFront, ctx: cvFront.getContext("2d"), embers: [], hazes: [],
      density: 0.3, alpha: 0.52, hazeCount: 0, spread: 0.48 });
  }

  function ember(p, e, init) {
    /* full-width spawn, source weighted right/center + low — heat rises
       from around the lion; never blank on the left */
    e.x = W * Math.pow(Math.random(), p.spread);
    e.y = init ? rnd(H * 0.18, H + 20) : H + rnd(8, 60);
    var s = 0.5 + 2.8 * Math.pow(Math.random(), 2.4); /* many tiny, few large-close */
    e.s = s;
    e.rise = 0.55 + rnd(0, 0.5) + s * 0.3;            /* energetic climb */
    e.elong = 2 + Math.min(e.rise / 2, 1) * 1.1;      /* 2:1 → ~3:1 vertical streak */
    e.trail = e.rise * rnd(8, 14);                    /* fading tail length */
    e.swA = rnd(0.15, 0.5);                           /* turbulent wander */
    e.swS = rnd(0.001, 0.003);
    e.ph = rnd(0, Math.PI * 2);
    e.a = rnd(0.35, 0.75) + s * 0.08;
    e.fs = rnd(0.008, 0.02);                          /* fast ember pulse */
    e.flare = 0;
    e.f = fireClass();
    e.vx = 0; e.vy = 0;
    return e;
  }
  function haze(h) {
    h.x = W * Math.pow(Math.random(), 0.5);
    h.y = rnd(0, H);
    h.r = rnd(Math.min(W, H) * 0.3, Math.min(W, H) * 0.52);
    h.rise = rnd(0.03, 0.09);
    h.a = rnd(0.02, 0.048);
    return h;
  }
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cvBack.clientWidth; H = cvBack.clientHeight;
    for (var k = 0; k < plates.length; k++) {
      var p = plates[k];
      p.cv.width = Math.round(W * dpr);
      p.cv.height = Math.round(H * dpr);
      p.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var need = Math.round((W < 720 ? 52 : 112) * p.density);
      if (p.embers.length !== need) {
        p.embers = []; p.hazes = [];
        for (var i = 0; i < need; i++) p.embers.push(ember(p, {}, true));
        for (var j = 0; j < p.hazeCount; j++) p.hazes.push(haze({}));
      }
    }
  }

  function draw(now) {
    raf = 0;
    var t = now - t0;
    var dt = Math.min(Math.max((now - lastT) / 16.667, 0.25), 2.5);
    lastT = now;

    /* ease cursor, decay stir momentum */
    px += (tpx - px) * Math.min(0.12 * dt, 1);
    py += (tpy - py) * Math.min(0.12 * dt, 1);
    var decay = Math.pow(0.9, dt);
    mvx *= decay; mvy *= decay;
    var damp = Math.pow(0.94, dt);

    for (var k = 0; k < plates.length; k++) {
      var p = plates[k];
      var ctx = p.ctx;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      for (var j = 0; j < p.hazes.length; j++) {
        var h = p.hazes[j];
        h.y -= h.rise * dt;
        if (h.y < -h.r) { haze(h); h.y = H + h.r * 0.6; }
        var hg = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r);
        hg.addColorStop(0, "rgba(206,116,44," + h.a.toFixed(3) + ")");
        hg.addColorStop(1, "rgba(206,116,44,0)");
        ctx.fillStyle = hg;
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, 6.2832); ctx.fill();
      }

      for (var i = 0; i < p.embers.length; i++) {
        var e = p.embers[i];

        if (hasPtr && !reduce) {
          var dx = e.x - px, dy = e.y - py;
          var d2 = dx * dx + dy * dy;
          if (d2 < RADIUS * RADIUS) {
            var d = Math.sqrt(d2) || 1;
            var f = 1 - d / RADIUS; f *= f;
            e.vx += ((dx / d) * PUSH + (-dy / d) * SWIRL + mvx * STIR) * f * dt;
            e.vy += ((dy / d) * PUSH + (dx / d) * SWIRL + mvy * STIR) * f * dt;
          }
        }
        e.vx += (Math.random() - 0.5) * 0.05 * dt; /* heat turbulence */
        e.vx = Math.max(-2.4, Math.min(2.4, e.vx)) * damp;
        e.vy = Math.max(-2.4, Math.min(2.4, e.vy)) * damp;

        e.x += Math.cos(t * e.swS + e.ph) * e.swA * dt + e.vx * dt;
        e.y += (-e.rise + e.vy) * dt;
        if (e.y < 4 || e.x < -40 || e.x > W + 40) ember(p, e, false);

        /* fast flicker + occasional flare; embers cool as they climb */
        if (Math.random() < 0.006 * dt) e.flare = 1;
        e.flare *= Math.pow(0.88, dt);
        var fl = 0.55 + 0.45 * Math.sin(t * e.fs + e.ph * 3);
        var cool = Math.min(1, Math.max(0, e.y / (H * 0.28)));
        var a = Math.min(1, e.a * fl * cool * p.alpha * (1 + e.flare * 1.2));
        if (a < 0.012) continue;

        var s = e.s, ry = s * 0.55 * e.elong;
        var core = e.f.core[0] + "," + e.f.core[1] + "," + e.f.core[2];
        var body = e.f.body[0] + "," + e.f.body[1] + "," + e.f.body[2];
        var edge = e.f.edge[0] + "," + e.f.edge[1] + "," + e.f.edge[2];

        /* short fading motion trail — streaking upward */
        var tg = ctx.createLinearGradient(0, e.y, 0, e.y + e.trail);
        tg.addColorStop(0, "rgba(" + body + "," + (a * 0.3).toFixed(3) + ")");
        tg.addColorStop(1, "rgba(" + edge + ",0)");
        ctx.fillStyle = tg;
        ctx.fillRect(e.x - s * 0.45, e.y, s * 0.9, e.trail);

        /* tight glow halo — warm falloff body → edge */
        var g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, s * 3);
        g.addColorStop(0, "rgba(" + body + "," + (a * 0.4).toFixed(3) + ")");
        g.addColorStop(0.55, "rgba(" + edge + "," + (a * 0.12).toFixed(3) + ")");
        g.addColorStop(1, "rgba(" + edge + ",0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(e.x, e.y, s * 3, 0, 6.2832); ctx.fill();

        /* elongated ember body with a white-hot core */
        ctx.fillStyle = "rgba(" + body + "," + Math.min(1, a * 0.9).toFixed(3) + ")";
        ctx.beginPath(); ctx.ellipse(e.x, e.y, s * 0.55, ry, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "rgba(" + core + "," + a.toFixed(3) + ")";
        ctx.beginPath(); ctx.ellipse(e.x, e.y, s * 0.26, ry * 0.55, 0, 0, 6.2832); ctx.fill();
      }
    }

    /* lion: breathing + slow parallax lag on scroll (copy exits faster) */
    if (!reduce) {
      var plx = document.documentElement.getAttribute("data-energy") === "calm" ? 0 : window.scrollY * 0.12;
      lion.style.transform = "translate3d(0," + plx.toFixed(1) + "px,0) scale(" + (1 + 0.004 * Math.sin(t / 1450)).toFixed(4) + ")";
    }

    if (running) raf = requestAnimationFrame(draw);
  }

  function start() { if (!running) { running = true; lastT = performance.now(); if (!raf) raf = requestAnimationFrame(draw); } }
  function stop() { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  resize();
  window.addEventListener("resize", function () {
    resize();
    if (!running) draw(performance.now());
  }, { passive: true });

  /* impact burst — recycle back-plate embers into a flared shockwave
     at (fx, fy) fractions of the hero. Used by the headline slam. */
  window.__heroBurst = function (fx, fy, n) {
    var p = plates[0];
    if (!p || !W || !H || !p.embers.length) return;
    n = Math.min(n || 24, p.embers.length);
    for (var i = 0; i < n; i++) {
      var e = p.embers[(Math.random() * p.embers.length) | 0];
      e.x = fx * W + rnd(-55, 55);
      e.y = fy * H + rnd(-18, 32);
      e.vx = rnd(-3, 3);
      e.vy = rnd(-3, -0.6);
      e.flare = 1;
      e.a = Math.max(e.a, 0.6);
    }
  };

  if (reduce) { draw(performance.now()); return; } /* single static frame */

  if (window.matchMedia("(pointer: fine)").matches) {
    var lastX = null, lastY = null;
    hero.addEventListener("pointermove", function (ev) {
      var r = hero.getBoundingClientRect();
      tpx = ev.clientX - r.left + 28; /* canvases are inset -28px */
      tpy = ev.clientY - r.top + 28;
      if (lastX !== null) {
        mvx = Math.max(-30, Math.min(30, mvx + (ev.clientX - lastX) * 0.18));
        mvy = Math.max(-30, Math.min(30, mvy + (ev.clientY - lastY) * 0.18));
      }
      lastX = ev.clientX; lastY = ev.clientY;
      if (!hasPtr) { hasPtr = true; px = tpx; py = tpy; }
    });
    hero.addEventListener("pointerleave", function () { hasPtr = false; lastX = lastY = null; });
  }

  var onScreen = true;
  function inView() {
    var r = hero.getBoundingClientRect();
    return r.bottom > 0 && r.top < (window.innerHeight || document.documentElement.clientHeight);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      onScreen = en[0].isIntersecting;
      if (onScreen && !document.hidden) start(); else stop();
    }, { threshold: 0.02 }).observe(hero);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else if (onScreen || inView()) start();
  });
  /* watchdog: IO edges can be missed while the page is backgrounded
     (e.g. hidden iframe) — recover whenever we're actually visible */
  setInterval(function () {
    if (!running && !document.hidden && inView()) { onScreen = true; start(); }
  }, 1000);
  start();
})();


/* ============================================================
   INTRO VEIL — centered logo over rising embers, then a curtain
   lift reveals the page (hero entrances re-arm at that moment).
   Lift = max(window load, MIN dwell), hard-capped; capture
   contexts (reveals-forced) skip straight through.
   ============================================================ */
(function () {
  "use strict";
  var veil = document.getElementById("introVeil");
  if (!veil) return;
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.getElementById("introFx");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  var raf = 0, alive = true, t0 = performance.now(), lastT = t0;
  var W = 0, H = 0, embers = [];

  var FIRE = [
    { w: 0.08, core: [255, 246, 224], body: [255, 217, 143], edge: [255, 154, 61] },
    { w: 0.27, core: [255, 233, 194], body: [255, 181, 71],  edge: [224, 102, 42] },
    { w: 0.42, core: [255, 217, 160], body: [224, 102, 42],  edge: [194, 58, 26]  },
    { w: 0.23, core: [255, 181, 71],  body: [194, 58, 26],   edge: [143, 36, 16]  }
  ];
  function fireClass() {
    var r = Math.random(), acc = 0;
    for (var i = 0; i < FIRE.length; i++) { acc += FIRE[i].w; if (r < acc) return FIRE[i]; }
    return FIRE[FIRE.length - 1];
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function ember(e, init) {
    e.x = Math.random() * W;
    e.y = init ? rnd(H * 0.2, H + 20) : H + rnd(8, 50);
    var s = 0.5 + 2.4 * Math.pow(Math.random(), 2.4);
    e.s = s;
    e.rise = 0.5 + rnd(0, 0.45) + s * 0.28;
    e.elong = 2 + Math.min(e.rise / 2, 1);
    e.trail = e.rise * rnd(8, 13);
    e.swA = rnd(0.15, 0.45); e.swS = rnd(0.001, 0.003); e.ph = rnd(0, Math.PI * 2);
    e.a = rnd(0.3, 0.7) + s * 0.08;
    e.fs = rnd(0.008, 0.02);
    e.f = fireClass();
    return e;
  }
  function resize() {
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var need = W < 720 ? 34 : 64;
    if (embers.length !== need) {
      embers = [];
      for (var i = 0; i < need; i++) embers.push(ember({}, true));
    }
  }
  function draw(now) {
    raf = 0;
    if (!alive || !ctx) return;
    var t = now - t0;
    var dt = Math.min(Math.max((now - lastT) / 16.667, 0.25), 2.5);
    lastT = now;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < embers.length; i++) {
      var e = embers[i];
      e.x += Math.cos(t * e.swS + e.ph) * e.swA * dt;
      e.y -= e.rise * dt;
      if (e.y < 4 || e.x < -40 || e.x > W + 40) ember(e, false);
      var fl = 0.55 + 0.45 * Math.sin(t * e.fs + e.ph * 3);
      var cool = Math.min(1, Math.max(0, e.y / (H * 0.3)));
      var a = Math.min(1, e.a * fl * cool);
      if (a < 0.012) continue;
      var s = e.s, ry = s * 0.55 * e.elong;
      var core = e.f.core.join(","), body = e.f.body.join(","), edge = e.f.edge.join(",");
      var tg = ctx.createLinearGradient(0, e.y, 0, e.y + e.trail);
      tg.addColorStop(0, "rgba(" + body + "," + (a * 0.3).toFixed(3) + ")");
      tg.addColorStop(1, "rgba(" + edge + ",0)");
      ctx.fillStyle = tg;
      ctx.fillRect(e.x - s * 0.45, e.y, s * 0.9, e.trail);
      var g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, s * 3);
      g.addColorStop(0, "rgba(" + body + "," + (a * 0.4).toFixed(3) + ")");
      g.addColorStop(0.55, "rgba(" + edge + "," + (a * 0.12).toFixed(3) + ")");
      g.addColorStop(1, "rgba(" + edge + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(e.x, e.y, s * 3, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "rgba(" + body + "," + Math.min(1, a * 0.9).toFixed(3) + ")";
      ctx.beginPath(); ctx.ellipse(e.x, e.y, s * 0.55, ry, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "rgba(" + core + "," + a.toFixed(3) + ")";
      ctx.beginPath(); ctx.ellipse(e.x, e.y, s * 0.26, ry * 0.55, 0, 0, 6.2832); ctx.fill();
    }
    if (alive) raf = requestAnimationFrame(draw);
  }

  var MIN = reduce ? 1100 : 2600;
  var lifted = false;
  function lift() {
    if (lifted) return;
    lifted = true;
    veil.classList.add("lift");
    root.classList.remove("intro-hold"); /* hero entrances play as the curtain clears */
    setTimeout(function () {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (veil.parentNode) veil.parentNode.removeChild(veil);
    }, 1150);
  }
  function schedule() {
    setTimeout(lift, Math.max(0, MIN - (performance.now() - t0)));
  }

  /* capture/print contexts: skip immediately (also covers reveals-forced later) */
  if (root.classList.contains("reveals-forced")) { lift(); return; }
  var watchdog = setInterval(function () {
    if (root.classList.contains("reveals-forced")) { clearInterval(watchdog); lift(); }
    if (lifted) clearInterval(watchdog);
  }, 150);

  resize();
  window.addEventListener("resize", resize, { passive: true });
  if (!reduce && ctx) raf = requestAnimationFrame(draw);
  else if (ctx) draw(performance.now()); /* one static frame */

  if (document.readyState === "complete") schedule();
  else {
    window.addEventListener("load", schedule);
    setTimeout(lift, 5000); /* hard cap: never strand the visitor */
  }
})();


/* ============================================================
   POWER PASS — kinetic energy layer
   - gold scroll-progress bar (always on; informational)
   - kinetic type strips: scroll-driven drift + idle motion +
     velocity skew, seamless loop via group cloning
   - hero copy exits faster than the scroll (cinematic pull)
   - creed backdrop de-zooms 1.18 → 1 as you push through it
   - magnetic pull on primary CTAs (fine pointers only)
   Honors prefers-reduced-motion and the "Calm" energy tweak.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var bar = document.querySelector(".scroll-progress i");
  var heroInner = document.querySelector(".hero-inner");
  var creedBg = document.querySelector(".creed-bg");
  var creedMedia = creedBg ? creedBg.querySelector("video, img") : null;
  var strips = Array.prototype.slice.call(document.querySelectorAll(".power-strip"));
  function calm() { return root.getAttribute("data-energy") === "calm"; }
  function forced() { return root.classList.contains("reveals-forced"); }

  /* ---------- progress bar (works even with reduced motion) ---------- */
  function setBar() {
    if (!bar) return;
    var max = root.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
  }
  window.addEventListener("scroll", setBar, { passive: true });
  window.addEventListener("resize", setBar, { passive: true });
  setBar();

  if (reduce) return;

  /* ---------- strips: clone the group until the loop is seamless ---------- */
  strips.forEach(function (el) {
    var track = el.querySelector(".ps-track");
    var group = track && track.firstElementChild;
    if (!group) return;
    el._track = track;
    el._speed = parseFloat(el.getAttribute("data-speed") || "0.5");
    el._dir = parseFloat(el.getAttribute("data-dir") || "1");
    function fill() {
      var gw = group.getBoundingClientRect().width;
      if (!gw) return;
      el._gw = gw;
      var need = Math.ceil((window.innerWidth + gw) / gw) + 1;
      while (track.children.length < need) track.appendChild(group.cloneNode(true));
    }
    fill();
    window.addEventListener("resize", fill, { passive: true });
    window.addEventListener("load", fill);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fill);
  });

  /* ---------- one kinetic frame loop ---------- */
  var lastSc = window.scrollY, vel = 0, drift = 0, lastT = performance.now(), raf = 0;

  function frame(now) {
    raf = 0;
    var dt = Math.min((now - lastT) / 16.667, 3);
    lastT = now;
    var sc = window.scrollY;
    vel += ((sc - lastSc) - vel) * Math.min(0.14 * dt, 1);
    lastSc = sc;
    var vh = window.innerHeight || 1;

    if (!calm() && !forced()) {
      /* strips: idle drift + scroll drive + velocity skew */
      drift += 0.32 * dt;
      var skew = Math.max(-7, Math.min(7, -vel * 0.16));
      for (var i = 0; i < strips.length; i++) {
        var s = strips[i];
        if (!s._gw) continue;
        var r = s.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) continue;
        var x = ((sc * s._speed + drift) * s._dir) % s._gw;
        x = ((x % s._gw) + s._gw) % s._gw;
        s._track.style.transform = "translate3d(" + (-x).toFixed(2) + "px,0,0) skewX(" + (skew * s._dir).toFixed(2) + "deg)";
      }

      /* hero copy: cinematic pull-away */
      if (heroInner) {
        if (sc < vh * 1.2) {
          var hp = Math.min(sc / (vh * 0.85), 1);
          heroInner.style.transform = "translate3d(0," + (-sc * 0.08).toFixed(1) + "px,0)";
          heroInner.style.opacity = (1 - hp * 0.9).toFixed(3);
        }
      }

      /* creed backdrop de-zoom */
      if (creedBg && creedMedia) {
        var cr = creedBg.getBoundingClientRect();
        if (cr.bottom > -60 && cr.top < vh + 60) {
          var p = Math.min(Math.max((vh - cr.top) / (vh + cr.height), 0), 1);
          creedMedia.style.transform = "scale(" + (1.18 - 0.18 * p).toFixed(4) + ")";
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    else if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); }
  });

  /* ---------- headline slam → stage quake + ember shockwave ---------- */
  (function () {
    var hero = document.querySelector(".hero");
    var title = document.getElementById("heroTitle");
    if (!hero || !title) return;
    var done = false;
    function land(burst) {
      if (done) return; done = true;
      hero.classList.add("impact");
      if (burst && window.__heroBurst && !calm()) {
        var hr = hero.getBoundingClientRect();
        var tr = title.getBoundingClientRect();
        if (hr.width && hr.height) {
          window.__heroBurst(
            (tr.left + tr.width * 0.35 - hr.left) / hr.width,
            (tr.top + tr.height * 0.72 - hr.top) / hr.height,
            26
          );
        }
      }
    }
    if (forced()) { land(false); return; }
    title.addEventListener("transitionend", function (e) {
      if (e.propertyName === "transform") land(true);
    });
    setTimeout(function () { land(false); }, 6500); /* veil hard-cap + slam */
  })();

  /* ---------- magnetic pull on primary CTAs ---------- */
  if (window.matchMedia("(pointer: fine)").matches) {
    var mags = document.querySelectorAll(".hero-actions .btn, .cta-gold .cta-actions .btn");
    Array.prototype.forEach.call(mags, function (b) {
      b.addEventListener("pointermove", function (ev) {
        if (calm()) return;
        var r = b.getBoundingClientRect();
        var dx = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2);
        b.style.transform = "translate(" + (dx * 5).toFixed(1) + "px," + (dy * 4).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () {
        b.style.transition = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
        b.style.transform = "";
        setTimeout(function () { b.style.transition = ""; }, 460);
      });
    });
  }
})();


/* ============================================================
   MOBILE — swipe-rail progress chrome + sticky action bar
   Adds a live "01 / 06" counter + gold progress thumb under each
   horizontal rail (facilities, squad, membership, testimonials),
   and reveals a Call / Free-Trial bar once past the hero.
   Desktop: chrome is CSS-hidden; listeners are inert (grids
   don't scroll). Everything is null-guarded.
   ============================================================ */
(function () {
  "use strict";
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  var rails = [
    [".bento", ":scope > .cell"],
    [".squad", ":scope > .coach"],
    [".tiers", ":scope > .tier"],
    [".testi-wall", ".tw-card:not([aria-hidden='true'])"]
  ];

  rails.forEach(function (pair) {
    var rail = document.querySelector(pair[0]);
    if (!rail) return;
    var items = Array.prototype.slice.call(rail.querySelectorAll(pair[1]));
    if (items.length < 2) return;

    var nav = document.createElement("div");
    nav.className = "m-railnav" + (rail.closest(".wrap") ? "" : " m-railnav--bleed");
    nav.setAttribute("aria-hidden", "true");
    nav.innerHTML =
      '<div class="m-railtrack"><i></i></div>' +
      '<span class="m-railcount"><b>01</b>&nbsp;<em>/ ' + pad2(items.length) + "</em></span>";
    rail.insertAdjacentElement("afterend", nav);

    var thumb = nav.querySelector(".m-railtrack i");
    var cur = nav.querySelector(".m-railcount b");
    var n = items.length;
    thumb.style.width = (100 / n).toFixed(3) + "%";

    var scheduled = 0;
    function update() {
      scheduled = 0;
      var edge = rail.getBoundingClientRect().left +
        (parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0);
      /* sort by visual position so flex `order` (Elite-first) maps correctly */
      var ordered = items.slice().sort(function (a, b) {
        return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
      });
      var best = 0, bestD = Infinity;
      for (var i = 0; i < ordered.length; i++) {
        var d = Math.abs(ordered[i].getBoundingClientRect().left - edge);
        if (d < bestD) { bestD = d; best = i; }
      }
      cur.textContent = pad2(best + 1);
      thumb.style.transform = "translateX(" + (best * 100).toFixed(2) + "%)";
    }
    function schedule() { if (!scheduled) scheduled = requestAnimationFrame(update); }
    rail.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
    update();
  });

  /* ---------- sticky action bar ---------- */
  var bar = document.querySelector(".m-actionbar");
  if (bar) {
    var hero = document.querySelector(".hero");
    var contact = document.querySelector("#contact");
    var menu = document.querySelector(".mobile-menu");
    function barState() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var afterHero = hero
        ? hero.getBoundingClientRect().bottom < vh * 0.55
        : window.scrollY > vh * 0.6;
      var nearContact = false;
      if (contact) {
        var r = contact.getBoundingClientRect();
        nearContact = r.top < vh * 0.9 && r.bottom > 0;
      }
      var menuOpen = menu && menu.classList.contains("open");
      bar.classList.toggle("show", afterHero && !nearContact && !menuOpen);
    }
    window.addEventListener("scroll", barState, { passive: true });
    window.addEventListener("resize", barState, { passive: true });
    var burger = document.querySelector(".nav-burger");
    if (burger) burger.addEventListener("click", function () { setTimeout(barState, 0); });
    if (menu) menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setTimeout(barState, 60); });
    });
    barState();
  }
})();
