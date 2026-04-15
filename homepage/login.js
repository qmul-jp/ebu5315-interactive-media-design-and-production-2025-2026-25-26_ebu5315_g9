(() => {
  const form = document.querySelector("[data-login-form]");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const emailInput = form.querySelector("#loginEmail");
  const passwordInput = form.querySelector("#loginPassword");
  const feedback = form.querySelector("[data-login-feedback]");
  const helpButton = form.querySelector("[data-login-help]");

  if (
    !(emailInput instanceof HTMLInputElement) ||
    !(passwordInput instanceof HTMLInputElement) ||
    !feedback
  ) {
    return;
  }

  const fields = [emailInput, passwordInput];

  const showFeedback = (message, state = "info") => {
    feedback.hidden = false;
    feedback.textContent = message;
    feedback.classList.toggle("is-error", state === "error");
    feedback.classList.toggle("is-success", state === "success");
  };

  const clearFeedback = () => {
    feedback.hidden = true;
    feedback.textContent = "";
    feedback.classList.remove("is-error", "is-success");
  };

  const clearFieldError = (input) => {
    input.removeAttribute("aria-invalid");
  };

  const validateField = (input) => {
    input.setCustomValidity("");

    if (input.checkValidity()) {
      clearFieldError(input);
      return "";
    }

    input.setAttribute("aria-invalid", "true");
    return input.validationMessage || "Please check this field and try again.";
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFeedback();

    for (const input of fields) {
      const message = validateField(input);
      if (message) {
        showFeedback(message, "error");
        input.focus();
        return;
      }
    }

    showFeedback(
      "Login demo complete. This static page validates in the browser and is ready to connect to a real auth service.",
      "success"
    );
  });

  fields.forEach((input) => {
    input.addEventListener("input", () => {
      clearFieldError(input);
      if (!feedback.hidden) {
        clearFeedback();
      }
    });
  });

  if (helpButton instanceof HTMLButtonElement) {
    helpButton.addEventListener("click", () => {
      showFeedback(
        "Password recovery is not connected yet in this static build. Hook this button to your email reset flow when the auth service is ready."
      );
    });
  }
})();
