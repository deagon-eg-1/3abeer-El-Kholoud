document.addEventListener("DOMContentLoaded", function () {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll(".slide"));
  const mainEl = document.querySelector(".main");
  const prevBtn = hero.querySelector(".slider-btn.prev");
  const nextBtn = hero.querySelector(".slider-btn.next");
  const currentEl = hero.querySelector(".slider-counter .current");
  const totalEl = hero.querySelector(".slider-counter .total");
  const progress = hero.querySelector(".slider-progress");
  const progressBar = hero.querySelector(".slider-progress-bar");

  let currentIndex = Math.max(
    0,
    slides.findIndex((s) => s.classList.contains("active"))
  );
  const total = slides.length;
  if (totalEl) totalEl.textContent = String(total);

  // Progress replaces dots (keep empty array for API compatibility)
  const dots = [];

  function updateUI() {
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add("active");
        slide.classList.remove("hidden");
      } else {
        slide.classList.remove("active");
        slide.classList.add("hidden");
      }
    });
    // في الشريحة الأولى يكون ممتلئ أيضاً (حمل كامل)
    const percent = total > 1 ? ((currentIndex + 1) / total) * 100 : 100;
    if (progress)
      progress.setAttribute("aria-valuenow", String(Math.round(percent)));
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (currentEl) currentEl.textContent = String(currentIndex + 1);
  }

  // IMPORTANT: CSS var URLs resolve relative to the CSS file (assets/css/)
  // while inline style URLs resolve relative to the HTML document (index.html)
  const backgroundImagesCss = [
    "url('../img/d.jpg')",
    "url('../img/570ea497171329.5ebec47b77f7e.jpg')",
    "url('../img/872ea097171329.5ebec47b7b926.jpg')",
  ];
  const backgroundImagesInline = [
    "url('assets/img/d.jpg')",
    "url('assets/img/570ea497171329.5ebec47b77f7e.jpg')",
    "url('assets/img/872ea097171329.5ebec47b7b926.jpg')",
  ];

  function animateBackground(toIndex) {
    if (!mainEl) return;
    const fromIndex = currentIndex;
    const currentBgCss =
      backgroundImagesCss[fromIndex % backgroundImagesCss.length];
    const nextBgCss = backgroundImagesCss[toIndex % backgroundImagesCss.length];
    const nextBgInline =
      backgroundImagesInline[toIndex % backgroundImagesInline.length];
    mainEl.style.setProperty("--bg-current", currentBgCss);
    mainEl.style.setProperty("--bg-next", nextBgCss);
    // trigger animation class
    mainEl.classList.remove("bg-anim-next", "bg-anim-prev");
    // force reflow to restart animation reliably
    void mainEl.offsetWidth;
    mainEl.classList.add("bg-anim-next");
    // after animation ends, swap vars so current reflects next
    setTimeout(() => {
      // disable transitions to avoid double flash on reset
      mainEl.classList.add("no-transition");
      mainEl.style.setProperty("--bg-current", nextBgCss);
      mainEl.style.setProperty("--bg-next", nextBgCss);
      // also set inline background as a hard fallback (document-relative path)
      mainEl.style.backgroundImage = nextBgInline;
      mainEl.classList.remove("bg-anim-next", "bg-anim-prev");
      // force reflow, then re-enable transitions
      void mainEl.offsetWidth;
      mainEl.classList.remove("no-transition");
    }, 620); // slightly longer than CSS transition
  }

  function goTo(index) {
    if (index === currentIndex) return;
    const normalized = (index + total) % total;
    animateBackground(normalized);
    currentIndex = normalized;
    updateUI();
  }

  function next() {
    goTo(currentIndex + 1);
  }
  function prev() {
    goTo(currentIndex - 1);
  }

  nextBtn && nextBtn.addEventListener("click", next);
  prevBtn && prevBtn.addEventListener("click", prev);

  // Keyboard support
  hero.setAttribute("tabindex", "0");
  hero.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") next();
    if (e.key === "ArrowRight") prev();
  });

  // Swipe support (basic)
  let startX = 0;
  hero.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
    },
    { passive: true }
  );
  hero.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        dx < 0 ? next() : prev();
      }
    },
    { passive: true }
  );

  // init bg
  if (mainEl) {
    const initBgCss = backgroundImagesCss[0];
    const initBgInline = backgroundImagesInline[0];
    mainEl.style.setProperty("--bg-current", initBgCss);
    mainEl.style.setProperty("--bg-next", initBgCss);
    // ensure visible even before first animation (document-relative)
    mainEl.style.backgroundImage = initBgInline;
    mainEl.style.backgroundSize = "110%";
    mainEl.style.backgroundRepeat = "no-repeat";
    mainEl.style.backgroundPositionY = "40%";
    mainEl.style.backgroundPositionX = "100%";
  }
  updateUI();
});
