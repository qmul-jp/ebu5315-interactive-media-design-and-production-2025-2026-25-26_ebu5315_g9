(() => {
  const hero = document.getElementById("heroInteractive");
  if (!hero) {
    return;
  }

  const refs = {
    group: document.getElementById("geo-parallax"),
    bgLayers: document.getElementById("geo-bg-layers"),
    construct: document.getElementById("geo-construct"),
    radius: document.getElementById("radiusLine"),
    chord: document.getElementById("chordLine"),
    tangent: document.getElementById("tangentLine"),
    arc: document.getElementById("arcPath"),
    angle: document.getElementById("anglePath"),
    pointA: document.getElementById("pointA"),
    pointB: document.getElementById("pointB"),
  };

  if (Object.values(refs).some((node) => !node)) {
    return;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const compactLayout = window.matchMedia("(max-width: 980px)");

  const center = { x: 700, y: 390 };
  const radius = 210;
  const axisStart = 0;

  const state = {
    pointerInside: false,
    nx: 0,
    ny: 0,
    targetNx: 0,
    targetNy: 0,
    angle: -0.85,
    targetAngle: -0.85,
    spread: 1.18,
    targetSpread: 1.18,
    shapeX: 0,
    shapeY: 0,
    targetShapeX: 0,
    targetShapeY: 0,
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, alpha) => from + (to - from) * alpha;
  const getAxisProximity = (angle) =>
    clamp(1 - Math.abs(Math.sin(angle)), 0, 1);
  const getChordSpread = (angle, focusBoost = 0) =>
    0.48 + (1 - getAxisProximity(angle)) * 0.88 + clamp(focusBoost, 0, 1) * 0.18;
  const getTangentHalfLength = (angle) =>
    170 + getAxisProximity(angle) * 150;

  const polarToCartesian = (cx, cy, r, angle) => ({
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
  });

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const delta = endAngle - startAngle;
    const largeArc = Math.abs(delta) > Math.PI ? 1 : 0;
    const sweep = delta >= 0 ? 1 : 0;
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  };

  const setLine = (el, p1, p2) => {
    el.setAttribute("x1", p1.x.toFixed(2));
    el.setAttribute("y1", p1.y.toFixed(2));
    el.setAttribute("x2", p2.x.toFixed(2));
    el.setAttribute("y2", p2.y.toFixed(2));
  };

  const updateTargetsFromPointer = (event) => {
    const rect = hero.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    const clampedX = clamp(nx, -1, 1);
    const clampedY = clamp(ny, -1, 1);
    const distance = Math.min(1, Math.hypot(clampedX, clampedY));

    state.targetNx = clampedX;
    state.targetNy = clampedY;

    state.targetAngle = -0.95 + clampedX * 0.82 + clampedY * 0.28;
    state.targetSpread = getChordSpread(state.targetAngle, 1 - distance);

    state.targetShapeX = clampedX * 7;
    state.targetShapeY = clampedY * 5;
  };

  hero.addEventListener("pointerenter", (event) => {
    state.pointerInside = true;
    updateTargetsFromPointer(event);
  });

  hero.addEventListener("pointermove", (event) => {
    state.pointerInside = true;
    updateTargetsFromPointer(event);
  });

  hero.addEventListener("pointerleave", () => {
    state.pointerInside = false;
  });

  const render = (time) => {
    const t = time * 0.001;

    if (!state.pointerInside && !reduceMotion) {
      state.targetNx = Math.sin(t * 0.52) * 0.42;
      state.targetNy = Math.cos(t * 0.33) * 0.34;
      state.targetAngle = -0.98 + Math.sin(t * 0.62) * 0.58;
      state.targetSpread = getChordSpread(
        state.targetAngle,
        (Math.sin(t * 0.42) + 1) * 0.5
      );
      state.targetShapeX = state.targetNx * 5.4;
      state.targetShapeY = state.targetNy * 4.2;
    }

    const easing = reduceMotion ? 0.2 : 0.06;
    state.nx = lerp(state.nx, state.targetNx, easing);
    state.ny = lerp(state.ny, state.targetNy, easing);
    state.angle = lerp(state.angle, state.targetAngle, easing);
    state.spread = lerp(state.spread, state.targetSpread, easing);
    state.shapeX = lerp(state.shapeX, state.targetShapeX, easing);
    state.shapeY = lerp(state.shapeY, state.targetShapeY, easing);

    const pointA = polarToCartesian(center.x, center.y, radius, state.angle);
    const pointB = polarToCartesian(
      center.x,
      center.y,
      radius,
      state.angle + state.spread
    );

    setLine(refs.radius, center, pointA);
    setLine(refs.chord, pointA, pointB);

    const tangentDir = {
      x: -Math.sin(state.angle),
      y: Math.cos(state.angle),
    };
    // As the moving radius approaches the x-axis, tighten the chord and extend the tangent.
    const tangentLength = getTangentHalfLength(state.angle);
    setLine(
      refs.tangent,
      {
        x: pointA.x - tangentDir.x * tangentLength,
        y: pointA.y - tangentDir.y * tangentLength,
      },
      {
        x: pointA.x + tangentDir.x * tangentLength,
        y: pointA.y + tangentDir.y * tangentLength,
      }
    );

    refs.arc.setAttribute(
      "d",
      describeArc(center.x, center.y, radius, state.angle, state.angle + state.spread)
    );
    refs.angle.setAttribute(
      "d",
      describeArc(center.x, center.y, 76, axisStart, state.angle)
    );

    refs.pointA.setAttribute("cx", pointA.x.toFixed(2));
    refs.pointA.setAttribute("cy", pointA.y.toFixed(2));
    refs.pointB.setAttribute("cx", pointB.x.toFixed(2));
    refs.pointB.setAttribute("cy", pointB.y.toFixed(2));

    const energy = 0.4 + Math.min(0.58, Math.hypot(state.nx, state.ny));
    refs.pointA.setAttribute("r", (8 + energy * 1.8).toFixed(2));
    refs.pointB.setAttribute("r", (7 + energy * 1.4).toFixed(2));

    refs.radius.style.strokeWidth = (3 + energy * 0.8).toFixed(2);
    refs.chord.style.strokeWidth = (2.8 + energy * 0.7).toFixed(2);
    refs.tangent.style.strokeWidth = (2.8 + energy * 0.7).toFixed(2);
    refs.arc.style.strokeWidth = (3 + energy * 0.9).toFixed(2);
    refs.angle.style.opacity = (0.48 + energy * 0.42).toFixed(2);

    const subjectOffsetX = compactLayout.matches ? 0 : 214;

    refs.group.setAttribute(
      "transform",
      `translate(${(subjectOffsetX + state.shapeX).toFixed(2)} ${state.shapeY.toFixed(2)})`
    );

    refs.bgLayers.setAttribute(
      "transform",
      "translate(0 0)"
    );

    // Keep the background construction anchored so only the focal diagram tracks the pointer.
    refs.construct.setAttribute(
      "transform",
      `translate(${subjectOffsetX.toFixed(2)} 0)`
    );

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
})();

(() => {
  const revealTargets = Array.from(
    document.querySelectorAll(".scroll-title-reveal, .scroll-title-cascade")
  );
  const cascadeTitles = Array.from(
    document.querySelectorAll(".scroll-title-cascade")
  );

  if (!revealTargets.length) {
    return;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const lineSelectors = ["title-line", "callout-line", "title-cascade-line"];

  const collectRawLines = (title) => {
    const explicitLines = Array.from(title.children).filter((child) =>
      lineSelectors.some((className) => child.classList.contains(className))
    );

    if (explicitLines.length) {
      return explicitLines.map((line) => ({
        text: (line.dataset.cascadeSource || line.textContent || "")
          .replace(/\s+/g, " ")
          .trim(),
        className: line.className,
      }));
    }

    const segments = [];
    let buffer = "";

    Array.from(title.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
        segments.push(buffer);
        buffer = "";
        return;
      }

      buffer += node.textContent || "";
    });

    segments.push(buffer);

    return segments
      .flatMap((segment) => segment.split(/\n+/))
      .map((segment) => segment.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .map((text) => ({
        text,
        className: "title-cascade-line",
      }));
  };

  const prepareCascadeTitle = (title) => {
    const lines = collectRawLines(title);
    if (!lines.length) {
      title.classList.remove("title-cascade-ready");
      return;
    }

    title.replaceChildren();

    lines.forEach((line, index) => {
      const lineEl = document.createElement("span");
      lineEl.className = line.className;
      lineEl.dataset.cascadeSource = line.text;
      lineEl.style.setProperty(
        "--line-delay",
        `${index * 120}ms`
      );

      const inner = document.createElement("span");
      inner.className = "title-cascade-line-inner";
      inner.textContent = line.text;

      lineEl.append(inner);
      title.append(lineEl);
    });

    title.classList.add("title-cascade-ready");
  };

  const prepareCascadeTitles = () => {
    cascadeTitles.forEach(prepareCascadeTitle);
  };

  const reveal = (el) => {
    el.classList.add("is-visible");
  };

  prepareCascadeTitles();

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(reveal);
    return;
  }

  revealTargets.forEach((target, index) => {
    const customDelay = Number.parseInt(
      target.getAttribute("data-reveal-delay") || "",
      10
    );
    const delay = Number.isFinite(customDelay) ? customDelay : index * 45;
    target.style.setProperty("--reveal-delay", `${delay}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target);
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      revealTargets.forEach((target) => observer.observe(target));
    });
  });

  window.addEventListener("circlelab:languagechange", () => {
    prepareCascadeTitles();
  });
})();

(() => {
  const viewport = document.getElementById("theoremsViewport");
  if (!viewport) {
    return;
  }

  const carousel = viewport.closest(".theorems-carousel");
  if (!carousel) {
    return;
  }
  const track = viewport.querySelector(".theorems-carousel-track");
  const buttons = Array.from(
    carousel.querySelectorAll("[data-theorem-nav]")
  );

  if (!track || !buttons.length) {
    return;
  }

  const getGap = () => {
    const style = window.getComputedStyle(track);
    const gap = Number.parseFloat(style.columnGap || style.gap || "0");
    return Number.isFinite(gap) ? gap : 0;
  };

  const getCardWidth = () => {
    const firstCard = track.querySelector(".theorem-frame");
    if (!firstCard) {
      return 0;
    }
    return firstCard.getBoundingClientRect().width;
  };

  const getVisibleCount = () => {
    const style = window.getComputedStyle(carousel);
    const value = Number.parseInt(style.getPropertyValue("--theorem-visible"), 10);
    return Number.isFinite(value) && value > 0 ? value : 3;
  };

  const getStep = () => {
    return getCardWidth() + getGap();
  };

  const getPageDistance = () => {
    return getStep() * getVisibleCount();
  };

  const updateButtons = () => {
    const maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);
    const current = viewport.scrollLeft;

    buttons.forEach((button) => {
      const dir = Number.parseInt(button.getAttribute("data-theorem-nav"), 10);
      if (dir < 0) {
        button.disabled = current <= 2;
      } else {
        button.disabled = current >= maxScroll - 2;
      }
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const dir = Number.parseInt(button.getAttribute("data-theorem-nav"), 10) || 1;
      viewport.scrollBy({
        left: dir * getPageDistance(),
        behavior: "smooth",
      });
    });
  });

  viewport.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  updateButtons();
})();

(() => {
  const pricing = document.querySelector(".pricing-section");
  if (!pricing) {
    return;
  }

  const buttons = Array.from(
    pricing.querySelectorAll("[data-pricing-view-target]")
  );
  const panels = Array.from(pricing.querySelectorAll("[data-pricing-panel]"));

  if (!buttons.length || !panels.length) {
    return;
  }

  const setView = (view) => {
    pricing.setAttribute("data-pricing-view", view);

    buttons.forEach((button) => {
      const active =
        button.getAttribute("data-pricing-view-target") === view;

      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });

    panels.forEach((panel) => {
      panel.hidden = panel.getAttribute("data-pricing-panel") !== view;
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.getAttribute("data-pricing-view-target");
      if (view) {
        setView(view);
      }
    });
  });

  setView(pricing.getAttribute("data-pricing-view") || "personal");
})();

(() => {
  const embed = document.querySelector(
    ".theorem-frame-center-fix .theorem-embed"
  );
  if (!embed) {
    return;
  }

  // Cross-origin iframe content can't be edited directly; apply a solid color tint layer.
  embed.style.backgroundColor = "#243650";

  const iframe = embed.querySelector("iframe");
  if (iframe) {
    iframe.style.zIndex = "1";
  }

  let tint = embed.querySelector("[data-theorem-solid-bg='true']");
  if (!tint) {
    tint = document.createElement("div");
    tint.setAttribute("data-theorem-solid-bg", "true");
    embed.append(tint);
  }

  Object.assign(tint.style, {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
    zIndex: "2",
    backgroundColor: "rgba(36, 54, 80, 0.18)",
    mixBlendMode: "multiply",
  });

  const lock = embed.querySelector(".theorem-center-lock");
  if (lock) {
    lock.style.zIndex = "3";
  }
})();

(() => {
  const picker = document.querySelector(".ai-chat-model-picker");
  if (!picker) {
    return;
  }

  const triggerValue = picker.querySelector(".ai-chat-model-picker-value");
  const options = Array.from(
    picker.querySelectorAll(".ai-chat-model-menu-item")
  );

  if (!triggerValue || !options.length) {
    return;
  }

  let feedbackTimeout = 0;

  const setSelectedModel = (label) => {
    triggerValue.textContent = label;

    options.forEach((option) => {
      const optionLabel = option.textContent.trim();
      const isSelected = optionLabel === label;

      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    picker.classList.remove("is-updated");
    window.clearTimeout(feedbackTimeout);

    requestAnimationFrame(() => {
      picker.classList.add("is-updated");
      feedbackTimeout = window.setTimeout(() => {
        picker.classList.remove("is-updated");
      }, 720);
    });
  };

  options.forEach((option) => {
    option.addEventListener("click", () => {
      setSelectedModel(option.textContent.trim());
      picker.open = false;
    });
  });

  document.addEventListener("click", (event) => {
    if (!picker.open || picker.contains(event.target)) {
      return;
    }

    picker.open = false;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      picker.open = false;
    }
  });
})();

(() => {
  const chatShell = document.querySelector(".ai-chat-shell");
  if (!chatShell) {
    return;
  }

  const form = chatShell.querySelector(".ai-chat-composer");
  const input = chatShell.querySelector(".ai-chat-draft");
  const sendButton = chatShell.querySelector(".ai-chat-send");
  const transcript = chatShell.querySelector(".ai-chat-transcript");
  const messages = chatShell.querySelector("[data-ai-chat-messages]");
  const modelValue = chatShell.querySelector(".ai-chat-model-picker-value");
  const attachButton = chatShell.querySelector(".ai-chat-icon-btn");
  const prefersReducedMotion = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  if (
    !form ||
    !(form instanceof HTMLFormElement) ||
    !input ||
    !(input instanceof HTMLTextAreaElement) ||
    !sendButton ||
    !(sendButton instanceof HTMLButtonElement) ||
    !transcript ||
    !messages ||
    !modelValue
  ) {
    return;
  }

  const maxComposerHeight = 172;

  const autoResizeInput = () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, maxComposerHeight)}px`;
    input.style.overflowY = input.scrollHeight > maxComposerHeight ? "auto" : "hidden";
  };

  const syncSendState = () => {
    sendButton.disabled = input.value.trim().length === 0;
  };

  const scrollTranscriptToBottom = (behavior = "smooth") => {
    const nextTop = transcript.scrollHeight;

    if (prefersReducedMotion.matches || typeof transcript.scrollTo !== "function") {
      transcript.scrollTop = nextTop;
      return;
    }

    transcript.scrollTo({
      top: nextTop,
      behavior,
    });
  };

  const createMessage = (role, label, text) => {
    const message = document.createElement("article");
    message.className = `ai-chat-message is-${role}`;

    const meta = document.createElement("p");
    meta.className = "ai-chat-message-meta";
    meta.textContent = label;

    const bubble = document.createElement("p");
    bubble.className = "ai-chat-message-bubble";
    bubble.textContent = text;

    message.append(meta, bubble);
    return message;
  };

  const buildTutorReply = () =>
    "Ask a question about circle geometry and I'll help you think it through.";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const prompt = input.value.trim();
    if (!prompt) {
      syncSendState();
      input.focus();
      return;
    }

    messages.append(createMessage("user", "You", prompt));
    messages.append(
      createMessage(
        "assistant",
        `ArcMind - ${modelValue.textContent.trim()}`,
        buildTutorReply()
      )
    );

    input.value = "";
    autoResizeInput();
    syncSendState();
    requestAnimationFrame(() => {
      scrollTranscriptToBottom();
    });
    input.focus();
  });

  input.addEventListener("input", () => {
    autoResizeInput();
    syncSendState();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
      return;
    }

    event.preventDefault();

    if (typeof form.requestSubmit === "function") {
      form.requestSubmit();
      return;
    }

    sendButton.click();
  });

  if (attachButton instanceof HTMLButtonElement) {
    attachButton.addEventListener("click", () => {
      input.focus();
    });
  }

  autoResizeInput();
  syncSendState();
  scrollTranscriptToBottom("auto");
})();

(() => {
  const header = document.querySelector(".site-header");
  if (!(header instanceof HTMLElement)) {
    return;
  }

  const measureScrollbarWidth = () => {
    const scrollProbe = document.createElement("div");
    scrollProbe.style.position = "absolute";
    scrollProbe.style.top = "-9999px";
    scrollProbe.style.width = "120px";
    scrollProbe.style.height = "120px";
    scrollProbe.style.overflow = "scroll";
    scrollProbe.style.pointerEvents = "none";
    document.body.append(scrollProbe);
    const scrollbarWidth = scrollProbe.offsetWidth - scrollProbe.clientWidth;
    scrollProbe.remove();
    return Math.max(0, scrollbarWidth);
  };

  const syncViewportMetrics = () => {
    const offset = Math.ceil(header.getBoundingClientRect().height + 12);
    document.documentElement.style.setProperty("--auth-header-offset", `${offset}px`);
    document.documentElement.style.setProperty(
      "--scrollbar-compensation",
      `${measureScrollbarWidth()}px`
    );
  };

  const syncHeaderScrollState = () => {
    document.body.classList.toggle("is-scrolled", window.scrollY > 0);
  };

  syncViewportMetrics();
  syncHeaderScrollState();
  window.addEventListener("load", syncViewportMetrics, { once: true });
  window.addEventListener("resize", syncViewportMetrics);
  window.addEventListener("scroll", syncHeaderScrollState, { passive: true });
})();

(() => {
  const overlaySelector =
    "[data-signup-overlay], [data-login-overlay], [data-contact-overlay]";
  const signupOverlay = document.querySelector("[data-signup-overlay]");
  const loginOverlay = document.querySelector("[data-login-overlay]");
  const contactOverlay = document.querySelector("[data-contact-overlay]");

  if (!signupOverlay && !loginOverlay && !contactOverlay) {
    return;
  }

  const setHash = (hash) => {
    if (window.location.hash === hash) {
      return;
    }

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}${hash}`
    );
  };

  const clearHash = (hash) => {
    if (window.location.hash !== hash) {
      return;
    }

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`
    );
  };

  const shouldRememberTrigger = (trigger) =>
    trigger instanceof HTMLElement && !trigger.closest(overlaySelector);

  const isAnyOverlayOpen = () =>
    [signupOverlay, loginOverlay, contactOverlay].some(
      (overlay) => overlay instanceof HTMLElement && !overlay.hidden
    );

  const syncBodyState = () => {
    document.body.classList.toggle("is-auth-open", isAnyOverlayOpen());
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const overlayCloseCleanupMap = new WeakMap();
  const overlayOpenCleanupMap = new WeakMap();
  const preferences = window.CircleLabPreferences || null;
  const t = (key, fallback = "") =>
    preferences?.t ? preferences.t(key, fallback) : fallback;

  const getValidationMessage = (input, checkboxMessage) => {
    if (input.validity.valueMissing) {
      if (input.type === "checkbox") {
        return checkboxMessage;
      }

      return input.validationMessage;
    }

    if (input.validity.typeMismatch || input.validity.tooShort) {
      return input.validationMessage;
    }

    return (
      input.validationMessage ||
      t("feedback.generic", "Please check this field and try again.")
    );
  };

  let lastTrigger = null;

  const signupForm = signupOverlay
    ? signupOverlay.querySelector("[data-signup-form]")
    : null;
  const signupEmailInput = signupOverlay
    ? signupOverlay.querySelector("#signupEmail")
    : null;
  const signupPasswordInput = signupOverlay
    ? signupOverlay.querySelector("#signupPassword")
    : null;
  const signupConsentInput = signupOverlay
    ? signupOverlay.querySelector("#signupConsent")
    : null;
  const signupFeedback = signupOverlay
    ? signupOverlay.querySelector("[data-signup-feedback]")
    : null;
  const signupOpenButtons = Array.from(document.querySelectorAll("[data-open-signup]"));
  const signupCloseButtons = signupOverlay
    ? Array.from(signupOverlay.querySelectorAll("[data-signup-close]"))
    : [];
  const signupFields =
    signupEmailInput instanceof HTMLInputElement &&
    signupPasswordInput instanceof HTMLInputElement &&
    signupConsentInput instanceof HTMLInputElement
      ? [signupEmailInput, signupPasswordInput, signupConsentInput]
      : [];

  let activeSignupValidationField = null;

  const clearSignupFieldError = (input) => {
    input.removeAttribute("aria-invalid");
  };

  const showSignupFeedback = (message, state) => {
    if (!signupFeedback) {
      return;
    }

    signupFeedback.hidden = false;
    signupFeedback.textContent = message;
    signupFeedback.classList.toggle("is-error", state === "error");
    signupFeedback.classList.toggle("is-success", state === "success");
  };

  const clearSignupFeedback = () => {
    if (!signupFeedback) {
      return;
    }

    signupFeedback.hidden = true;
    signupFeedback.textContent = "";
    signupFeedback.classList.remove("is-error", "is-success");
    activeSignupValidationField = null;
  };

  const validateSignupField = (input) => {
    input.setCustomValidity("");

    if (input.checkValidity()) {
      clearSignupFieldError(input);
      return "";
    }

    input.setAttribute("aria-invalid", "true");
    return getValidationMessage(
      input,
      t(
        "feedback.signup_consent",
        "Please agree to the Terms and Conditions and Privacy Policy."
      )
    );
  };

  const validateSignupForm = () => {
    for (const input of signupFields) {
      const message = validateSignupField(input);
      if (message) {
        activeSignupValidationField = input;
        return { input, message };
      }
    }

    return null;
  };

  const resetSignupState = () => {
    if (!(signupForm instanceof HTMLFormElement)) {
      return;
    }

    signupForm.reset();
    clearSignupFeedback();
    signupFields.forEach(clearSignupFieldError);
  };

  const loginForm = loginOverlay
    ? loginOverlay.querySelector("[data-login-form]")
    : null;
  const loginEmailInput = loginOverlay
    ? loginOverlay.querySelector("#loginEmail")
    : null;
  const loginPasswordInput = loginOverlay
    ? loginOverlay.querySelector("#loginPassword")
    : null;
  const loginFeedback = loginOverlay
    ? loginOverlay.querySelector("[data-login-feedback]")
    : null;
  const loginHelpButton = loginOverlay
    ? loginOverlay.querySelector("[data-login-help]")
    : null;
  const loginOpenButtons = Array.from(document.querySelectorAll("[data-open-login]"));
  const loginCloseButtons = loginOverlay
    ? Array.from(loginOverlay.querySelectorAll("[data-login-close]"))
    : [];
  const loginFields =
    loginEmailInput instanceof HTMLInputElement &&
    loginPasswordInput instanceof HTMLInputElement
      ? [loginEmailInput, loginPasswordInput]
      : [];

  let activeLoginValidationField = null;

  const clearLoginFieldError = (input) => {
    input.removeAttribute("aria-invalid");
  };

  const showLoginFeedback = (message, state = "info") => {
    if (!loginFeedback) {
      return;
    }

    loginFeedback.hidden = false;
    loginFeedback.textContent = message;
    loginFeedback.classList.toggle("is-error", state === "error");
    loginFeedback.classList.toggle("is-success", state === "success");
  };

  const clearLoginFeedback = () => {
    if (!loginFeedback) {
      return;
    }

    loginFeedback.hidden = true;
    loginFeedback.textContent = "";
    loginFeedback.classList.remove("is-error", "is-success");
    activeLoginValidationField = null;
  };

  const validateLoginField = (input) => {
    input.setCustomValidity("");

    if (input.checkValidity()) {
      clearLoginFieldError(input);
      return "";
    }

    input.setAttribute("aria-invalid", "true");
    return getValidationMessage(input, "");
  };

  const validateLoginForm = () => {
    for (const input of loginFields) {
      const message = validateLoginField(input);
      if (message) {
        activeLoginValidationField = input;
        return { input, message };
      }
    }

    return null;
  };

  const resetLoginState = () => {
    if (!(loginForm instanceof HTMLFormElement)) {
      return;
    }

    loginForm.reset();
    clearLoginFeedback();
    loginFields.forEach(clearLoginFieldError);
  };

  const contactForm = contactOverlay
    ? contactOverlay.querySelector("[data-contact-form]")
    : null;
  const contactNameInput = contactOverlay
    ? contactOverlay.querySelector("#contactName")
    : null;
  const contactEmailInput = contactOverlay
    ? contactOverlay.querySelector("#contactEmail")
    : null;
  const contactTopicInput = contactOverlay
    ? contactOverlay.querySelector("#contactTopic")
    : null;
  const contactTopicPicker = contactOverlay
    ? contactOverlay.querySelector("[data-contact-topic-picker]")
    : null;
  const contactTopicTrigger = contactOverlay
    ? contactOverlay.querySelector(".contact-topic-picker-trigger")
    : null;
  const contactTopicValue = contactOverlay
    ? contactOverlay.querySelector("[data-contact-topic-value]")
    : null;
  const contactMessageInput = contactOverlay
    ? contactOverlay.querySelector("#contactMessage")
    : null;
  const contactFeedback = contactOverlay
    ? contactOverlay.querySelector("[data-contact-feedback]")
    : null;
  const contactTopicOptions = contactOverlay
    ? Array.from(contactOverlay.querySelectorAll("[data-contact-topic-option]"))
    : [];
  const contactOpenButtons = Array.from(
    document.querySelectorAll("[data-open-contact]")
  );
  const contactCloseButtons = contactOverlay
    ? Array.from(contactOverlay.querySelectorAll("[data-contact-close]"))
    : [];
  const contactFields =
    contactNameInput instanceof HTMLInputElement &&
    contactEmailInput instanceof HTMLInputElement &&
    contactTopicInput instanceof HTMLInputElement &&
    contactMessageInput instanceof HTMLTextAreaElement
      ? [
          contactNameInput,
          contactEmailInput,
          contactTopicInput,
          contactMessageInput,
        ]
      : [];

  let activeContactValidationField = null;
  let contactTopicFeedbackTimeout = 0;

  const clearContactFieldError = (input) => {
    input.removeAttribute("aria-invalid");

    if (input === contactTopicInput) {
      if (contactTopicTrigger instanceof HTMLElement) {
        contactTopicTrigger.removeAttribute("aria-invalid");
      }

      if (contactTopicPicker instanceof HTMLElement) {
        contactTopicPicker.removeAttribute("data-invalid");
      }
    }
  };

  const showContactFeedback = (message, state = "info") => {
    if (!contactFeedback) {
      return;
    }

    contactFeedback.hidden = false;
    contactFeedback.textContent = message;
    contactFeedback.classList.toggle("is-error", state === "error");
    contactFeedback.classList.toggle("is-success", state === "success");
  };

  const clearContactFeedback = () => {
    if (!contactFeedback) {
      return;
    }

    contactFeedback.hidden = true;
    contactFeedback.textContent = "";
    contactFeedback.classList.remove("is-error", "is-success");
    activeContactValidationField = null;
  };

  const syncContactTopicSelection = (
    value,
    { emit = true, close = false, restoreFocus = false, pulse = true } = {}
  ) => {
    if (
      !(contactTopicInput instanceof HTMLInputElement) ||
      !(contactTopicPicker instanceof HTMLDetailsElement) ||
      !(contactTopicValue instanceof HTMLElement)
    ) {
      return;
    }

    const nextValue = typeof value === "string" ? value : "";
    const selectedOption = contactTopicOptions.find((option) => {
      return option instanceof HTMLButtonElement && option.dataset.value === nextValue;
    });

    contactTopicInput.value = selectedOption ? nextValue : "";

    contactTopicOptions.forEach((option) => {
      if (!(option instanceof HTMLButtonElement)) {
        return;
      }

      const isSelected = option === selectedOption;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    if (selectedOption instanceof HTMLButtonElement) {
      const label = selectedOption.textContent?.trim() || "";
      const translationKey = selectedOption.dataset.i18nKey || "";

      contactTopicValue.textContent = label;

      if (translationKey) {
        contactTopicValue.dataset.i18n = translationKey;
      } else {
        delete contactTopicValue.dataset.i18n;
      }
    } else {
      contactTopicValue.textContent = t(
        "contact.topic_placeholder",
        "Choose a topic"
      );
      contactTopicValue.dataset.i18n = "contact.topic_placeholder";
    }

    clearContactFieldError(contactTopicInput);

    window.clearTimeout(contactTopicFeedbackTimeout);
    contactTopicPicker.classList.remove("is-updated");

    if (pulse && selectedOption) {
      requestAnimationFrame(() => {
        contactTopicPicker.classList.add("is-updated");
        contactTopicFeedbackTimeout = window.setTimeout(() => {
          contactTopicPicker.classList.remove("is-updated");
          contactTopicFeedbackTimeout = 0;
        }, 720);
      });
    }

    if (close) {
      contactTopicPicker.open = false;
    }

    if (restoreFocus && contactTopicTrigger instanceof HTMLElement) {
      contactTopicTrigger.focus();
    }

    if (emit) {
      contactTopicInput.dispatchEvent(
        new Event("input", {
          bubbles: true,
        })
      );
    }
  };

  const syncContactCustomValidity = (input) => {
    input.setCustomValidity("");

    if (input === contactTopicInput) {
      return;
    }

    if (input === contactMessageInput) {
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

  const validateContactField = (input) => {
    if (input === contactTopicInput) {
      const hasSelection =
        contactTopicInput instanceof HTMLInputElement &&
        contactTopicInput.value.trim().length > 0;

      if (hasSelection) {
        clearContactFieldError(input);
        return "";
      }

      input.setAttribute("aria-invalid", "true");

      if (contactTopicTrigger instanceof HTMLElement) {
        contactTopicTrigger.setAttribute("aria-invalid", "true");
      }

      if (contactTopicPicker instanceof HTMLElement) {
        contactTopicPicker.setAttribute("data-invalid", "true");
      }

      return t(
        "feedback.contact_topic",
        "Please choose a topic so we can route your message."
      );
    }

    syncContactCustomValidity(input);

    if (input.checkValidity()) {
      clearContactFieldError(input);
      return "";
    }

    input.setAttribute("aria-invalid", "true");
    return getValidationMessage(input, "");
  };

  const validateContactForm = () => {
    for (const input of contactFields) {
      const message = validateContactField(input);
      if (message) {
        activeContactValidationField = input;
        return { input, message };
      }
    }

    return null;
  };

  const resetContactState = () => {
    if (!(contactForm instanceof HTMLFormElement)) {
      return;
    }

    contactForm.reset();
    clearContactFeedback();
    contactFields.forEach(clearContactFieldError);

    if (contactTopicPicker instanceof HTMLDetailsElement) {
      contactTopicPicker.open = false;
    }

    syncContactTopicSelection("", { emit: false, pulse: false });
  };

  const initTopicDropdown = () => {
    if (
      !(contactTopicInput instanceof HTMLInputElement) ||
      !(contactTopicPicker instanceof HTMLDetailsElement) ||
      !(contactTopicTrigger instanceof HTMLElement) ||
      !(contactTopicValue instanceof HTMLElement) ||
      !contactTopicOptions.length
    ) {
      return;
    }

    syncContactTopicSelection(contactTopicInput.value, {
      emit: false,
      pulse: false,
    });

    contactTopicOptions.forEach((option) => {
      if (!(option instanceof HTMLButtonElement)) {
        return;
      }

      option.addEventListener("click", () => {
        syncContactTopicSelection(option.dataset.value || "", {
          close: true,
          restoreFocus: true,
        });
      });
    });

    document.addEventListener("click", (event) => {
      if (!contactTopicPicker.open || contactTopicPicker.contains(event.target)) {
        return;
      }

      contactTopicPicker.open = false;
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !contactTopicPicker.open) {
        return;
      }

      contactTopicPicker.open = false;
      contactTopicTrigger.focus();
    });

    window.addEventListener("circlelab:languagechange", () => {
      syncContactTopicSelection(contactTopicInput.value, {
        emit: false,
        pulse: false,
      });
    });
  };

  const cancelOverlayClose = (overlay) => {
    if (!(overlay instanceof HTMLElement)) {
      return;
    }

    const cleanup = overlayCloseCleanupMap.get(overlay);
    if (cleanup) {
      cleanup();
      overlayCloseCleanupMap.delete(overlay);
    }

    overlay.classList.remove("is-closing");
  };

  const cancelOverlayOpen = (overlay) => {
    if (!(overlay instanceof HTMLElement)) {
      return;
    }

    const cleanup = overlayOpenCleanupMap.get(overlay);
    if (cleanup) {
      cleanup();
      overlayOpenCleanupMap.delete(overlay);
    }

    overlay.classList.remove("is-opening");
  };

  const startOverlayOpen = (overlay) => {
    if (!(overlay instanceof HTMLElement) || reduceMotion) {
      return;
    }

    cancelOverlayOpen(overlay);
    overlay.classList.add("is-opening");

    const timeoutId = window.setTimeout(() => {
      cancelOverlayOpen(overlay);
    }, 360);

    overlayOpenCleanupMap.set(overlay, () => {
      window.clearTimeout(timeoutId);
    });
  };

  const finalizeOverlayHide = (overlay, hash, resetState, clearUrl) => {
    if (!(overlay instanceof HTMLElement)) {
      return;
    }

    cancelOverlayOpen(overlay);
    cancelOverlayClose(overlay);
    overlay.hidden = true;
    resetState();

    if (clearUrl) {
      clearHash(hash);
    }

    syncBodyState();
  };

  const hideOverlay = (
    overlay,
    hash,
    resetState,
    { clearUrl = true, immediate = false } = {}
  ) => {
    if (!(overlay instanceof HTMLElement) || overlay.hidden) {
      return;
    }

    if (immediate || reduceMotion) {
      finalizeOverlayHide(overlay, hash, resetState, clearUrl);
      return;
    }

    cancelOverlayClose(overlay);
    overlay.classList.add("is-closing");

    const modal = overlay.querySelector(".signup-modal");
    const animationTarget = modal instanceof HTMLElement ? modal : overlay;

    const completeClose = () => {
      finalizeOverlayHide(overlay, hash, resetState, clearUrl);
    };

    const handleAnimationEnd = (event) => {
      if (event.target !== animationTarget) {
        return;
      }

      completeClose();
    };

    const timeoutId = window.setTimeout(completeClose, 260);

    animationTarget.addEventListener("animationend", handleAnimationEnd);

    overlayCloseCleanupMap.set(overlay, () => {
      window.clearTimeout(timeoutId);
      animationTarget.removeEventListener("animationend", handleAnimationEnd);
    });
  };

  const closeOverlay = (
    overlay,
    hash,
    resetState,
    { restoreFocus = true, clearUrl = true } = {}
  ) => {
    if (!(overlay instanceof HTMLElement) || overlay.hidden) {
      return;
    }

    hideOverlay(overlay, hash, resetState, { clearUrl });

    if (!isAnyOverlayOpen() && restoreFocus && lastTrigger instanceof HTMLElement) {
      lastTrigger.focus();
    }
  };

  const switchOverlay = ({
    fromOverlay,
    fromHash,
    fromResetState,
    toOverlay,
    toHash,
    toResetState,
    focusInput,
    direction,
  }) => {
    if (
      !(fromOverlay instanceof HTMLElement) ||
      !(toOverlay instanceof HTMLElement) ||
      !(focusInput instanceof HTMLElement)
    ) {
      return false;
    }

    const fromModal = fromOverlay.querySelector(".signup-modal");
    const toModal = toOverlay.querySelector(".signup-modal");

    if (
      reduceMotion ||
      !(fromModal instanceof HTMLElement) ||
      !(toModal instanceof HTMLElement) ||
      typeof fromModal.animate !== "function" ||
      typeof toModal.animate !== "function"
    ) {
      return false;
    }

    cancelOverlayClose(fromOverlay);
    cancelOverlayClose(toOverlay);
    cancelOverlayOpen(fromOverlay);
    cancelOverlayOpen(toOverlay);
    toResetState();
    toOverlay.classList.add("is-switch-target");
    toOverlay.hidden = false;
    document.body.classList.add("is-auth-switching");
    setHash(toHash);
    syncBodyState();

    const enterOffset = direction > 0 ? 34 : -34;
    const exitOffset = direction > 0 ? -28 : 28;

    const enterAnimation = toModal.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${enterOffset}px, 0, 0) scale(0.986)`,
          filter: "blur(7px)",
        },
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0) scale(1)",
          filter: "blur(0px)",
        },
      ],
      {
        duration: 300,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      }
    );

    const exitAnimation = fromModal.animate(
      [
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0) scale(1)",
          filter: "blur(0px)",
        },
        {
          opacity: 0,
          transform: `translate3d(${exitOffset}px, 0, 0) scale(0.986)`,
          filter: "blur(7px)",
        },
      ],
      {
        duration: 220,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "both",
      }
    );

    let isFinalized = false;
    const finalizeSwitch = () => {
      if (isFinalized) {
        return;
      }

      isFinalized = true;
      document.body.classList.remove("is-auth-switching");
      toOverlay.classList.remove("is-switch-target");
      enterAnimation.cancel();
      exitAnimation.cancel();
      hideOverlay(fromOverlay, fromHash, fromResetState, {
        clearUrl: false,
        immediate: true,
      });

      requestAnimationFrame(() => {
        focusInput.focus();
      });
    };

    Promise.allSettled([enterAnimation.finished, exitAnimation.finished]).then(
      finalizeSwitch
    );
    window.setTimeout(finalizeSwitch, 340);

    return true;
  };

  const openSignupOverlay = (trigger) => {
    if (
      !(signupOverlay instanceof HTMLElement) ||
      !(signupForm instanceof HTMLFormElement) ||
      !(signupEmailInput instanceof HTMLInputElement)
    ) {
      return;
    }

    if (shouldRememberTrigger(trigger)) {
      lastTrigger = trigger;
    }

    if (
      contactOverlay instanceof HTMLElement &&
      !contactOverlay.hidden &&
      switchOverlay({
        fromOverlay: contactOverlay,
        fromHash: "#contactOverlay",
        fromResetState: resetContactState,
        toOverlay: signupOverlay,
        toHash: "#signupOverlay",
        toResetState: resetSignupState,
        focusInput: signupEmailInput,
        direction: -1,
      })
    ) {
      return;
    }

    if (
      loginOverlay instanceof HTMLElement &&
      !loginOverlay.hidden &&
      switchOverlay({
        fromOverlay: loginOverlay,
        fromHash: "#loginOverlay",
        fromResetState: resetLoginState,
        toOverlay: signupOverlay,
        toHash: "#signupOverlay",
        toResetState: resetSignupState,
        focusInput: signupEmailInput,
        direction: -1,
      })
    ) {
      return;
    }

    hideOverlay(contactOverlay, "#contactOverlay", resetContactState, {
      clearUrl: false,
      immediate: true,
    });
    hideOverlay(loginOverlay, "#loginOverlay", resetLoginState, {
      clearUrl: false,
      immediate: true,
    });
    cancelOverlayClose(signupOverlay);
    cancelOverlayOpen(signupOverlay);
    signupOverlay.hidden = false;
    startOverlayOpen(signupOverlay);
    setHash("#signupOverlay");
    syncBodyState();
    resetSignupState();

    requestAnimationFrame(() => {
      signupEmailInput.focus();
    });
  };

  const closeSignupOverlay = (options) => {
    closeOverlay(signupOverlay, "#signupOverlay", resetSignupState, options);
  };

  const openLoginOverlay = (trigger) => {
    if (
      !(loginOverlay instanceof HTMLElement) ||
      !(loginForm instanceof HTMLFormElement) ||
      !(loginEmailInput instanceof HTMLInputElement)
    ) {
      return;
    }

    if (shouldRememberTrigger(trigger)) {
      lastTrigger = trigger;
    }

    if (
      contactOverlay instanceof HTMLElement &&
      !contactOverlay.hidden &&
      switchOverlay({
        fromOverlay: contactOverlay,
        fromHash: "#contactOverlay",
        fromResetState: resetContactState,
        toOverlay: loginOverlay,
        toHash: "#loginOverlay",
        toResetState: resetLoginState,
        focusInput: loginEmailInput,
        direction: -1,
      })
    ) {
      return;
    }

    if (
      signupOverlay instanceof HTMLElement &&
      !signupOverlay.hidden &&
      switchOverlay({
        fromOverlay: signupOverlay,
        fromHash: "#signupOverlay",
        fromResetState: resetSignupState,
        toOverlay: loginOverlay,
        toHash: "#loginOverlay",
        toResetState: resetLoginState,
        focusInput: loginEmailInput,
        direction: 1,
      })
    ) {
      return;
    }

    hideOverlay(contactOverlay, "#contactOverlay", resetContactState, {
      clearUrl: false,
      immediate: true,
    });
    hideOverlay(signupOverlay, "#signupOverlay", resetSignupState, {
      clearUrl: false,
      immediate: true,
    });
    cancelOverlayClose(loginOverlay);
    cancelOverlayOpen(loginOverlay);
    loginOverlay.hidden = false;
    startOverlayOpen(loginOverlay);
    setHash("#loginOverlay");
    syncBodyState();
    resetLoginState();

    requestAnimationFrame(() => {
      loginEmailInput.focus();
    });
  };

  const closeLoginOverlay = (options) => {
    closeOverlay(loginOverlay, "#loginOverlay", resetLoginState, options);
  };

  const openContactOverlay = (trigger) => {
    if (
      !(contactOverlay instanceof HTMLElement) ||
      !(contactForm instanceof HTMLFormElement) ||
      !(contactNameInput instanceof HTMLInputElement)
    ) {
      return;
    }

    if (shouldRememberTrigger(trigger)) {
      lastTrigger = trigger;
    }

    if (
      loginOverlay instanceof HTMLElement &&
      !loginOverlay.hidden &&
      switchOverlay({
        fromOverlay: loginOverlay,
        fromHash: "#loginOverlay",
        fromResetState: resetLoginState,
        toOverlay: contactOverlay,
        toHash: "#contactOverlay",
        toResetState: resetContactState,
        focusInput: contactNameInput,
        direction: 1,
      })
    ) {
      return;
    }

    if (
      signupOverlay instanceof HTMLElement &&
      !signupOverlay.hidden &&
      switchOverlay({
        fromOverlay: signupOverlay,
        fromHash: "#signupOverlay",
        fromResetState: resetSignupState,
        toOverlay: contactOverlay,
        toHash: "#contactOverlay",
        toResetState: resetContactState,
        focusInput: contactNameInput,
        direction: 1,
      })
    ) {
      return;
    }

    hideOverlay(loginOverlay, "#loginOverlay", resetLoginState, {
      clearUrl: false,
      immediate: true,
    });
    hideOverlay(signupOverlay, "#signupOverlay", resetSignupState, {
      clearUrl: false,
      immediate: true,
    });
    cancelOverlayClose(contactOverlay);
    cancelOverlayOpen(contactOverlay);
    contactOverlay.hidden = false;
    startOverlayOpen(contactOverlay);
    setHash("#contactOverlay");
    syncBodyState();
    resetContactState();

    requestAnimationFrame(() => {
      contactNameInput.focus();
    });
  };

  const closeContactOverlay = (options) => {
    closeOverlay(contactOverlay, "#contactOverlay", resetContactState, options);
  };

  const setupFieldValidation = (
    fields,
    feedback,
    validateField,
    setActiveValidationField,
    getActiveValidationField
  ) => {
    fields.forEach((input) => {
      const updateValidation = () => {
        if (feedback.classList.contains("is-success")) {
          feedback.hidden = true;
          feedback.textContent = "";
          feedback.classList.remove("is-error", "is-success");
        }

        if (
          getActiveValidationField() === input ||
          input.getAttribute("aria-invalid") === "true"
        ) {
          const message = validateField(input);

          if (message) {
            setActiveValidationField(input);
            feedback.hidden = false;
            feedback.textContent = message;
            feedback.classList.add("is-error");
            feedback.classList.remove("is-success");
            return;
          }

          feedback.hidden = true;
          feedback.textContent = "";
          feedback.classList.remove("is-error", "is-success");
          setActiveValidationField(null);
        }
      };

      const eventName =
        input instanceof HTMLSelectElement || input.type === "checkbox"
          ? "change"
          : "input";

      input.addEventListener(eventName, updateValidation);
    });
  };

  signupOpenButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openSignupOverlay(button);
    });
  });

  signupCloseButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeSignupOverlay();
    });
  });

  loginOpenButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openLoginOverlay(button);
    });
  });

  loginCloseButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeLoginOverlay();
    });
  });

  contactOpenButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openContactOverlay(button);
    });
  });

  contactCloseButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeContactOverlay();
    });
  });

  if (signupOverlay instanceof HTMLElement) {
    signupOverlay.addEventListener("click", (event) => {
      if (event.target === signupOverlay) {
        closeSignupOverlay();
      }
    });
  }

  if (loginOverlay instanceof HTMLElement) {
    loginOverlay.addEventListener("click", (event) => {
      if (event.target === loginOverlay) {
        closeLoginOverlay();
      }
    });
  }

  if (contactOverlay instanceof HTMLElement) {
    contactOverlay.addEventListener("click", (event) => {
      if (event.target === contactOverlay) {
        closeContactOverlay();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (contactOverlay instanceof HTMLElement && !contactOverlay.hidden) {
      closeContactOverlay();
      return;
    }

    if (loginOverlay instanceof HTMLElement && !loginOverlay.hidden) {
      closeLoginOverlay();
      return;
    }

    if (signupOverlay instanceof HTMLElement && !signupOverlay.hidden) {
      closeSignupOverlay();
    }
  });

  const applyHashState = () => {
    if (window.location.hash === "#contactOverlay") {
      openContactOverlay(null);
      return;
    }

    if (window.location.hash === "#loginOverlay") {
      openLoginOverlay(null);
      return;
    }

    if (window.location.hash === "#signupOverlay") {
      openSignupOverlay(null);
      return;
    }

    closeContactOverlay({ restoreFocus: false, clearUrl: false });
    closeLoginOverlay({ restoreFocus: false, clearUrl: false });
    closeSignupOverlay({ restoreFocus: false, clearUrl: false });
  };

  window.addEventListener("hashchange", applyHashState);

  if (
    signupForm instanceof HTMLFormElement &&
    signupFeedback &&
    signupFields.length === 3
  ) {
    setupFieldValidation(
      signupFields,
      signupFeedback,
      validateSignupField,
      (input) => {
        activeSignupValidationField = input;
      },
      () => activeSignupValidationField
    );

    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const invalidField = validateSignupForm();
      if (invalidField) {
        showSignupFeedback(invalidField.message, "error");
        invalidField.input.focus();
        return;
      }

      closeSignupOverlay();
    });
  }

  if (
    loginForm instanceof HTMLFormElement &&
    loginFeedback &&
    loginFields.length === 2
  ) {
    setupFieldValidation(
      loginFields,
      loginFeedback,
      validateLoginField,
      (input) => {
        activeLoginValidationField = input;
      },
      () => activeLoginValidationField
    );

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const invalidField = validateLoginForm();
      if (invalidField) {
        showLoginFeedback(invalidField.message, "error");
        invalidField.input.focus();
        return;
      }

      closeLoginOverlay();
    });
  }

  if (
    contactForm instanceof HTMLFormElement &&
    contactFeedback &&
    contactFields.length === 4
  ) {
    setupFieldValidation(
      contactFields,
      contactFeedback,
      validateContactField,
      (input) => {
        activeContactValidationField = input;
      },
      () => activeContactValidationField
    );

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const invalidField = validateContactForm();
      if (invalidField) {
        showContactFeedback(invalidField.message, "error");
        if (invalidField.input === contactTopicInput) {
          contactTopicTrigger?.focus();
        } else {
          invalidField.input.focus();
        }
        return;
      }

      contactForm.reset();
      contactFields.forEach(clearContactFieldError);
      activeContactValidationField = null;

      if (contactTopicPicker instanceof HTMLDetailsElement) {
        contactTopicPicker.open = false;
      }

      syncContactTopicSelection("", { emit: false, pulse: false });

      showContactFeedback(
        t(
          "feedback.contact_success",
          "Thanks for reaching out. This static page validated your message in the browser. Connect this form to email or your preferred form service when you're ready."
        ),
        "success"
      );
    });
  }

  initTopicDropdown();

  if (loginHelpButton instanceof HTMLButtonElement) {
    loginHelpButton.addEventListener("click", () => {
      showLoginFeedback(
        t(
          "feedback.password_reset",
          "Password recovery is not connected yet in this static build. Hook this button to your email reset flow when the auth service is ready."
        )
      );
    });
  }

  applyHashState();
})();
