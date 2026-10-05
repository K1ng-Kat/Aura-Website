(() => {
  const config = {
    clientToken: "",
    prices: {
      monthly: "pri_01m44vf3jc6j3pc9t6r7kgtx6e",
      lifetime: "pri_01m44vhcrws4p0vgnq6avgpq7d"
    },
    display: {
      monthly: { name: "Monthly", price: "$2.99", totalLabel: "Due today" },
      lifetime: { name: "Lifetime", price: "$15.99", totalLabel: "Due today" }
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
  let selectedPlan = queryPlan === "lifetime" ? "lifetime" : "monthly";

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
    if (!config.clientToken || !window.Paddle) {
      button.disabled = true;
      buttonLabel.textContent = "Secure checkout activating";
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
    if (button.disabled || !window.Paddle) return;

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
