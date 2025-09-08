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

// slider js
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
      const maxScroll = scrollWidth - visibleWidth + gapValue;
      return Math.max(0, maxScroll);
    }

    let currentX = 0;

    function updateSliderPosition() {
      // 🚫 إلغاء السلايدر في الموبايل
      if (window.innerWidth <= 768) {
        slider.style.transform = "none";
        progressFill.style.width = "0%";
        if (currentSlideText) currentSlideText.textContent = 1;
        if (totalSlidesText) totalSlidesText.textContent = products.length;
        return; // نخرج من الفنكشن هنا
      }

      // ✅ السلايدر شغال في الشاشات الكبيرة
      const maxScroll = getMaxScroll();

      if (currentX < 0) currentX = 0;
      if (currentX > maxScroll) currentX = maxScroll;

      slider.style.transform = `translateX(${-currentX}px)`;

      const max = getMaxScroll();
      const progressPercentage = max === 0 ? 0 : (currentX / max) * 100;
      progressFill.style.width = `${progressPercentage}%`;

      if (currentSlideText && cardWidth > 0) {
        const currentSlide = Math.floor(currentX / cardWidth) + 1;
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
      if (window.innerWidth <= 768) return; // 🚫 مفيش سلايدر في الموبايل
      isMouseDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeftStart = currentX;
      slider.style.cursor = "grabbing";
      e.preventDefault();
    });

    const handleMouseUpAndLeave = () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      slider.style.cursor = "grab";
      updateSliderPosition();
    };

    slider.addEventListener("mouseup", handleMouseUpAndLeave);
    slider.addEventListener("mouseleave", handleMouseUpAndLeave);

    slider.addEventListener("mousemove", (e) => {
      if (!isMouseDown || window.innerWidth <= 768) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      currentX = scrollLeftStart - walk;
      updateSliderPosition();
    });

    let touchStartX = 0;

    slider.addEventListener(
      "touchstart",
      (e) => {
        if (window.innerWidth <= 768) return; // 🚫 إلغاء اللمس في الموبايل
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeftStart = currentX;
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchmove",
      (e) => {
        if (window.innerWidth <= 768) return; // 🚫 إلغاء السحب في الموبايل
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5;
        currentX = scrollLeftStart - walk;
        updateSliderPosition();
      },
      { passive: true }
    );

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
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const productCards = document.querySelectorAll(".product-card");
  const categorySections = document.querySelectorAll(".category-section");

  function filterAndSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    // First, handle category visibility
    categorySections.forEach((section) => {
      const slider = section.querySelector(".products-slider");
      if (!slider) return;
      const categoryId = slider.id.replace("-slider", "");
      if (selectedCategory === "all" || selectedCategory === categoryId) {
        section.style.display = "";
      } else {
        section.style.display = "none";
      }
    });

    // Then, filter products within visible categories
    productCards.forEach((card) => {
      const productName = card.querySelector("h4").textContent.toLowerCase();
      const productCategorySlider = card.closest(".products-slider");
      if (!productCategorySlider) return;

      const productCategoryId = productCategorySlider.id.replace("-slider", "");

      const matchesCategory =
        selectedCategory === "all" || selectedCategory === productCategoryId;
      const matchesSearch = productName.includes(searchTerm);

      // The card should be visible only if its category is selected (or 'all') AND it matches the search term
      if (
        (selectedCategory === "all" ||
          selectedCategory === productCategoryId) &&
        matchesSearch
      ) {
        card.style.display = "flex"; // Use flex as it's a flex container
      } else {
        card.style.display = "none";
      }
    });

    // After filtering, we need to recalculate the slider positions
    window.dispatchEvent(new Event("resize"));
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterAndSearch);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterAndSearch);
  }
})();

// Cart module (storage + UI)
(function () {
  const CART_KEY = "cartItems";
  const container = document.querySelector(".cart-icon-container");
  const counterEl = document.querySelector(".cart-counter");

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCounter();
    renderDropdown();
  }

  function updateCounter() {
    if (!counterEl) return;
    const items = loadCart();
    const count = items.reduce((sum, it) => sum + (it.qty || 1), 0);
    counterEl.textContent = count;
    if (count > 0) counterEl.classList.add("show-counter");
    else counterEl.classList.remove("show-counter");
  }

  function addItem(product) {
    const items = loadCart();
    const idx = items.findIndex((it) => it.id === product.id);
    if (idx > -1) {
      items[idx].qty = (items[idx].qty || 1) + 1;
    } else {
      items.push({ ...product, qty: 1 });
    }
    saveCart(items);
  }

  function removeItem(id) {
    let idToNum = Number(id);
    let items = loadCart();
    const idx = items.findIndex((it) => it.id === idToNum);

    if (idx > -1) {
      const currentQty = items[idx].qty || 1;
      if (currentQty > 1) {
        items[idx].qty = currentQty - 1;
      } else {
        items.splice(idx, 1);
      }
      saveCart(items);
    }
  }

  function clearCart() {
    saveCart([]);
  }

  function currency(val) {
    return `$${Number(val).toFixed(2)}`;
  }

  function ensureDropdown() {
    if (!container) {
      console.error("Cart container not found");
      return null;
    }
    let dd = container.querySelector(".cart-dropdown");
    if (!dd) {
      dd = document.createElement("div");
      dd.className =
        "cart-dropdown absolute left-0 mt-3 w-80 max-h-96 overflow-auto bg-white text-[#03144f] rounded-xl shadow-2xl border border-gray-200 hidden z-50";
      dd.innerHTML = '<div class="p-4 text-sm text-gray-500">السلة فارغة</div>';
      container.appendChild(dd);
    }
    return dd;
  }

  function renderDropdown() {
    const dd = ensureDropdown();
    if (!dd) {
      console.error("Could not find or create dropdown container");
      return;
    }
    const items = loadCart();
    if (!items.length) {
      dd.innerHTML = '<div class="p-4 text-sm text-gray-500">السلة فارغة</div>';
      return;
    }

    const total = items.reduce((s, it) => s + it.price * (it.qty || 1), 0);
    dd.innerHTML = `
      <div class="p-3 divide-y divide-gray-200 z-40">
        <div class="space-y-2 max-h-60 overflow-auto z-40">
          ${items
            .map(
              (it) => `
              <div class="flex items-center gap-3">
                <img src="${it.img}" alt="${
                it.name
              }" class="w-12 h-12 rounded object-cover border" />
                <div class="flex-1">
                  <div class="text-sm font-semibold">${it.name}</div>
                  <div class="text-xs text-gray-500">${currency(it.price)} × ${
                it.qty || 1
              }</div>
                </div>
                <button class="text-red-600 text-xs remove-item" data-id="${
                  it.id
                }">حذف</button>
              </div>`
            )
            .join("")}
        </div>
        <div class="pt-3 flex items-center justify-between text-sm font-bold">
          <span>الإجمالي</span>
          <span>${currency(total)}</span>
        </div>
        <div class="pt-3 grid grid-cols-2 gap-2">
          <a href="./products.html" class="px-3 py-2 rounded-lg text-center text-white" style="background:#03144f">اذهب للمنتجات</a>
          <a href="./checkout.html" class="px-3 py-2 rounded-lg text-center text-white" style="background:#c19a6b">تابع الدفع</a>
        </div>
        <div class="pt-2">
          <button class="w-full text-xs text-gray-500 hover:text-red-600 clear-cart">تفريغ السلة</button>
        </div>
      </div>
    `;

    // Event delegation for remove buttons
    dd.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        const id = e.target.dataset.id;
        removeItem(id);
      }
    });

    // Clear cart button event
    const clearBtn = dd.querySelector(".clear-cart");
    if (clearBtn) clearBtn.addEventListener("click", clearCart);
  }

  function toggleDropdown(open) {
    const dd = ensureDropdown();
    if (!dd) return;
    if (open === undefined) dd.classList.toggle("hidden");
    else dd.classList.toggle("hidden", !open);
  }

  function setupToggle() {
    const icon = document.querySelector(".nav-cart-icon");
    const dd = ensureDropdown();
    if (!icon || !dd) return;
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDropdown();
    });
  }

  // Expose minimal API on window for reuse in other handlers
  window.__cart = { addItem, loadCart, updateCounter };
  updateCounter();
  renderDropdown();
  setupToggle();
})();

// Add to cart animation
function addToCartAnimation() {
  const addToCartButtons = document.querySelectorAll(".product-card .cart-btn");
  const cartIcon = document.querySelector(".nav-cart-icon");
  const cartCounter = document.querySelector(".cart-counter");

  if (!addToCartButtons.length || !cartIcon || !cartCounter) {
    return;
  }

  // Initialize counter from storage
  if (window.__cart && window.__cart.updateCounter)
    window.__cart.updateCounter();

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      console.log(button);
      e.preventDefault();

      const card = button.closest(".product-card");
      const productImageDiv = card.querySelector(".product-image");

      if (!productImageDiv) return;

      // Get background image URL from computed style
      const style = window.getComputedStyle(productImageDiv);
      const bgImage = style.backgroundImage;

      // Exit if no background image
      if (!bgImage || bgImage === "none") return;

      // Extract URL from 'url("...")'
      const imageUrl = bgImage.slice(5, -2);

      const productImageRect = productImageDiv.getBoundingClientRect();
      const cartIconRect = cartIcon.getBoundingClientRect();

      // Create a new img element for the animation
      const flyingImage = document.createElement("img");
      flyingImage.src = imageUrl;
      flyingImage.style.position = "fixed";
      flyingImage.style.left = `${productImageRect.left}px`;
      flyingImage.style.top = `${productImageRect.top}px`;
      flyingImage.style.width = `${productImageRect.width}px`;
      flyingImage.style.height = `${productImageRect.height}px`;
      flyingImage.style.zIndex = "1000";
      flyingImage.style.transition = "all 1s ease-in-out";
      flyingImage.style.borderRadius = "20px";
      flyingImage.style.objectFit = "cover";

      document.body.appendChild(flyingImage);

      requestAnimationFrame(() => {
        flyingImage.style.left = `${
          cartIconRect.left + cartIconRect.width / 2
        }px`;
        flyingImage.style.top = `${
          cartIconRect.top + cartIconRect.height / 2
        }px`;
        flyingImage.style.width = "0px";
        flyingImage.style.height = "0px";
        flyingImage.style.transform = "rotate(360deg)";
      });

      setTimeout(() => {
        flyingImage.remove();
        // Extract product data from card
        const name = (card.querySelector("h4")?.textContent || "").trim();
        const priceText = (
          card.querySelector("span")?.textContent || "0"
        ).replace(/[^0-9.]/g, "");
        const price = Number(priceText || 0);
        // Build an ID from name as products page is demo (no explicit IDs)
        const id = name ? name.hashCode?.() || name.length + price : Date.now();
        const product = { id, name, price, img: imageUrl };
        if (window.__cart)
          window.__cart.addItem ? window.__cart.addItem(product) : null;
        if (window.__cart && window.__cart.updateCounter)
          window.__cart.updateCounter();

        // Bounce effect
        cartIcon.classList.add("bounce");
        setTimeout(() => {
          cartIcon.classList.remove("bounce");
        }, 300);
      }, 1000);
    });
  });
}
addToCartAnimation();

// Perfume Advisor logic
(function () {
  // Ensure we are on the advisor page
  const advisorSection = document.getElementById("perfume-advisor");
  if (!advisorSection) return;

  const steps = Array.from(advisorSection.querySelectorAll(".advisor-step"));
  const resultsGrid = document.getElementById("advisor-results");
  const restartBtn = document.getElementById("advisor-restart");
  const mainEl = document.querySelector("main.advisor-main") || advisorSection;
  const emptyEl = document.getElementById("advisor-empty");

  const state = {
    feeling: null,
    scent: null,
    time: null,
  };

  function goToStep(n) {
    steps.forEach((s) => s.classList.remove("active"));
    const target = steps.find((s) => s.dataset.step === String(n));
    if (target) {
      target.classList.add("active");
      // smooth scroll to the active block (helpful on mobile)
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function setBgByScent(scent) {
    if (!mainEl) return;
    const classes = ["bg-floral", "bg-fruity", "bg-woody", "bg-oriental"];
    mainEl.classList.remove(...classes);
    if (!scent) return;
    switch (scent) {
      case "floral":
        mainEl.classList.add("bg-floral");
        break;
      case "fruity":
        mainEl.classList.add("bg-fruity");
        break;
      case "woody":
        mainEl.classList.add("bg-woody");
        break;
      case "oriental":
        mainEl.classList.add("bg-oriental");
        break;
    }
  }

  // Demo product pool (could be replaced with real data)
  const products = [
    // Oriental
    {
      id: "1",
      name: "عود الكمبودي",
      price: 350,
      scent: "oriental",
      times: ["night", "occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756883898/oud-cambodi_cqbvgj.avif",
    },
    {
      id: "2",
      name: "عنبر سلطاني",
      price: 10800,
      scent: "oriental",
      times: ["night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885368/Sultani-Amber-wood-0301020560_h4kmyx.jpg",
    },
    {
      id: "3",
      name: "زعفران الشرق",
      price: 25524,
      scent: "oriental",
      times: ["occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885362/saffron_aybdwj.avif",
    },
    {
      id: 4,
      name: "عود بخور ماليزي",
      price: 10371,
      scent: "oriental",
      times: ["occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885362/oud-malaysian_xsfaj2.avif",
    },
    {
      id: 5,
      name: "فانيليا شرقية",
      price: 17498,
      scent: "oriental",
      times: ["day", "night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885363/vanilla-oriental_xctji4.avif",
    },
    {
      id: 6,
      name: "عنبر كشميري",
      price: 11750,
      scent: "oriental",
      times: ["night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885364/amber-kashmiri_zvxhhs.avif",
    },
    {
      id: 7,
      name: "عود لاوسي",
      price: 625,
      scent: "oriental",
      times: ["night", "occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885362/oud-laos_qh45qm.webp",
    },
    {
      id: 8,
      name: "بخور ملكي",
      price: 330,
      scent: "oriental",
      times: ["occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885367/bakhoor_s2tz3r.avif",
    },
    {
      id: 9,
      name: "عود كمبودي محسن",
      price: 390,
      scent: "oriental",
      times: ["night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885367/oud-cambodi-premium_hjxord.avif",
    },
    {
      id: 10,
      name: "زعفران مذهب",
      price: 265,
      scent: "oriental",
      times: ["day"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885362/saffron_aybdwj.avif",
    },
    {
      id: 11,
      name: "عنبر دافئ",
      price: 240,
      scent: "oriental",
      times: ["day"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885368/Sultani-Amber-wood-0301020560_h4kmyx.jpg",
    },
    {
      id: 12,
      name: "عود ملكي",
      price: 410,
      scent: "oriental",
      times: ["occasion", "night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885362/oud-malaysian_xsfaj2.avif",
    },

    // Floral
    {
      id: 20,
      name: "ورد طائفي",
      price: 10600,
      scent: "floral",
      times: ["day", "occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885363/taif-rose_uic1wm.avif",
    },
    {
      id: 21,
      name: "لافندر مراكش",
      price: 5800,
      scent: "floral",
      times: ["day"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756886240/lavender_eyjvkp.avif",
    },
    {
      id: 22,
      name: "ياسمين عربي",
      price: 1700,
      scent: "floral",
      times: ["day"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885365/jasmine_ad9n0k.avif",
    },
    {
      id: 23,
      name: "مسك الطهارة",
      price: 210,
      scent: "floral",
      times: ["day", "occasion"],
      img: "assets/img/P/musk-tahara.jpg",
    },
    {
      id: 24,
      name: "حديقة الزهور",
      price: 195,
      scent: "floral",
      times: ["day", "night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885365/jasmine_ad9n0k.avif",
    },
    {
      id: 25,
      name: "رحيق الورود",
      price: 230,
      scent: "floral",
      times: ["occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885363/taif-rose_uic1wm.avif",
    },
    {
      id: 26,
      name: "بتلات ناعمة",
      price: 185,
      scent: "floral",
      times: ["night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756886240/lavender_eyjvkp.avif",
    },

    // Woody
    {
      id: 30,
      name: "مسك أبيض",
      price: 200,
      scent: "woody",
      times: ["day"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885364/white-musk_b1orxj.avif",
    },
    {
      id: 31,
      name: "المسك الأسود",
      price: 220,
      scent: "woody",
      times: ["night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885368/black-musk_yprcav.avif",
    },
    {
      id: 32,
      name: "صندل عربي",
      price: 250,
      scent: "woody",
      times: ["day", "night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885362/sandal_to2kwj.avif",
    },
    {
      id: 33,
      name: "خشب الصندل الفاخر",
      price: 270,
      scent: "woody",
      times: ["occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885362/sandal_to2kwj.avif",
    },
    {
      id: 34,
      name: "أرز جبلي",
      price: 240,
      scent: "woody",
      times: ["day"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885368/black-musk_yprcav.avif",
    },
    {
      id: 35,
      name: "مسك الغزال",
      price: 310,
      scent: "woody",
      times: ["night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756886183/musk-ghazal_fl9xfv.avif",
    },

    // Fruity (add broad coverage)
    {
      id: 40,
      name: "رذاذ التفاح",
      price: 160,
      scent: "fruity",
      times: ["day"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885363/vanilla-oriental_xctji4.avif",
    },
    {
      id: 41,
      name: "توت بري",
      price: 170,
      scent: "fruity",
      times: ["night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885369/pink-musk_yifwyn.avif",
    },
    {
      id: 42,
      name: "مشمش رقيق",
      price: 165,
      scent: "fruity",
      times: ["day", "occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885363/vanilla-oriental_xctji4.avif",
    },
    {
      id: 43,
      name: "حمضيات متوسطية",
      price: 175,
      scent: "fruity",
      times: ["day"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885369/pink-musk_yifwyn.avif",
    },
    {
      id: 44,
      name: "مانجو شرقي",
      price: 185,
      scent: "fruity",
      times: ["occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885363/vanilla-oriental_xctji4.avif",
    },
    {
      id: 45,
      name: "رمان ليلي",
      price: 190,
      scent: "fruity",
      times: ["night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885369/pink-musk_yifwyn.avif",
    },

    // Cross coverage to reach ~90%
    {
      id: 50,
      name: "باقات مساء",
      price: 205,
      scent: "floral",
      times: ["night"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885365/jasmine_ad9n0k.avif",
    },
    {
      id: 51,
      name: "دفء الصحراء",
      price: 295,
      scent: "oriental",
      times: ["day"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885364/amber-kashmiri_zvxhhs.avif",
    },
    {
      id: 52,
      name: "نسيم الغابة",
      price: 235,
      scent: "woody",
      times: ["occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885362/sandal_to2kwj.avif",
    },
    {
      id: 53,
      name: "سحر الشرق",
      price: 315,
      scent: "oriental",
      times: ["night", "occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885362/oud-laos_qh45qm.webp",
    },
    {
      id: 54,
      name: "ندى الصباح",
      price: 175,
      scent: "floral",
      times: ["day"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756886240/lavender_eyjvkp.avif",
    },
    {
      id: 55,
      name: "ليلة فواكه",
      price: 195,
      scent: "fruity",
      times: ["night", "occasion"],
      img: "https://res.cloudinary.com/dji6rydrr/image/upload/v1756885369/pink-musk_yifwyn.avif",
    },
  ];

  function pickSuggestions() {
    // Strict matching by scent AND time
    let pool = products.filter(
      (p) =>
        (!state.scent || p.scent === state.scent) &&
        (!state.time || p.times.includes(state.time))
    );

    // feeling heuristic: prioritize based on feeling (only sorting; no fallback)
    const feelingBoost =
      {
        fresh: ["fruity", "floral"],
        romantic: ["floral", "oriental"],
        warm: ["woody", "oriental"],
        adventurous: ["oriental", "woody"],
      }[state.feeling] || [];

    pool.sort(
      (a, b) => feelingBoost.indexOf(b.scent) - feelingBoost.indexOf(a.scent)
    );
    return pool.slice(0, 3);
  }

  function renderResults(items) {
    if (!resultsGrid) return;
    // Empty-state handling
    if (emptyEl) emptyEl.classList.add("hidden");
    resultsGrid.innerHTML = "";

    if (!items || items.length === 0) {
      if (emptyEl) emptyEl.classList.remove("hidden");
      return;
    }

    items.forEach((p, i) => {
      const card = document.createElement("div");
      card.className =
        "result-card rounded-xl overflow-hidden bg-white/10 border border-white/20 backdrop-blur translate-y-6 opacity-0 transition-all duration-500";
      card.style.transitionDelay = `${i * 120}ms`;
      card.innerHTML = `
        <div class="relative h-56 w-full rounded-lg overflow-hidden bg-center bg-cover" style="background: url('${
          p.img
        }') no-repeat center/contain;">
          <span class="absolute top-2 left-2 px-2 py-1 rounded-md text-xs bg-black/50 text-white">$${p.price.toFixed(
            2
          )}</span>
        </div>
        <div class="mt-3 flex items-center justify-between p-2">
          <div>
            <h3 class="text-base font-bold">${p.name}</h3>
            <div class="text-xs opacity-80">${
              p.scent === "floral"
                ? "زهور"
                : p.scent === "fruity"
                ? "فواكه"
                : p.scent === "woody"
                ? "أخشاب"
                : "شرقي"
            }</div>
          </div>
          <button class="cta px-3 py-2 rounded-md text-xs advisor-add">أضفه للسلة</button>
        </div>
      `;
      resultsGrid.appendChild(card);
      requestAnimationFrame(() => {
        card.classList.remove("translate-y-6", "opacity-0");
        card.classList.add("translate-y-0", "opacity-100");
      });

      // Hook add-to-cart with animation from advisor results
      const btn = card.querySelector(".advisor-add");
      if (btn) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const imgDiv = card.querySelector(".relative");
          const style = window.getComputedStyle(imgDiv);
          const bgImage = style.backgroundImage;
          if (!bgImage || bgImage === "none") return;
          const imageUrl = bgImage.slice(5, -2);
          const cartIcon = document.querySelector(".nav-cart-icon");
          if (!cartIcon) return;
          const imgRect = imgDiv.getBoundingClientRect();
          const cartRect = cartIcon.getBoundingClientRect();

          const flyingImage = document.createElement("img");
          flyingImage.src = imageUrl;
          flyingImage.style.position = "fixed";
          flyingImage.style.left = `${imgRect.left}px`;
          flyingImage.style.top = `${imgRect.top}px`;
          flyingImage.style.width = `${imgRect.width}px`;
          flyingImage.style.height = `${imgRect.height}px`;
          flyingImage.style.zIndex = "1000";
          flyingImage.style.transition = "all 1s ease-in-out";
          flyingImage.style.borderRadius = "20px";
          flyingImage.style.objectFit = "cover";
          document.body.appendChild(flyingImage);

          requestAnimationFrame(() => {
            flyingImage.style.left = `${cartRect.left + cartRect.width / 2}px`;
            flyingImage.style.top = `${cartRect.top + cartRect.height / 2}px`;
            flyingImage.style.width = "0px";
            flyingImage.style.height = "0px";
            flyingImage.style.transform = "rotate(360deg)";
          });

          setTimeout(() => {
            flyingImage.remove();
            if (window.__cart)
              window.__cart.addItem?.({
                id: p.id,
                name: p.name,
                price: p.price,
                img: p.img,
              });
            window.__cart?.updateCounter?.();
            cartIcon.classList.add("bounce");
            setTimeout(() => {
              cartIcon.classList.remove("bounce");
            }, 300);
          }, 1000);
        });
      }
    });
  }

  function currentStepNumber() {
    const active = advisorSection.querySelector(".advisor-step.active");
    return active ? Number(active.dataset.step) : 1;
  }

  function canProceed(stepNum) {
    switch (stepNum) {
      case 1:
        return !!state.feeling;
      case 2:
        return !!state.scent;
      case 3:
        return !!state.time;
      default:
        return true;
    }
  }

  function showValidationHint() {
    // Simple UX: alert; can be replaced by visual hint
    alert("من فضلك اختر إجابة قبل المتابعة");
  }

  function clearSelections(selector) {
    advisorSection
      .querySelectorAll(selector)
      .forEach((btn) => btn.classList.remove("selected"));
  }

  // Step 1: feeling
  advisorSection.addEventListener("click", (e) => {
    const target = e.target;
    if (target.matches(".feeling-btn")) {
      clearSelections(".feeling-btn");
      target.classList.add("selected");
      state.feeling = target.getAttribute("data-feeling");
      // stay until user presses التالي or allow auto-advance? Keep as is: do not auto-advance
    }
  });

  // Step 2: scent
  advisorSection.addEventListener("click", (e) => {
    const target = e.target;
    if (target.matches(".scent-btn")) {
      clearSelections(".scent-btn");
      target.classList.add("selected");
      state.scent = target.getAttribute("data-scent");
      setBgByScent(state.scent);
      // do not auto-advance; wait for التالي
    }
  });

  // Step 3: time
  advisorSection.addEventListener("click", (e) => {
    const target = e.target;
    if (target.matches(".time-btn")) {
      clearSelections(".time-btn");
      target.classList.add("selected");
      state.time = target.getAttribute("data-time");
      // wait for عرض النتائج or التالي
    }
  });

  // Prev/Next controls
  advisorSection.addEventListener("click", (e) => {
    const target = e.target;
    if (target.matches(".advisor-prev")) {
      const step = currentStepNumber();
      if (step > 1) goToStep(step - 1);
    }
    if (target.matches(".advisor-next")) {
      const step = currentStepNumber();
      if (!canProceed(step)) return showValidationHint();
      if (step < 3) {
        goToStep(step + 1);
      } else if (step === 3) {
        const picks = pickSuggestions();
        renderResults(picks);
        goToStep(4);
      }
    }
  });

  // Restart
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      state.feeling = state.scent = state.time = null;
      clearSelections(".feeling-btn");
      clearSelections(".scent-btn");
      clearSelections(".time-btn");
      resultsGrid.innerHTML = "";
      setBgByScent(null);
      if (emptyEl) emptyEl.classList.add("hidden");
      goToStep(1);
    });

    // Add a Go to Products button next to restart (once)
    if (!document.getElementById("go-products-btn")) {
      const wrapper = restartBtn.parentElement;
      if (wrapper) {
        const link = document.createElement("a");
        link.id = "go-products-btn";
        link.href = "./products.html";
        link.className = "btn-tile";
        link.textContent = "اذهب للمنتجات";
        wrapper.appendChild(link);
      }
    }
  }
})();

// load img product local storage
function renderOrderSummary() {
  const CART_KEY = "cartItems";
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  }
  const items = loadCart();
  const largeImageContainer = document.getElementById("large-product-image");
  const miniatureImagesContainer = document.getElementById(
    "miniature-product-images"
  );

  if (!largeImageContainer || !miniatureImagesContainer) {
    console.error("Order summary containers not found");
    return;
  }

  // Clear existing content
  largeImageContainer.innerHTML = "";
  miniatureImagesContainer.innerHTML = "";

  if (items && items.length > 0) {
    // Display large image for the first product
    const firstProduct = items[0];
    const largeImage = document.createElement("img");
    largeImage.src = firstProduct.img;
    largeImage.alt = firstProduct.name;
    largeImage.className = "w-64 h-64 object-cover rounded-lg shadow-md";
    largeImageContainer.appendChild(largeImage);

    // Display miniature images for the remaining products
    if (items.length > 1) {
      for (let i = 1; i < items.length; i++) {
        const product = items[i];
        const miniatureImage = document.createElement("img");
        miniatureImage.src = product.img;
        miniatureImage.alt = product.name;
        miniatureImage.className =
          "w-16 h-16 object-cover rounded-lg shadow-md m-1";
        miniatureImagesContainer.appendChild(miniatureImage);
      }
    }
  } else {
    // Display a default message if the cart is empty
    largeImageContainer.textContent = "السلة فارغة";
  }
  const total = items.reduce((s, it) => s + it.price * (it.qty || 1), 0);
  document.querySelector(".total").textContent = `${total}$`;
}

// Call renderOrderSummary when the page loads or when the cart changes
document.addEventListener("DOMContentLoaded", () => {
  // ... your existing code ...
  renderOrderSummary();
});

// Add event listeners to the form inputs
if (document.querySelector(".checkout-page")) {
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");
  const cardInput = document.getElementById("card");
  const phoneStatus = document.getElementById("phone-status");
  const emailStatus = document.getElementById("email-status");
  const cardType = document.getElementById("card-type");
  const checkoutForm = document.getElementById("checkout-form");
  const checkoutContainer = document.getElementById("checkout-container");
  const thankYouMessage = document.getElementById("thank-you-message");

  // Phone Validation
  phoneInput.addEventListener("input", () => {
    const isValid = phoneInput.value.length === 11; // Example validation
    phoneStatus.innerHTML = isValid
      ? '<i class="fas fa-check-circle text-green-500"></i>'
      : '<i class="fas fa-times-circle text-red-500"></i>';
  });

  // Email Validation
  emailInput.addEventListener("input", () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
    emailStatus.innerHTML = isValid
      ? '<i class="fas fa-check-circle text-green-500"></i>'
      : '<i class="fas fa-times-circle text-red-500"></i>';
  });

  // Card Formatting and Type Detection
  cardInput.addEventListener("input", () => {
    let formattedNumber = cardInput.value.replace(/\D/g, "").substring(0, 16);
    formattedNumber = formattedNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
    cardInput.value = formattedNumber;

    const cardNumber = cardInput.value.replace(/\s/g, "");
    let type = "";

    if (cardNumber.startsWith("4")) {
      type = "Visa";
    } else if (cardNumber.startsWith("5")) {
      type = "Mastercard";
    }

    cardType.textContent = type ? `Card Type: ${type}` : "";
  });

  // Form Submission
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Simulate payment processing (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Hide form and show thank you message
    checkoutContainer.classList.add("hidden");
    thankYouMessage.classList.remove("hidden");
    thankYouMessage.classList.add("animate-fade"); // Add fade animation
  });
}

// ===== Popup Logic =====
document.addEventListener("DOMContentLoaded", () => {
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    card.addEventListener("click", () => {
      console.log(card);
      // لو في بوب أب مفتوح قبل كدا، امسحه
      const oldPopup = document.getElementById("product-popup");
      if (oldPopup) oldPopup.remove();

      // إنشاء الغلاف
      const popup = document.createElement("div");
      popup.id = "product-popup";
      popup.className =
        "fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[9999]";

      // إنشاء البوب أب
      popup.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl flex flex-col md:flex-row overflow-hidden transform scale-90 opacity-0 transition-all duration-300">
          
          <!-- النص -->
          <div class="w-full md:w-1/2 p-6 flex flex-col justify-center">
            <h2 class="text-2xl font-bold mb-4">عطر فاخر</h2>
            <p class="text-gray-600 mb-4 leading-relaxed">
              عرض المنتج بشكل يُشعر العميل بالفخامة والتفرد.
            </p>
            <p class="text-gray-800 mb-6">
              <strong>خريطة المكونات:</strong><br>
              Top: روائح حمضية<br>
              Heart: ياسمين<br>
              Base: مسك
            </p>
            <button class="bg-[#03144f] text-white px-5 py-3 rounded-xl hover:bg-[#1a2b6b] transition">
              ➕ أضف للعربة
            </button>
          </div>

          <!-- الصورة -->
          <div class="w-full md:w-1/2">
            <img src="./assets/img/hero-bg-1.jpg" 
                 class="w-full h-full object-cover" alt="Perfume">
          </div>

          <!-- زر إغلاق -->
          <button id="popup-close" 
            class="absolute top-4 right-4 text-gray-700 hover:text-red-600 text-3xl font-bold">
            &times;
          </button>
        </div>
      `;

      document.body.appendChild(popup);

      // انيميشن الظهور
      setTimeout(() => {
        const modalBox = popup.querySelector("div");
        modalBox.classList.remove("scale-90", "opacity-0");
        modalBox.classList.add("scale-100", "opacity-100");
      }, 50);

      // زر إغلاق
      const closeBtn = popup.querySelector("#popup-close");
      closeBtn.addEventListener("click", () => {
        popup.remove();
      });

      // كليك برا البوب أب يقفله
      popup.addEventListener("click", (e) => {
        if (e.target === popup) {
          popup.remove();
        }
      });
    });
  });
});
