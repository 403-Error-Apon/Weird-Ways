(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const toastRegion = $("#toastRegion");
  const modal = $("#modal");
  const modalTitle = $("#modalTitle");
  const modalBody = $("#modalBody");
  const modalEyebrow = $("#modalEyebrow");
  const modalIcon = $("#modalIcon");
  const themeOverlay = $("#themeOverlay");
  const statusTitle = $("#statusTitle");
  const statusDescription = $("#statusDescription");

  let toastTimer;
  let secretClickCount = 0;
  let secretResetTimer;
  let themeActive = false;
  let modalTrigger = null;

  const statuses = [
    ["Curiosity detected.", "Please proceed irresponsibly."],
    ["Suspicious activity.", "Someone is clicking things again."],
    ["Snack protocol active.", "Academic responsibility not found."],
    ["Everything is normal.", "This message has been reviewed by absolutely nobody."],
    ["Side quest available.", "Reward: a very small amount of satisfaction."],
    ["Apon.exe is running.", "Estimated stability: questionable."]
  ];

  function showToast(message, duration = 3200) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastRegion.append(toast);
    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(6px)";
      window.setTimeout(() => toast.remove(), 220);
    }, duration);
  }

  function openModal({ title, body, eyebrow = "A QUICK INTERRUPTION", icon = "✳" }) {
    modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalTitle.textContent = title;
    modalBody.textContent = body;
    modalEyebrow.textContent = eyebrow;
    modalIcon.textContent = icon;
    if (typeof modal.showModal === "function") {
      if (!modal.open) modal.showModal();
    } else {
      showToast(`${title} ${body}`);
    }
  }

  function closeModal() {
    if (modal.open) modal.close();
  }

  $("#modalClose").addEventListener("click", closeModal);
  $("#modalOkay").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  modal.addEventListener("close", () => {
    if (modalTrigger && document.contains(modalTrigger)) modalTrigger.focus({ preventScroll: true });
    modalTrigger = null;
  });

  // Mobile navigation: update the accessible expanded state with the menu.
  const menuButton = $("#menuButton");
  const siteNav = $("#siteNav");
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
  });
  $$("#siteNav a, #siteNav button").forEach((item) => {
    item.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });

  function showAbout() {
    openModal({
      eyebrow: "FILE Nº 403 / SUBJECT: APON",
      title: "A person of mild concern.",
      body: "DU criminology student. Curious about people. Frequently hungry. Enjoys horror, silly ideas, and clicking things that say 'do not click.' Further investigation is encouraged.",
      icon: "⌕"
    });
  }
  $("#aboutButton").addEventListener("click", showAbout);
  $("#whoButton").addEventListener("click", showAbout);

  $("#statusRefresh").addEventListener("click", () => {
    const current = statusTitle.textContent;
    let next = statuses[Math.floor(Math.random() * statuses.length)];
    if (next[0] === current) next = statuses[(statuses.findIndex((item) => item[0] === current) + 1) % statuses.length];
    statusTitle.textContent = next[0];
    statusDescription.textContent = next[1];
  });

  $("#watchButton").addEventListener("click", () => {
    openModal({
      eyebrow: "OBSERVATION LOG",
      title: "It noticed you noticing.",
      body: "Don't worry. It's only a CSS illustration. It has no camera, no access to your files, and absolutely no useful information.",
      icon: "◉"
    });
  });

  $("#dontClickButton").addEventListener("click", () => {
    openModal({
      eyebrow: "UNAUTHORIZED BUTTON PRESS",
      title: "I literally said don't.",
      body: "ACCESS DENIED. REASON: APON IS BEING SILLY AGAIN. Please take a moment to reflect on your choices. Or click again. I'm not your supervisor.",
      icon: "⚠"
    });
  });

  $("#smileyButton").addEventListener("click", () => {
    const replies = [
      "What? Why are you looking at me?",
      "I was smiling before you got here.",
      "We need to stop meeting like this.",
      "I know what you clicked last summer."
    ];
    showToast(replies[Math.floor(Math.random() * replies.length)]);
  });

  $("#normalButton").addEventListener("click", () => {
    showToast("Acting normal... FAILED. Please try being weirder.");
    document.body.classList.add("tiny-shake");
    window.setTimeout(() => document.body.classList.remove("tiny-shake"), 380);
  });

  $$(".orbit-spark").forEach((spark, index) => {
    spark.addEventListener("click", () => {
      showToast(index === 0 ? "You found a star. Congratulations, astronomer." : "That dot has a complicated backstory.");
    });
  });

  $("#guestbookButton").addEventListener("click", () => {
    openModal({
      eyebrow: "DOOR Nº 03 / NOT OPEN YET",
      title: "The guestbook is hiding.",
      body: "The strangers' room is still being prepared. When it opens, you'll be able to leave a note for someone you've never met. Until then, consider this your first knock.",
      icon: "✉"
    });
  });

  function activateTheme() {
    if (themeActive) return;
    themeActive = true;
    themeOverlay.classList.add("is-active");
    document.body.classList.add("theme-active");
    themeOverlay.setAttribute("aria-hidden", "false");
    $("#restoreTheme").focus({ preventScroll: true });
  }

  function restoreTheme() {
    themeActive = false;
    themeOverlay.classList.remove("is-active");
    document.body.classList.remove("theme-active");
    themeOverlay.setAttribute("aria-hidden", "true");
    secretClickCount = 0;
    $("#secret403").focus({ preventScroll: true });
  }

  $("#secret403").addEventListener("click", () => {
    secretClickCount += 1;
    window.clearTimeout(secretResetTimer);
    if (secretClickCount >= 1) {
      showToast(secretClickCount < 3 ? `403 noticed. ${3 - secretClickCount} more ${3 - secretClickCount === 1 ? "click" : "clicks"} to make things weird.` : "Well. You asked for this.");
    }
    if (secretClickCount >= 3) {
      activateTheme();
      secretClickCount = 0;
    } else {
      secretResetTimer = window.setTimeout(() => { secretClickCount = 0; }, 5000);
    }
  });

  $("#restoreTheme").addEventListener("click", restoreTheme);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && themeActive) restoreTheme();
  });

  // Small keyboard easter egg. We only watch printable keys when the user
  // isn't typing into an input or editable element.
  let typedBuffer = "";
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
    if (isTyping || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.length !== 1 || !/[a-z]/i.test(event.key)) return;
    typedBuffer = (typedBuffer + event.key.toLowerCase()).slice(-4);
    if (typedBuffer === "apon") {
      typedBuffer = "";
      showToast("APON DETECTED. Okay, you know too much.");
    }
  });

  // Footer brand scrolls home without forcing a full page reload.
  $(".footer-brand").addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  // Avoid running a continuous motion ticker for users who prefer reduced motion.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    $$(".ticker-track").forEach((track) => { track.style.animation = "none"; });
  }
})();
