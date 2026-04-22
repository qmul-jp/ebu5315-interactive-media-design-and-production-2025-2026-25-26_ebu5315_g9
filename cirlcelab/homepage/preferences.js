(() => {
  const root = document.documentElement;
  const body = document.body;

  if (!body) {
    return;
  }

  const STORAGE_KEYS = {
    language: "circlelab-language",
    theme: "circlelab-theme",
    fontScale: "circlelab-font-scale",
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
      "feedback.contact_topic":
        "Please choose a topic so we can route your message.",
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
      "settings.font_size": "Text Size",
      "settings.language_en": "English",
      "settings.language_zh": "简体中文",
      "settings.theme_dark": "Dark",
      "settings.theme_light": "Light",
      "settings.font_small": "Small",
      "settings.font_medium": "Medium",
      "settings.font_large": "Large",
      "settings.font_slider_aria": "Adjust text size",
      "hero.kicker": "CIRCLE LAB",
      "hero.title": "Master Circle Geometry with Ease",
      "hero.intro":
        "Learn the key rules of circle geometry through clear explanations, interactive visuals, and simple practice.",
      "hero.start": "Start Learning",
      "hero.demo": "Chat now",
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
      "feedback.contact_topic":
        "\u8bf7\u5148\u9009\u62e9\u4e00\u4e2a\u4e3b\u9898\uff0c\u65b9\u4fbf\u6211\u4eec\u66f4\u597d\u5904\u7406\u4f60\u7684\u6d88\u606f\u3002",
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
      "settings.font_size": "字号",
      "settings.language_en": "English",
      "settings.language_zh": "简体中文",
      "settings.theme_dark": "深色",
      "settings.theme_light": "浅色",
      "settings.font_small": "小",
      "settings.font_medium": "中",
      "settings.font_large": "大",
      "settings.font_slider_aria": "调整字号",
      "hero.kicker": "CIRCLE LAB",
      "hero.title": "轻松掌握圆几何",
      "hero.intro": "通过清晰讲解、交互图形和简明练习，学习圆几何的关键规则。",
      "hero.start": "开始学习",
      "hero.demo": "立即聊天",
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

  const enExtendedCopy = {
    "brand.home_aria": "Circle Geometry home",
    "brand.logo_alt": "Circle Geometry logo",
    "nav.primary_aria": "Primary",
    "nav.account_aria": "Account",
    "settings.language_section_aria": "Language settings",
    "settings.language_group_aria": "Language",
    "settings.theme_section_aria": "Theme settings",
    "settings.theme_group_aria": "Theme",
    "settings.font_section_aria": "Text size settings",
    "settings.font_group_aria": "Text size",
    "core.title.line1": "A Reimagined",
    "core.title.line2": "Approach to Geometry",
    "core.card1.title": "Powered by AI",
    "core.card1.body":
      "AI guidance, right when you need it.<br />Clear hints, instant support, and smarter practice.<br />Learn with more confidence, clarity, and flow.",
    "core.card2.title": "Dynamic Exploration",
    "core.card2.body":
      "See geometry come to life.<br />Interact with shapes and watch them respond.<br />Understand concepts through real-time visuals.",
    "core.card3.title": "Learn in Motion",
    "core.card3.body":
      "Learn by doing, not just reading.<br />Play, explore, and challenge yourself.<br />Spot mistakes and improve without delay.",
    "core.card4.title": "Learn in Cycles",
    "core.card4.body":
      "Study, play, and test in one connected flow.<br />Move between ideas, interaction, and practice with ease.<br />Build understanding through every step of the cycle.",
    "theorems.title": "Hands-On<br />Circle Theorems",
    "theorems.controls_aria": "Theorem navigation",
    "theorems.prev_aria": "Previous theorems",
    "theorems.next_aria": "Next theorems",
    "theorem.1.title": "Angle at the Center",
    "theorem.1.desc":
      "The angle at the center is twice the angle at the circumference.",
    "theorem.1.iframe_title": "Circle Theorem 1 - Angle at the Centre",
    "theorem.2.title": "Angle in a Semicircle",
    "theorem.2.desc": "The angle in a semicircle is always 90&deg;.<br /><br />",
    "theorem.2.iframe_title": "Circle Theorem 2 - Angles in a Semicircle",
    "theorem.3.title": "Angles in the Same Segment",
    "theorem.3.desc": "The angles in the same segment are equal.",
    "theorem.3.iframe_title": "Circle Theorem 3 - Angles in the Same Segment",
    "theorem.4.title": "Cyclic Quadrilateral",
    "theorem.4.desc": "Opposite angles in a cyclic quadrilateral sum to 180°.",
    "theorem.4.iframe_title": "Circle Theorem 4 - Cyclic Quadrilateral",
    "theorem.5.title": "Radius to a Tangent",
    "theorem.5.desc":
      "The radius is perpendicular to the tangent at the point of contact.",
    "theorem.5.iframe_title": "Circle Theorem 5 - Radius to a Tangent",
    "theorem.6.title": "Tangents from a Point",
    "theorem.6.desc": "Tangents from the same point are equal in length.",
    "theorem.6.iframe_title":
      "Circle Theorem 6 - Tangents from a Point to a Circle",
    "theorem.7.title": "Bisected Angle of Tangents",
    "theorem.7.desc":
      "The line to the center bisects the angle between the two tangents.",
    "theorem.7.iframe_title":
      "Circle Theorem 7 - Tangents from a Point to a Circle II",
    "theorem.8.title": "Alternate Segment Theorem",
    "theorem.8.desc":
      "The angle between a tangent and a chord equals the angle in the opposite arc.",
    "theorem.8.iframe_title": "Circle Theorem 8 - Alternate Segment Theorem",
    "theorem.cta.line1": "Learn. Explore.",
    "theorem.cta.line2": "Now challenge yourself.",
    "theorem.cta.copy":
      "Choose the quiz for a quick check, or step into the game for a deeper experience.",
    "theorem.cta.actions_aria": "Challenge actions",
    "theorem.cta.quiz": "Start Quiz",
    "theorem.cta.play": "Play Now",
    "ai.kicker": "AI STUDY COPILOT",
    "ai.title.line1": "Get stuck?",
    "ai.title.line2": "Ask ArcMind",
    "ai.subtitle":
      "Your AI guide to circle theorems and proofs, from first ideas to complete reasoning.",
    "ai.demo.shell_aria": "AI chat demonstration",
    "ai.demo.subtitle": "Help with theorems and proof practice",
    "ai.demo.transcript_aria": "AI chat transcript",
    "ai.demo.empty_title": "Where should we start?",
    "ai.demo.welcome":
      "Ask a question about circle and I'll help you think it through.",
    "ai.demo.composer_aria": "AI chat composer",
    "ai.demo.ask_label": "Ask ArcMind",
    "ai.demo.placeholder": "Ask anything about circle",
    "ai.demo.hint":
      "Press Enter to send. Press Shift plus Enter to start a new line.",
    "ai.demo.attach_aria": "Add attachment",
    "ai.demo.select_model_aria": "Select model",
    "ai.demo.select_model": "Select model",
    "ai.demo.send_aria": "Send message",
    "ai.demo.disclaimer":
      "AI can make mistakes. Please check important information.",
    "ai.demo.suggestions_aria": "Suggested circle prompts",
    "ai.demo.suggestion.1":
      "Why is the angle at the centre twice the angle at the circumference?",
    "ai.demo.suggestion.2": "Help me prove this tangent theorem.",
    "ai.demo.suggestion.3": "Give me a hint, not the answer.",
    "ai.demo.suggestion.4": "Explain the alternate segment theorem.",
    "ai.demo.sidebar_aria": "ArcMind sidebar",
    "ai.demo.sidebar_expand_aria": "Focus chat area",
    "ai.demo.sidebar_settings_aria": "Open sidebar settings",
    "ai.demo.new_chat": "New Chat",
    "ai.demo.assistant_label": "Assistant",
    "ai.demo.sidebar.ask": "Ask ArcMind",
    "ai.demo.sidebar.theorem": "Theorem Help",
    "ai.demo.sidebar.proof": "Proof Practice",
    "ai.demo.sidebar.quiz": "Quiz Support",
    "ai.demo.recent_label": "Recent",
    "ai.demo.history.1": "Angle at the Centre",
    "ai.demo.history.2": "Tangent Theorem Proof",
    "ai.demo.history.3": "Cyclic Quadrilateral",
    "ai.demo.history.4": "Alternate Segment",
    "ai.demo.history_more": "View all history",
  };

  const enPricingAndFooterCopy = {
    "pricing.title": "Unlock More Possibilities",
    "pricing.intro": "More support for theorems, proofs, and every next step.",
    "pricing.audience_aria": "Pricing audience",
    "pricing.audience.individual": "Individual",
    "pricing.audience.schools": "Schools",
    "pricing.unit.month": "/month",
    "pricing.unit.school_month": "per school / month",
    "pricing.includes": "Includes:",
    "pricing.personal.starter.name": "Starter",
    "pricing.personal.starter.subtitle": "Start with the essentials",
    "pricing.personal.starter.note_price": "$59.88 billed yearly",
    "pricing.personal.starter.cta": "Choose starter",
    "pricing.personal.starter.f1": "Core theorem access",
    "pricing.personal.starter.f2": "Interactive foundations",
    "pricing.personal.starter.f3": "Standard quiz practice",
    "pricing.personal.starter.f4": "AI hints",
    "pricing.personal.starter.f5": "Flexible self-paced learning",
    "pricing.personal.starter.note":
      "Billed monthly. Includes access to essential features only. You can upgrade or cancel at any time.",
    "pricing.personal.pro.name": "Pro",
    "pricing.personal.pro.badge": "Most Popular",
    "pricing.personal.pro.subtitle": "Go further with smarter tools",
    "pricing.personal.pro.note_price": "$119.88 billed yearly",
    "pricing.personal.pro.cta": "Upgrade to Pro",
    "pricing.personal.pro.lead": "Everything in Pro, plus:",
    "pricing.personal.pro.f1": "Explore the full theorem library",
    "pricing.personal.pro.f2": "Unlock skill-based game modes",
    "pricing.personal.pro.f3": "Access richer interactive models",
    "pricing.personal.pro.f4": "Enjoy unlimited quiz practice",
    "pricing.personal.pro.f5": "Learn with complete AI guidance",
    "pricing.personal.pro.f6": "Track progress with ease",
    "pricing.personal.pro.f7": "Go further with visual explanations",
    "pricing.personal.pro.note":
      "Includes all Starter features plus advanced learning tools. You can upgrade or cancel at any time.",
    "pricing.personal.premium.name": "Premium",
    "pricing.personal.premium.subtitle": "Everything without limits",
    "pricing.personal.premium.note_price": "$239.88 billed yearly",
    "pricing.personal.premium.cta": "Choose Premium",
    "pricing.personal.premium.lead": "Everything in Pro, plus:",
    "pricing.personal.premium.f1": "Personal study roadmap templates",
    "pricing.personal.premium.f2": "Advanced performance analytics",
    "pricing.personal.premium.f3": "Unlimited AI usage",
    "pricing.personal.premium.f4": "Priority response support",
    "pricing.personal.premium.f5": "Early access to upcoming modules",
    "pricing.personal.premium.note":
      "Billed annually. Includes all Pro features plus exclusive premium content. You can cancel at any time.",
    "pricing.school.classroom.name": "Classroom",
    "pricing.school.classroom.note_price": "$948 billed yearly",
    "pricing.school.classroom.cta": "Start Classroom",
    "pricing.school.classroom.f1": "1 teacher seat and 35 student seats",
    "pricing.school.classroom.f2": "Lesson projector mode",
    "pricing.school.classroom.f3": "Auto-graded quiz reports",
    "pricing.school.classroom.f4": "Shareable class assignment links",
    "pricing.school.classroom.f5": "Basic learner progress tracking",
    "pricing.school.classroom.note":
      "Built for individual classrooms getting started with interactive geometry learning.",
    "pricing.school.campus.name": "Campus",
    "pricing.school.campus.badge": "Best for Departments",
    "pricing.school.campus.note_price": "$2,388 billed yearly",
    "pricing.school.campus.cta": "Choose Campus",
    "pricing.school.campus.lead": "Everything in Classroom, plus:",
    "pricing.school.campus.f1": "Up to 5 teachers and 200 students",
    "pricing.school.campus.f2": "Shared class dashboards",
    "pricing.school.campus.f3": "Bulk student import tools",
    "pricing.school.campus.f4": "Curriculum-aligned assignment packs",
    "pricing.school.campus.f5": "Priority onboarding and support",
    "pricing.school.campus.note":
      "Designed for schools that need broader access, richer tools, and stronger classroom support.",
    "pricing.school.institution.name": "Institution",
    "pricing.school.institution.note_price": "$5,388 billed yearly",
    "pricing.school.institution.cta": "Choose Institution",
    "pricing.school.institution.lead": "Everything in Campus, plus:",
    "pricing.school.institution.f1": "Unlimited teachers and up to 800 students",
    "pricing.school.institution.f2": "Admin reporting and export tools",
    "pricing.school.institution.f3": "SSO and LMS support",
    "pricing.school.institution.f4": "Dedicated implementation support",
    "pricing.school.institution.f5": "Annual usage and success review",
    "pricing.school.institution.note":
      "Created for institutions seeking a complete, scalable, and advanced learning solution.",
    "callout.line1": "From patterns to theorems.",
    "callout.line2": "From practice to mastery.",
    "callout.contact": "Get in Touch",
    "footer.aria": "Footer",
    "footer.brand_aria": "CircleLab home",
    "footer.logo_alt": "CircleLab logo",
    "footer.tagline": "Geometry made visible.",
    "footer.explore": "Explore",
    "footer.home": "Home",
    "footer.theorems": "Theorems",
    "footer.quizzes": "Quizzes",
    "footer.games": "Games",
    "footer.support": "Support",
    "footer.contact": "Contact Us",
    "footer.faq": "FAQs",
    "footer.feedback": "Feedback",
    "footer.social": "Social",
    "footer.twitter": "Twitter",
    "footer.instagram": "Instagram",
    "footer.linkedin": "LinkedIn",
    "footer.copy": "© 2026 CircleLab. All rights reserved.",
    "footer.terms": "Terms and Conditions",
    "footer.privacy": "Privacy Policy",
    "signup.close_aria": "Close sign up",
    "login.close_aria": "Close log in",
    "contact.close_aria": "Close contact form",
    "float.shell_aria": "ArcMind quick access",
    "float.form_aria": "Ask ArcMind quickly",
    "float.focus_aria": "Focus ArcMind",
    "float.ask_label": "Ask ArcMind",
    "float.placeholder": "Ask ArcMind",
    "float.send_aria": "Send to ArcMind",
  };

  const zhExtendedCopy = {
    "brand.home_aria": "CircleLab 首页",
    "brand.logo_alt": "CircleLab 标志",
    "nav.primary_aria": "主导航",
    "nav.account_aria": "账户导航",
    "settings.language_section_aria": "语言设置",
    "settings.language_group_aria": "语言",
    "settings.theme_section_aria": "主题设置",
    "settings.theme_group_aria": "主题",
    "settings.font_section_aria": "字号设置",
    "settings.font_group_aria": "字号",
    "settings.language_en": "英语",
    "core.title.line1": "重塑你的",
    "core.title.line2": "几何学习方式",
    "core.card1.title": "AI 助力",
    "core.card1.body":
      "所需之时，即刻指引。<br />清晰提示、即时支持与更聪明的练习。<br />让学习更自信、更清晰、更流畅。",
    "core.card2.title": "探索不止于静态",
    "core.card2.body":
      "让几何动起来。<br />交互操作图形，实时观察变化。<br />在每一次变化中看清几何的逻辑。",
    "core.card3.title": "让学习真正发生",
    "core.card3.body":
      "不止理论，更重实践。<br />去尝试，去探索，也去挑战自己。<br />发现问题正是前进的第一步。",
    "core.card4.title": "循序而学",
    "core.card4.body":
      "学习、游戏与测试自然闭环。<br />在想法、互动和练习之间轻松切换。<br />每一步，都推动理解更进一步。",
    "theorems.title": "让圆定理<br />触手可及",
    "theorems.controls_aria": "定理导航",
    "theorems.prev_aria": "上一组定理",
    "theorems.next_aria": "下一组定理",
    "theorem.1.title": "圆心角定理",
    "theorem.1.desc": "同弧所对圆心角是圆周角的两倍。",
    "theorem.1.iframe_title": "圆定理 1 - 圆心角与圆周角",
    "theorem.2.title": "半圆所对角",
    "theorem.2.desc": "半圆所对角恒为 90°。",
    "theorem.2.iframe_title": "圆定理 2 - 半圆所对角",
    "theorem.3.title": "同弧所对角",
    "theorem.3.desc": "同弧所对的圆周角相等。",
    "theorem.3.iframe_title": "圆定理 3 - 同弧所对角",
    "theorem.4.title": "圆内接四边形",
    "theorem.4.desc": "圆内接四边形的对角和为 180°。",
    "theorem.4.iframe_title": "圆定理 4 - 圆内接四边形",
    "theorem.5.title": "半径与切线垂直",
    "theorem.5.desc": "切点处半径垂直于切线。",
    "theorem.5.iframe_title": "圆定理 5 - 半径与切线",
    "theorem.6.title": "两条切线等长",
    "theorem.6.desc": "同一点向圆引出的两条切线长度相等。",
    "theorem.6.iframe_title": "圆定理 6 - 同一点引切线",
    "theorem.7.title": "切线夹角平分定理",
    "theorem.7.desc": "连接该点与圆心的线平分两条切线夹角。",
    "theorem.7.iframe_title": "圆定理 7 - 切线夹角平分",
    "theorem.8.title": "切弦定理",
    "theorem.8.desc": "切线与弦所成角等于其对弧所对圆周角。",
    "theorem.8.iframe_title": "圆定理 8 - 切弦定理",
    "theorem.cta.line1": "学习。探索。",
    "theorem.cta.line2": "现在挑战自己。",
    "theorem.cta.copy": "选择测验，快速检验理解。<br />或进入游戏，开启更深入的体验。",
    "theorem.cta.actions_aria": "挑战操作",
    "theorem.cta.quiz": "开始测验",
    "theorem.cta.play": "玩会游戏",
    "ai.kicker": "AI 学习助手",
    "ai.title.line1": "卡住了？",
    "ai.title.line2": "问问 ArcMind",
    "ai.subtitle": "你的圆几何与证明 AI 助手，从第一步想法到完整推理全程陪伴。",
    "ai.demo.shell_aria": "AI 对话演示",
    "ai.demo.subtitle": "定理与证明练习助手",
    "ai.demo.transcript_aria": "AI 对话记录",
    "ai.demo.empty_title": "我们先从哪里开始呢？",
    "ai.demo.welcome": "问我任意圆几何问题，我会陪你一步步推理。",
    "ai.demo.composer_aria": "AI 输入区",
    "ai.demo.ask_label": "向 ArcMind 提问",
    "ai.demo.placeholder": "有问题，尽管问",
    "ai.demo.hint": "按 Enter 发送，按 Shift+Enter 换行。",
    "ai.demo.attach_aria": "添加附件",
    "ai.demo.select_model_aria": "选择模型",
    "ai.demo.select_model": "选择模型",
    "ai.demo.send_aria": "发送消息",
    "ai.demo.disclaimer": "AI 可能会出错，请核对重要信息。",
    "ai.demo.suggestions_aria": "推荐的圆几何问题",
    "ai.demo.suggestion.1": "为什么同弧所对的圆心角是圆周角的两倍？",
    "ai.demo.suggestion.2": "帮我证明这道切线定理。",
    "ai.demo.suggestion.3": "给我一点提示，先不要直接给答案。",
    "ai.demo.suggestion.4": "讲解一下切弦定理。",
    "ai.demo.sidebar_aria": "ArcMind 侧边栏",
    "ai.demo.sidebar_expand_aria": "聚焦聊天区域",
    "ai.demo.sidebar_settings_aria": "打开侧边栏设置",
    "ai.demo.new_chat": "新对话",
    "ai.demo.assistant_label": "助手",
    "ai.demo.sidebar.ask": "询问 ArcMind",
    "ai.demo.sidebar.theorem": "定理帮助",
    "ai.demo.sidebar.proof": "证明练习",
    "ai.demo.sidebar.quiz": "测验辅助",
    "ai.demo.recent_label": "最近",
    "ai.demo.history.1": "圆心角定理",
    "ai.demo.history.2": "切线定理证明",
    "ai.demo.history.3": "圆内接四边形",
    "ai.demo.history.4": "切弦定理",
    "ai.demo.history_more": "查看全部历史",
  };

  const zhPricingAndFooterCopy = {
    "pricing.title": "解锁更多可能",
    "pricing.intro": "为定理、证明和每一步进阶提供更强支持。",
    "pricing.audience_aria": "定价对象",
    "pricing.audience.individual": "个人",
    "pricing.audience.schools": "学校",
    "pricing.unit.month": "/月",
    "pricing.unit.school_month": "每校 / 月",
    "pricing.includes": "包含：",
    "pricing.personal.starter.name": "入门版",
    "pricing.personal.starter.subtitle": "从基础开始",
    "pricing.personal.starter.note_price": "$59.88 按年计费",
    "pricing.personal.starter.cta": "选择入门版",
    "pricing.personal.starter.f1": "核心定理访问",
    "pricing.personal.starter.f2": "交互式基础学习",
    "pricing.personal.starter.f3": "标准测验练习",
    "pricing.personal.starter.f4": "AI 提示",
    "pricing.personal.starter.f5": "灵活自定进度",
    "pricing.personal.starter.note":
      "按月计费，仅包含基础功能。你可随时升级或取消。",
    "pricing.personal.pro.name": "专业版",
    "pricing.personal.pro.badge": "最受欢迎",
    "pricing.personal.pro.subtitle": "用更智能的工具走得更远",
    "pricing.personal.pro.note_price": "$119.88 按年计费",
    "pricing.personal.pro.cta": "升级到专业版",
    "pricing.personal.pro.lead": "在 Starter 基础上，另外提供：",
    "pricing.personal.pro.f1": "完整定理库访问",
    "pricing.personal.pro.f2": "解锁技能型游戏模式",
    "pricing.personal.pro.f3": "更丰富的交互模型",
    "pricing.personal.pro.f4": "无限测验练习",
    "pricing.personal.pro.f5": "完整 AI 学习引导",
    "pricing.personal.pro.f6": "轻松追踪学习进度",
    "pricing.personal.pro.f7": "更深入的可视化讲解",
    "pricing.personal.pro.note":
      "包含 Starter 全部功能与进阶学习工具。你可随时升级或取消。",
    "pricing.personal.premium.name": "高级版",
    "pricing.personal.premium.subtitle": "无上限完整体验",
    "pricing.personal.premium.note_price": "$239.88 按年计费",
    "pricing.personal.premium.cta": "选择高级版",
    "pricing.personal.premium.lead": "在 Pro 基础上，另外提供：",
    "pricing.personal.premium.f1": "个性化学习路线模板",
    "pricing.personal.premium.f2": "高级表现分析",
    "pricing.personal.premium.f3": "无限 AI 使用",
    "pricing.personal.premium.f4": "优先响应支持",
    "pricing.personal.premium.f5": "新模块抢先体验",
    "pricing.personal.premium.note":
      "按年计费，包含 Pro 全部功能与专属高级内容。可随时取消。",
    "pricing.school.classroom.name": "班级版",
    "pricing.school.classroom.note_price": "$948 按年计费",
    "pricing.school.classroom.cta": "开通班级版",
    "pricing.school.classroom.f1": "1 位教师席位和 35 位学生席位",
    "pricing.school.classroom.f2": "课堂投屏模式",
    "pricing.school.classroom.f3": "自动批改测验报告",
    "pricing.school.classroom.f4": "可分享班级作业链接",
    "pricing.school.classroom.f5": "基础学习进度追踪",
    "pricing.school.classroom.note":
      "面向单个班级，快速开始互动式几何教学。",
    "pricing.school.campus.name": "校区版",
    "pricing.school.campus.badge": "院系首选",
    "pricing.school.campus.note_price": "$2,388 按年计费",
    "pricing.school.campus.cta": "选择校区版",
    "pricing.school.campus.lead": "在 Classroom 基础上，另外提供：",
    "pricing.school.campus.f1": "最多 5 位教师和 200 位学生",
    "pricing.school.campus.f2": "共享班级仪表盘",
    "pricing.school.campus.f3": "批量导入学生工具",
    "pricing.school.campus.f4": "对齐课程标准的作业包",
    "pricing.school.campus.f5": "优先上手与支持服务",
    "pricing.school.campus.note":
      "为需要更大覆盖、更强工具与更稳教学支持的学校设计。",
    "pricing.school.institution.name": "机构版",
    "pricing.school.institution.note_price": "$5,388 按年计费",
    "pricing.school.institution.cta": "选择机构版",
    "pricing.school.institution.lead": "在 Campus 基础上，另外提供：",
    "pricing.school.institution.f1": "教师无限，学生最多 800 人",
    "pricing.school.institution.f2": "管理端报表与导出工具",
    "pricing.school.institution.f3": "SSO 与 LMS 支持",
    "pricing.school.institution.f4": "专属落地实施支持",
    "pricing.school.institution.f5": "年度使用与成效复盘",
    "pricing.school.institution.note":
      "面向机构级规模，提供完整、可扩展的进阶学习方案。",
    "callout.line1": "从图形规律到定理推导。",
    "callout.line2": "从反复练习到真正精通。",
    "callout.contact": "联系我们",
    "footer.aria": "页脚",
    "footer.brand_aria": "CircleLab 首页",
    "footer.logo_alt": "CircleLab 标志",
    "footer.tagline": "让几何看得见。",
    "footer.explore": "探索",
    "footer.home": "首页",
    "footer.theorems": "定理",
    "footer.quizzes": "测验",
    "footer.games": "游戏",
    "footer.support": "支持",
    "footer.contact": "联系我们",
    "footer.faq": "常见问题",
    "footer.feedback": "反馈",
    "footer.social": "社交",
    "footer.twitter": "Twitter",
    "footer.instagram": "Instagram",
    "footer.linkedin": "LinkedIn",
    "footer.copy": "© 2026 CircleLab。保留所有权利。",
    "footer.terms": "条款与条件",
    "footer.privacy": "隐私政策",
    "signup.close_aria": "关闭注册窗口",
    "login.close_aria": "关闭登录窗口",
    "contact.close_aria": "关闭联系窗口",
    "float.shell_aria": "ArcMind 快捷入口",
    "float.form_aria": "快速向 ArcMind 提问",
    "float.focus_aria": "聚焦 ArcMind",
    "float.ask_label": "向 ArcMind 提问",
    "float.placeholder": "有问题，尽管问",
    "float.send_aria": "发送给 ArcMind",
  };

  Object.assign(dictionaries.en, enExtendedCopy, enPricingAndFooterCopy);
  Object.assign(dictionaries.zh, zhExtendedCopy, zhPricingAndFooterCopy);

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

    if (value === "dark") {
      return "dark";
    }

    return "light";
  };
  const normalizeFontScale = (value) => {
    if (value === "small" || value === "large") {
      return value;
    }

    return "normal";
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
  let currentFontScale = normalizeFontScale(
    readStoredPreference(STORAGE_KEYS.fontScale)
  );
  const FONT_SCALE_STEPS = ["small", "normal", "large"];
  const getFontScaleStep = (fontScale) =>
    Math.max(0, FONT_SCALE_STEPS.indexOf(normalizeFontScale(fontScale)));
  const getFontScaleFromStep = (step) => {
    const stepValue = Number.parseInt(step, 10);
    if (!Number.isFinite(stepValue)) {
      return "normal";
    }

    return FONT_SCALE_STEPS[Math.min(FONT_SCALE_STEPS.length - 1, Math.max(0, stepValue))];
  };
  const getFontScaleValueKey = (fontScale) => {
    if (fontScale === "small") {
      return "settings.font_small";
    }

    if (fontScale === "large") {
      return "settings.font_large";
    }

    return "settings.font_medium";
  };

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
  const syncFontScaleControl = () => {
    document.querySelectorAll("[data-font-scale-range]").forEach((range) => {
      if (!(range instanceof HTMLInputElement)) {
        return;
      }

      const currentStep = getFontScaleStep(currentFontScale);
      range.value = String(currentStep);
      range.setAttribute(
        "aria-valuetext",
        translate(getFontScaleValueKey(currentFontScale), range.getAttribute("aria-valuetext") ?? "")
      );
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

    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      element.innerHTML = translate(element.dataset.i18nHtml, element.innerHTML ?? "");
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

    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      element.setAttribute(
        "title",
        translate(element.dataset.i18nTitle, element.getAttribute("title") ?? "")
      );
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      element.setAttribute(
        "alt",
        translate(element.dataset.i18nAlt, element.getAttribute("alt") ?? "")
      );
    });

    if (body.dataset.titleKey) {
      document.title = translate(body.dataset.titleKey, document.title);
    }

    syncLanguageButtons();
    syncFontScaleControl();
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
  const applyFontScale = (fontScale, persist = true) => {
    currentFontScale = normalizeFontScale(fontScale);

    if (currentFontScale === "normal") {
      delete root.dataset.fontScale;
    } else {
      root.dataset.fontScale = currentFontScale;
    }

    if (persist) {
      writeStoredPreference(STORAGE_KEYS.fontScale, currentFontScale);
    }

    syncFontScaleControl();
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

    delete menu.dataset.previewTheme;
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
    const fontScaleRanges = settingsRoot.querySelectorAll("[data-font-scale-range]");

    if (!(toggle instanceof HTMLButtonElement) || !(menu instanceof HTMLElement)) {
      return;
    }

    const setPreviewTheme = (theme) => {
      if (theme === "dark" || theme === "light") {
        menu.dataset.previewTheme = theme;
        return;
      }

      delete menu.dataset.previewTheme;
    };

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

      const previewTheme = button.dataset.themeOption;

      button.addEventListener("mouseenter", () => {
        setPreviewTheme(previewTheme);
      });

      button.addEventListener("mouseleave", () => {
        setPreviewTheme(null);
      });

      button.addEventListener("focus", () => {
        setPreviewTheme(previewTheme);
      });

      button.addEventListener("blur", () => {
        setPreviewTheme(null);
      });

      button.addEventListener("click", () => {
        setPreviewTheme(null);
        applyTheme(button.dataset.themeOption);
      });
    });

    fontScaleRanges.forEach((range) => {
      if (!(range instanceof HTMLInputElement)) {
        return;
      }

      const updateFontScale = () => {
        applyFontScale(getFontScaleFromStep(range.value));
      };

      range.addEventListener("input", updateFontScale);
      range.addEventListener("change", () => {
        range.blur();
        updateFontScale();
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
  applyFontScale(currentFontScale, false);
  applyLanguage(currentLanguage, false);
  document.querySelectorAll("[data-settings]").forEach(initSettingsMenu);

  window.CircleLabPreferences = {
    t: translate,
    getLanguage: () => currentLanguage,
    getTheme: () => currentTheme,
    getFontScale: () => currentFontScale,
    setLanguage: applyLanguage,
    setTheme: applyTheme,
    setFontScale: applyFontScale,
  };
})();
