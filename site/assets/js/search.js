(function () {
  var searchInput = document.getElementById("search-input");
  var cards = Array.from(document.querySelectorAll(".card"));
  var chips = Array.from(document.querySelectorAll(".chip"));
  var clearBtn = document.getElementById("clear-filters");
  var countEl = document.getElementById("results-count");
  var noResults = document.getElementById("no-results");

  var activeFilters = {
    specializations: new Set(),
    frameworks: new Set(),
    languages: new Set(),
    available: new Set(),
  };

  /* --- Phased filter transitions --- */
  var FADE_MS = 250;
  var pendingTimers = new Map();

  function hideCard(card) {
    if (card.classList.contains("hidden")) return;
    // Clear any pending show timer
    if (pendingTimers.has(card)) {
      clearTimeout(pendingTimers.get(card));
      pendingTimers.delete(card);
    }
    card.classList.add("fading");
    var timer = setTimeout(function () {
      card.classList.add("hidden");
      pendingTimers.delete(card);
    }, FADE_MS);
    pendingTimers.set(card, timer);
  }

  function showCard(card) {
    if (!card.classList.contains("hidden") && !card.classList.contains("fading")) return;
    // Clear any pending hide timer
    if (pendingTimers.has(card)) {
      clearTimeout(pendingTimers.get(card));
      pendingTimers.delete(card);
    }
    card.classList.remove("hidden");
    // Force reflow so the transition triggers
    void card.offsetHeight;
    card.classList.remove("fading");
  }

  function updateCards() {
    var query = (searchInput.value || "").toLowerCase().trim();
    var visible = 0;

    cards.forEach(function (card) {
      var name = card.dataset.name || "";
      var specs = card.dataset.specializations || "";
      var fws = card.dataset.frameworks || "";
      var langs = card.dataset.languages || "";
      var avail = card.dataset.available || "";
      var allText = [name, specs, fws, langs, avail].join(" ");

      var show = true;

      if (query && allText.indexOf(query) === -1) {
        show = false;
      }

      if (show && activeFilters.specializations.size > 0) {
        var has = Array.from(activeFilters.specializations).some(function (v) {
          return specs.indexOf(v) !== -1;
        });
        if (!has) show = false;
      }

      if (show && activeFilters.frameworks.size > 0) {
        var has = Array.from(activeFilters.frameworks).some(function (v) {
          return fws.indexOf(v) !== -1;
        });
        if (!has) show = false;
      }

      if (show && activeFilters.languages.size > 0) {
        var has = Array.from(activeFilters.languages).some(function (v) {
          return langs.indexOf(v) !== -1;
        });
        if (!has) show = false;
      }

      if (show && activeFilters.available.size > 0) {
        var has = Array.from(activeFilters.available).some(function (v) {
          return avail.indexOf(v) !== -1;
        });
        if (!has) show = false;
      }

      if (show) {
        showCard(card);
        visible++;
      } else {
        hideCard(card);
      }
    });

    if (countEl) countEl.textContent = visible;
    if (noResults) noResults.style.display = visible === 0 ? "" : "none";

    var hasActive =
      activeFilters.specializations.size > 0 ||
      activeFilters.frameworks.size > 0 ||
      activeFilters.languages.size > 0 ||
      activeFilters.available.size > 0 ||
      query.length > 0;
    if (clearBtn) clearBtn.style.display = hasActive ? "" : "none";
  }

  /* --- Chip click with pop animation --- */
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var group = chip.closest("[data-filter]");
      if (!group) return;
      var filterKey = group.dataset.filter;
      var value = chip.dataset.value;

      if (activeFilters[filterKey].has(value)) {
        activeFilters[filterKey].delete(value);
        chip.classList.remove("active");
      } else {
        activeFilters[filterKey].add(value);
        chip.classList.add("active");
      }

      // Pop animation
      chip.classList.add("pop");
      chip.addEventListener("animationend", function handler() {
        chip.classList.remove("pop");
        chip.removeEventListener("animationend", handler);
      });

      updateCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", updateCards);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      searchInput.value = "";
      activeFilters.specializations.clear();
      activeFilters.frameworks.clear();
      activeFilters.languages.clear();
      activeFilters.available.clear();
      chips.forEach(function (c) { c.classList.remove("active"); });
      updateCards();
    });
  }

  /* --- "/" keyboard shortcut to focus search --- */
  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
    if (e.key === "/" && searchInput) {
      e.preventDefault();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      searchInput.focus();
    }
  });

  /* --- Hero stat count-up animation --- */
  var statEls = document.querySelectorAll(".hero-stat-num[data-target]");
  if (statEls.length) {
    var duration = 1500;
    var start = null;

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animateCounters(timestamp) {
      if (!start) start = timestamp;
      var elapsed = timestamp - start;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOut(progress);

      statEls.forEach(function (el) {
        var target = parseInt(el.dataset.target, 10);
        el.textContent = Math.round(easedProgress * target);
      });

      if (progress < 1) {
        requestAnimationFrame(animateCounters);
      }
    }

    requestAnimationFrame(animateCounters);
  }
})();
