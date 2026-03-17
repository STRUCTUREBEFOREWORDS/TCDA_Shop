(function () {
  const STORAGE_KEY = "tcda-cart-v1";

  const runtime = window.TCDA_RUNTIME_CONFIG || {};

  const config = {
    apiBase: runtime.apiBase || "/api",
    catalogEndpoint: runtime.catalogEndpoint || "/api/catalog",
    stripeCheckoutEndpoint: runtime.stripeCheckoutEndpoint || "/api/checkout/stripe-session",
    printfulOrderEndpoint: runtime.printfulOrderEndpoint || "/api/fulfillment/printful-order",
    accountEndpoint: runtime.accountEndpoint || "/api/account",
    currency: runtime.currency || "JPY",
    checkoutProvider: "stripe",
    fulfillmentProvider: "printful",
  };

  const safeParse = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const getCart = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return Array.isArray(safeParse(raw, [])) ? safeParse(raw, []) : [];
  };

  const setCart = (cart) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("tcda:cart:updated", { detail: cart }));
  };

  const addToCart = (item) => {
    const cart = getCart();
    const index = cart.findIndex((entry) => entry.id === item.id && entry.size === item.size);

    if (index > -1) {
      cart[index].quantity += item.quantity;
    } else {
      cart.push(item);
    }

    setCart(cart);
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartCount = () => getCart().reduce((sum, item) => sum + item.quantity, 0);

  const requestJson = async (url, payload) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.message || "Request failed";
      throw new Error(message);
    }
    return data;
  };

  const createCheckoutSession = async (input = {}) => {
    const cart = getCart();

    if (cart.length === 0) {
      throw new Error("Your cart is empty");
    }

    const payload = {
      provider: config.checkoutProvider,
      cart,
      currency: config.currency,
      successUrl: input.successUrl || `${location.origin}/shop.html?checkout=success`,
      cancelUrl: input.cancelUrl || `${location.origin}/shop.html?checkout=cancel`,
      customerEmail: input.customerEmail || null,
    };

    const data = await requestJson(config.stripeCheckoutEndpoint, payload);
    return {
      ok: true,
      provider: config.checkoutProvider,
      ...data,
    };
  };

  const fetchCatalog = async () => {
    const response = await fetch(config.catalogEndpoint).catch(() => null);
    if (!response || !response.ok) return [];
    return response.json();
  };

  const createPrintfulOrder = async (input = {}) => {
    const cart = getCart();

    if (cart.length === 0) {
      throw new Error("Cannot create order from empty cart");
    }

    const payload = {
      provider: config.fulfillmentProvider,
      items: cart,
      customer: input.customer || null,
      shippingAddress: input.shippingAddress || null,
      metadata: {
        source: "tcda-web",
        createdAt: new Date().toISOString(),
      },
    };

    return requestJson(config.printfulOrderEndpoint, payload);
  };

  const startCheckoutFlow = async (button) => {
    const originalText = button.textContent;
    const statusNode = document.querySelector("[data-checkout-status]");

    button.disabled = true;
    button.textContent = "Processing...";

    try {
      const session = await createCheckoutSession();

      if (statusNode) {
        statusNode.textContent = "Secure checkout session created.";
      }

      if (session.url) {
        window.location.href = session.url;
        return;
      }

      button.textContent = "Session Ready";
    } catch (error) {
      if (statusNode) {
        statusNode.textContent = error.message || "Checkout could not start.";
      }
      button.textContent = "Checkout Unavailable";
    }

    setTimeout(() => {
      button.disabled = false;
      button.textContent = originalText;
    }, 1800);
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-to-cart]");
    if (!button) {
      const checkoutButton = event.target.closest("[data-start-checkout]");
      if (!checkoutButton) return;
      startCheckoutFlow(checkoutButton);
      return;
    }

    const productId = button.getAttribute("data-product-id");
    const productName = button.getAttribute("data-product-name");
    const price = Number(button.getAttribute("data-product-price") || 0);
    const selectedSize = document.querySelector(".size-btn[aria-pressed='true']")?.textContent?.trim() || "M";

    addToCart({
      id: productId,
      name: productName,
      price,
      size: selectedSize,
      quantity: 1,
    });

    button.textContent = "Added";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = "Add to Cart";
      button.disabled = false;
    }, 1200);
  });

  window.TCDACommerce = {
    config,
    getCart,
    getCartCount,
    addToCart,
    clearCart,
    createCheckoutSession,
    createPrintfulOrder,
    fetchCatalog,
  };
})();