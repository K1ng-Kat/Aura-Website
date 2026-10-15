(() => {
  const config = {
    clientToken: "",
    prices: {
      // Web checkout is disabled until actual products match current pricing.
      // Do not reuse the previous price IDs with the former $1.99/$14.49 pricing.
      monthly: "",
      yearly: "",
      lifetime: ""
    },
    display: {
      monthly: { name: "Monthly", price: "$2.99", totalLabel: "Payment unavailable" },
      yearly: { name: "Yearly", price: "$29.99/year", totalLabel: "Billed in-app by Apple" },
      lifetime: { name: "Lifetime", price: "$49.99", totalLabel: "Payment unavailable" }
    }
  };

  const plans = [...document.querySelectorAll("[data-checkout-plan]")];
  const button = document.querySelector("[data-checkout-button]");
  const buttonLabel = document.querySelector("[data-checkout-button-label]");
  const status = document.querySelector("[data-checkout-status]");
  const summaryName = document.querySelector("[data-checkout-summary-name]");
  const summaryPrice = document.querySelector("[data-checkout-summary-price]");
  const total = document.querySelector("[data-checkout-total]");
  const totalLabel = document.querySelector("[data-checkout-total-label]");

  if (!plans.length || !button) return;

  const queryPlan = new URLSearchParams(window.location.search).get("plan");
  let selectedPlan = Object.prototype.hasOwnProperty.call(config.display, queryPlan) ? queryPlan : "monthly";

  const render = () => {
    plans.forEach(plan => {
      const active = plan.dataset.checkoutPlan === selectedPlan;
      plan.classList.toggle("selected", active);
      plan.setAttribute("aria-pressed", String(active));
    });

    const info = config.display[selectedPlan];
    summaryName.textContent = info.name;
    summaryPrice.textContent = info.price;
    total.textContent = info.price;
    totalLabel.textContent = info.totalLabel;
    button.disabled = true;
    buttonLabel.textContent = "Web checkout unavailable";
    status.textContent = selectedPlan === "yearly"
      ? "Yearly offers 7 days free only to eligible customers, then $29.99/year with automatic renewal unless canceled. The Mac App Store handles the purchase and trial."
      : "Aura Pro purchases are handled in-app through Apple's Mac App Store. Web checkout is not yet active.";

    const url = new URL(window.location.href);
    url.searchParams.set("plan", selectedPlan);
    window.history.replaceState({}, "", url);
  };

  plans.forEach(plan => {
    plan.addEventListener("click", () => {
      selectedPlan = plan.dataset.checkoutPlan;
      render();
    });
  });

  const enablePaddle = () => {
    if (!config.clientToken || !config.prices[selectedPlan] || !window.Paddle) {
      button.disabled = true;
      buttonLabel.textContent = "Web checkout unavailable";
      return;
    }

    try {
      window.Paddle.Initialize({
        token: config.clientToken,
        eventCallback: event => {
          if (event?.name === "checkout.completed") {
            status.textContent = "Purchase complete. Check your email for your Paddle receipt and Aura Pro purchase details.";
          }
        }
      });
      button.disabled = false;
      buttonLabel.textContent = "Continue to secure checkout";
    } catch {
      button.disabled = true;
      buttonLabel.textContent = "Checkout temporarily unavailable";
    }
  };

  button.addEventListener("click", () => {
    if (button.disabled || !window.Paddle || !config.prices[selectedPlan]) return;

    window.Paddle.Checkout.open({
      items: [{ priceId: config.prices[selectedPlan], quantity: 1 }],
      settings: {
        displayMode: "overlay",
        theme: "dark",
        locale: "en"
      }
    });
  });

  render();
  enablePaddle();
})();
