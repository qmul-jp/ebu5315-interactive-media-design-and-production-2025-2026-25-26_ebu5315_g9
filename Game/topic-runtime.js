(function () {
  const TOPIC_MOUNT_SELECTOR = "#contentFrame";
  const BODY_SELECTOR_PATTERN = /(^|[{\s,>+~])body(?=[:.#\s[{>+~]|$)/gm;

  function escapeId(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(value);
    }
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function scopeTopicCss(cssText) {
    return String(cssText || "").replace(
      BODY_SELECTOR_PATTERN,
      `$1${TOPIC_MOUNT_SELECTOR}`,
    );
  }

  function createTrackedMutationObserverStore(store) {
    return class TrackedMutationObserver {
      constructor(callback) {
        this._observer = new MutationObserver(callback);
        store.push(this._observer);
      }

      observe(...args) {
        return this._observer.observe(...args);
      }

      disconnect() {
        return this._observer.disconnect();
      }

      takeRecords() {
        return this._observer.takeRecords();
      }
    };
  }

  function createTopicDocument(root, windowProxy, cleanups) {
    const documentProxy = {
      documentElement: document.documentElement,
      body: root,
      head: document.head,
      defaultView: windowProxy,
      get hidden() {
        return document.hidden;
      },
      get readyState() {
        return "complete";
      },
      getElementById(id) {
        return root.querySelector(`#${escapeId(id)}`);
      },
      querySelector(selector) {
        return root.querySelector(selector);
      },
      querySelectorAll(selector) {
        return root.querySelectorAll(selector);
      },
      createElement(tagName) {
        return document.createElement(tagName);
      },
      createTextNode(text) {
        return document.createTextNode(text);
      },
      addEventListener(type, handler, options) {
        document.addEventListener(type, handler, options);
        cleanups.push(() => {
          document.removeEventListener(type, handler, options);
        });
      },
      removeEventListener(type, handler, options) {
        document.removeEventListener(type, handler, options);
      },
    };

    return documentProxy;
  }

  function createTopicRuntime(root, initialState) {
    const cleanups = [];
    const observers = [];
    const timeouts = new Set();
    const intervals = new Set();
    const animationFrames = new Set();
    const messageHandlers = new Set();
    const loadHandlers = new Set();
    const TrackedMutationObserver =
      createTrackedMutationObserverStore(observers);

    const trackedSetTimeout = (fn, delay, ...args) => {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        fn(...args);
      }, delay);
      timeouts.add(id);
      return id;
    };

    const trackedClearTimeout = (id) => {
      timeouts.delete(id);
      window.clearTimeout(id);
    };

    const trackedSetInterval = (fn, delay, ...args) => {
      const id = window.setInterval(fn, delay, ...args);
      intervals.add(id);
      return id;
    };

    const trackedClearInterval = (id) => {
      intervals.delete(id);
      window.clearInterval(id);
    };

    const trackedRequestAnimationFrame = (fn) => {
      const id = window.requestAnimationFrame((timestamp) => {
        animationFrames.delete(id);
        fn(timestamp);
      });
      animationFrames.add(id);
      return id;
    };

    const trackedCancelAnimationFrame = (id) => {
      animationFrames.delete(id);
      window.cancelAnimationFrame(id);
    };

    const windowProxy = {
      _CL: { lang: initialState.lang || "zh" },
      parent: {
        postMessage() {},
      },
      self: null,
      top: null,
      document: null,
      location: window.location,
      navigator: window.navigator,
      console: window.console,
      getComputedStyle: window.getComputedStyle.bind(window),
      requestAnimationFrame: trackedRequestAnimationFrame,
      cancelAnimationFrame: trackedCancelAnimationFrame,
      setTimeout: trackedSetTimeout,
      clearTimeout: trackedClearTimeout,
      setInterval: trackedSetInterval,
      clearInterval: trackedClearInterval,
      addEventListener(type, handler, options) {
        if (type === "message") {
          messageHandlers.add(handler);
          return;
        }
        if (type === "load") {
          loadHandlers.add(handler);
          return;
        }
        window.addEventListener(type, handler, options);
        cleanups.push(() => {
          window.removeEventListener(type, handler, options);
        });
      },
      removeEventListener(type, handler, options) {
        if (type === "message") {
          messageHandlers.delete(handler);
          return;
        }
        if (type === "load") {
          loadHandlers.delete(handler);
          return;
        }
        window.removeEventListener(type, handler, options);
      },
    };
    windowProxy.self = windowProxy;
    windowProxy.top = windowProxy;

    const documentProxy = createTopicDocument(root, windowProxy, cleanups);
    windowProxy.document = documentProxy;

    function dispatchMessage(data) {
      const event = { data };
      messageHandlers.forEach((handler) => {
        try {
          handler.call(windowProxy, event);
        } catch (error) {
          console.error(error);
        }
      });
    }

    function dispatchLoad() {
      const event = new Event("load");
      loadHandlers.forEach((handler) => {
        try {
          handler.call(windowProxy, event);
        } catch (error) {
          console.error(error);
        }
      });
    }

    function execute(scriptText) {
      const runner = new Function(
        "window",
        "document",
        "MutationObserver",
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "requestAnimationFrame",
        "cancelAnimationFrame",
        `
          const self = window;
          const parent = window.parent;
          ${scriptText}
        `,
      );
      runner(
        windowProxy,
        documentProxy,
        TrackedMutationObserver,
        trackedSetTimeout,
        trackedClearTimeout,
        trackedSetInterval,
        trackedClearInterval,
        trackedRequestAnimationFrame,
        trackedCancelAnimationFrame,
      );
    }

    function destroy() {
      messageHandlers.clear();
      loadHandlers.clear();
      cleanups.splice(0).forEach((cleanup) => cleanup());
      observers.splice(0).forEach((observer) => observer.disconnect());
      timeouts.forEach((id) => window.clearTimeout(id));
      timeouts.clear();
      intervals.forEach((id) => window.clearInterval(id));
      intervals.clear();
      animationFrames.forEach((id) => window.cancelAnimationFrame(id));
      animationFrames.clear();
    }

    return {
      execute,
      sync(state) {
        if (state.lang) {
          windowProxy._CL.lang = state.lang;
        }
        dispatchMessage({
          _src: "circlelab",
          lang: state.lang,
          theme: state.theme,
          fontSize: state.fontSize,
          topicFile: state.topicFile,
        });
      },
      start() {
        dispatchLoad();
      },
      destroy,
    };
  }

  function parseTopicSource(source) {
    const parser = new DOMParser();
    return parser.parseFromString(source, "text/html");
  }

  function createTopicMountHtml(doc, root) {
    const styles = Array.from(doc.querySelectorAll("style")).map((style) =>
      scopeTopicCss(style.textContent),
    );
    const scripts = [];
    const fragment = document.createDocumentFragment();

    Array.from(doc.body.childNodes).forEach((node) => {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName &&
        node.tagName.toLowerCase() === "script"
      ) {
        scripts.push(node.textContent || "");
        return;
      }
      fragment.appendChild(document.importNode(node, true));
    });

    root.innerHTML = "";
    styles.forEach((cssText) => {
      const style = document.createElement("style");
      style.setAttribute("data-topic-inline-style", "true");
      style.textContent = cssText;
      root.appendChild(style);
    });
    root.appendChild(fragment);

    return scripts;
  }

  function renderTopicInto(root, topicFile, state) {
    const sourceMap = window.TOPIC_SOURCE_MAP || {};
    const source = sourceMap[topicFile];
    if (!source) {
      throw new Error(`Missing topic source: ${topicFile}`);
    }

    const parsed = parseTopicSource(source);
    const scripts = createTopicMountHtml(parsed, root);
    const runtime = createTopicRuntime(root, state);
    scripts.forEach((scriptText) => runtime.execute(scriptText));
    runtime.start();
    runtime.sync({ ...state, topicFile });

    return runtime;
  }

  window.CircleLabTopicRuntime = {
    renderTopicInto,
  };
})();
