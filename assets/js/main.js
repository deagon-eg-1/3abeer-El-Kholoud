document.addEventListener("DOMContentLoaded", function () {
  // Mark elements for page-load animation (staggered)
  try {
    var root = document.documentElement;
    var animTargets = [];
    animTargets.push.apply(
      animTargets,
      document.querySelectorAll(".sidebar *")
    );
    animTargets.push.apply(
      animTargets,
      document.querySelectorAll(".navbar .nav-links a")
    );
    animTargets.push.apply(
      animTargets,
      document.querySelectorAll(".hero .slide.active .slide-content > *")
    );
    animTargets.push.apply(
      animTargets,
      document.querySelectorAll(".slider-controls, .menu-toggle")
    );
    animTargets.forEach(function (el, idx) {
      el.setAttribute("data-animate", "");
      el.style.setProperty("--i", String(idx));
    });
    // trigger reveal on next frame
    requestAnimationFrame(function () {
      root.classList.add("is-loaded");
    });
  } catch (e) {}

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

  // Autoplay controls
  const AUTOPLAY_INTERVAL_MS = 5000;
  let autoplayId = null;
  let isHoveredOrFocused = false;
  function startAutoplay() {
    if (autoplayId || total <= 1) return;
    autoplayId = setInterval(() => {
      if (!isHoveredOrFocused) {
        next();
      }
    }, AUTOPLAY_INTERVAL_MS);
  }
  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }
  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // IMPORTANT: CSS var URLs resolve relative to the CSS file (assets/css/)
  // while inline style URLs resolve relative to the HTML document (index.html)
  const backgroundImagesCss = [
    "url('../img/hero-bg-1.jpg')",
    "url('../img/hero-bg-2.jpg')",
    "url('../img/hero-bg-3.jpg')",
  ];
  const backgroundImagesInline = [
    "url('assets/img/hero-bg-1.jpg')",
    "url('assets/img/hero-bg-2.jpg')",
    "url('assets/img/hero-bg-3.jpg')",
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

  nextBtn &&
    nextBtn.addEventListener("click", function () {
      next();
      resetAutoplay();
    });
  prevBtn &&
    prevBtn.addEventListener("click", function () {
      prev();
      resetAutoplay();
    });

  // Keyboard support
  hero.setAttribute("tabindex", "0");
  hero.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") next();
    if (e.key === "ArrowRight") prev();
    resetAutoplay();
  });

  // Swipe support (basic)
  let startX = 0;
  hero.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      stopAutoplay();
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
      resetAutoplay();
    },
    { passive: true }
  );

  // Pause autoplay on hover/focus within hero
  hero.addEventListener("mouseenter", function () {
    isHoveredOrFocused = true;
  });
  hero.addEventListener("mouseleave", function () {
    isHoveredOrFocused = false;
  });
  hero.addEventListener("focusin", function () {
    isHoveredOrFocused = true;
  });
  hero.addEventListener("focusout", function () {
    isHoveredOrFocused = false;
  });

  // Handle tab visibility changes
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

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
  startAutoplay();
});

// offcanvas menu
(function () {
  var toggle = document.querySelector(".menu-toggle");
  var offcanvas = document.querySelector(".offcanvas");
  var closeBtn = document.querySelector(".offcanvas-close");
  var backdrop = document.querySelector(".offcanvas-backdrop");
  var main = document.querySelector("main");

  function openMenu() {
    offcanvas.classList.add("open");
    document.body.classList.add("no-scroll");
    backdrop.hidden = false;
    requestAnimationFrame(function () {
      backdrop.classList.add("show");
    });
    offcanvas.setAttribute("aria-hidden", "false");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    if (main) main.setAttribute("inert", "");
    if (closeBtn)
      try {
        closeBtn.focus();
      } catch (e) {}
  }
  function closeMenu() {
    offcanvas.classList.remove("open");
    document.body.classList.remove("no-scroll");
    backdrop.classList.remove("show");
    setTimeout(function () {
      backdrop.hidden = true;
    }, 200);
    offcanvas.setAttribute("aria-hidden", "true");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (main) main.removeAttribute("inert");
    if (toggle)
      try {
        toggle.focus();
      } catch (e) {}
  }

  if (toggle) {
    toggle.addEventListener("click", openMenu);
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }
  if (backdrop) {
    backdrop.addEventListener("click", closeMenu);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenu();
    }
  });
})();

(function () {
  const sliders = document.querySelectorAll(".products-slider");

  sliders.forEach((slider) => {
    const sliderId = slider.id;
    const progressFill = document.querySelector(
      `[data-slider="${sliderId}"].progress-fill`
    );
    const currentSlideText = document.querySelector(
      `[data-slider="${sliderId}"].current-slide`
    );
    const totalSlidesText = document.querySelector(
      `[data-slider="${sliderId}"].total-slides`
    );
    const products = slider.querySelectorAll(".product-card");

    if (!progressFill || products.length === 0) return;

    // استخدم gap الفعلي من CSS بدل قيمة ثابتة، وحدد اتجاه التدفق
    const styles = window.getComputedStyle(slider);
    const gapValue = parseFloat(styles.gap || styles.columnGap || 0) || 0;
    const isReversed = (styles.flexDirection || '').includes('reverse');
    const cardWidth = products.length > 0 ? products[0].offsetWidth + gapValue : 0;

    function getOverflowWidth() {
      // استخدم أقرب حاوية للسلايدر لضمان القياس الصحيح لو كان هناك أكثر من طبقة التفاف
      const container = slider.closest('.products-slider-container') || slider.parentElement;
      // clientWidth يتضمن الـ padding بالفعل، لذا لا داعي لطرحه
      const visibleWidth = container.clientWidth;
      const correction = 1; // تعويض بسيط لتجنب قص آخر عنصر
      const overflow = slider.scrollWidth - visibleWidth + correction;
      const safeOverflow = overflow > 0.5 ? overflow : 0; // تجاهل فروق أقل من نصف بكسل
      // سجلات للتتبع
      console.debug('[Slider]', slider.id, {
        containerWidth: container.clientWidth,
        visibleWidth,
        sliderScrollWidth: slider.scrollWidth,
        correction,
        overflow,
        safeOverflow,
        isReversed
      });
      return Math.max(0, safeOverflow);
    }

    function getBounds() {
      const overflow = getOverflowWidth();
      // في الاتجاه العادي: المدى [سالب, 0]، في العكسي: [0, موجب]
      return isReversed
        ? { min: 0, max: overflow }
        : { min: -overflow, max: 0 };
    }

    let currentX = 0;

    function updateSliderPosition() {
      // منع ترك مساحات فاضية بحسب حدود السلايدر
      const bounds = getBounds();
      if (currentX < bounds.min) currentX = bounds.min;
      if (currentX > bounds.max) currentX = bounds.max;

      // طبّق التحويل بحسب اتجاه التدفق: في الاتجاه المعكوس نستخدم الإشارة السالبة
      const tx = isReversed ? -currentX : currentX;
      slider.style.transform = `translateX(${tx}px)`;

      // تحديث progress bar مع تجنب القسمة على صفر وبغض النظر عن الاتجاه
      const bounds2 = getBounds();
      const range = bounds2.max - bounds2.min;
      const progressPercentage = range === 0 ? 100 : ((currentX - bounds2.min) / range) * 100;
      progressFill.style.width = `${Math.min(100, Math.max(0, progressPercentage))}%`;
      console.debug('[Slider Progress]', slider.id, { currentX, bounds: bounds2, range, progressPercentage });

      // Update slide counter dynamically
      if (currentSlideText && cardWidth > 0) {
        const currentSlide = Math.floor(Math.abs(currentX) / cardWidth) + 1;
        const totalSlides = products.length;
        currentSlideText.textContent = Math.min(totalSlides, Math.max(1, currentSlide));
      }
      if (totalSlidesText) {
        totalSlidesText.textContent = products.length;
      }
    }

    updateSliderPosition();

    // Add grabbing cursor style
    slider.style.cursor = "grab";

    // Mouse drag support
    let isMouseDown = false;
    let mouseStartX = 0;

    slider.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      const rawCurrent = isReversed ? -currentX : currentX;
      mouseStartX = e.clientX - rawCurrent;
      slider.style.cursor = "grabbing";
      e.preventDefault();
    });

    const handleMouseUpAndLeave = () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      slider.style.cursor = "grab";
      // Snap to bounds after drag ends
      updateSliderPosition();
    };

    slider.addEventListener("mouseup", handleMouseUpAndLeave);

    slider.addEventListener("mousemove", (e) => {
      if (!isMouseDown) return;
      const rawCurrent = e.clientX - mouseStartX;
      currentX = isReversed ? -rawCurrent : rawCurrent;
      updateSliderPosition();
    });

    slider.addEventListener("mouseleave", handleMouseUpAndLeave);

    // Touch/swipe support
    let touchStartX = 0;

    slider.addEventListener("touchstart", (e) => {
      const rawCurrent = isReversed ? -currentX : currentX;
      touchStartX = e.touches[0].clientX - rawCurrent;
    });

    slider.addEventListener("touchmove", (e) => {
      const rawCurrent = e.touches[0].clientX - touchStartX;
      currentX = isReversed ? -rawCurrent : rawCurrent;
      updateSliderPosition();
    });

    slider.addEventListener("touchend", () => {
      // Snap to bounds after touch ends
      updateSliderPosition();
    });

    // إعادة حساب الموضع عند تحميل الصور/تغيير المقاسات
    window.addEventListener('load', updateSliderPosition);
    window.addEventListener('resize', updateSliderPosition);



    // باقي الأنيميشنز والـ hover effects زي ما هي
    const productCards = slider.querySelectorAll(".product-card");
    productCards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(30px)";

      setTimeout(() => {
        card.style.transition = "all 0.6s ease-out";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, 200 + index * 150);
    });
  });
})();
