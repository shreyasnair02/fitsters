// Fitsters Tweaks — drives CSS variables + hero imagery. Page is plain HTML.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#f2b705",
  "headlineFont": "Anton",
  "heroHeadline": "A — Anton Condensed",
  "heroFont": "Anton",
  "heroGrade": "Cinematic Gold",
  "heroTitleText": "Fitsters Athletic Club",
  "introExit": "Cinematic Fade",
  "energy": "Full Cinematic",
  "powerStrips": true
}/*EDITMODE-END*/;

const FONT_MAP = {
  "Anton": "\"Anton\", \"Arial Narrow\", sans-serif",
  "Oswald": "\"Oswald\", \"Arial Narrow\", sans-serif",
  "Bebas Neue": "\"Bebas Neue\", \"Anton\", sans-serif"
};

function res(id, fallback) {
  return (window.__resources && window.__resources[id]) || fallback;
}

// legacy map (old headline-treatment tweak) — kept for saved versions
const HERO_HEADLINE_MAP = {
  "A — Anton Condensed": "anton",
  "B — Archivo Wide": "archivo",
  "C — Bodoni Black": "bodoni"
};

const INTRO_EXIT_MAP = {
  "Curtain Up": "up",
  "Iris": "iris",
  "Split Doors": "split",
  "Cinematic Fade": "fade",
  "Flash Burn": "burn"
};

const HERO_FONT_MAP = {
  "Archivo Condensed": "archivo",
  "Anton": "anton",
  "Rammetto One": "rammetto",
  "Alfa Slab One": "alfa",
  "Ultra": "ultra",
  "Passion One": "passion",
  "Bungee": "bungee"
};

const HERO_GRADE_MAP = {
  "Cinematic Gold": "gold",
  "Noir": "noir",
  "Natural": "natural"
};

const HERO_TITLE_MAP = {
  "Join the Pride": { html: 'Join the <em class="glitch" data-text="Pride">Pride</em>', mode: "pride" },
  "Fitsters Athletic Club": { html: '<em class="glitch" data-text="Fitsters">Fitsters</em> Athletic Club', mode: "club" }
};

function hexToRgb(hex) {
  var h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
  var n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function FitstersTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(function () {
    var root = document.documentElement;
    var rgb = hexToRgb(t.accent);
    root.style.setProperty("--gold", t.accent);
    root.style.setProperty("--gold-rgb", rgb.join(", "));
    root.style.setProperty("--font-display", FONT_MAP[t.headlineFont] || FONT_MAP.Anton);
  }, [t.accent, t.headlineFont]);

  React.useEffect(function () {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    hero.setAttribute("data-hero-font", HERO_FONT_MAP[t.heroFont] || "archivo");
  }, [t.heroFont]);

  React.useEffect(function () {
    var bg = document.getElementById("heroBg");
    if (!bg || !bg.classList.contains("video")) return;
    bg.setAttribute("data-grade", HERO_GRADE_MAP[t.heroGrade] || "gold");
  }, [t.heroGrade]);

  React.useEffect(function () {
    var hero = document.querySelector(".hero.hero-centered");
    var title = document.getElementById("heroTitle");
    var conf = HERO_TITLE_MAP[t.heroTitleText];
    if (!hero || !title || !conf) return;
    title.innerHTML = conf.html;
    hero.setAttribute("data-hero-title", conf.mode);
  }, [t.heroTitleText]);

  React.useEffect(function () {
    var veil = document.getElementById("introVeil");
    if (veil) veil.setAttribute("data-exit", INTRO_EXIT_MAP[t.introExit] || "up");
  }, [t.introExit]);

  React.useEffect(function () {
    document.documentElement.setAttribute("data-energy", t.energy === "Calm" ? "calm" : "full");
    document.querySelectorAll(".power-strip").forEach(function (el) {
      el.style.display = t.powerStrips ? "" : "none";
    });
  }, [t.energy, t.powerStrips]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Intro" />
      <TweakSelect
        label="Exit transition"
        value={t.introExit}
        options={["Curtain Up", "Iris", "Split Doors", "Cinematic Fade", "Flash Burn"]}
        onChange={function (v) { setTweak("introExit", v); }}
      />
      <TweakButton label="Replay intro" onClick={function () { location.reload(); }} />
      <TweakSection label="Brand accent" />
      <TweakColor
        label="Gold"
        value={t.accent}
        options={["#f2b705", "#f9bd14", "#ffd782", "#d4960f"]}
        onChange={function (v) { setTweak("accent", v); }}
      />
      <TweakSection label="Typography" />
      <TweakSelect
        label="Display font"
        value={t.headlineFont}
        options={["Anton", "Oswald", "Bebas Neue"]}
        onChange={function (v) { setTweak("headlineFont", v); }}
      />
      <TweakSection label="Hero display font" />
      <TweakSelect
        label="Font"
        value={t.heroFont}
        options={["Archivo Condensed", "Anton", "Rammetto One", "Alfa Slab One", "Ultra", "Passion One", "Bungee"]}
        onChange={function (v) { setTweak("heroFont", v); }}
      />
      <TweakSection label="Motion" />
      <TweakRadio
        label="Energy"
        value={t.energy}
        options={["Full Cinematic", "Calm"]}
        onChange={function (v) { setTweak("energy", v); }}
      />
      <TweakToggle
        label="Kinetic type strips"
        value={t.powerStrips}
        onChange={function (v) { setTweak("powerStrips", v); }}
      />
      <TweakSection label="Hero footage" />
      <TweakSelect
        label="Grade"
        value={t.heroGrade}
        options={["Cinematic Gold", "Noir", "Natural"]}
        onChange={function (v) { setTweak("heroGrade", v); }}
      />
      <TweakSection label="Headline text" />
      <TweakSelect
        label="Text"
        value={t.heroTitleText}
        options={["Join the Pride", "Fitsters Athletic Club"]}
        onChange={function (v) { setTweak("heroTitleText", v); }}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<FitstersTweaks />);
