/* BrightSmile Dental Clinic — interactions */

// Current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile navigation toggle
const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

menuToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close mobile menu when a link is clicked
siteNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Contact form validation (demo only — no backend)
const form = document.getElementById("contactForm");
const note = document.getElementById("formNote");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const name = (data.get("name") || "").toString().trim();
  const email = (data.get("email") || "").toString().trim();
  const message = (data.get("message") || "").toString().trim();

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !emailOk || !message) {
    note.textContent = "Please fill in your name, a valid email, and a short message.";
    note.className = "form-note err";
    return;
  }

  note.textContent = `Thanks, ${name}! Your request has been received — we'll call you shortly to confirm a time.`;
  note.className = "form-note ok";
  form.reset();
});

// Services scroll animation: the video background scrubs through its timeline
// as you scroll, while also gliding and slowly zooming (parallax-style).
(function () {
  const services = document.getElementById("services");
  const media = document.getElementById("servicesMedia");
  const video = document.getElementById("servicesVideo");
  if (!services || !media) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion && video) video.pause();

  const SHIFT = 180;   // max px the media layer travels with scroll
  const ZOOM = 0.25;   // extra scale gained while scrolling through the section
  let duration = 0;
  let ticking = false;

  // Six service cards rise as each one enters the viewport (scroll-scrubbed
  // and fully reversible), with a small per-column stagger in a row for a
  // cascade feel. Anchoring to the card's own rect keeps the motion on-screen.
  const cards = services.querySelectorAll(".cards-grid > article");
  const COL_STAGGER = 0.08; // extra delay for the 2nd/3rd card in a row

  function cardProgress(top, vh) {
    // 0 while the card's top is below ~88% of the screen height, 1 once it
    // has risen to ~35% — so the rise plays out fully while the card is visible.
    let cp = (vh * 0.88 - top) / (vh * 0.88 - vh * 0.35);
    return Math.min(1, Math.max(0, cp));
  }

  function updateCards() {
    const vh = window.innerHeight;
    cards.forEach((card, i) => {
      const col = i % 3;
      let cp = cardProgress(card.getBoundingClientRect().top, vh);
      if (col) {
        cp = Math.min(1, Math.max(0, (cp - col * COL_STAGGER) / (1 - 2 * COL_STAGGER)));
      }
      cp = 1 - Math.pow(1 - cp, 3); // ease-out for a natural rise
      card.style.setProperty("--cp", cp.toFixed(3));
    });
  }

  // Smoothstep for a soft start/stop
  function ease(t) { return t * t * (3 - 2 * t); }

  // Scroll progress: 0 when the section's top enters the viewport,
  // 1 once it is ~60% scrolled through the screen.
  function progress() {
    const rect = services.getBoundingClientRect();
    const vh = window.innerHeight;
    const span = vh + rect.height * 0.6;
    let p = (vh - rect.top) / span;
    return Math.min(1, Math.max(0, p));
  }

  function update() {
    ticking = false;
    if (reduceMotion) return;

    const p = ease(progress());

    // Six service cards rise one after another as they enter the screen,
    // synced with the video scrub. Reversible on scroll-back.
    updateCards();

    // +SHIFT px while entering -> -SHIFT px while leaving, plus a gentle zoom-in
    media.style.setProperty("--bg-shift", ((0.5 - p) * 2 * SHIFT).toFixed(1) + "px");
    media.style.setProperty("--bg-scale", (1.15 + p * ZOOM).toFixed(3));

    // Scrub the video along its own timeline in sync with the scroll position
    if (video && duration > 0 && video.readyState >= 1) {
      video.pause();
      const target = p * duration;
      if (Math.abs(video.currentTime - target) > 0.05) {
        video.currentTime = target;
      }
    }
  }

  if (video) {
    const onMeta = () => {
      duration = video.duration || 0;
      update();
    };
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("error", () => { duration = 0; });
    if (video.readyState >= 1) onMeta();
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
})();

// Scroll-reveal animation for cards and section blocks (services cards are
// excluded — they follow the scroll-scrub in the section above instead)
const revealTargets = Array.from(
  document.querySelectorAll(".cards-grid > article, .about-list, .hero-card, .contact-form")
).filter((el) => !el.closest("#services"));
revealTargets.forEach((el) => el.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => observer.observe(el));
} else {
  // Fallback: show everything immediately
  revealTargets.forEach((el) => el.classList.add("visible"));
}
