/* ============================================================
   Kanbann Consulting Solutions — script.js
   ============================================================ */
(function () {
  "use strict";

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Mobile nav toggle ---- */
  var toggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Sticky header background on scroll ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Scroll spy for nav ---- */
  var ids = ["manifesto", "services", "contact"];
  var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var linkFor = {};
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
    linkFor[a.getAttribute("href").slice(1)] = a;
  });
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var link = linkFor[entry.target.id];
          if (!link) return;
          Object.keys(linkFor).forEach(function (k) { linkFor[k].classList.remove("active"); });
          link.classList.add("active");
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Contact form (static-friendly: opens mail client) ---- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var get = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var name = get("name"), email = get("email"), phone = get("phone"),
          company = get("company"), capability = get("capability"), message = get("message");

      var subject = encodeURIComponent("[Website enquiry] " + (capability || "General") + " — " + name);
      var body = encodeURIComponent(
        "Name: " + name + "\n" +
        "Work email: " + email + "\n" +
        "Phone: " + phone + "\n" +
        "Company: " + company + "\n" +
        "Capability: " + capability + "\n\n" +
        message
      );
      // TODO: wire to a form backend (Formspree, etc.) to receive submissions directly.
      window.location.href =
        "mailto:kanbannconsultingsolutions@gmail.com?subject=" + subject + "&body=" + body;

      if (note) note.textContent = "Opening your email app… if nothing happens, write to kanbannconsultingsolutions@gmail.com";
      form.reset();
    });
  }

  /* ---- Motion layer (respects reduced-motion) ---- */
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Count-up stat numbers ---- */
  function countUp(el, target, prefix, suffix, decimals) {
    var dur = 1400, start = null;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      el.textContent = prefix + Number(val).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + Number(target).toLocaleString() + suffix;
    }
    requestAnimationFrame(frame);
  }
  var statEls = document.querySelectorAll(".metric strong");
  if (statEls.length && !reduceMotion && "IntersectionObserver" in window) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var m = el.textContent.match(/^(\D*)([\d.,]+)(.*)$/);
        if (m) {
          var prefix = m[1] || "";
          var numStr = m[2].replace(/,/g, "");
          var suffix = m[3] || "";
          var target = parseFloat(numStr);
          var decimals = (numStr.split(".")[1] || "").length;
          if (!isNaN(target)) { el.textContent = prefix + "0" + suffix; countUp(el, target, prefix, suffix, decimals); }
        }
        statIO.unobserve(el);
      });
    }, { threshold: 0.6 });
    statEls.forEach(function (el) { statIO.observe(el); });
  }

  /* ---- Magnetic primary buttons (smooth, rAF-throttled) ---- */
  if (!reduceMotion) {
    document.querySelectorAll(".btn-ink, .nav-cta").forEach(function (btn) {
      var raf = null, tx = 0, ty = 0;
      function apply() {
        raf = null;
        btn.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(1.03)";
      }
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        tx = (e.clientX - r.left - r.width / 2) * 0.16;
        ty = (e.clientY - r.top - r.height / 2) * 0.28;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      btn.addEventListener("mouseleave", function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        btn.style.transform = "";
      });
    });
  }

  /* ---- Subtle parallax on feature images ---- */
  if (!reduceMotion) {
    var parallaxEls = [];
    var heroImg = document.querySelector(".hero-media img");
    if (heroImg) parallaxEls.push({ el: heroImg, speed: 0.08 });
    document.querySelectorAll(".belief-media img, .founder-photo img").forEach(function (img) {
      parallaxEls.push({ el: img, speed: 0.05 });
    });
    parallaxEls.forEach(function (p) {
      p.el.style.willChange = "transform";
      if (p.el.parentElement) p.el.parentElement.style.overflow = "hidden";
    });
    var ticking = false;
    function onParallax() {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (p) {
        var r = p.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var offset = (r.top + r.height / 2 - vh / 2) * -p.speed;
        p.el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0) scale(1.2)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(onParallax); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", onParallax, { passive: true });
    onParallax();
  }

  /* ---- Testimonials carousel (auto-rotate, dots, arrows, pause on hover) ---- */
  document.querySelectorAll(".tst-carousel").forEach(function (car) {
    var slides = Array.prototype.slice.call(car.querySelectorAll(".tst-slide"));
    if (!slides.length) return;
    var viewport = car.querySelector(".tst-viewport");
    var dotsWrap = car.querySelector(".tst-dots");
    var interval = parseInt(car.getAttribute("data-autoplay"), 10) || 6000;
    var idx = 0, timer = null;

    var dots = slides.map(function (_, i) {
      var d = document.createElement("button");
      d.type = "button";
      d.className = "tst-dot" + (i === 0 ? " is-active" : "");
      d.setAttribute("aria-label", "Show testimonial " + (i + 1));
      d.addEventListener("click", function () { go(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(d);
      return d;
    });

    function setHeight() {
      if (viewport && slides[idx]) viewport.style.height = slides[idx].offsetHeight + "px";
    }
    function go(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); });
      setHeight();
    }
    function next() { go(idx + 1); }
    function prev() { go(idx - 1); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { if (!reduceMotion && slides.length > 1 && !timer) timer = setInterval(next, interval); }
    function restart() { stop(); start(); }

    var nb = car.querySelector(".tst-next"); if (nb) nb.addEventListener("click", function () { next(); restart(); });
    var pb = car.querySelector(".tst-prev"); if (pb) pb.addEventListener("click", function () { prev(); restart(); });
    car.addEventListener("mouseenter", stop);
    car.addEventListener("mouseleave", start);

    setHeight();
    window.addEventListener("resize", setHeight, { passive: true });
    window.addEventListener("load", setHeight);
    setTimeout(setHeight, 400);
    start();
  });
})();
