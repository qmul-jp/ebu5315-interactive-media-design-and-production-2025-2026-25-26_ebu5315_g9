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
    dictionaries[currentLanguage]?.[key] ?? dictionaries.en[key] ?? fallback ?? key;

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
