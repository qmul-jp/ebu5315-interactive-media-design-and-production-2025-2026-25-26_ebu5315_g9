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
