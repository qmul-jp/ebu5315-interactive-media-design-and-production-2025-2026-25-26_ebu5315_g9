(() => {
  const ICON_CLASS = "cl-topic-icon";
  const ICON_MAP = {
    "\u{1F5B1}": {
      type: "mouse",
      label: "mouse",
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="2" width="14" height="20" rx="7"></rect>
          <path d="M12 6v4"></path>
        </svg>`,
    },
    "\u{1F4CF}": {
      type: "ruler",
      label: "ruler",
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"></path>
          <path d="m14.5 12.5 2-2"></path>
          <path d="m11.5 9.5 2-2"></path>
          <path d="m8.5 6.5 2-2"></path>
          <path d="m17.5 15.5 2-2"></path>
        </svg>`,
    },
    "\u{1F9EE}": {
      type: "calculator",
      label: "calculator",
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
          <rect width="16" height="20" x="4" y="2" rx="2"></rect>
          <line x1="8" x2="16" y1="6" y2="6"></line>
          <line x1="16" x2="16" y1="14" y2="18"></line>
          <path d="M16 10h.01"></path>
          <path d="M12 10h.01"></path>
          <path d="M8 10h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M8 14h.01"></path>
          <path d="M12 18h.01"></path>
          <path d="M8 18h.01"></path>
        </svg>`,
    },
    "\u{1F4D0}": {
      type: "compass",
      label: "drafting compass",
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12.99 6.74 1.93 3.44"></path>
          <path d="M19.136 12a10 10 0 0 1-14.271 0"></path>
          <path d="m21 21-2.16-3.84"></path>
          <path d="M3 21 11.02 6.74"></path>
          <circle cx="12" cy="5" r="2"></circle>
        </svg>`,
    },
  };

  function shouldSkipNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    if (parent.closest(`[data-topic-icons="done"]`)) return true;
    const tag = parent.tagName;
    return tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA";
  }

  function getTopicIconRoot() {
    return document.getElementById("contentFrame") || document.body;
  }

  function replaceEmojiInTextNode(node) {
    if (!node || !node.nodeValue || shouldSkipNode(node)) return false;
    const text = node.nodeValue;
    const matches = [...text].filter((char) => ICON_MAP[char]);
    if (matches.length === 0) return false;

    const fragment = document.createDocumentFragment();
    for (const char of text) {
      const icon = ICON_MAP[char];
      if (!icon) {
        fragment.appendChild(document.createTextNode(char));
        continue;
      }

      const span = document.createElement("span");
      span.className = ICON_CLASS;
      span.setAttribute("data-icon", icon.type);
      span.setAttribute("data-topic-icons", "done");
      span.setAttribute("aria-label", icon.label);
      span.setAttribute("role", "img");
      span.innerHTML = icon.svg.trim();
      fragment.appendChild(span);
    }

    node.parentNode.replaceChild(fragment, node);
    return true;
  }

  function sanitizeTopicIcons(root = getTopicIconRoot()) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const targets = [];
    while (walker.nextNode()) {
      const current = walker.currentNode;
      if (shouldSkipNode(current)) continue;
      if ([...current.nodeValue].some((char) => ICON_MAP[char])) {
        targets.push(current);
      }
    }
    targets.forEach(replaceEmojiInTextNode);
  }

  let queued = false;
  function queueSanitize() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sanitizeTopicIcons();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      sanitizeTopicIcons();
    });
  } else {
    sanitizeTopicIcons();
  }

  const observer = new MutationObserver(() => {
    queueSanitize();
  });

  const startObserving = () => {
    const root = getTopicIconRoot();
    if (!root) return;
    observer.observe(root, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserving, {
      once: true,
    });
  } else {
    startObserving();
  }
})();
