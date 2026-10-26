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
  let watcherClicks = 0;
  let watcherIsAvoiding = false;
  let watcherTimer = null;
  let watcherPeekTimer = null;
  let linkClickCount = 0;
  let updateNoticeShown = false;
  let modalTrigger = null;

  const statuses = [
    ["Curiosity detected.", "Please proceed irresponsibly."],
    ["Suspicious activity.", "Someone is clicking things again."],
    ["Snack protocol active.", "Academic responsibility not found."],
    ["Everything is normal.", "This message has been reviewed by absolutely nobody."],
    ["Side quest available.", "Reward: a very small amount of satisfaction."],
    ["Apon.exe is running.", "Estimated stability: questionable."]
  ];

  // Easter egg 13: remember repeat visits in this browser, without a backend.
  try {
    const visitKey = "weirdWaysVisitCount";
    const oldCount = Number.parseInt(localStorage.getItem(visitKey) || "0", 10);
    const visitCount = (Number.isFinite(oldCount) ? oldCount : 0) + 1;
    localStorage.setItem(visitKey, String(visitCount));
    const greetings = [
      "Welcome, stranger. Try not to break anything.",
      "Oh. It's you again.",
      "Back already? I knew you would be.",
      "You know where everything is now. That's mildly concerning.",
      "Apon says you can stay. I wasn't consulted."
    ];
    window.setTimeout(() => showToast(greetings[Math.min(visitCount - 1, greetings.length - 1)], 4200), 900);
  } catch (_) { /* The site still works when browser storage is unavailable. */ }


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

  // Easter egg 05: fixed watcher. Three clicks trigger a warning; three more
  // make it look away. It peeks back for a moment every nine seconds.
  const fixedWatcher = $("#fixedWatcher");
  const watcherCaption = $("#watcherCaption");
  function watcherLooksAway() {
    watcherIsAvoiding = true;
    fixedWatcher.classList.add("is-looking-away");
    fixedWatcher.classList.remove("is-looking-back");
    watcherCaption.textContent = "NOT LOOKING";
    window.clearInterval(watcherTimer);
    window.clearTimeout(watcherPeekTimer);
    watcherTimer = window.setInterval(() => {
      if (!watcherIsAvoiding) return;
      fixedWatcher.classList.add("is-looking-back");
      fixedWatcher.classList.remove("is-looking-away");
      watcherCaption.textContent = "JUST CHECKING";
      watcherPeekTimer = window.setTimeout(() => {
        if (!watcherIsAvoiding) return;
        fixedWatcher.classList.remove("is-looking-back");
        fixedWatcher.classList.add("is-looking-away");
        watcherCaption.textContent = "NOT LOOKING";
      }, 1700);
    }, 9000);
  }
  fixedWatcher.addEventListener("click", () => {
    watcherClicks += 1;
    if (watcherClicks === 3) {
      fixedWatcher.classList.add("is-startled");
      showToast("Stop it!!");
      window.setTimeout(() => fixedWatcher.classList.remove("is-startled"), 900);
    } else if (watcherClicks === 6) {
      showToast("Okey, Okey, I won't look at you anymore.");
      watcherLooksAway();
    } else if (watcherClicks > 6 && watcherIsAvoiding) {
      showToast("I said I wasn't looking. That was a lie.");
      fixedWatcher.classList.add("is-looking-back");
      fixedWatcher.classList.remove("is-looking-away");
      watcherCaption.textContent = "CAUGHT YOU";
      window.setTimeout(() => {
        if (watcherIsAvoiding) {
          fixedWatcher.classList.remove("is-looking-back");
          fixedWatcher.classList.add("is-looking-away");
          watcherCaption.textContent = "NOT LOOKING";
        }
      }, 1700);
    } else {
      showToast(watcherClicks < 3 ? "The little smile is watching you back." : "It's trying very hard to ignore you.");
    }
  });
  document.addEventListener("pointermove", (event) => {
    if (watcherIsAvoiding && !fixedWatcher.classList.contains("is-looking-back")) return;
    const rect = fixedWatcher.getBoundingClientRect();
    const dx = Math.max(-3, Math.min(3, (event.clientX - (rect.left + rect.width / 2)) / 45));
    const dy = Math.max(-2, Math.min(2, (event.clientY - (rect.top + rect.height / 2)) / 55));
    fixedWatcher.style.setProperty("--look-x", `${dx}px`);
    fixedWatcher.style.setProperty("--look-y", `${dy}px`);
  }, { passive:true });


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

  // Easter egg 11: after any five anchor-link clicks, display a fake changelog.
  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link || link.classList.contains("skip-link") || updateNoticeShown) return;
    linkClickCount += 1;
    if (linkClickCount >= 5) {
      updateNoticeShown = true;
      window.setTimeout(() => openModal({
        eyebrow:"SYSTEM NOTICE / VERSION 0.403",
        title:"WEIRD WAYS HAS UPDATED",
        body:"Fixed 0 bugs. Added 7 bugs. Made the website 3% weirder. You may notice absolutely no difference.",
        icon:"↻"
      }), 180);
    }
  });

  // Easter egg 16: custom right-click menu only on the floating question mark.
  const secretObject = $("#secretObject");
  const customContextMenu = $("#customContextMenu");
  function hideContextMenu() { customContextMenu.hidden = true; }
  secretObject.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    customContextMenu.hidden = false;
    const rect = customContextMenu.getBoundingClientRect();
    const margin = 10;
    customContextMenu.style.left = `${Math.max(margin, Math.min(event.clientX, window.innerWidth - rect.width - margin))}px`;
    customContextMenu.style.top = `${Math.max(margin, Math.min(event.clientY, window.innerHeight - rect.height - margin))}px`;
    customContextMenu.querySelector('[role="menuitem"]')?.focus({ preventScroll:true });
  });
  customContextMenu.addEventListener("click", (event) => {
    const item = event.target instanceof Element ? event.target.closest("[data-context-action]") : null;
    if (!item) return;
    const action = item.dataset.contextAction;
    hideContextMenu();
    if (action === "inspect") openModal({ eyebrow:"OBJECT Nº 403 / INSPECTION", title:"It is a question mark.", body:"You right-clicked a decorative object to inspect it. That's exactly the sort of energy this website was built for.", icon:"?" });
    else if (action === "leave") showToast("Good call. It looked like it was about to ask you something.");
  });
  document.addEventListener("pointerdown", (event) => {
    if (!customContextMenu.hidden && !customContextMenu.contains(event.target) && event.target !== secretObject) hideContextMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideContextMenu();
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !customContextMenu.hidden && customContextMenu.contains(document.activeElement)) {
      event.preventDefault();
      const items = $$('[role="menuitem"]', customContextMenu);
      const index = items.indexOf(document.activeElement);
      const step = event.key === "ArrowDown" ? 1 : -1;
      items[(index + step + items.length) % items.length]?.focus();
    }
  });
  window.addEventListener("resize", hideContextMenu);
  window.addEventListener("scroll", hideContextMenu, { passive:true });

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
      document.body.classList.remove("egg-celebration");
      void document.body.offsetWidth;
      document.body.classList.add("egg-celebration");
      window.setTimeout(() => document.body.classList.remove("egg-celebration"), 2200);
      showToast("APON DETECTED. Okay, you know too much.");
    }
  });

  // Footer brand scrolls home without forcing a full page reload.
  $(".footer-brand").addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  window.addEventListener("pagehide", () => {
    window.clearInterval(watcherTimer);
    window.clearTimeout(watcherPeekTimer);
    window.clearTimeout(secretResetTimer);
  });

  // Avoid running a continuous motion ticker for users who prefer reduced motion.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    $$(".ticker-track").forEach((track) => { track.style.animation = "none"; });
  }
})();
