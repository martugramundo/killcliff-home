/* =========================================================
   Kill Cliff — Homepage interactions (vanilla, no deps)
   ========================================================= */
(function () {
  "use strict";

  /* Mark that JS is live so reveal animations only hide content when they can be shown. */
  document.documentElement.classList.add("js");

  /* Easter egg for the curious */
  try {
    console.log(
      "%c KILL CLIFF %c Clean energy. Created by a Navy SEAL. Every purchase supports the Navy SEAL Foundation. ",
      "background:#FFE819;color:#000;font-weight:700;padding:4px 8px;border-radius:4px 0 0 4px;",
      "background:#111;color:#F5F5F5;padding:4px 8px;border-radius:0 4px 4px 0;"
    );
  } catch (e) {}

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* SVG marks for the comparison table */
  var CHECK = '<svg class="mark mark--yes" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-label="Yes"><path d="M4 12.5 10 18.5 20 6"/></svg>';
  var CROSS = '<svg class="mark mark--no" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-label="No"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  /* ---- Sticky header compaction on scroll ---- */
  var header = document.getElementById("header");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile drawer ---- */
  var toggle = document.getElementById("menuToggle");
  var drawer = document.getElementById("mobileDrawer");
  var overlay = document.getElementById("drawerOverlay");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add("is-visible"); });
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    overlay.classList.remove("is-visible");
    setTimeout(function () { overlay.hidden = true; }, 300);
    document.body.style.overflow = "";
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
    });
  }
  if (overlay) overlay.addEventListener("click", closeDrawer);
  if (drawer) drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeDrawer); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("is-open")) closeDrawer();
  });

  /* ---- Scroll reveal (staggered) ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = el.dataset.delay ? parseInt(el.dataset.delay, 10) : indexInParent(el) * 70;
          el.style.transitionDelay = delay + "ms";
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }
  function indexInParent(el) {
    var i = 0, sib = el;
    while ((sib = sib.previousElementSibling) != null) {
      if (sib.classList.contains("reveal")) i++;
    }
    return Math.min(i, 6);
  }

  /* ---- Comparison (interactive toggle) ---- */
  (function () {
    var CMP = {
      sugar: { label: "Zero sugar", kc: "0g sugar — clean energy", other: "Up to 50g of sugar" },
      electrolytes: { label: "Real electrolytes", kc: "Sodium, potassium & magnesium", other: "No real electrolytes" },
      creatine: { label: "Premium creatine HCl", kc: "Premium creatine HCl", other: "None, or cheap monohydrate" },
      crash: { label: "No crash, no jitters", kc: "Clean, sustained energy", other: "Spike, then crash" },
      dyes: { label: "No artificial dyes", kc: "No artificial dyes", other: "Synthetic colors & fillers" },
      mission: { label: "Supports the Navy SEAL Foundation", kc: "Every purchase gives back", other: "No mission" }
    };
    var tabs = document.querySelectorAll(".cmp__tab");
    var attrEl = document.getElementById("cmpAttr");
    var kcMark = document.getElementById("cmpKcMark");
    var otherMark = document.getElementById("cmpOtherMark");
    var kcNote = document.getElementById("cmpKcNote");
    var otherNote = document.getElementById("cmpOtherNote");
    if (!tabs.length || !kcMark) return;
    function set(k) {
      var d = CMP[k]; if (!d) return;
      if (attrEl) attrEl.textContent = d.label;
      kcMark.innerHTML = CHECK; otherMark.innerHTML = CROSS;
      kcNote.textContent = d.kc; otherNote.textContent = d.other;
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
        t.classList.add("is-active"); t.setAttribute("aria-selected", "true");
        set(t.dataset.k);
      });
    });
    set("sugar");
  })();

  /* ---- The stack — interactive tabs ---- */
  var STACK = {
    hcl: { title: "Creatine HCl", body: "The premium form of creatine your muscles run on — for explosive power and faster recovery. Not the cheap monohydrate filler." },
    lions: { title: "Lion's Mane", body: "The cognitive edge. Mind energy, not body buzz — sustained, sharp focus without the crash." },
    glutamine: { title: "Glutamine", body: "Recovery support so you bounce back faster between sessions, deployments, and long days in the field." },
    electrolytes: { title: "Real electrolytes", body: "Clean hydration that puts back what sweat takes out — sodium, potassium, and magnesium that actually work." }
  };
  var stackTabs = document.querySelectorAll(".stack__tab");
  var stackPanel = document.getElementById("stackPanel");
  function setIngredient(key) {
    var data = STACK[key];
    if (!data || !stackPanel) return;
    stackPanel.classList.add("is-swapping");
    setTimeout(function () {
      stackPanel.innerHTML =
        '<h3 class="stack__panel-title">' + data.title + '</h3>' +
        '<p class="stack__panel-body">' + data.body + '</p>';
      stackPanel.classList.remove("is-swapping");
    }, prefersReduced ? 0 : 160);
  }
  stackTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      stackTabs.forEach(function (t) { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      setIngredient(tab.dataset.ing);
    });
  });

  /* ---- Stats count-up (on reveal) ---- */
  var stats = document.querySelectorAll(".stat__num[data-count]");
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var suffix = el.dataset.suffix || "";
    if (prefersReduced || target === 0) { el.textContent = target + suffix; return; }
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && !prefersReduced) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); sio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    stats.forEach(function (s) { sio.observe(s); });
  } else {
    stats.forEach(function (s) { s.textContent = (parseInt(s.dataset.count, 10) || 0) + (s.dataset.suffix || ""); });
  }

  /* ---- Testimonial slider ---- */
  (function () {
    var track = document.getElementById("quotesTrack");
    var dotsWrap = document.getElementById("quotesDots");
    if (!track) return;
    var count = track.children.length, idx = 0, dots = [];
    if (dotsWrap) {
      for (var i = 0; i < count; i++) {
        var d = document.createElement("button");
        d.type = "button"; d.className = "results__dot" + (i === 0 ? " is-active" : "");
        d.setAttribute("aria-label", "Go to testimonial " + (i + 1));
        (function (n) { d.addEventListener("click", function () { go(n); }); })(i);
        dotsWrap.appendChild(d); dots.push(d);
      }
    }
    function go(n) {
      idx = (n + count) % count;
      track.style.transform = "translateX(-" + (idx * 100) + "%)";
      dots.forEach(function (dot, j) { dot.classList.toggle("is-active", j === idx); });
    }
    document.querySelectorAll(".results__arrow").forEach(function (b) {
      b.addEventListener("click", function () { go(idx + parseInt(b.dataset.dir, 10)); });
    });
    if (!prefersReduced) {
      var timer = setInterval(function () { go(idx + 1); }, 6000);
      track.parentNode.addEventListener("mouseenter", function () { clearInterval(timer); });
    }
  })();

  /* ---- Progressive word reveal (.js-words) ---- */
  (function () {
    var els = document.querySelectorAll(".js-words");
    if (!els.length) return;
    els.forEach(function (el) {
      var nodes = Array.prototype.slice.call(el.childNodes);
      var wi = 0;
      el.innerHTML = "";
      function addWords(text, cls) {
        text.split(/(\s+)/).forEach(function (tok) {
          if (tok === "") return;
          if (!tok.trim()) { el.appendChild(document.createTextNode(tok)); return; }
          var s = document.createElement("span");
          s.className = "word" + (cls ? " " + cls : "");
          s.textContent = tok;
          s.style.transitionDelay = (wi++ * 55) + "ms";
          el.appendChild(s);
        });
      }
      nodes.forEach(function (node) {
        if (node.nodeType === 3) addWords(node.nodeValue, "");
        else if (node.nodeType === 1) addWords(node.textContent, node.className);
      });
    });
    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-revealing"); });
      return;
    }
    var wio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-revealing"); wio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    els.forEach(function (el) { wio.observe(el); });
  })();

  /* ---- Newsletter email composer typing ---- */
  (function () {
    var subjEl = document.getElementById("newsletter-title");
    var bodyEl = document.getElementById("mailerBody");
    if (!subjEl || !bodyEl) return;
    var subject = subjEl.textContent;
    var body = bodyEl.textContent;
    if (prefersReduced || !("IntersectionObserver" in window)) return; // leave full text
    function type(el, text, speed, done) {
      var i = 0;
      (function step() {
        if (i <= text.length) { el.textContent = text.slice(0, i); i++; setTimeout(step, speed); }
        else if (done) done();
      })();
    }
    var started = false;
    function run() {
      if (started) return; started = true;
      subjEl.textContent = ""; bodyEl.textContent = "";
      type(subjEl, subject, 55, function () {
        setTimeout(function () { type(bodyEl, body, 30); }, 350);
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(); io.disconnect(); } });
    }, { threshold: 0.45 });
    io.observe(document.querySelector(".mailer"));
  })();

  /* ---- Newsletter form (no backend yet) ---- */
  var form = document.querySelector(".mailer__body");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      if (input && input.value && input.validity.valid) {
        form.innerHTML = '<p style="font-weight:500;color:var(--yellow);text-transform:uppercase;letter-spacing:.04em;">You\'re in. Welcome to the community.</p>';
      } else if (input) {
        input.focus();
        input.style.borderColor = "var(--yellow)";
      }
    });
  }

  /* ---- Hero can spin (crossfade flipbook of each can's views) ---- */
  /* Per-can render config. To use real art, drop frames at
     assets/cans/<id>/01.<ext>, 02.<ext>, ... (front → side → back → side …,
     evenly spaced around 360°) and set data-frames / data-ext in the markup.
     With few views the crossfade reads as a smooth spin; more frames = smoother. */
  (function initCanSpin() {
    var cans = document.querySelectorAll(".can-spin");
    if (!cans.length) return;

    var ROTATION_MS = 4200;   // duration of ONE can's full turn
    var DWELL_MS = 650;       // pause (everyone facing front) between cans
    var engines = [];

    cans.forEach(function (el) {
      var id = el.getAttribute("data-can");
      var count = parseInt(el.getAttribute("data-frames"), 10) || 0;
      var ext = el.getAttribute("data-ext") || "png";
      if (!id || count < 1) return;

      var frames = [];
      for (var f = 1; f <= count; f++) {
        var img = document.createElement("img");
        img.className = "can-spin__frame";
        img.src = "assets/cans/" + id + "/" + (f < 10 ? "0" + f : f) + "." + ext;
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        img.draggable = false;
        el.appendChild(img);
        frames.push(img);
      }
      // short crossfade so frames track the scroll crisply
      el.style.setProperty("--spin-fade", "110ms");
      // everyone rests on frame 0 (the front)
      frames[0].classList.add("is-active");
      engines.push({ frames: frames, i: 0 });
    });

    if (!engines.length) return;

    // Static when reduced motion is requested — everyone stays on the front.
    if (prefersReduced) return;

    // Scroll-scrub: the cans rotate as the hero scrolls past — the product
    // turns in your hands as you read. Reversible, tied to scroll position.
    function show(eng, idx) {
      if (idx === eng.i) return;
      eng.frames[eng.i].classList.remove("is-active");
      eng.i = idx;
      eng.frames[idx].classList.add("is-active");
    }
    function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

    var heroEl = document.querySelector(".hero");
    var cansWrap = document.querySelector(".hero__cans");

    function progress() {
      if (!heroEl) return 0;
      var r = heroEl.getBoundingClientRect();
      // 0 when the hero top meets the viewport top; 1 after scrolling one hero-height.
      return clamp01(-r.top / (r.height || 1));
    }
    function render() {
      var p = progress();
      for (var k = 0; k < engines.length; k++) {
        var e = engines[k];
        var pk = clamp01(p + k * 0.05);          // slight cascade so cans don't move in lockstep
        show(e, Math.round(pk * (e.frames.length - 1)));
      }
    }

    // render is cheap (one rect read + a class toggle on ≤4 cans) so we run it
    // directly on scroll — no rAF gate that can stall in a backgrounded tab.
    var active = true;
    function onScroll() { if (active) render(); }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    if (cansWrap && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        active = entries[0].isIntersecting;
        if (active) render();
      }, { threshold: 0 }).observe(cansWrap);
    }
    render(); // set initial frames from current scroll position
  })();

})();
