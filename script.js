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

// Services 3D perspective flip scroll animation
// Cards flip from a hidden 3D state (rotateX/Y skewed, pushed back and down)
// to their flat final state as the user scrolls through the section.
// The animation is driven by scroll progress (--cp) for the whole block and
// by each card's own scroll progress for the flip. Reversible on scroll-back.
(function () {
  const services = document.getElementById("services");
  if (!services || !services.classList.contains("cards-3d")) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    const cards = services.querySelectorAll(".card");
    cards.forEach((c) => {
      c.style.setProperty("--cp", "1");
    });
    const media = services.querySelector(".services-media");
    if (media) {
      media.style.setProperty("--bg-shift", "0");
      media.style.setProperty("--bg-scale", "1.15");
    }
    return;
  }

  const cards = services.querySelectorAll(".card");
  if (!cards.length) return;

  const SHIFT = 180;   // max px the whole block travels with scroll
  const ZOOM = 0.18;   // extra scale gained while scrolling through the section
  let ticking = false;

  // Each card's own 3D animation progress uses the card's bounding rect so
  // the flip plays out while that card is actually on-screen.
  function cardProgress(top, vh) {
    // 0 while the card's top is below ~88% of the screen height, 1 once it
    // has risen to ~35% — so the flip plays out fully while the card is visible.
    let cp = (vh * 0.88 - top) / (vh * 0.88 - vh * 0.35);
    return Math.min(1, Math.max(0, cp));
  }

  function cardIndex(card) {
    const idx = Array.prototype.indexOf.call(cards, card);
    return idx;
  }

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
    const p = ease(progress());

    // Background media layer: +SHIFT px while entering -> -SHIFT px while
    // leaving, plus a gentle zoom-in, synced with the overall section scroll.
    const media = services.querySelector(".services-media");
    if (media) {
      media.style.setProperty("--bg-shift", ((0.5 - p) * 2 * SHIFT).toFixed(1) + "px");
      media.style.setProperty("--bg-scale", (1.15 + p * ZOOM).toFixed(3));
    }

    // 3D perspective flip scroll animation for each card:
    // Each card gets its own --cp (0..1) from its bounding rect so the flip
    // plays out fully while that specific card is visible, with a natural
    // ease-out (1 - (1 - cp)^3) so the flip feels quick but gentle.
    // Cards start flipped away (cp 0) and flatten in (cp 1) as they scroll in.
    cards.forEach((card) => {
      const idx = cardIndex(card);
      const top = card.getBoundingClientRect().top;
      const vh = window.innerHeight;
      let cp = cardProgress(top, vh);
      cp = 1 - Math.pow(1 - cp, 3);     // ease-out
      card.style.setProperty("--cp", cp.toFixed(3));
      card.style.setProperty("--card-index", String(idx));
    });
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
  const ignoreSelector = "#services.cards-3d .card";
  const observerOptions = { threshold: 0.15, rootMargin: "0px 0px -80px 0px" };

  // IntersectionObserver applies .visible to the remaining reveal targets only.
  // Services cards are excluded — their flip is driven by scroll-scrub --cp above.
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
  // Fallback: show everything immediately (no IntersectionObserver)
  revealTargets.forEach((el) => el.classList.add("visible"));
}
