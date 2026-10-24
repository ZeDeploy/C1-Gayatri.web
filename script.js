/* Dr Gayatri's Dental Clinic — interactions */

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

// Sticky 3D Card Stack Animation for Services Section
(function () {
  const wrappers = document.querySelectorAll("#services .card-wrapper");
  const cards = document.querySelectorAll("#services .card");

  if (!wrappers.length || !cards.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    cards.forEach((card) => {
      card.style.transform = "none";
      card.style.opacity = "1";
      card.style.filter = "none";
    });
    return;
  }

  function updateCardStack() {
    const pinTop = window.innerHeight * 0.14; // Matches CSS 'top: 14vh'
    const start = window.innerHeight; // When next card enters viewport bottom

    wrappers.forEach((wrapper, index) => {
      // Last card remains unscaled/untransformed as the active top card
      if (index === wrappers.length - 1) {
        cards[index].style.transform = "translate3d(0, 0, 0) scale(1)";
        cards[index].style.opacity = "1";
        cards[index].style.filter = "none";
        return;
      }

      // Calculate how much subsequent cards cover this card (supports full multi-card deck stacking)
      let totalProgress = 0;
      for (let j = index + 1; j < wrappers.length; j++) {
        const nextRect = wrappers[j].getBoundingClientRect();
        let p = (start - nextRect.top) / (start - pinTop);
        p = Math.min(Math.max(p, 0), 1);
        totalProgress += p;
      }

      // Scale down slightly, dim, and blur as cards stack over it
      const scale = Math.max(0.84, 1 - totalProgress * 0.045);
      const opacity = Math.max(0.4, 1 - totalProgress * 0.15);
      const blur = Math.min(5, totalProgress * 1.5);
      const translateY = -totalProgress * 22; // Shifts up to leave a visible stepped deck tab

      cards[index].style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      cards[index].style.opacity = opacity.toFixed(3);
      cards[index].style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : "none";
    });
  }

  // Attach listener with requestAnimationFrame for smooth 60fps performance
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateCardStack();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", updateCardStack, { passive: true });
  updateCardStack();
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
