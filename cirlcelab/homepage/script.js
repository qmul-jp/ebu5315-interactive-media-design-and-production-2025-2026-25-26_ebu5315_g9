window.CircleLabDebug = window.CircleLabDebug || {};

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
        text: (
          line.dataset.i18n || line.dataset.i18nHtml
            ? line.textContent || ""
            : line.dataset.cascadeSource || line.textContent || ""
        )
          .replace(/\s+/g, " ")
          .trim(),
        className: line.className,
        i18nKey: line.dataset.i18n || "",
        i18nHtmlKey: line.dataset.i18nHtml || "",
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
      if (line.i18nKey) {
        lineEl.dataset.i18n = line.i18nKey;
      }
      if (line.i18nHtmlKey) {
        lineEl.dataset.i18nHtml = line.i18nHtmlKey;
      }
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
    window.CircleLabDebug.getTheoremMetrics = () => ({
      available: false,
      reason: "The current page does not contain the theorem carousel.",
    });
    return;
  }

  const carousel = viewport.closest(".theorems-carousel");
  if (!carousel) {
    window.CircleLabDebug.getTheoremMetrics = () => ({
      available: false,
      reason: "The theorem carousel wrapper was not found.",
    });
    return;
  }
  const track = viewport.querySelector(".theorems-carousel-track");
  const buttons = Array.from(
    carousel.querySelectorAll("[data-theorem-nav]")
  );

  if (!track || !buttons.length) {
    window.CircleLabDebug.getTheoremMetrics = () => ({
      available: false,
      reason: "The theorem carousel track or navigation buttons are missing.",
    });
    return;
  }

  const freezeRenderedTheoremSize = () => {
    if (carousel.dataset.theoremSizeLocked === "true") {
      return;
    }

    const firstCard = track.querySelector(".theorem-frame:not(.theorem-frame-cta)");
    if (!(firstCard instanceof HTMLElement)) {
      return;
    }

    const embed = firstCard.querySelector(".theorem-embed");
    const cardRect = firstCard.getBoundingClientRect();
    const embedRect =
      embed instanceof HTMLElement ? embed.getBoundingClientRect() : null;
    const computedCarousel = window.getComputedStyle(carousel);
    const textScale = computedCarousel.getPropertyValue("--theorem-text-scale").trim();

    if (cardRect.width > 0) {
      carousel.style.setProperty("--theorem-card-width", `${cardRect.width}px`);
      carousel.style.setProperty("--theorem-card-height", `${cardRect.height}px`);
    }

    if (embedRect && embedRect.width > 0) {
      carousel.style.setProperty("--theorem-embed-size", `${embedRect.width}px`);
    }

    if (textScale) {
      carousel.style.setProperty("--theorem-text-scale", textScale);
    }

    carousel.dataset.theoremSizeLocked = "true";
  };

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
    const value = Number.parseInt(
      style.getPropertyValue("--theorem-visible-current"),
      10
    );
    return Number.isFinite(value) && value > 0 ? value : 3;
  };

  const getBaseVisibleCount = () => {
    const style = window.getComputedStyle(carousel);
    const value = Number.parseInt(style.getPropertyValue("--theorem-visible"), 10);
    return Number.isFinite(value) && value > 0 ? value : 3;
  };

  const getCarouselContentWidth = () => {
    const style = window.getComputedStyle(carousel);
    const paddingInline =
      Number.parseFloat(style.paddingLeft || "0") +
      Number.parseFloat(style.paddingRight || "0");
    return Math.max(0, carousel.clientWidth - paddingInline);
  };

  const updateVisibleCardsForSpace = () => {
    const cardWidth = getCardWidth();
    const gap = getGap();
    const baseVisible = getBaseVisibleCount();
    const availableWidth = getCarouselContentWidth();

    if (!(cardWidth > 0) || !(availableWidth > 0)) {
      return;
    }

    const fitCount = Math.max(
      1,
      Math.floor((availableWidth + gap) / (cardWidth + gap))
    );
    const nextVisible = Math.max(1, Math.min(baseVisible, fitCount));
    carousel.style.setProperty("--theorem-visible-current", `${nextVisible}`);
  };

  const alignViewportToCardBoundary = () => {
    const step = getStep();
    if (!(step > 0)) {
      return;
    }
    const snapped = Math.round(viewport.scrollLeft / step) * step;
    viewport.scrollLeft = snapped;
  };

  const getStep = () => {
    return getCardWidth() + getGap();
  };

  const getPageDistance = () => {
    return getStep() * getVisibleCount();
  };

  const holdScrollState = {
    active: false,
    direction: 0,
    frame: 0,
    pointerId: null,
    activator: null,
    activationTimer: 0,
    suppressClickFor: null,
    suppressClickTimer: 0,
  };

  const getHoldScrollSpeed = () => {
    const cardWidth = getCardWidth();
    if (!(cardWidth > 0)) {
      return 6;
    }
    return Math.max(4, Math.min(9, cardWidth / 46));
  };

  const stopHoldScroll = (snap = true) => {
    if (holdScrollState.activationTimer) {
      window.clearTimeout(holdScrollState.activationTimer);
      holdScrollState.activationTimer = 0;
    }

    if (holdScrollState.frame) {
      window.cancelAnimationFrame(holdScrollState.frame);
      holdScrollState.frame = 0;
    }

    const wasActive = holdScrollState.active;
    const pointerId = holdScrollState.pointerId;
    const activator = holdScrollState.activator;
    holdScrollState.active = false;
    holdScrollState.direction = 0;
    holdScrollState.pointerId = null;
    holdScrollState.activator = null;
    carousel.removeAttribute("data-theorem-hold-scroll");

    if (
      activator instanceof Element &&
      pointerId !== null &&
      typeof activator.hasPointerCapture === "function" &&
      activator.hasPointerCapture(pointerId)
    ) {
      activator.releasePointerCapture(pointerId);
    }

    if (wasActive && snap) {
      alignViewportToCardBoundary();
      updateButtons();
    }

    if (wasActive) {
      if (holdScrollState.suppressClickTimer) {
        window.clearTimeout(holdScrollState.suppressClickTimer);
      }
      holdScrollState.suppressClickTimer = window.setTimeout(() => {
        holdScrollState.suppressClickFor = null;
        holdScrollState.suppressClickTimer = 0;
      }, 260);
    }
  };

  const runHoldScroll = () => {
    if (!holdScrollState.active || !holdScrollState.direction) {
      return;
    }

    const maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);
    if (maxScroll <= 0) {
      stopHoldScroll(false);
      return;
    }

    const speed = getHoldScrollSpeed();
    const next = Math.max(
      0,
      Math.min(maxScroll, viewport.scrollLeft + speed * holdScrollState.direction)
    );

    viewport.scrollLeft = next;
    updateButtons();

    const atStart = next <= 0.5 && holdScrollState.direction < 0;
    const atEnd = next >= maxScroll - 0.5 && holdScrollState.direction > 0;
    if (atStart || atEnd) {
      stopHoldScroll(true);
      return;
    }

    holdScrollState.frame = window.requestAnimationFrame(runHoldScroll);
  };

  const activateButtonHoldScroll = (button, pointerId) => {
    if (!(button instanceof HTMLElement) || button.disabled) {
      return;
    }

    const maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);
    if (maxScroll <= 0) {
      return;
    }

    const direction = Number.parseInt(
      button.getAttribute("data-theorem-nav") || "0",
      10
    );
    if (!direction) {
      return;
    }

    stopHoldScroll(false);
    holdScrollState.active = true;
    holdScrollState.direction = direction;
    holdScrollState.pointerId = pointerId;
    holdScrollState.activator = button;
    holdScrollState.suppressClickFor = button;
    if (typeof button.setPointerCapture === "function") {
      button.setPointerCapture(pointerId);
    }
    carousel.setAttribute("data-theorem-hold-scroll", direction < 0 ? "left" : "right");
    holdScrollState.frame = window.requestAnimationFrame(runHoldScroll);
  };

  const queueButtonHoldScroll = (event) => {
    const button = event.currentTarget;
    if (
      event.button !== 0 ||
      !(button instanceof HTMLElement) ||
      button.disabled
    ) {
      return;
    }

    if (holdScrollState.activationTimer) {
      window.clearTimeout(holdScrollState.activationTimer);
    }

    holdScrollState.pointerId = event.pointerId;
    holdScrollState.activator = button;
    holdScrollState.activationTimer = window.setTimeout(() => {
      holdScrollState.activationTimer = 0;
      activateButtonHoldScroll(button, event.pointerId);
    }, 180);
  };

  const collectTheoremMetrics = () => {
    const frames = Array.from(track.querySelectorAll(".theorem-frame"));
    const metrics = frames.map((frame, index) => {
      const embed = frame.querySelector(".theorem-embed");
      const iframe = embed ? embed.querySelector("iframe") : null;
      const frameRect = frame.getBoundingClientRect();
      const embedRect = embed ? embed.getBoundingClientRect() : null;
      const iframeRect = iframe ? iframe.getBoundingClientRect() : null;

      return {
        index: index + 1,
        cardWidth: Number(frameRect.width.toFixed(2)),
        cardHeight: Number(frameRect.height.toFixed(2)),
        embedWidth: embedRect ? Number(embedRect.width.toFixed(2)) : 0,
        embedHeight: embedRect ? Number(embedRect.height.toFixed(2)) : 0,
        iframeWidth: iframeRect ? Number(iframeRect.width.toFixed(2)) : 0,
        iframeHeight: iframeRect ? Number(iframeRect.height.toFixed(2)) : 0,
      };
    });

    return {
      windowWidth: Number(window.innerWidth.toFixed(2)),
      viewportWidth: Number(viewport.getBoundingClientRect().width.toFixed(2)),
      visibleCount: getVisibleCount(),
      gap: Number(getGap().toFixed(2)),
      cards: metrics,
    };
  };

  const reportTheoremMetrics = () => {
    const metrics = collectTheoremMetrics();
    if (window.console && typeof window.console.groupCollapsed === "function") {
      window.console.groupCollapsed("[CircleLab] theorem metrics");
      window.console.log({
        windowWidth: metrics.windowWidth,
        viewportWidth: metrics.viewportWidth,
        visibleCount: metrics.visibleCount,
        gap: metrics.gap,
      });
      if (typeof window.console.table === "function") {
        window.console.table(metrics.cards);
      } else {
        window.console.log(metrics.cards);
      }
      window.console.groupEnd();
    }
    return metrics;
  };

  window.CircleLabDebug.getTheoremMetrics = collectTheoremMetrics;

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
    button.addEventListener("pointerdown", queueButtonHoldScroll);
    button.addEventListener("lostpointercapture", () => {
      stopHoldScroll(true);
    });
    button.addEventListener("click", (event) => {
      if (holdScrollState.suppressClickFor === button) {
        if (holdScrollState.suppressClickTimer) {
          window.clearTimeout(holdScrollState.suppressClickTimer);
          holdScrollState.suppressClickTimer = 0;
        }
        holdScrollState.suppressClickFor = null;
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      const dir = Number.parseInt(button.getAttribute("data-theorem-nav"), 10) || 1;
      viewport.scrollBy({
        left: dir * getPageDistance(),
        behavior: "smooth",
      });
    });
  });

  viewport.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("pointerup", () => {
    stopHoldScroll(true);
  });
  window.addEventListener("pointercancel", () => {
    stopHoldScroll(true);
  });
  window.addEventListener("resize", () => {
    stopHoldScroll(false);
    updateVisibleCardsForSpace();
    alignViewportToCardBoundary();
    updateButtons();
    reportTheoremMetrics();
  });
  requestAnimationFrame(() => {
    freezeRenderedTheoremSize();
    updateVisibleCardsForSpace();
    alignViewportToCardBoundary();
    updateButtons();
    reportTheoremMetrics();
  });
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
  const emptyState = chatShell.querySelector("[data-ai-chat-empty]");
  const emptySuggestionButtons = Array.from(
    chatShell.querySelectorAll("[data-ai-chat-empty-suggestion]")
  );
  const messages = chatShell.querySelector("[data-ai-chat-messages]");
  const modelValue = chatShell.querySelector(".ai-chat-model-picker-value");
  const attachButton = chatShell.querySelector(".ai-chat-icon-btn");
  const sidebarActionButtons = Array.from(
    chatShell.querySelectorAll("[data-ai-chat-sidebar-action]")
  );
  const sidebarPromptButtons = Array.from(
    chatShell.querySelectorAll("[data-ai-chat-sidebar-intent]")
  );
  const sidebarResetButton = chatShell.querySelector("[data-ai-chat-reset]");
  const heroSection = document.getElementById("heroInteractive");
  const aiStudySection = document.querySelector(".ai-study-section");
  const floatShell = document.querySelector("[data-ai-float-shell]");
  const floatForm = floatShell?.querySelector("[data-ai-float-form]");
  const floatInput = floatShell?.querySelector(".ai-float-input");
  const floatSend = floatShell?.querySelector(".ai-float-send");
  const floatFocusButton = floatShell?.querySelector("[data-ai-float-focus]");
  const floatOpenButtons = Array.from(document.querySelectorAll("[data-open-float-chat]"));
  const prefersReducedMotion = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };
  const compactViewport = typeof window.matchMedia === "function"
    ? window.matchMedia("(max-width: 620px)")
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
  const floatPromptCopy = {
    en: {
      label: "Suggested circle questions",
      placeholder: "Ask ArcMind",
      prompts: [
        "How do I prove the angle in a semicircle is 90 degrees?",
        "What is the difference between a chord and a tangent?",
        "Why are angles in the same segment equal?",
      ],
    },
    zh: {
      label: "\u63a8\u8350\u7684\u5706\u51e0\u4f55\u95ee\u9898",
      placeholder: "\u968f\u4fbf\u95ee\u4e00\u4e2a\u5706\u51e0\u4f55\u95ee\u9898",
      prompts: [
        "\u5982\u4f55\u8bc1\u660e\u534a\u5706\u6240\u5bf9\u7684\u89d2\u662f 90 \u5ea6\uff1f",
        "\u5f26\u548c\u5207\u7ebf\u6709\u4ec0\u4e48\u533a\u522b\uff1f",
        "\u4e3a\u4ec0\u4e48\u540c\u5f27\u6240\u5bf9\u7684\u89d2\u76f8\u7b49\uff1f",
      ],
    },
  };
  const sidebarPromptCopy = {
    en: {
      theorem: "Help me review the angle at the centre theorem.",
      proof: "Can we practise a circle theorem proof step by step?",
      quiz: "Give me a circle theorem hint without the full answer.",
      "history-centre":
        "Why is the angle at the centre twice the angle at the circumference?",
      "history-tangent": "Help me prove this tangent theorem.",
      "history-cyclic": "Explain the cyclic quadrilateral theorem.",
      "history-alternate": "Explain the alternate segment theorem.",
    },
    zh: {
      theorem: "帮我复习一下圆心角与圆周角定理。",
      proof: "我们可以一步一步练习一道圆几何证明题吗？",
      quiz: "给我一个圆几何提示，但先不要直接给完整答案。",
      "history-centre": "为什么同弧所对的圆心角是圆周角的两倍？",
      "history-tangent": "帮我证明这道切线定理。",
      "history-cyclic": "讲解一下圆内接四边形定理。",
      "history-alternate": "解释一下切弦定理。",
    },
  };
  const floatResponseUiCopy = {
    en: {
      brand: "ArcMind",
      panelLabel: "ArcMind answer panel",
      loadingTitle: "Working through the circle theorem",
      loadingBody: "Building a clear circle-geometry explanation...",
      closeLabel: "Hide answer panel",
      collapseLabel: "Collapse answer",
      followUp:
        "Ask a follow-up below if you want the proof rewritten with diagram letters.",
    },
    zh: {
      brand: "ArcMind",
      panelLabel: "ArcMind \u56de\u7b54\u9762\u677f",
      loadingTitle: "\u6b63\u5728\u6574\u7406\u5706\u51e0\u4f55\u601d\u8def",
      loadingBody: "\u6b63\u5728\u751f\u6210\u66f4\u6e05\u695a\u7684\u5706\u51e0\u4f55\u8bb2\u89e3\u2026\u2026",
      closeLabel: "\u6536\u8d77\u56de\u7b54\u9762\u677f",
      collapseLabel: "\u6536\u8d77\u56de\u7b54",
      followUp:
        "\u5982\u679c\u4f60\u613f\u610f\uff0c\u53ef\u4ee5\u7ee7\u7eed\u8ffd\u95ee\uff0c\u6211\u4e5f\u53ef\u4ee5\u6309\u56fe\u4e2d\u5b57\u6bcd\u5199\u6210\u8bc1\u660e\u8fc7\u7a0b\u3002",
    },
  };
  const floatAnswerLibrary = [
    {
      patterns: [
        "semicircle",
        "diameter",
        "half circle",
        "\u534a\u5706",
        "\u76f4\u5f84",
        "\u534a\u5706\u6240\u5bf9\u89d2",
      ],
      title: {
        en: "Angle in a semicircle",
        zh: "\u534a\u5706\u6240\u5bf9\u89d2",
      },
      paragraphs: {
        en: [
          "If the angle stands on a diameter, the intercepted arc is 180 degrees. An angle at the circumference is half the angle at the centre on the same arc, so the angle must be 90 degrees.",
          "A clean proof route is to mark the centre, join the centre to the endpoints of the diameter and to the point on the circle, then use equal radii and angle sums to justify the right angle.",
          "In exam-style proofs, name the diameter first, then state the theorem before writing the final angle value.",
        ],
        zh: [
          "\u5982\u679c\u8fd9\u4e2a\u89d2\u6240\u5bf9\u7684\u662f\u76f4\u5f84\uff0c\u90a3\u4e48\u5b83\u5bf9\u5e94\u7684\u5706\u5fc3\u89d2\u5c31\u662f 180 \u5ea6\u3002\u540c\u5f27\u6240\u5bf9\u7684\u5706\u5468\u89d2\u7b49\u4e8e\u5706\u5fc3\u89d2\u7684\u4e00\u534a\uff0c\u6240\u4ee5\u8fd9\u4e2a\u89d2\u4e00\u5b9a\u662f 90 \u5ea6\u3002",
          "\u66f4\u7a33\u7684\u8bc1\u660e\u8def\u7ebf\u662f\uff1a\u5148\u6807\u51fa\u5706\u5fc3\uff0c\u8fde\u63a5\u5706\u5fc3\u5230\u76f4\u5f84\u4e24\u7aef\u548c\u5706\u4e0a\u90a3\u4e2a\u70b9\uff0c\u518d\u5229\u7528\u534a\u5f84\u76f8\u7b49\u548c\u89d2\u5ea6\u5173\u7cfb\u63a8\u51fa\u76f4\u89d2\u3002",
          "\u5199\u9898\u65f6\u53ef\u4ee5\u5148\u660e\u786e\u6307\u51fa\u54ea\u6761\u7ebf\u662f\u76f4\u5f84\uff0c\u518d\u5199\u51fa\u5b9a\u7406\uff0c\u7ed3\u8bba\u4f1a\u66f4\u6e05\u6670\u3002",
        ],
      },
    },
    {
      patterns: [
        "same segment",
        "same arc",
        "same chord",
        "\u540c\u5f27",
        "\u540c\u4e00\u5f27",
        "\u540c\u5f26",
        "\u540c\u4e00\u6bb5",
      ],
      title: {
        en: "Angles in the same segment",
        zh: "\u540c\u5f27\u6240\u5bf9\u89d2",
      },
      paragraphs: {
        en: [
          "If two angles stand on the same chord and lie in the same segment of the circle, those angles are equal.",
          "The fastest route is to identify the common chord first, then name each angle as standing on that chord before applying the theorem.",
          "Check that both points are on the same side of the chord. If one point lies in the opposite segment, the theorem does not apply directly.",
        ],
        zh: [
          "\u5982\u679c\u4e24\u4e2a\u89d2\u540c\u65f6\u622a\u540c\u4e00\u6761\u5f26\uff0c\u800c\u4e14\u5b83\u4eec\u5728\u540c\u4e00\u6bb5\u5f27\u4e0a\uff0c\u90a3\u4e48\u8fd9\u4e24\u4e2a\u89d2\u76f8\u7b49\u3002",
          "\u6700\u5feb\u7684\u89e3\u9898\u65b9\u5f0f\u662f\u5148\u627e\u51fa\u516c\u5171\u7684\u5f26\uff0c\u518d\u5206\u522b\u6307\u51fa\u4e24\u4e2a\u89d2\u90fd\u662f\u7531\u8fd9\u6761\u5f26\u6240\u5bf9\uff0c\u6700\u540e\u518d\u5957\u7528\u5b9a\u7406\u3002",
          "\u8981\u6ce8\u610f\u4e24\u4e2a\u70b9\u5fc5\u987b\u843d\u5728\u5f26\u7684\u540c\u4e00\u4fa7\uff1b\u5982\u679c\u4e0d\u5728\u540c\u4e00\u6bb5\uff0c\u5c31\u4e0d\u80fd\u76f4\u63a5\u7528\u8fd9\u6761\u5b9a\u7406\u3002",
        ],
      },
    },
    {
      patterns: [
        "tangent",
        "chord and tangent",
        "radius and tangent",
        "\u5207\u7ebf",
        "\u5f26\u548c\u5207\u7ebf",
        "\u534a\u5f84\u4e0e\u5207\u7ebf",
      ],
      title: {
        en: "Chord and tangent",
        zh: "\u5f26\u4e0e\u5207\u7ebf",
      },
      paragraphs: {
        en: [
          "A chord joins two points on the circle, while a tangent touches the circle at exactly one point of contact.",
          "When a radius meets a tangent at the point of contact, they form a right angle. That is often the first fact to use in a geometry proof.",
          "If the question is about the angle between a chord and a tangent, the alternate segment theorem is usually the next theorem to check.",
        ],
        zh: [
          "\u5f26\u662f\u8fde\u63a5\u5706\u4e0a\u4e24\u70b9\u7684\u7ebf\u6bb5\uff0c\u800c\u5207\u7ebf\u53ea\u5728\u4e00\u4e2a\u5207\u70b9\u4e0e\u5706\u76f8\u63a5\u3002",
          "\u5f53\u534a\u5f84\u8fde\u5230\u5207\u70b9\u65f6\uff0c\u534a\u5f84\u4e0e\u5207\u7ebf\u5782\u76f4\uff0c\u4e5f\u5c31\u662f\u8bf4\u5b83\u4eec\u4f1a\u5f62\u6210 90 \u5ea6\u3002\u8fd9\u901a\u5e38\u662f\u8bc1\u660e\u91cc\u6700\u5148\u8981\u7528\u7684\u4e00\u6b65\u3002",
          "\u5982\u679c\u9898\u76ee\u5173\u5fc3\u7684\u662f\u5f26\u4e0e\u5207\u7ebf\u6240\u6210\u7684\u89d2\uff0c\u90a3\u4e48\u5f80\u5f80\u8981\u7ee7\u7eed\u68c0\u67e5\u5207\u5f26\u5b9a\u7406\u3002",
        ],
      },
    },
    {
      patterns: [
        "cyclic quadrilateral",
        "\u5185\u63a5\u56db\u8fb9\u5f62",
        "\u5706\u5185\u63a5\u56db\u8fb9\u5f62",
      ],
      title: {
        en: "Cyclic quadrilateral",
        zh: "\u5706\u5185\u63a5\u56db\u8fb9\u5f62",
      },
      paragraphs: {
        en: [
          "For a cyclic quadrilateral, opposite interior angles add to 180 degrees. That makes one missing angle a quick supplement calculation.",
          "If one side is extended, the exterior angle is equal to the interior opposite angle. That form is often easier to use in angle-chasing questions.",
          "A strong proof route is to state that the quadrilateral is cyclic first, then choose whichever angle relation matches the diagram best.",
        ],
        zh: [
          "\u5bf9\u4e8e\u5706\u5185\u63a5\u56db\u8fb9\u5f62\uff0c\u5bf9\u89d2\u4e4b\u548c\u7b49\u4e8e 180 \u5ea6\uff0c\u6240\u4ee5\u5f88\u591a\u7f3a\u89d2\u90fd\u80fd\u5feb\u901f\u7528\u8865\u89d2\u5173\u7cfb\u6c42\u51fa\u3002",
          "\u5982\u679c\u5176\u4e2d\u4e00\u6761\u8fb9\u88ab\u5ef6\u957f\uff0c\u90a3\u4e48\u5916\u89d2\u7b49\u4e8e\u5185\u5bf9\u89d2\uff0c\u8fd9\u5728\u8ffd\u89d2\u9898\u91cc\u5f88\u5e38\u7528\u3002",
          "\u66f4\u7a33\u7684\u5199\u6cd5\u662f\u5148\u6307\u51fa\u56db\u8fb9\u5f62\u5185\u63a5\u4e8e\u540c\u4e00\u4e2a\u5706\uff0c\u518d\u6839\u636e\u56fe\u5f62\u9009\u62e9\u5bf9\u89d2\u4e92\u8865\u6216\u8005\u5916\u89d2\u7b49\u4e8e\u5185\u5bf9\u89d2\u3002",
        ],
      },
    },
    {
      patterns: [
        "angle at the center",
        "angle at the centre",
        "circumference",
        "\u5706\u5fc3\u89d2",
        "\u5706\u5468\u89d2",
      ],
      title: {
        en: "Centre and circumference",
        zh: "\u5706\u5fc3\u89d2\u4e0e\u5706\u5468\u89d2",
      },
      paragraphs: {
        en: [
          "The angle at the centre is twice the angle at the circumference standing on the same arc.",
          "So the key move is to match both angles to one intercepted arc. Once the arc is identified, the ratio between the two angles is immediate.",
          "If radii are already drawn, the central angle is often the easiest anchor to use before moving back to the circumference angle.",
        ],
        zh: [
          "\u540c\u5f27\u6240\u5bf9\u7684\u5706\u5fc3\u89d2\u7b49\u4e8e\u5706\u5468\u89d2\u7684 2 \u500d\u3002",
          "\u6240\u4ee5\u89e3\u9898\u7684\u5173\u952e\u662f\u5148\u5224\u65ad\u8fd9\u4e24\u4e2a\u89d2\u662f\u4e0d\u662f\u5bf9\u540c\u4e00\u6bb5\u5f27\uff0c\u53ea\u8981\u5bf9\u7684\u662f\u540c\u5f27\uff0c\u500d\u6570\u5173\u7cfb\u5c31\u53ef\u4ee5\u76f4\u63a5\u5199\u51fa\u6765\u3002",
          "\u5982\u679c\u56fe\u4e2d\u5df2\u7ecf\u753b\u51fa\u4e86\u534a\u5f84\uff0c\u901a\u5e38\u53ef\u4ee5\u5148\u6293\u4f4f\u5706\u5fc3\u89d2\uff0c\u518d\u5012\u56de\u53bb\u6c42\u5706\u5468\u89d2\u3002",
        ],
      },
    },
    {
      patterns: [],
      title: {
        en: "Circle theorem walkthrough",
        zh: "\u5706\u51e0\u4f55\u601d\u8def\u6574\u7406",
      },
      paragraphs: {
        en: [
          "Start by naming the objects in the diagram: radius, chord, tangent, diameter, arc, or cyclic quadrilateral. Most circle proofs become easier once the structure is explicit.",
          "Then look for one of the high-frequency theorems: angle at the centre, angle in a semicircle, angles in the same segment, radius and tangent, tangent-chord, or opposite angles in a cyclic quadrilateral.",
          "If you share the diagram letters or the exact given angle, I can turn this into a cleaner step-by-step proof.",
        ],
        zh: [
          "\u5148\u628a\u56fe\u4e2d\u7684\u5143\u7d20\u8bf4\u6e05\u695a\uff1a\u534a\u5f84\u3001\u5f26\u3001\u5207\u7ebf\u3001\u76f4\u5f84\u3001\u5f27\uff0c\u6216\u8005\u5185\u63a5\u56db\u8fb9\u5f62\u3002\u5f88\u591a\u5706\u51e0\u4f55\u9898\u5728\u7ed3\u6784\u88ab\u70b9\u660e\u4e4b\u540e\u5c31\u4f1a\u7acb\u523b\u7b80\u5355\u5f88\u591a\u3002",
          "\u7136\u540e\u518d\u53bb\u627e\u5e38\u7528\u5b9a\u7406\uff1a\u5706\u5fc3\u89d2\u4e0e\u5706\u5468\u89d2\uff0c\u534a\u5706\u6240\u5bf9\u89d2\uff0c\u540c\u5f27\u6240\u5bf9\u89d2\uff0c\u534a\u5f84\u4e0e\u5207\u7ebf\u5782\u76f4\uff0c\u5207\u5f26\u5b9a\u7406\uff0c\u6216\u8005\u5185\u63a5\u56db\u8fb9\u5f62\u5bf9\u89d2\u4e92\u8865\u3002",
          "\u5982\u679c\u4f60\u53ef\u4ee5\u8865\u5145\u56fe\u4e2d\u5b57\u6bcd\u6216\u5df2\u77e5\u89d2\uff0c\u6211\u53ef\u4ee5\u628a\u8fd9\u4e2a\u601d\u8def\u6539\u5199\u6210\u66f4\u5b8c\u6574\u7684\u9010\u6b65\u8bc1\u660e\u3002",
        ],
      },
    },
  ];
  let floatPromptPanel = null;
  let floatResponsePanel = null;
  let floatResponseTitle = null;
  let floatResponseBody = null;
  let floatResponseAnswer = null;
  let floatResponseMinimize = null;
  let isFloatResponseVisible = false;
  let nextConversationId = 0;
  const mainConversationHistory = [];
  const floatConversationHistory = [];
  const floatPromptButtons = [];

  const resolveFloatLanguage = (language = "") => {
    if (typeof language === "string" && language.toLowerCase().startsWith("zh")) {
      return "zh";
    }

    return document.documentElement.lang.toLowerCase().startsWith("zh") ? "zh" : "en";
  };

  const getFloatPromptData = (language = "") =>
    floatPromptCopy[resolveFloatLanguage(language)] ?? floatPromptCopy.en;

  const getSidebarPrompt = (intent, language = "") => {
    const lang = resolveFloatLanguage(language);
    return sidebarPromptCopy[lang]?.[intent] ?? sidebarPromptCopy.en[intent] ?? "";
  };

  const setActiveSidebarAction = (intent = "ask") => {
    sidebarActionButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      button.classList.toggle(
        "is-active",
        (button.dataset.aiChatSidebarAction?.trim() ?? "") === intent
      );
    });
  };

  const getFloatResponseUiData = (language = "") =>
    floatResponseUiCopy[resolveFloatLanguage(language)] ?? floatResponseUiCopy.en;

  const includesPromptPattern = (normalizedPrompt, patterns) =>
    patterns.some((pattern) => normalizedPrompt.includes(pattern));

  const buildFloatAnswer = (prompt, language = "") => {
    const lang = resolveFloatLanguage(language);
    const normalizedPrompt = prompt.trim().toLowerCase();
    const matchedAnswer =
      floatAnswerLibrary.find(
        (entry) => entry.patterns.length && includesPromptPattern(normalizedPrompt, entry.patterns)
      ) ?? floatAnswerLibrary[floatAnswerLibrary.length - 1];

    return {
      title: matchedAnswer.title[lang] ?? matchedAnswer.title.en,
      paragraphs: matchedAnswer.paragraphs[lang] ?? matchedAnswer.paragraphs.en,
    };
  };

  const hasMainConversationHistory = () => mainConversationHistory.length > 0;

  const hasFloatConversationHistory = () => floatConversationHistory.length > 0;

  const getLatestFloatConversationTurn = () =>
    hasFloatConversationHistory()
      ? floatConversationHistory[floatConversationHistory.length - 1]
      : null;

  const syncFloatResponseScrollState = () => {
    if (
      !(floatResponseBody instanceof HTMLElement) ||
      !(floatResponseAnswer instanceof HTMLElement)
    ) {
      return;
    }

    const maxScroll = Math.max(
      0,
      floatResponseAnswer.scrollHeight - floatResponseAnswer.clientHeight
    );
    const isScrollable = maxScroll > 6;
    const hasScrollTop = floatResponseAnswer.scrollTop > 6;
    const hasScrollBottom = maxScroll - floatResponseAnswer.scrollTop > 6;

    floatResponseBody.classList.toggle("is-scrollable", isScrollable);
    floatResponseBody.classList.toggle("has-scroll-top", hasScrollTop);
    floatResponseBody.classList.toggle("has-scroll-bottom", isScrollable && hasScrollBottom);
  };

  const getFloatResponseTitleText = (language = "") => {
    const responseUi = getFloatResponseUiData(language);
    const latestTurn = getLatestFloatConversationTurn();

    if (!latestTurn) {
      return responseUi.brand;
    }

    if (latestTurn.status === "loading") {
      return `${responseUi.brand} • ${responseUi.loadingTitle}`;
    }

    const latestAnswer = buildFloatAnswer(latestTurn.prompt, language);
    return `${responseUi.brand} • ${latestAnswer.title}`;
  };

  const buildMainReplyText = (prompt, language = "") => {
    const answer = buildFloatAnswer(prompt, language);
    return answer.paragraphs.join("\n\n");
  };

  const createFloatLoadingNode = (language = "") => {
    const responseUi = getFloatResponseUiData(language);
    const loadingWrap = document.createElement("div");
    loadingWrap.className = "ai-float-response-loading";

    const loadingDots = document.createElement("div");
    loadingDots.className = "ai-float-response-loading-dots";

    for (let index = 0; index < 3; index += 1) {
      const loadingDot = document.createElement("span");
      loadingDot.className = "ai-float-response-loading-dot";
      loadingDots.append(loadingDot);
    }

    const loadingLabel = document.createElement("p");
    loadingLabel.className = "ai-float-response-loading-label";
    loadingLabel.textContent = responseUi.loadingBody;

    loadingWrap.append(loadingDots, loadingLabel);
    return loadingWrap;
  };

  const createFloatResponseCopy = (prompt, language = "") => {
    const answer = buildFloatAnswer(prompt, language);
    const responseCopy = document.createElement("div");
    responseCopy.className = "ai-float-response-copy";

    answer.paragraphs.forEach((paragraph) => {
      const paragraphNode = document.createElement("p");
      paragraphNode.textContent = paragraph;
      responseCopy.append(paragraphNode);
    });

    return responseCopy;
  };

  const syncFloatPromptVisibility = () => {
    if (!(floatShell instanceof HTMLElement) || !(floatPromptPanel instanceof HTMLElement)) {
      return;
    }

    const isVisible =
      floatShell.classList.contains("is-expanded") &&
      !floatShell.classList.contains("has-value") &&
      !floatShell.classList.contains("has-response");

    floatPromptPanel.setAttribute("aria-hidden", String(!isVisible));
  };

  const setFloatExpanded = (expanded) => {
    if (!(floatShell instanceof HTMLElement)) {
      return;
    }

    floatShell.classList.toggle("is-expanded", Boolean(expanded));
    syncFloatPromptVisibility();
  };

  const setFloatResponseVisible = (visible, language = "") => {
    if (!(floatShell instanceof HTMLElement)) {
      return;
    }

    isFloatResponseVisible = Boolean(visible) && hasFloatConversationHistory();
    const isResponding = floatConversationHistory.some((turn) => turn.status === "loading");

    floatShell.classList.toggle("has-response", isFloatResponseVisible);
    floatShell.classList.toggle("is-responding", isFloatResponseVisible && isResponding);

    if (floatResponsePanel instanceof HTMLElement) {
      floatResponsePanel.setAttribute("aria-hidden", String(!isFloatResponseVisible));
    }

    if (floatResponseTitle instanceof HTMLElement) {
      floatResponseTitle.textContent = isFloatResponseVisible
        ? getFloatResponseTitleText(language)
        : "";
    }

    syncFloatPromptVisibility();
  };

  const clearFloatResponse = (collapse = false) => {
    setFloatResponseVisible(false);

    if (floatResponseAnswer instanceof HTMLElement) {
      floatResponseAnswer.scrollTop = 0;
    }

    if (floatResponseBody instanceof HTMLElement) {
      floatResponseBody.classList.remove(
        "is-scrollable",
        "has-scroll-top",
        "has-scroll-bottom"
      );
    }

    if (collapse) {
      setFloatExpanded(false);
      return;
    }

    syncFloatPromptVisibility();
  };

  const scrollFloatResponseToBottom = () => {
    if (!(floatResponseAnswer instanceof HTMLElement)) {
      return;
    }

    const nextTop = floatResponseAnswer.scrollHeight;

    if (prefersReducedMotion.matches || typeof floatResponseAnswer.scrollTo !== "function") {
      floatResponseAnswer.scrollTop = nextTop;
      return;
    }

    floatResponseAnswer.scrollTo({
      top: nextTop,
      behavior: "smooth",
    });
  };

  const renderFloatResponseHistory = (language = "", options = {}) => {
    if (
      !(floatResponsePanel instanceof HTMLElement) ||
      !(floatResponseTitle instanceof HTMLElement) ||
      !(floatResponseAnswer instanceof HTMLElement)
    ) {
      return;
    }

    const { scrollToBottom = false } = options;

    if (!hasFloatConversationHistory()) {
      floatResponseAnswer.replaceChildren();
      setFloatResponseVisible(false, language);
      return;
    }

    const responseList = document.createElement("div");
    responseList.className = "ai-float-response-list";

    floatConversationHistory.forEach((turn) => {
      const entry = document.createElement("article");
      entry.className = `ai-float-response-entry is-${turn.status}`;

      const questionNode = document.createElement("p");
      questionNode.className = "ai-float-response-question";
      questionNode.textContent = turn.prompt;

      const answerNode = document.createElement("div");
      answerNode.className = "ai-float-response-answer";
      answerNode.append(
        turn.status === "loading"
          ? createFloatLoadingNode(language)
          : createFloatResponseCopy(turn.prompt, language)
      );

      entry.append(questionNode, answerNode);
      responseList.append(entry);
    });

    floatResponseAnswer.replaceChildren(responseList);
    setFloatResponseVisible(isFloatResponseVisible, language);

    window.requestAnimationFrame(() => {
      if (scrollToBottom) {
        scrollFloatResponseToBottom();
      }

      syncFloatResponseScrollState();
    });
  };

  const syncFloatPromptCopy = (language = "") => {
    const promptData = getFloatPromptData(language);
    const responseUi = getFloatResponseUiData(language);

    if (floatInput instanceof HTMLInputElement) {
      floatInput.placeholder = promptData.placeholder;
    }

    if (floatPromptPanel instanceof HTMLElement) {
      floatPromptPanel.setAttribute("aria-label", promptData.label);
    }

    floatPromptButtons.forEach((button, index) => {
      const prompt = promptData.prompts[index] ?? promptData.prompts[0] ?? "";
      button.textContent = prompt;
      button.dataset.prompt = prompt;
      button.setAttribute("aria-label", prompt);
    });

    if (floatResponsePanel instanceof HTMLElement) {
      floatResponsePanel.setAttribute("aria-label", responseUi.panelLabel);
    }

    if (floatResponseMinimize instanceof HTMLButtonElement) {
      floatResponseMinimize.setAttribute("aria-label", responseUi.closeLabel);
    }

    if (hasFloatConversationHistory()) {
      renderFloatResponseHistory(language);
    }
  };

  if (floatShell instanceof HTMLElement) {
    let floatEntranceTimer = 0;

    const revealFloatShell = () => {
      floatShell.classList.add("is-ready");

      if (prefersReducedMotion.matches) {
        return;
      }

      floatShell.classList.remove("is-entering");
      void floatShell.offsetWidth;
      floatShell.classList.add("is-entering");

      window.clearTimeout(floatEntranceTimer);
      floatEntranceTimer = window.setTimeout(() => {
        floatShell.classList.remove("is-entering");
      }, 760);
    };

    if (prefersReducedMotion.matches) {
      revealFloatShell();
    } else if (document.readyState === "complete") {
      window.setTimeout(revealFloatShell, 90);
    } else {
      window.addEventListener("load", () => {
        window.setTimeout(revealFloatShell, 90);
      }, { once: true });
    }
  }

  const autoResizeInput = () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, maxComposerHeight)}px`;
    input.style.overflowY = input.scrollHeight > maxComposerHeight ? "auto" : "hidden";
  };

  const syncSendState = () => {
    sendButton.disabled = input.value.trim().length === 0;
  };

  const syncFloatState = () => {
    if (
      !(floatShell instanceof HTMLElement) ||
      !(floatInput instanceof HTMLInputElement) ||
      !(floatSend instanceof HTMLButtonElement)
    ) {
      return;
    }

    const hasPrompt = floatInput.value.trim().length > 0;
    floatShell.classList.toggle("has-value", hasPrompt);
    floatSend.disabled = !hasPrompt;
    syncFloatPromptVisibility();
  };

  const focusComposer = (preventScroll = false) => {
    try {
      input.focus(preventScroll ? { preventScroll: true } : undefined);
    } catch (error) {
      input.focus();
    }

    const caret = input.value.length;
    input.setSelectionRange(caret, caret);
  };

  const scrollTranscriptToBottom = (behavior = "smooth") => {
    const nextTop = messages.scrollHeight;

    if (prefersReducedMotion.matches || typeof messages.scrollTo !== "function") {
      messages.scrollTop = nextTop;
      return;
    }

    messages.scrollTo({
      top: nextTop,
      behavior,
    });
  };

  const createMessage = (role, label, text, options = {}) => {
    const { compact = false, detailed = false, loading = false } = options;
    const message = document.createElement("article");
    message.className = `ai-chat-message is-${role}`;

    if (compact) {
      message.classList.add("is-compact");
    }

    if (loading) {
      message.classList.add("is-loading");
    }

    const meta = document.createElement("p");
    meta.className = "ai-chat-message-meta";
    meta.textContent = label;

    const bubble = document.createElement("div");
    bubble.className = "ai-chat-message-bubble";

    if (detailed || loading) {
      bubble.classList.add("is-detailed");
    }

    if (loading) {
      bubble.classList.add("is-loading");
    }

    bubble.textContent = text;

    message.append(meta, bubble);
    return message;
  };

  const mainChatUiCopy = {
    en: {
      assistantLabel: "ArcMind",
      userLabel: "You",
      assistantPrefix: "ArcMind -",
      welcome: "Ask a question about circle and I'll help you think it through.",
    },
    zh: {
      assistantLabel: "ArcMind",
      userLabel: "你",
      assistantPrefix: "ArcMind -",
      welcome: "问我任意圆几何问题，我会陪你一步步推理。",
    },
  };

  const getMainChatUiData = (language = "") =>
    mainChatUiCopy[resolveFloatLanguage(language)] ?? mainChatUiCopy.en;

  const buildTutorReply = (language = "") => getMainChatUiData(language).welcome;

  const renderMainTranscript = (language = "", behavior = "smooth") => {
    const uiData = getMainChatUiData(language);

    messages.replaceChildren();

    if (!hasMainConversationHistory()) {
      if (emptyState instanceof HTMLElement) {
        emptyState.hidden = false;
      }

      if (messages instanceof HTMLElement) {
        messages.hidden = true;
      }

      if (transcript instanceof HTMLElement) {
        transcript.classList.add("is-empty");
      }
      return;
    }

    if (emptyState instanceof HTMLElement) {
      emptyState.hidden = true;
    }

    if (messages instanceof HTMLElement) {
      messages.hidden = false;
    }

    if (transcript instanceof HTMLElement) {
      transcript.classList.remove("is-empty");
    }

    mainConversationHistory.forEach((turn) => {
      messages.append(createMessage("user", uiData.userLabel, turn.prompt));

      const assistantText =
        turn.status === "loading"
          ? getFloatResponseUiData(language).loadingBody
          : buildMainReplyText(turn.prompt, language);

      messages.append(
        createMessage(
          "assistant",
          `${uiData.assistantPrefix} ${turn.model}`,
          assistantText,
          {
            detailed: true,
            loading: turn.status === "loading",
          }
        )
      );
    });

    requestAnimationFrame(() => {
      scrollTranscriptToBottom(behavior);
    });
  };

  const resetMainConversation = (focusAfter = true) => {
    mainConversationHistory.length = 0;
    renderMainTranscript(resolveFloatLanguage(), "auto");
    setActiveSidebarAction("ask");

    if (focusAfter) {
      input.value = "";
      autoResizeInput();
      syncSendState();
      focusComposer(true);
    }
  };

  const submitSharedPrompt = (prompt, source = "main") => {
    const language = resolveFloatLanguage();
    const turn = {
      id: `arcmind-turn-${++nextConversationId}`,
      prompt,
      status: "loading",
      model: modelValue.textContent.trim(),
    };

    floatConversationHistory.push(turn);

    if (source !== "float") {
      mainConversationHistory.push(turn);
    }

    if (source === "float") {
      setFloatExpanded(true);
      setFloatResponseVisible(true, language);
    }

    if (source !== "float") {
      renderMainTranscript(language);
    }

    renderFloatResponseHistory(language, {
      scrollToBottom: source === "float" || isFloatResponseVisible,
    });

    window.setTimeout(() => {
      turn.status = "ready";
      const nextLanguage = resolveFloatLanguage();

      if (source !== "float") {
        renderMainTranscript(nextLanguage);
      }

      renderFloatResponseHistory(nextLanguage, {
        scrollToBottom: isFloatResponseVisible,
      });
    }, prefersReducedMotion.matches ? 120 : 320);
  };

  const submitMainPrompt = (prompt, focusAfter = true) => {
    if (!prompt) {
      return;
    }

    submitSharedPrompt(prompt, "main");
    input.value = "";
    autoResizeInput();
    syncSendState();

    if (focusAfter) {
      focusComposer(true);
    }
  };

  const handleMainComposerSubmit = (focusAfter = true) => {
    const prompt = input.value.trim();
    if (!prompt) {
      syncSendState();
      focusComposer();
      return false;
    }

    setActiveSidebarAction("ask");
    submitMainPrompt(prompt, focusAfter);
    return true;
  };

  const revealArcMind = () => {
    clearFloatResponse();
    setFloatExpanded(false);

    if (aiStudySection instanceof HTMLElement) {
      aiStudySection.scrollIntoView({
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
        block: compactViewport.matches ? "start" : "center",
      });
    }

    if (prefersReducedMotion.matches) {
      requestAnimationFrame(() => {
        focusComposer(true);
      });
      return;
    }

    window.setTimeout(() => {
      focusComposer(true);
    }, compactViewport.matches ? 320 : 240);
  };

  const setFloatHeroOverride = (enabled) => {
    if (!(floatShell instanceof HTMLElement)) {
      return;
    }

    floatShell.classList.toggle("is-hero-forced", Boolean(enabled));
  };

  const openFloatChatWindow = () => {
    if (!(floatShell instanceof HTMLElement) || !(floatInput instanceof HTMLInputElement)) {
      return;
    }

    const previousScrollX = window.scrollX;
    const previousScrollY = window.scrollY;

    setFloatHeroOverride(true);
    floatShell.classList.add("is-ready");
    floatShell.classList.remove("is-docked-away");
    setFloatExpanded(true);

    const language = resolveFloatLanguage();
    if (hasFloatConversationHistory()) {
      setFloatResponseVisible(true, language);
      renderFloatResponseHistory(language, { scrollToBottom: true });
    }

    try {
      floatInput.focus({ preventScroll: true });
    } catch (error) {
      floatInput.focus();
    }

    window.scrollTo({
      left: previousScrollX,
      top: previousScrollY,
      behavior: "auto",
    });

    const caret = floatInput.value.length;
    floatInput.setSelectionRange(caret, caret);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleMainComposerSubmit(true);
  });

  sendButton.addEventListener("click", (event) => {
    event.preventDefault();
    handleMainComposerSubmit(true);
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
    handleMainComposerSubmit(true);
  });

  if (attachButton instanceof HTMLButtonElement) {
    attachButton.addEventListener("click", () => {
      focusComposer();
    });
  }

  emptySuggestionButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    button.addEventListener("click", () => {
      const prompt = button.textContent?.trim() ?? "";
      if (!prompt) {
        return;
      }

      setActiveSidebarAction("ask");
      submitMainPrompt(prompt, true);
    });
  });

  sidebarPromptButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    button.addEventListener("click", () => {
      const intent = button.dataset.aiChatSidebarIntent?.trim() ?? "";
      if (button.hasAttribute("data-ai-chat-sidebar-action")) {
        setActiveSidebarAction(intent || "ask");
      }

      if (intent === "ask") {
        resetMainConversation(true);
        return;
      }

      const prompt = getSidebarPrompt(intent);
      if (!prompt) {
        return;
      }

      submitMainPrompt(prompt, true);
    });
  });

  if (sidebarResetButton instanceof HTMLButtonElement) {
    sidebarResetButton.addEventListener("click", () => {
      resetMainConversation(true);
    });
  }

  if (
    floatForm instanceof HTMLFormElement &&
    floatInput instanceof HTMLInputElement &&
    floatSend instanceof HTMLButtonElement
  ) {
    const resetFloatBarBorderSpot = () => {
      floatForm.style.setProperty("--ai-float-border-spot-x", "50%");
      floatForm.style.setProperty("--ai-float-border-spot-y", "50%");
    };

    const updateFloatBarBorderSpot = (event) => {
      const rect = floatForm.getBoundingClientRect();

      if (!rect.width || !rect.height) {
        return;
      }

      const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
      const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);

      floatForm.style.setProperty("--ai-float-border-spot-x", `${x}px`);
      floatForm.style.setProperty("--ai-float-border-spot-y", `${y}px`);
    };

    resetFloatBarBorderSpot();
    floatForm.addEventListener("pointerenter", updateFloatBarBorderSpot, {
      passive: true,
    });
    floatForm.addEventListener("pointermove", updateFloatBarBorderSpot, {
      passive: true,
    });
    floatForm.addEventListener("pointerleave", resetFloatBarBorderSpot);

    if (floatShell instanceof HTMLElement) {
      floatResponsePanel = document.createElement("section");
      floatResponsePanel.className = "ai-float-response";
      floatResponsePanel.setAttribute("aria-hidden", "true");

      const floatResponseShell = document.createElement("div");
      floatResponseShell.className = "ai-float-response-shell";

      const floatResponseHeader = document.createElement("div");
      floatResponseHeader.className = "ai-float-response-header";

      const floatResponseIdentity = document.createElement("div");
      floatResponseIdentity.className = "ai-float-response-identity";

      const floatResponseMark = document.createElement("span");
      floatResponseMark.className = "ai-float-response-mark";
      floatResponseMark.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6.4"></circle><path d="M12 5.6v12.8"></path><path d="M5.6 12h12.8"></path><path d="M16.6 7.4 7.4 16.6"></path></svg>';

      floatResponseTitle = document.createElement("p");
      floatResponseTitle.className = "ai-float-response-title";

      floatResponseIdentity.append(floatResponseMark, floatResponseTitle);

      floatResponseMinimize = document.createElement("button");
      floatResponseMinimize.type = "button";
      floatResponseMinimize.className = "ai-float-response-minimize";
      floatResponseMinimize.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"></path></svg>';
      floatResponseMinimize.addEventListener("click", () => {
        clearFloatResponse(true);
      });

      floatResponseHeader.append(floatResponseIdentity, floatResponseMinimize);

      floatResponseBody = document.createElement("div");
      floatResponseBody.className = "ai-float-response-body";

      floatResponseAnswer = document.createElement("div");
      floatResponseAnswer.className = "ai-float-response-log";
      floatResponseAnswer.setAttribute("aria-live", "polite");
      floatResponseAnswer.setAttribute("aria-relevant", "additions text");
      floatResponseAnswer.addEventListener("scroll", () => {
        syncFloatResponseScrollState();
      }, { passive: true });

      floatResponseBody.append(floatResponseAnswer);

      floatResponseShell.append(floatResponseHeader, floatResponseBody);
      floatResponsePanel.append(floatResponseShell);
      floatShell.insertBefore(floatResponsePanel, floatForm);

      floatPromptPanel = document.createElement("div");
      floatPromptPanel.className = "ai-float-prompts";
      floatPromptPanel.setAttribute("role", "group");
      floatPromptPanel.setAttribute("aria-hidden", "true");
      floatShell.insertBefore(floatPromptPanel, floatForm);

      for (let index = 0; index < 3; index += 1) {
        const promptButton = document.createElement("button");
        promptButton.type = "button";
        promptButton.className = "ai-float-prompt";
        promptButton.dataset.aiFloatPrompt = "";
        promptButton.dataset.prompt = "";
        promptButton.addEventListener("click", () => {
          const nextPrompt = promptButton.dataset.prompt ?? "";
          floatInput.value = nextPrompt;
          syncFloatState();
          setFloatExpanded(true);

          try {
            floatInput.focus({ preventScroll: true });
          } catch (error) {
            floatInput.focus();
          }

          const caret = floatInput.value.length;
          floatInput.setSelectionRange(caret, caret);
        });

        floatPromptPanel.append(promptButton);
        floatPromptButtons.push(promptButton);
      }

      syncFloatPromptCopy();
      window.addEventListener("resize", () => {
        syncFloatResponseScrollState();
      });
    }

    floatForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const prompt = floatInput.value.trim();
      if (!prompt) {
        revealArcMind();
        syncFloatState();
        return;
      }

      submitSharedPrompt(prompt, "float");
      floatInput.value = "";
      syncFloatState();
    });

    floatInput.addEventListener("input", () => {
      syncFloatState();
    });

    floatInput.addEventListener("focus", () => {
      if (hasFloatConversationHistory()) {
        setFloatExpanded(true);
        setFloatResponseVisible(true, resolveFloatLanguage());
        renderFloatResponseHistory(resolveFloatLanguage(), {
          scrollToBottom: true,
        });
        return;
      }

      setFloatExpanded(true);
    });

    floatInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
        return;
      }

      event.preventDefault();

      if (typeof floatForm.requestSubmit === "function") {
        floatForm.requestSubmit();
        return;
      }

      floatSend.click();
    });
  }

  if (
    floatFocusButton instanceof HTMLButtonElement &&
    floatInput instanceof HTMLInputElement
  ) {
    floatFocusButton.addEventListener("click", () => {
      if (floatInput.value.trim()) {
        input.value = floatInput.value.trim();
        autoResizeInput();
        syncSendState();
        floatInput.value = "";
        syncFloatState();
      }

      revealArcMind();
    });
  }

  if (floatShell instanceof HTMLElement) {
    const collapseFloatIfOutside = (target) => {
      if (
        !floatShell.classList.contains("is-expanded") &&
        !floatShell.classList.contains("has-response")
      ) {
        return;
      }

      if (target instanceof Node && floatShell.contains(target)) {
        return;
      }

      clearFloatResponse();
      setFloatExpanded(false);
      setFloatHeroOverride(false);
    };

    document.addEventListener("pointerdown", (event) => {
      collapseFloatIfOutside(event.target);
    });

    document.addEventListener("focusin", (event) => {
      collapseFloatIfOutside(event.target);
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key !== "Escape" ||
        (!floatShell.classList.contains("is-expanded") &&
          !floatShell.classList.contains("has-response"))
      ) {
        return;
      }

      clearFloatResponse();
      setFloatExpanded(false);
      setFloatHeroOverride(false);

      if (document.activeElement instanceof HTMLElement && floatShell.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    });
  }

  if (floatShell instanceof HTMLElement && "IntersectionObserver" in window) {
    const dockTargets = [heroSection, aiStudySection].filter(
      (section) => section instanceof HTMLElement
    );

    if (dockTargets.length) {
      const activeDockTargets = new Set();
      const syncDockedState = () => {
        const shouldDockAway =
          activeDockTargets.size > 0 &&
          !floatShell.classList.contains("is-hero-forced");

        floatShell.classList.toggle("is-docked-away", shouldDockAway);

        if (shouldDockAway) {
          clearFloatResponse();
          setFloatExpanded(false);
        }
      };

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const shouldDock =
              entry.isIntersecting && entry.intersectionRatio > 0.12;

            if (shouldDock) {
              activeDockTargets.add(entry.target);
            } else {
              activeDockTargets.delete(entry.target);
            }
          });

          syncDockedState();
        },
        {
          threshold: [0, 0.12, 0.26, 0.48],
          rootMargin: "-8% 0px 16% 0px",
        }
      );

      dockTargets.forEach((section) => {
        observer.observe(section);
      });
    }
  }

  autoResizeInput();
  syncSendState();
  syncFloatState();
  syncFloatPromptCopy();
  renderMainTranscript(resolveFloatLanguage(), "auto");
  renderFloatResponseHistory(resolveFloatLanguage());

  window.addEventListener("circlelab:languagechange", (event) => {
    const nextLanguage = event.detail?.language ?? "";
    syncFloatPromptCopy(nextLanguage);
    renderMainTranscript(nextLanguage, "auto");
    renderFloatResponseHistory(nextLanguage);
    syncFloatState();
  });
})();

(() => {
  const chatShell = document.querySelector(".ai-chat-shell");
  if (!(chatShell instanceof HTMLElement) || chatShell.dataset.aiFallbackBound === "true") {
    return;
  }

  chatShell.dataset.aiFallbackBound = "true";

  const form = chatShell.querySelector(".ai-chat-composer");
  const input = chatShell.querySelector(".ai-chat-draft");
  const sendButton = chatShell.querySelector(".ai-chat-send");
  const transcript = chatShell.querySelector(".ai-chat-transcript");
  const emptyState = chatShell.querySelector("[data-ai-chat-empty]");
  const messages = chatShell.querySelector("[data-ai-chat-messages]");
  const modelValue = chatShell.querySelector(".ai-chat-model-picker-value");
  const attachButton = chatShell.querySelector(".ai-chat-icon-btn");
  const resetButton = chatShell.querySelector("[data-ai-chat-reset]");
  const suggestionButtons = Array.from(
    chatShell.querySelectorAll("[data-ai-chat-empty-suggestion]")
  );
  const sidebarIntentButtons = Array.from(
    chatShell.querySelectorAll("[data-ai-chat-sidebar-intent]")
  );
  const sidebarActionButtons = Array.from(
    chatShell.querySelectorAll("[data-ai-chat-sidebar-action]")
  );

  if (
    !(form instanceof HTMLFormElement) ||
    !(input instanceof HTMLTextAreaElement) ||
    !(sendButton instanceof HTMLButtonElement) ||
    !(transcript instanceof HTMLElement) ||
    !(messages instanceof HTMLElement) ||
    !(modelValue instanceof HTMLElement)
  ) {
    return;
  }

  const prefersReducedMotion = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };
  const maxComposerHeight = 172;
  const fallbackHistory = [];
  let nextFallbackId = 0;

  const uiCopy = {
    user: document.documentElement.lang.toLowerCase().startsWith("zh") ? "你" : "You",
    assistantPrefix: "ArcMind -",
  };

  const sidebarPrompts = {
    ask: "",
    theorem: "Help me review a circle theorem step by step.",
    proof: "Can we practise a circle theorem proof step by step?",
    quiz: "Give me a hint for a circle theorem problem without the full answer.",
    "history-centre":
      "Why is the angle at the centre twice the angle at the circumference?",
    "history-tangent": "Help me prove this tangent theorem.",
    "history-cyclic": "Explain the cyclic quadrilateral theorem.",
    "history-alternate": "Explain the alternate segment theorem.",
  };

  const autoResizeInput = () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, maxComposerHeight)}px`;
    input.style.overflowY = input.scrollHeight > maxComposerHeight ? "auto" : "hidden";
  };

  const syncSendState = () => {
    sendButton.disabled = input.value.trim().length === 0;
  };

  const focusComposer = () => {
    try {
      input.focus({ preventScroll: true });
    } catch (error) {
      input.focus();
    }

    const caret = input.value.length;
    input.setSelectionRange(caret, caret);
  };

  const setActiveSidebarAction = (intent = "ask") => {
    sidebarActionButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      button.classList.toggle(
        "is-active",
        (button.dataset.aiChatSidebarAction?.trim() ?? "") === intent
      );
    });
  };

  const buildFallbackReply = (prompt) => {
    const normalizedPrompt = prompt.trim().toLowerCase();

    if (normalizedPrompt.includes("tangent") || normalizedPrompt.includes("切线")) {
      return [
        "Start at the point of contact. The first fact to check is whether a radius meets a tangent there, because that gives a right angle immediately.",
        "If the question is about the angle between a tangent and a chord, the next theorem to test is the alternate segment theorem.",
        "A clean write-up is: identify the tangent point, state the perpendicular radius fact or alternate segment theorem, then chase the remaining angle."
      ].join("\n\n");
    }

    if (normalizedPrompt.includes("cyclic") || normalizedPrompt.includes("四边形")) {
      return [
        "For a cyclic quadrilateral, opposite angles sum to 180 degrees. That usually gives the fastest first step.",
        "If one side is extended, the exterior angle equals the interior opposite angle, which is often easier to use than the supplementary-angle form.",
        "Mark the cyclic shape clearly first, then choose the angle relation that matches the diagram."
      ].join("\n\n");
    }

    if (
      normalizedPrompt.includes("centre") ||
      normalizedPrompt.includes("center") ||
      normalizedPrompt.includes("circumference") ||
      normalizedPrompt.includes("圆心角") ||
      normalizedPrompt.includes("圆周角")
    ) {
      return [
        "Match both angles to the same intercepted arc first. Once that arc is identified, the angle at the centre is twice the angle at the circumference.",
        "So if you know the circumference angle, double it for the central angle. If you know the central angle, halve it for the circumference angle.",
        "In a proof, explicitly name the common arc before writing the ratio."
      ].join("\n\n");
    }

    return [
      "Start by naming the diagram objects: radius, chord, tangent, diameter, arc, or cyclic quadrilateral. Circle-geometry questions get easier once the structure is explicit.",
      "Then test the common theorems: angle at the centre, angle in a semicircle, angles in the same segment, radius and tangent, tangent-chord, or cyclic quadrilateral angle rules.",
      "If you want, send the exact theorem or the angle values next, and I can turn this into a cleaner step-by-step simulated proof."
    ].join("\n\n");
  };

  const createMessage = (role, label, text, options = {}) => {
    const message = document.createElement("article");
    message.className = `ai-chat-message is-${role}`;

    if (role === "assistant") {
      message.classList.add("is-compact");
    }

    const meta = document.createElement("p");
    meta.className = "ai-chat-message-meta";
    meta.textContent = label;

    const bubble = document.createElement("div");
    bubble.className = "ai-chat-message-bubble";
    bubble.textContent = text;

    if (options.detailed || options.loading) {
      bubble.classList.add("is-detailed");
    }

    if (options.loading) {
      message.classList.add("is-loading");
      bubble.classList.add("is-loading");
    }

    message.append(meta, bubble);
    return message;
  };

  const renderConversation = () => {
    messages.replaceChildren();

    if (!fallbackHistory.length) {
      if (emptyState instanceof HTMLElement) {
        emptyState.hidden = false;
      }
      messages.hidden = true;
      transcript.classList.add("is-empty");
      return;
    }

    if (emptyState instanceof HTMLElement) {
      emptyState.hidden = true;
    }
    messages.hidden = false;
    transcript.classList.remove("is-empty");

    fallbackHistory.forEach((turn) => {
      messages.append(createMessage("user", uiCopy.user, turn.prompt));
      messages.append(
        createMessage(
          "assistant",
          `${uiCopy.assistantPrefix} ${turn.model}`,
          turn.status === "loading"
            ? "Working through your circle-geometry question..."
            : buildFallbackReply(turn.prompt),
          { detailed: true, loading: turn.status === "loading" }
        )
      );
    });

    requestAnimationFrame(() => {
      messages.scrollTop = messages.scrollHeight;
    });
  };

  const submitPrompt = (prompt) => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      syncSendState();
      focusComposer();
      return;
    }

    fallbackHistory.push({
      id: `fallback-turn-${++nextFallbackId}`,
      prompt: cleanPrompt,
      status: "loading",
      model: modelValue.textContent.trim(),
    });

    input.value = "";
    autoResizeInput();
    syncSendState();
    renderConversation();
    focusComposer();

    window.setTimeout(() => {
      const latestTurn = fallbackHistory[fallbackHistory.length - 1];
      if (!latestTurn) {
        return;
      }

      latestTurn.status = "ready";
      renderConversation();
    }, prefersReducedMotion.matches ? 100 : 320);
  };

  const resetConversation = () => {
    fallbackHistory.length = 0;
    renderConversation();
    setActiveSidebarAction("ask");
    input.value = "";
    autoResizeInput();
    syncSendState();
    focusComposer();
  };

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      submitPrompt(input.value);
    },
    true
  );

  sendButton.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      submitPrompt(input.value);
    },
    true
  );

  input.addEventListener("input", () => {
    autoResizeInput();
    syncSendState();
  });

  input.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      submitPrompt(input.value);
    },
    true
  );

  if (attachButton instanceof HTMLButtonElement) {
    attachButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        focusComposer();
      },
      true
    );
  }

  suggestionButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        setActiveSidebarAction("ask");
        submitPrompt(button.textContent ?? "");
      },
      true
    );
  });

  sidebarIntentButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const intent = button.dataset.aiChatSidebarIntent?.trim() ?? "";
        if (button.hasAttribute("data-ai-chat-sidebar-action")) {
          setActiveSidebarAction(intent || "ask");
        }

        if (intent === "ask") {
          resetConversation();
          return;
        }

        submitPrompt(sidebarPrompts[intent] ?? button.textContent ?? "");
      },
      true
    );
  });

  if (resetButton instanceof HTMLButtonElement) {
    resetButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        resetConversation();
      },
      true
    );
  }

  autoResizeInput();
  syncSendState();
  renderConversation();
})();

(() => {
  const chatShell = document.querySelector(".ai-chat-shell");
  if (
    !(chatShell instanceof HTMLElement) ||
    chatShell.dataset.aiHardOverrideBound === "true"
  ) {
    return;
  }

  chatShell.dataset.aiHardOverrideBound = "true";

  const form = chatShell.querySelector(".ai-chat-composer");
  const input = chatShell.querySelector(".ai-chat-draft");
  const sendButton = chatShell.querySelector(".ai-chat-send");
  const transcript = chatShell.querySelector(".ai-chat-transcript");
  const emptyState = chatShell.querySelector("[data-ai-chat-empty]");
  const messages = chatShell.querySelector("[data-ai-chat-messages]");
  const modelValue = chatShell.querySelector(".ai-chat-model-picker-value");
  const sidebarActionButtons = Array.from(
    chatShell.querySelectorAll("[data-ai-chat-sidebar-action]")
  );

  if (
    !(form instanceof HTMLFormElement) ||
    !(input instanceof HTMLTextAreaElement) ||
    !(sendButton instanceof HTMLButtonElement) ||
    !(transcript instanceof HTMLElement) ||
    !(messages instanceof HTMLElement)
  ) {
    return;
  }

  const prefersReducedMotion = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };
  const maxComposerHeight = 172;
  const conversation = [];
  let nextId = 0;

  const sidebarPrompts = {
    theorem: "Help me review a circle theorem step by step.",
    proof: "Can we practise a circle theorem proof step by step?",
    quiz: "Give me a hint for a circle theorem problem without the full answer.",
    "history-centre":
      "Why is the angle at the centre twice the angle at the circumference?",
    "history-tangent": "Help me prove this tangent theorem.",
    "history-cyclic": "Explain the cyclic quadrilateral theorem.",
    "history-alternate": "Explain the alternate segment theorem.",
  };

  const isZh = () => document.documentElement.lang.toLowerCase().startsWith("zh");

  const getUiCopy = () => ({
    user: isZh() ? "\u4f60" : "You",
    assistantPrefix: "ArcMind -",
    loading: isZh()
      ? "\u6b63\u5728\u6574\u7406\u4f60\u7684\u5706\u51e0\u4f55\u95ee\u9898..."
      : "Working through your circle-geometry question...",
  });

  const autoResizeInput = () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, maxComposerHeight)}px`;
    input.style.overflowY = input.scrollHeight > maxComposerHeight ? "auto" : "hidden";
  };

  const syncSendState = () => {
    sendButton.disabled = input.value.trim().length === 0;
  };

  const focusComposer = () => {
    try {
      input.focus({ preventScroll: true });
    } catch (error) {
      input.focus();
    }

    const caret = input.value.length;
    input.setSelectionRange(caret, caret);
  };

  const setActiveSidebarAction = (intent = "ask") => {
    sidebarActionButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      button.classList.toggle(
        "is-active",
        (button.dataset.aiChatSidebarAction?.trim() ?? "") === intent
      );
    });
  };

  const buildReply = (prompt) => {
    const normalizedPrompt = prompt.trim().toLowerCase();

    if (normalizedPrompt.includes("tangent")) {
      return [
        "Start at the point of contact. First check whether a radius meets the tangent there, because that gives a right angle immediately.",
        "If the question is about the angle between a chord and a tangent, the alternate segment theorem is usually the next step.",
        "A clean proof is: identify the contact point, state the tangent fact, then chase the remaining angle.",
      ].join("\n\n");
    }

    if (normalizedPrompt.includes("cyclic")) {
      return [
        "For a cyclic quadrilateral, opposite angles sum to 180 degrees. That is often the fastest first step.",
        "If one side is extended, the exterior angle equals the interior opposite angle, which is often even cleaner.",
        "Mark the cyclic shape first, then choose the angle relation that matches the diagram.",
      ].join("\n\n");
    }

    if (
      normalizedPrompt.includes("centre") ||
      normalizedPrompt.includes("center") ||
      normalizedPrompt.includes("circumference")
    ) {
      return [
        "Match both angles to the same intercepted arc first. Once that arc is identified, the angle at the centre is twice the angle at the circumference.",
        "So if you know the circumference angle, double it for the central angle. If you know the central angle, halve it for the circumference angle.",
        "In a proof, explicitly name the common arc before writing the ratio.",
      ].join("\n\n");
    }

    return [
      "Start by naming the key objects in the diagram: radius, chord, tangent, diameter, arc, or cyclic quadrilateral.",
      "Then test the common circle theorems: angle at the centre, angle in a semicircle, angles in the same segment, radius and tangent, tangent-chord, or cyclic quadrilateral angle rules.",
      "Send the theorem name or given angles next and I can keep the simulated walkthrough going step by step.",
    ].join("\n\n");
  };

  const createMessage = (role, label, text, options = {}) => {
    const message = document.createElement("article");
    message.className = `ai-chat-message is-${role}`;

    if (role === "assistant") {
      message.classList.add("is-compact");
    }

    if (options.loading) {
      message.classList.add("is-loading");
    }

    const meta = document.createElement("p");
    meta.className = "ai-chat-message-meta";
    meta.textContent = label;

    const bubble = document.createElement("div");
    bubble.className = "ai-chat-message-bubble";
    bubble.textContent = text;

    if (options.detailed || options.loading) {
      bubble.classList.add("is-detailed");
    }

    if (options.loading) {
      bubble.classList.add("is-loading");
    }

    message.append(meta, bubble);
    return message;
  };

  const syncTranscriptVisibility = (hasMessages) => {
    if (emptyState instanceof HTMLElement) {
      emptyState.hidden = hasMessages;
      emptyState.style.display = hasMessages ? "none" : "";
      emptyState.setAttribute("aria-hidden", String(hasMessages));
    }

    messages.hidden = !hasMessages;
    messages.style.display = hasMessages ? "flex" : "none";
    messages.setAttribute("aria-hidden", String(!hasMessages));
    transcript.classList.toggle("is-empty", !hasMessages);
  };

  const renderConversation = () => {
    const uiCopy = getUiCopy();
    messages.replaceChildren();

    if (!conversation.length) {
      syncTranscriptVisibility(false);
      return;
    }

    conversation.forEach((turn) => {
      messages.append(createMessage("user", uiCopy.user, turn.prompt));
      messages.append(
        createMessage(
          "assistant",
          `${uiCopy.assistantPrefix} ${turn.model}`,
          turn.status === "loading" ? uiCopy.loading : buildReply(turn.prompt),
          { detailed: true, loading: turn.status === "loading" }
        )
      );
    });

    syncTranscriptVisibility(true);

    requestAnimationFrame(() => {
      messages.scrollTop = messages.scrollHeight;
    });
  };

  const submitPrompt = (prompt) => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      syncSendState();
      focusComposer();
      return;
    }

    setActiveSidebarAction("ask");
    conversation.push({
      id: `override-turn-${++nextId}`,
      prompt: cleanPrompt,
      status: "loading",
      model: modelValue instanceof HTMLElement ? modelValue.textContent.trim() : "GPT-5.4",
    });

    input.value = "";
    autoResizeInput();
    syncSendState();
    renderConversation();
    focusComposer();

    window.setTimeout(() => {
      const latestTurn = conversation[conversation.length - 1];
      if (!latestTurn) {
        return;
      }

      latestTurn.status = "ready";
      renderConversation();
    }, prefersReducedMotion.matches ? 120 : 320);
  };

  const resetConversation = () => {
    conversation.length = 0;
    input.value = "";
    autoResizeInput();
    syncSendState();
    setActiveSidebarAction("ask");
    renderConversation();
    focusComposer();
  };

  chatShell.addEventListener(
    "submit",
    (event) => {
      const target = event.target;
      if (target !== form) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      submitPrompt(input.value);
    },
    true
  );

  chatShell.addEventListener(
    "keydown",
    (event) => {
      if (event.target !== input) {
        return;
      }

      if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      submitPrompt(input.value);
    },
    true
  );

  chatShell.addEventListener(
    "input",
    (event) => {
      if (event.target !== input) {
        return;
      }

      autoResizeInput();
      syncSendState();
    },
    true
  );

  chatShell.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const button = target.closest("button");
      if (!(button instanceof HTMLButtonElement) || !chatShell.contains(button)) {
        return;
      }

      if (button.classList.contains("ai-chat-send")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        submitPrompt(input.value);
        return;
      }

      if (button.hasAttribute("data-ai-chat-empty-suggestion")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        submitPrompt(button.textContent ?? "");
        return;
      }

      if (button.hasAttribute("data-ai-chat-reset")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        resetConversation();
        return;
      }

      if (button.classList.contains("ai-chat-icon-btn")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        focusComposer();
        return;
      }

      const intent = button.dataset.aiChatSidebarIntent?.trim() ?? "";
      if (!intent) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      if (button.hasAttribute("data-ai-chat-sidebar-action")) {
        setActiveSidebarAction(intent || "ask");
      }

      if (intent === "ask") {
        resetConversation();
        return;
      }

      submitPrompt(sidebarPrompts[intent] ?? button.textContent ?? "");
    },
    true
  );

  window.addEventListener("circlelab:languagechange", () => {
    renderConversation();
  });

  autoResizeInput();
  syncSendState();
  queueMicrotask(() => {
    renderConversation();
  });
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
  let lastContactCloseAt = 0;

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
    { restoreFocus = true, clearUrl = true, immediate = false } = {}
  ) => {
    if (!(overlay instanceof HTMLElement) || overlay.hidden) {
      return;
    }

    hideOverlay(overlay, hash, resetState, { clearUrl, immediate });

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

    const now = window.performance?.now?.() ?? Date.now();
    if (now - lastContactCloseAt < 260) {
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
    contactOverlay.style.removeProperty("display");
    startOverlayOpen(contactOverlay);
    setHash("#contactOverlay");
    syncBodyState();
    resetContactState();

    requestAnimationFrame(() => {
      contactNameInput.focus();
    });
  };

  const closeContactOverlay = (options = {}) => {
    lastContactCloseAt = window.performance?.now?.() ?? Date.now();
    closeOverlay(contactOverlay, "#contactOverlay", resetContactState, {
      immediate: true,
      ...options,
    });
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

  floatOpenButtons.forEach((button) => {
    button.dataset.floatChatBound = "true";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openFloatChatWindow();
    });
  });

  contactCloseButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeContactOverlay();
    });
  });

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const closeButton = target.closest("[data-contact-close]");
      if (!(closeButton instanceof HTMLElement)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      closeContactOverlay();
    },
    true
  );

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

// Fallback: always allow hero "Chat now" to force-open the floating chat window.
(() => {
  const triggerButtons = Array.from(
    document.querySelectorAll("[data-open-float-chat]:not([data-float-chat-bound])")
  );
  if (!triggerButtons.length) {
    return;
  }

  const forceOpenFloatChat = () => {
    const floatShell = document.querySelector("[data-ai-float-shell]");
    if (!(floatShell instanceof HTMLElement)) {
      return;
    }

    floatShell.classList.add("is-ready", "is-expanded", "is-hero-forced");
    floatShell.classList.remove("is-docked-away");
    const previousScrollX = window.scrollX;
    const previousScrollY = window.scrollY;

    // Inline styles are a hard override in case any state class still hides the shell.
    floatShell.style.opacity = "1";
    floatShell.style.visibility = "visible";
    floatShell.style.filter = "none";
    floatShell.style.transform = "translate3d(-50%, 0, 0) scale(1)";

    const floatInput = floatShell.querySelector(".ai-float-input");
    if (!(floatInput instanceof HTMLInputElement)) {
      return;
    }

    try {
      floatInput.focus({ preventScroll: true });
    } catch (error) {
      floatInput.focus();
    }

    window.scrollTo({
      left: previousScrollX,
      top: previousScrollY,
      behavior: "auto",
    });

    const caret = floatInput.value.length;
    floatInput.setSelectionRange(caret, caret);
  };

  // Capture-phase delegated listener to avoid conflicts with other click handlers.
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const trigger = target.closest("[data-open-float-chat]");
      if (!(trigger instanceof Element)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      forceOpenFloatChat();
    },
    true
  );

  triggerButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      forceOpenFloatChat();
    });
  });
})();
