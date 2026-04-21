(() => {
  const preferences = window.CircleLabPreferences || null;
  const t = (key, fallback = "") =>
    preferences?.t ? preferences.t(key, fallback) : fallback;
  const form = document.querySelector("[data-contact-form]");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const nameInput = form.querySelector("#contactName");
  const emailInput = form.querySelector("#contactEmail");
  const topicInput = form.querySelector("#contactTopic");
  const messageInput = form.querySelector("#contactMessage");
  const feedback = form.querySelector("[data-contact-feedback]");
  const topicWrap = form.querySelector(".contact-select-wrap");

  if (
    !(nameInput instanceof HTMLInputElement) ||
    !(emailInput instanceof HTMLInputElement) ||
    !(topicInput instanceof HTMLSelectElement) ||
    !(messageInput instanceof HTMLTextAreaElement) ||
    !feedback
  ) {
    return;
  }

  const fields = [nameInput, emailInput, topicInput, messageInput];
  let topicIconIsRotating = false;
  let ignoreNextTopicClick = false;

  const startTopicIconRotation = () => {
    if (!(topicWrap instanceof HTMLElement)) {
      return;
    }

    if (topicIconIsRotating) {
      return;
    }

    topicIconIsRotating = true;
    topicWrap.classList.add("is-turning");
  };

  const stopTopicIconRotation = () => {
    if (!(topicWrap instanceof HTMLElement) || !topicIconIsRotating) {
      return;
    }

    topicIconIsRotating = false;
    ignoreNextTopicClick = false;
    topicWrap.classList.remove("is-turning");
  };

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

  const syncCustomValidity = (input) => {
    input.setCustomValidity("");

    if (input === messageInput) {
      const length = input.value.trim().length;
      if (length > 0 && length < 24) {
        input.setCustomValidity(
          t(
            "feedback.contact_length",
            "Please add a little more detail so we know how to help."
          )
        );
      }
    }
  };

  const validateField = (input) => {
    syncCustomValidity(input);

    if (input.checkValidity()) {
      clearFieldError(input);
      return "";
    }

    input.setAttribute("aria-invalid", "true");
    return (
      input.validationMessage ||
      t("feedback.generic", "Please check this field and try again.")
    );
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

    form.reset();
    fields.forEach((input) => clearFieldError(input));
    showFeedback(
      t(
        "feedback.contact_success",
        "Thanks for reaching out. This static page validated your message in the browser. Connect this form to email or your preferred form service when you're ready."
      ),
      "success"
    );
  });

  fields.forEach((input) => {
    const eventName = input instanceof HTMLSelectElement ? "change" : "input";

    input.addEventListener(eventName, () => {
      syncCustomValidity(input);
      clearFieldError(input);
      if (!feedback.hidden) {
        clearFeedback();
      }
    });
  });

  topicInput.addEventListener("pointerdown", () => {
    ignoreNextTopicClick = true;
    startTopicIconRotation();
  });

  topicInput.addEventListener("click", () => {
    if (!topicIconIsRotating) {
      return;
    }

    if (ignoreNextTopicClick) {
      ignoreNextTopicClick = false;
      return;
    }

    stopTopicIconRotation();
  });

  topicInput.addEventListener("keydown", (event) => {
    if (
      event.key === " " ||
      event.key === "Enter" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowUp"
    ) {
      ignoreNextTopicClick = false;
      startTopicIconRotation();
    }

    if (event.key === "Escape" || event.key === "Tab") {
      stopTopicIconRotation();
    }
  });

  topicInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter" || event.key === "Escape") {
      stopTopicIconRotation();
    }
  });

  topicInput.addEventListener("change", () => {
    stopTopicIconRotation();
  });

  topicInput.addEventListener("blur", () => {
    stopTopicIconRotation();
  });
})();
