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
    radiusLabel: document.getElementById("radiusLabel"),
    chordLabel: document.getElementById("chordLabel"),
    tangentLabel: document.getElementById("tangentLabel"),
    arcLabel: document.getElementById("arcLabel"),
    angleLabel: document.getElementById("angleLabel"),
    orbit1: document.getElementById("orbit1"),
    orbit2: document.getElementById("orbit2"),
    orbit3: document.getElementById("orbit3"),
    orbit4: document.getElementById("orbit4"),
    orbit5: document.getElementById("orbit5"),
    orbit6: document.getElementById("orbit6"),
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
  const axisStart = -0.16;

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
    layerX: 0,
    layerY: 0,
    targetLayerX: 0,
    targetLayerY: 0,
    shapeX: 0,
    shapeY: 0,
    targetShapeX: 0,
    targetShapeY: 0,
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, alpha) => from + (to - from) * alpha;
  const dot = (a, b) => a.x * b.x + a.y * b.y;
  const normalize = (v) => {
    const len = Math.hypot(v.x, v.y);
    if (!len) {
      return { x: 0, y: 0 };
    }
    return { x: v.x / len, y: v.y / len };
  };
  const perpendicular = (v) => ({ x: -v.y, y: v.x });

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

  const setTextPos = (el, x, y) => {
    el.setAttribute("x", x.toFixed(2));
    el.setAttribute("y", y.toFixed(2));
  };

  const setCirclePos = (el, x, y) => {
    el.setAttribute("cx", x.toFixed(2));
    el.setAttribute("cy", y.toFixed(2));
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
    state.targetSpread = 1.12 + (1 - distance) * 0.32;

    state.targetShapeX = clampedX * 7;
    state.targetShapeY = clampedY * 5;
    state.targetLayerX = clampedX * 12;
    state.targetLayerY = clampedY * 9;
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
      state.targetSpread = 1.2 + (Math.sin(t * 0.42) + 1) * 0.14;
      state.targetShapeX = state.targetNx * 5.4;
      state.targetShapeY = state.targetNy * 4.2;
      state.targetLayerX = state.targetNx * 9;
      state.targetLayerY = state.targetNy * 7;
    }

    const easing = reduceMotion ? 0.2 : 0.06;
    state.nx = lerp(state.nx, state.targetNx, easing);
    state.ny = lerp(state.ny, state.targetNy, easing);
    state.angle = lerp(state.angle, state.targetAngle, easing);
    state.spread = lerp(state.spread, state.targetSpread, easing);
    state.shapeX = lerp(state.shapeX, state.targetShapeX, easing);
    state.shapeY = lerp(state.shapeY, state.targetShapeY, easing);
    state.layerX = lerp(state.layerX, state.targetLayerX, easing * 0.8);
    state.layerY = lerp(state.layerY, state.targetLayerY, easing * 0.8);

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
    const tangentLength = 210;
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

    const midRadius = {
      x: (center.x + pointA.x) * 0.5,
      y: (center.y + pointA.y) * 0.5,
    };
    const midChord = {
      x: (pointA.x + pointB.x) * 0.5,
      y: (pointA.y + pointB.y) * 0.5,
    };
    const arcMid = polarToCartesian(
      center.x,
      center.y,
      radius + 34,
      state.angle + state.spread * 0.5
    );
    const thetaMidAngle = axisStart + (state.angle - axisStart) * 0.5;
    const thetaLabelPoint = polarToCartesian(center.x, center.y, 96, thetaMidAngle);
    const radialDir = normalize({
      x: pointA.x - center.x,
      y: pointA.y - center.y,
    });
    const radialNormal = perpendicular(radialDir);
    const chordDir = normalize({
      x: pointB.x - pointA.x,
      y: pointB.y - pointA.y,
    });
    const rawChordNormal = perpendicular(chordDir);
    const toCenter = normalize({
      x: center.x - midChord.x,
      y: center.y - midChord.y,
    });
    const chordNormal =
      dot(rawChordNormal, toCenter) < 0
        ? { x: -rawChordNormal.x, y: -rawChordNormal.y }
        : rawChordNormal;
    const tangentLabelSide = tangentDir.x >= 0 ? 1 : -1;
    const subjectOffsetX = compactLayout.matches ? 0 : 214;
    const subjectCenterX = center.x + subjectOffsetX;

    setTextPos(
      refs.radiusLabel,
      midRadius.x + radialNormal.x * 18,
      midRadius.y + radialNormal.y * 18
    );
    setTextPos(
      refs.chordLabel,
      midChord.x + chordNormal.x * 16 + chordDir.x * 0,
      midChord.y + chordNormal.y * 16 + chordDir.y * 0
    );
    setTextPos(
      refs.tangentLabel,
      pointA.x + tangentDir.x * (74 * tangentLabelSide) + radialDir.x * 26,
      pointA.y + tangentDir.y * (74 * tangentLabelSide) + radialDir.y * 26
    );
    setTextPos(refs.arcLabel, arcMid.x - 18, arcMid.y + 8);
    setTextPos(refs.angleLabel, thetaLabelPoint.x - 7, thetaLabelPoint.y + 3);

    refs.group.setAttribute(
      "transform",
      `translate(${(subjectOffsetX + state.shapeX).toFixed(2)} ${state.shapeY.toFixed(2)})`
    );

    refs.bgLayers.setAttribute(
      "transform",
      `translate(${state.layerX.toFixed(2)} ${state.layerY.toFixed(2)}) rotate(${(state.nx * 3.6).toFixed(2)} 700 390)`
    );

    refs.construct.setAttribute(
      "transform",
      `translate(${(subjectOffsetX + state.layerX * 0.62).toFixed(2)} ${(state.layerY * 0.62).toFixed(2)}) rotate(${(state.nx * -2.3).toFixed(2)} ${subjectCenterX.toFixed(2)} 390)`
    );

    const orbitBase = t * 0.44;
    const orbit = [
      { el: refs.orbit1, r: 240, a: orbitBase * 1.2 + 0.1 },
      { el: refs.orbit2, r: 240, a: orbitBase * 1.2 + Math.PI / 2 },
      { el: refs.orbit3, r: 240, a: orbitBase * 1.2 + Math.PI },
      { el: refs.orbit4, r: 240, a: orbitBase * 1.2 + (Math.PI * 3) / 2 },
      { el: refs.orbit5, r: 332, a: orbitBase * 0.86 + 0.7 },
      { el: refs.orbit6, r: 332, a: orbitBase * 0.86 + 0.7 + Math.PI },
    ];

    orbit.forEach((item) => {
      const p = polarToCartesian(center.x, center.y, item.r, item.a);
      setCirclePos(item.el, p.x, p.y);
    });

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
})();

(() => {
  const titles = Array.from(document.querySelectorAll(".scroll-title-reveal"));
  if (!titles.length) {
    return;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const reveal = (el) => {
    el.classList.add("is-visible");
  };

  if (reduceMotion || !("IntersectionObserver" in window)) {
    titles.forEach(reveal);
    return;
  }

  titles.forEach((title, index) => {
    const customDelay = Number.parseInt(
      title.getAttribute("data-reveal-delay") || "",
      10
    );
    const delay = Number.isFinite(customDelay) ? customDelay : index * 45;
    title.style.setProperty("--reveal-delay", `${delay}ms`);
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
      titles.forEach((title) => observer.observe(title));
    });
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
