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

// Scroll-reveal animation for cards and section blocks
const revealTargets = document.querySelectorAll(".cards-grid > article, .about-list, .hero-card, .contact-form");
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
