(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function markLoaded() {
    requestAnimationFrame(function () { root.classList.add("is-loaded"); });
  }
  if (document.readyState === "complete") markLoaded();
  else window.addEventListener("load", markLoaded);
  setTimeout(markLoaded, 1500);

  var header = document.querySelector(".site-header");
  var callbar = document.querySelector(".callbar");
  var parallaxEls = reduceMotion ? [] : Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    if (header) header.classList.toggle("is-solid", y > 40);
    if (callbar) {
      var nearBottom = vh + y >= document.documentElement.scrollHeight - 160;
      callbar.classList.toggle("is-hidden", y < 320 || nearBottom);
    }
    parallaxEls.forEach(function (el) {
      var box = el.parentElement.getBoundingClientRect();
      if (box.bottom < -100 || box.top > vh + 100) return;
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.12;
      var progress = (box.top + box.height / 2 - vh / 2) / vh;
      el.style.transform = "translate3d(0," + (progress * speed * box.height).toFixed(1) + "px,0)";
    });
    updateTabs();
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");

  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(!document.body.classList.contains("nav-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        setNav(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 960 && document.body.classList.contains("nav-open")) setNav(false);
    });
  }

  var OPEN_DAYS = [0, 3, 4, 5, 6];
  var SLOTS = [[660, 900], [1080, 1380]];
  var DAY_NAMES = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  var WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function romeNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Rome",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      return { day: WEEKDAY_INDEX[map.weekday], minutes: (parseInt(map.hour, 10) % 24) * 60 + parseInt(map.minute, 10) };
    } catch (err) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function fmt(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }

  function computeStatus(now) {
    for (var off = 0; off < 8; off++) {
      var day = (now.day + off) % 7;
      if (OPEN_DAYS.indexOf(day) === -1) continue;
      for (var i = 0; i < SLOTS.length; i++) {
        var s = SLOTS[i][0];
        var e = SLOTS[i][1];
        if (off === 0) {
          if (now.minutes >= s && now.minutes < e) return { open: true, until: e };
          if (now.minutes < s) return { open: false, offset: 0, at: s, day: day };
        } else {
          return { open: false, offset: off, at: s, day: day };
        }
      }
    }
    return null;
  }

  function statusText(st, today) {
    if (!st) return "";
    if (st.open) return "Aperto ora, fino alle " + fmt(st.until);
    var lead = OPEN_DAYS.indexOf(today) === -1 ? "Oggi chiuso" : "Chiuso ora";
    if (st.offset === 0) return lead + ", " + (st.at === SLOTS[0][0] ? "apre oggi alle " : "riapre alle ") + fmt(st.at);
    if (st.offset === 1) return lead + ", riapre domani alle " + fmt(st.at);
    return lead + ", riapre " + DAY_NAMES[st.day] + " alle " + fmt(st.at);
  }

  function updateStatus() {
    var now = romeNow();
    var st = computeStatus(now);
    var text = statusText(st, now.day);
    document.querySelectorAll("[data-open-status]").forEach(function (el) {
      var label = el.querySelector(".status__text");
      if (label) label.textContent = text;
      el.classList.toggle("is-open", !!(st && st.open));
      el.classList.toggle("is-closed", !(st && st.open));
      el.hidden = false;
    });
    document.querySelectorAll("[data-day]").forEach(function (row) {
      row.classList.toggle("is-today", parseInt(row.getAttribute("data-day"), 10) === now.day);
    });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  var reveals = document.querySelectorAll(".reveal, .reveal-img");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  var tabs = document.querySelector(".menu-tabs");
  var tabLinks = tabs ? Array.prototype.slice.call(tabs.querySelectorAll("a[href^='#']")) : [];
  var tabSections = tabLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  var activeTab = null;

  function updateTabs() {
    if (!tabs) return;
    var limit = tabs.getBoundingClientRect().bottom + 40;
    var current = null;
    tabSections.forEach(function (sec, i) {
      if (sec && sec.getBoundingClientRect().top <= limit) current = tabLinks[i];
    });
    if (current === activeTab) return;
    tabLinks.forEach(function (a) { a.classList.toggle("is-active", a === current); });
    activeTab = current;
    if (current) {
      var list = current.closest("ul");
      var left = current.offsetLeft - list.clientWidth / 2 + current.clientWidth / 2;
      list.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  requestUpdate();

  var filters = document.querySelectorAll(".gallery-tabs button");
  var groups = document.querySelectorAll(".gallery-group");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-filter");
      filters.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      groups.forEach(function (g) {
        var show = target === "tutte" || g.id === target;
        g.hidden = !show;
        g.classList.remove("is-entering");
        if (show && !reduceMotion) {
          void g.offsetWidth;
          g.classList.add("is-entering");
        }
      });
    });
  });

  var lightbox = document.querySelector(".lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    var figure = lightbox.querySelector("figure");
    var caption = lightbox.querySelector("figcaption");
    var items = [];
    var current = 0;
    var lastTrigger = null;

    function visibleItems() {
      return Array.prototype.filter.call(document.querySelectorAll(".gallery-grid button"), function (b) {
        return !b.closest(".gallery-group").hidden;
      });
    }

    function show(index) {
      current = (index + items.length) % items.length;
      var btn = items[current];
      var thumb = btn.querySelector("img");
      var old = figure.querySelector("img");
      var img = document.createElement("img");
      img.src = btn.getAttribute("data-full");
      img.alt = thumb.alt;
      if (old) figure.replaceChild(img, old);
      else figure.insertBefore(img, caption);
      caption.textContent = thumb.alt;
    }

    document.querySelectorAll(".gallery-grid button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        items = visibleItems();
        lastTrigger = btn;
        show(items.indexOf(btn));
        lightbox.showModal();
      });
    });

    lightbox.querySelector(".lightbox__close").addEventListener("click", function () { lightbox.close(); });
    lightbox.querySelector(".lightbox__prev").addEventListener("click", function () { show(current - 1); });
    lightbox.querySelector(".lightbox__next").addEventListener("click", function () { show(current + 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target === figure) lightbox.close();
    });
    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
    var touchX = null;
    lightbox.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      touchX = null;
    });
    lightbox.addEventListener("close", function () {
      var img = figure.querySelector("img");
      if (img) img.remove();
      if (lastTrigger) lastTrigger.focus();
    });
  } else if (lightbox) {
    document.querySelectorAll(".gallery-grid button").forEach(function (btn) {
      btn.addEventListener("click", function () { window.open(btn.getAttribute("data-full"), "_blank", "noopener"); });
    });
  }
})();
