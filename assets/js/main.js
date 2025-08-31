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
      document.querySelectorAll(".hero .hero-content > *")
    );
    animTargets.push.apply(
      animTargets,
      document.querySelectorAll(".menu-toggle")
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

    const styles = window.getComputedStyle(slider);
    const gapValue = parseFloat(styles.gap || styles.columnGap || 0) || 0;
    const cardWidth =
      products.length > 0 ? products[0].offsetWidth + gapValue : 0;

    function getMaxScroll() {
        const container =
            slider.closest(".products-slider-container") || slider.parentElement;
        const visibleWidth = container.clientWidth;
        const scrollWidth = slider.scrollWidth;
        // Add the gap to the maxScroll calculation for better accuracy
        const maxScroll = scrollWidth - visibleWidth + gapValue;
        return Math.max(0, maxScroll);
    }

    let currentX = 0;

    function updateSliderPosition() {
      const maxScroll = getMaxScroll();
      // RTL: Clamp currentX between -maxScroll and 0
      if (currentX > 0) currentX = 0;
      if (currentX < -maxScroll) currentX = -maxScroll;

      slider.style.transform = `translateX(${currentX}px)`;

      const max = getMaxScroll();
      const progressPercentage = max === 0 ? 0 : (Math.abs(currentX) / max) * 100;
      progressFill.style.width = `${progressPercentage}%`;

      if (currentSlideText && cardWidth > 0) {
        const currentSlide = Math.floor(Math.abs(currentX) / cardWidth) + 1;
        const totalSlides = products.length;
        currentSlideText.textContent = Math.min(
          totalSlides,
          Math.max(1, currentSlide)
        );
      }
      if (totalSlidesText) {
        totalSlidesText.textContent = products.length;
      }
    }

    updateSliderPosition();

    slider.style.cursor = "grab";

    let isMouseDown = false;
    let startX = 0;
    let scrollLeftStart = 0;

    slider.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeftStart = -currentX; // Invert for calculation
      slider.style.cursor = "grabbing";
      e.preventDefault();
    });

    const handleMouseUpAndLeave = () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      slider.style.cursor = "grab";
      updateSliderPosition(); // Snap to bounds
    };

    slider.addEventListener("mouseup", handleMouseUpAndLeave);
    slider.addEventListener("mouseleave", handleMouseUpAndLeave);

    slider.addEventListener("mousemove", (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5; // Multiplier for faster scroll
      currentX = -(scrollLeftStart - walk);
      updateSliderPosition();
    });

    let touchStartX = 0;
    
    slider.addEventListener("touchstart", (e) => {
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeftStart = -currentX;
    }, { passive: true });

    slider.addEventListener("touchmove", (e) => {
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5;
        currentX = -(scrollLeftStart - walk);
        updateSliderPosition();
    }, { passive: true });

    slider.addEventListener("touchend", () => {
        updateSliderPosition();
    });

    window.addEventListener("load", updateSliderPosition);
    window.addEventListener("resize", updateSliderPosition);

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

// Filter and Search functionality
(function () {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const productCards = document.querySelectorAll('.product-card');
    const categorySections = document.querySelectorAll('.category-section');

    function filterAndSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        // First, handle category visibility
        categorySections.forEach(section => {
            const slider = section.querySelector('.products-slider');
            if (!slider) return;
            const categoryId = slider.id.replace('-slider', '');
            if (selectedCategory === 'all' || selectedCategory === categoryId) {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        });

        // Then, filter products within visible categories
        productCards.forEach(card => {
            const productName = card.querySelector('h4').textContent.toLowerCase();
            const productCategorySlider = card.closest('.products-slider');
            if (!productCategorySlider) return;

            const productCategoryId = productCategorySlider.id.replace('-slider', '');

            const matchesCategory = selectedCategory === 'all' || selectedCategory === productCategoryId;
            const matchesSearch = productName.includes(searchTerm);

            // The card should be visible only if its category is selected (or 'all') AND it matches the search term
            if ((selectedCategory === 'all' || selectedCategory === productCategoryId) && matchesSearch) {
                card.style.display = 'flex'; // Use flex as it's a flex container
            } else {
                card.style.display = 'none';
            }
        });

        // After filtering, we need to recalculate the slider positions
        window.dispatchEvent(new Event('resize'));
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterAndSearch);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAndSearch);
    }
})();
