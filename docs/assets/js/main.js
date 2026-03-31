document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const cartCount = document.querySelector("[data-cart-count]");

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealNodes = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealNodes.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8%" }
    );
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("in-view"));
  }

  document.querySelectorAll(".size-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest(".size-row");
      if (!group) return;
      group.querySelectorAll(".size-btn").forEach((btn) => btn.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
    });
  });

  const syncCartCount = () => {
    if (!cartCount) return;
    const amount = window.TCDACommerce?.getCartCount?.() ?? 0;
    cartCount.textContent = String(amount);
  };

  syncCartCount();
  window.addEventListener("tcda:cart:updated", syncCartCount);
});