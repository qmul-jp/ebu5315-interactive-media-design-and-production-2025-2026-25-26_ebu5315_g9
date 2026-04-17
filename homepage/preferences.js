(() => {
  const root = document.documentElement;
  const body = document.body;

  if (!body) {
    return;
  }

  const STORAGE_KEYS = {
    language: "circlelab-language",
    theme: "circlelab-theme",
  };

  const dictionaries = {
    en: {
      "document.contact": "CircleLab | Get in Touch",
      "contact.title": "Get in touch",
      "contact.intro":
        "We'd love to hear from you.\nShare your questions, ideas, or feedback anytime.",
      "contact.name": "Your name",
      "contact.name_placeholder": "What should we call you?",
      "contact.topic": "Topic",
      "contact.topic_placeholder": "Choose a topic",
      "contact.topic_learning": "Learning support",
      "contact.topic_feedback": "Product feedback",
      "contact.topic_bug": "Bug report",
      "contact.topic_school": "School or partnership",
      "contact.message": "Message",
      "contact.message_placeholder": "Let us know how we can help.",
      "contact.submit": "Send message",
      "contact.helper_prefix": "Need quick help instead?",
      "contact.helper_link": "Try the ArcMind",
      "feedback.contact_length":
        "Please add a little more detail so we know how to help.",
      "feedback.contact_success":
        "Thanks for reaching out. This static page validated your message in the browser. Connect this form to email or your preferred form service when you're ready.",
      "document.home": "CircleLab",
      "document.login": "CircleLab | Log in",
      "nav.home": "Home",
      "nav.game": "Game",
      "nav.quiz": "Quiz",
      "nav.login": "Log in",
      "nav.signup": "Sign up",
      "nav.settings": "Settings",
      "settings.title": "Preferences",
      "settings.language": "Language",
      "settings.theme": "Theme",
      "settings.language_en": "English",
      "settings.language_zh": "简体中文",
      "settings.theme_dark": "Dark",
      "settings.theme_light": "Light",
      "hero.kicker": "CIRCLE LAB",
      "hero.title": "Master Circle Geometry with Ease",
      "hero.intro":
        "Learn the key rules of circle geometry through clear explanations, interactive visuals, and simple practice.",
      "hero.start": "Start Learning",
      "hero.demo": "Watch Demo",
      "signup.title": "Create account",
      "signup.intro": "Welcome to your CircleLab workspace.",
      "signup.password_placeholder": "At least 8 characters",
      "signup.consent_prefix": "I agree to the ",
      "signup.consent_join": " and ",
      "signup.terms": "Terms and Conditions",
      "signup.privacy": "Privacy Policy",
      "signup.submit": "Create free account",
      "signup.helper_prefix": "Already have an account?",
      "field.email": "Email address",
      "field.email_placeholder": "you@circlelab.com",
      "field.password": "Password",
      "login.title": "Welcome back",
      "login.intro": "Log in to continue your geometry journey.",
      "login.password_placeholder": "Enter your password",
      "login.remember": "Remember this browser",
      "login.forgot": "Forgot password?",
      "login.helper_prefix": "Need an account?",
      "login.helper_link": "Create one here",
      "feedback.generic": "Please check this field and try again.",
      "feedback.signup_consent":
        "Please agree to the Terms and Conditions and Privacy Policy.",
      "feedback.login_success":
        "Login demo complete. This static page validates in the browser and is ready to connect to a real auth service.",
      "feedback.password_reset":
        "Password recovery is not connected yet in this static build. Hook this button to your email reset flow when the auth service is ready.",
    },
    zh: {
      "document.contact": "CircleLab | \u8054\u7cfb\u6211\u4eec",
      "contact.title": "\u8054\u7cfb\u6211\u4eec",
      "contact.intro":
        "\u544a\u8bc9\u6211\u4eec\u4f60\u6b63\u5728\u5b66\u4ec0\u4e48\uff0c\u54ea\u91cc\u89c9\u5f97\u4e0d\u591f\u6e05\u695a\uff0c\u6216\u8005\u4f60\u5e0c\u671b CircleLab \u600e\u6837\u6539\u8fdb\u3002",
      "contact.name": "\u4f60\u7684\u59d3\u540d",
      "contact.name_placeholder": "\u6211\u4eec\u5e94\u8be5\u600e\u4e48\u79f0\u547c\u4f60\uff1f",
      "contact.topic": "\u4e3b\u9898",
      "contact.topic_placeholder": "\u9009\u62e9\u4e00\u4e2a\u4e3b\u9898",
      "contact.topic_learning": "\u5b66\u4e60\u95ee\u9898",
      "contact.topic_feedback": "\u4ea7\u54c1\u53cd\u9988",
      "contact.topic_bug": "\u6545\u969c\u62a5\u544a",
      "contact.topic_school": "\u5b66\u6821\u6216\u5408\u4f5c",
      "contact.message": "\u6d88\u606f\u5185\u5bb9",
      "contact.message_placeholder":
        "\u7528\u51e0\u53e5\u8bdd\u8bf4\u660e\u4f60\u7684\u95ee\u9898\uff0c\u60f3\u6cd5\u6216\u9047\u5230\u7684\u60c5\u51b5\u3002",
      "contact.submit": "\u53d1\u9001\u6d88\u606f",
      "contact.helper_prefix": "\u60f3\u5feb\u901f\u5f97\u5230\u5e2e\u52a9\uff1f",
      "contact.helper_link": "\u8bd5\u8bd5 ArcMind",
      "feedback.contact_length":
        "\u8bf7\u518d\u8865\u5145\u4e00\u70b9\u7ec6\u8282\uff0c\u8fd9\u6837\u6211\u4eec\u66f4\u597d\u5e2e\u5230\u4f60\u3002",
      "feedback.contact_success":
        "\u611f\u8c22\u4f60\u7684\u7559\u8a00\u3002\u8fd9\u4e2a\u9759\u6001\u9875\u9762\u5df2\u5728\u6d4f\u89c8\u5668\u4e2d\u5b8c\u6210\u8868\u5355\u6821\u9a8c\uff1b\u5f53\u4f60\u51c6\u5907\u597d\u540e\uff0c\u53ef\u4ee5\u518d\u628a\u5b83\u63a5\u5230\u90ae\u4ef6\u6216\u8868\u5355\u670d\u52a1\u3002",
      "document.home": "CircleLab | 圆几何",
      "document.login": "CircleLab | 登录",
      "nav.home": "首页",
      "nav.game": "游戏",
      "nav.quiz": "测验",
      "nav.login": "登录",
      "nav.signup": "注册",
      "nav.settings": "设置",
      "settings.title": "偏好设置",
      "settings.language": "语言",
      "settings.theme": "主题",
      "settings.language_en": "English",
      "settings.language_zh": "简体中文",
      "settings.theme_dark": "深色",
      "settings.theme_light": "浅色",
      "hero.kicker": "CIRCLE LAB",
      "hero.title": "轻松掌握圆几何",
      "hero.intro": "通过清晰讲解、交互图形和简明练习，学习圆几何的关键规则。",
      "hero.start": "开始学习",
      "hero.demo": "观看演示",
      "signup.title": "创建账号",
      "signup.intro": "欢迎来到你的 CircleLab 学习空间。",
      "signup.password_placeholder": "至少 8 个字符",
      "signup.consent_prefix": "我同意",
      "signup.consent_join": "和",
      "signup.terms": "条款与条件",
      "signup.privacy": "隐私政策",
      "signup.submit": "免费创建账号",
      "signup.helper_prefix": "已经有账号？",
      "field.email": "电子邮箱",
      "field.email_placeholder": "you@circlelab.com",
      "field.password": "密码",
      "login.title": "欢迎回来",
      "login.intro": "登录以继续你的圆几何学习之旅。",
      "login.password_placeholder": "输入你的密码",
      "login.remember": "记住此设备",
      "login.forgot": "忘记密码？",
      "login.helper_prefix": "还没有账号？",
      "login.helper_link": "在这里创建",
      "feedback.generic": "请检查此字段后重试。",
      "feedback.signup_consent": "请先同意条款与条件和隐私政策。",
      "feedback.login_success":
        "登录演示已完成。这个静态页面已在浏览器中完成校验，之后可接入真实认证服务。",
      "feedback.password_reset":
        "当前静态版本尚未接入密码找回功能。连接认证服务后，可将此按钮接到邮件重置流程。",
    },
  };

  const multilineCopy = {
    en: {
      "hero.title": "Master\nCircle\nwith Ease",
    },
    zh: {
      "hero.title": "\u8f7b\u677e\u638c\u63e1\n\u5706\u51e0\u4f55",
    },
  };

  const normalizeLanguage = (value) => (value === "zh" ? "zh" : "en");
  const normalizeTheme = (value) => {
    if (value === "light" || value === "solar") {
      return "light";
    }

    return "dark";
  };

  const readStoredPreference = (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const writeStoredPreference = (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage failures in static mode.
    }
  };

  let currentLanguage = normalizeLanguage(readStoredPreference(STORAGE_KEYS.language));
  let currentTheme = normalizeTheme(readStoredPreference(STORAGE_KEYS.theme));

  const translate = (key, fallback = "") =>
    multilineCopy[currentLanguage]?.[key] ??
    dictionaries[currentLanguage]?.[key] ??
    multilineCopy.en[key] ??
    dictionaries.en[key] ??
    fallback ??
    key;

  const syncLanguageButtons = () => {
    document.querySelectorAll("[data-language-option]").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      const isSelected = button.dataset.languageOption === currentLanguage;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
  };

  const syncThemeButtons = () => {
    document.querySelectorAll("[data-theme-option]").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      const isSelected = button.dataset.themeOption === currentTheme;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
  };

  const applyLanguage = (language, persist = true) => {
    currentLanguage = normalizeLanguage(language);
    root.lang = currentLanguage === "zh" ? "zh-CN" : "en";

    if (persist) {
      writeStoredPreference(STORAGE_KEYS.language, currentLanguage);
    }

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = translate(element.dataset.i18n, element.textContent ?? "");
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.placeholder = translate(
          element.dataset.i18nPlaceholder,
          element.placeholder ?? ""
        );
      }
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute(
        "aria-label",
        translate(element.dataset.i18nAriaLabel, element.getAttribute("aria-label") ?? "")
      );
    });

    if (body.dataset.titleKey) {
      document.title = translate(body.dataset.titleKey, document.title);
    }

    syncLanguageButtons();
    window.dispatchEvent(
      new CustomEvent("circlelab:languagechange", {
        detail: {
          language: currentLanguage,
        },
      })
    );
  };

  const applyTheme = (theme, persist = true) => {
    currentTheme = normalizeTheme(theme);
    root.style.colorScheme = currentTheme;

    if (currentTheme === "light") {
      root.dataset.theme = "light";
    } else {
      delete root.dataset.theme;
    }

    if (persist) {
      writeStoredPreference(STORAGE_KEYS.theme, currentTheme);
    }

    syncThemeButtons();
  };

  const closeMenu = (settingsRoot) => {
    if (!(settingsRoot instanceof HTMLElement)) {
      return;
    }

    const toggle = settingsRoot.querySelector("[data-settings-toggle]");
    const menu = settingsRoot.querySelector("[data-settings-menu]");

    if (!(toggle instanceof HTMLButtonElement) || !(menu instanceof HTMLElement)) {
      return;
    }

    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  };

  const initSettingsMenu = (settingsRoot) => {
    if (!(settingsRoot instanceof HTMLElement)) {
      return;
    }

    const toggle = settingsRoot.querySelector("[data-settings-toggle]");
    const menu = settingsRoot.querySelector("[data-settings-menu]");
    const languageButtons = settingsRoot.querySelectorAll("[data-language-option]");
    const themeButtons = settingsRoot.querySelectorAll("[data-theme-option]");

    if (!(toggle instanceof HTMLButtonElement) || !(menu instanceof HTMLElement)) {
      return;
    }

    toggle.addEventListener("click", () => {
      const willOpen = menu.hidden;
      document.querySelectorAll("[data-settings]").forEach((item) => {
        if (item !== settingsRoot) {
          closeMenu(item);
        }
      });
      menu.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
    });

    languageButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      button.addEventListener("click", () => {
        applyLanguage(button.dataset.languageOption);
      });
    });

    themeButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      button.addEventListener("click", () => {
        applyTheme(button.dataset.themeOption);
      });
    });
  };

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    document.querySelectorAll("[data-settings]").forEach((settingsRoot) => {
      if (!(settingsRoot instanceof HTMLElement) || settingsRoot.contains(target)) {
        return;
      }

      closeMenu(settingsRoot);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    document.querySelectorAll("[data-settings]").forEach(closeMenu);
  });

  applyTheme(currentTheme, false);
  applyLanguage(currentLanguage, false);
  document.querySelectorAll("[data-settings]").forEach(initSettingsMenu);

  window.CircleLabPreferences = {
    t: translate,
    getLanguage: () => currentLanguage,
    getTheme: () => currentTheme,
    setLanguage: applyLanguage,
    setTheme: applyTheme,
  };
})();
