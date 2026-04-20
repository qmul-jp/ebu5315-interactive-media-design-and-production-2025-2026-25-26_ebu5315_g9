(() => {
  const FORCE_OPEN_SELECTOR = "[data-open-float-chat]";
  const FLOAT_SHELL_SELECTOR = "[data-ai-float-shell]";

  const openFloatChat = () => {
    const shell = document.querySelector(FLOAT_SHELL_SELECTOR);
    if (!(shell instanceof HTMLElement)) {
      return;
    }

    shell.classList.add("is-ready", "is-expanded", "is-hero-forced");
    shell.classList.remove("is-docked-away");

    // Hard override in case another state class still tries to hide it.
    shell.style.opacity = "1";
    shell.style.visibility = "visible";
    shell.style.filter = "none";
    shell.style.transform = "translate3d(-50%, 0, 0) scale(1)";

    const input = shell.querySelector(".ai-float-input");
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const prevX = window.scrollX;
    const prevY = window.scrollY;

    try {
      input.focus({ preventScroll: true });
    } catch (error) {
      input.focus();
    }

    window.scrollTo({
      left: prevX,
      top: prevY,
      behavior: "auto",
    });

    const caret = input.value.length;
    input.setSelectionRange(caret, caret);
  };

  const bind = () => {
    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
          return;
        }

        const trigger = target.closest(FORCE_OPEN_SELECTOR);
        if (!(trigger instanceof Element)) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openFloatChat();
      },
      true
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind, { once: true });
  } else {
    bind();
  }
})();
