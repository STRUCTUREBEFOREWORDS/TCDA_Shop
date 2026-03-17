document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector(".nav-links");

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 14);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const revealNodes = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" }
    );
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("in-view"));
  }

  const STORAGE_KEY = "tcda-project-cart-v1";
  const parseJSON = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const getCart = () => parseJSON(localStorage.getItem(STORAGE_KEY), []);
  const setCart = (cart) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
  };

  const updateCartCount = () => {
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
      node.textContent = String(count);
    });
  };

  updateCartCount();

  document.querySelectorAll(".size-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest(".size-row");
      if (!group) return;
      group.querySelectorAll(".size-btn").forEach((b) => b.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
    });
  });

  document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      const cart = getCart();
      const id = button.getAttribute("data-product-id") || "product";
      const name = button.getAttribute("data-product-name") || "TCDA Product";
      const price = Number(button.getAttribute("data-product-price") || 0);
      const size = document.querySelector(".size-btn[aria-pressed='true']")?.textContent?.trim() || "M";

      const i = cart.findIndex((item) => item.id === id && item.size === size);
      if (i > -1) {
        cart[i].quantity += 1;
      } else {
        cart.push({ id, name, price, size, quantity: 1 });
      }

      setCart(cart);
      button.textContent = "Added";
      button.disabled = true;
      setTimeout(() => {
        button.textContent = "Add to Cart";
        button.disabled = false;
      }, 1200);
    });
  });

  document.querySelectorAll("[data-checkout-placeholder]").forEach((button) => {
    button.addEventListener("click", () => {
      const status = document.querySelector("[data-checkout-status]");
      if (status) {
        status.textContent = "Secure checkout placeholder: Stripe/Printful integration prepared for future backend connection.";
      }
    });
  });
});
