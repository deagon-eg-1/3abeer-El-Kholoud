// Mobile Navigation
document.addEventListener("DOMContentLoaded", function () {
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  const toggleIcon = mobileToggle.querySelector("i");

  // Toggle mobile menu
  function toggleMobileMenu() {
    const isActive = sidebar.classList.contains("active");
    
    if (isActive) {
      // Close menu
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      toggleIcon.className = "fa-solid fa-bars";
      document.body.style.overflow = "";
    } else {
      // Open menu
      sidebar.classList.add("active");
      overlay.classList.add("active");
      toggleIcon.className = "fa-solid fa-times";
      document.body.style.overflow = "hidden";
    }
  }

  // Event listeners
  mobileToggle.addEventListener("click", toggleMobileMenu);
  overlay.addEventListener("click", toggleMobileMenu);

  // Close menu when clicking on sidebar links
  const sidebarLinks = sidebar.querySelectorAll("a");
  sidebarLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (sidebar.classList.contains("active")) {
        toggleMobileMenu();
      }
    });
  });

  // Close menu on escape key
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && sidebar.classList.contains("active")) {
      toggleMobileMenu();
    }
  });

  // Handle window resize
  window.addEventListener("resize", function() {
    if (window.innerWidth > 768 && sidebar.classList.contains("active")) {
      toggleMobileMenu();
    }
  });

  // Improve touch handling for mobile devices
  let touchStartY = 0;
  let touchEndY = 0;
  
  sidebar.addEventListener("touchstart", function(e) {
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  
  sidebar.addEventListener("touchend", function(e) {
    touchEndY = e.changedTouches[0].screenY;
    const swipeDistance = touchStartY - touchEndY;
    
    // If swiped up significantly, close menu (for better UX on mobile)
    if (Math.abs(swipeDistance) > 100 && swipeDistance > 0) {
      // Optionally close on upward swipe
      // toggleMobileMenu();
    }
  }, { passive: true });
});

// Enhanced scroll behavior for mobile
document.addEventListener("DOMContentLoaded", function() {
  // Prevent scroll bounce on iOS
  document.addEventListener("touchmove", function(e) {
    if (document.body.style.overflow === "hidden") {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});