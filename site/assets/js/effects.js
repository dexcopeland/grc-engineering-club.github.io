(function () {
  /* ── Helpers ── */
  function isDark() {
    var theme = document.documentElement.getAttribute("data-theme");
    if (theme) return theme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  var isMobile = window.innerWidth < 600;

  /* ── Particles ── */
  function particleColor() {
    return isDark() ? "#e8650a" : "#d45800";
  }
  function linkColor() {
    return isDark() ? "rgba(232,101,10,0.15)" : "rgba(212,88,0,0.12)";
  }

  function initParticles() {
    if (reducedMotion || lowEnd || typeof tsParticles === "undefined") return;

    tsParticles.load({
      id: "tsparticles",
      options: {
        fullScreen: { enable: false },
        fpsLimit: 60,
        particles: {
          number: { value: isMobile ? 15 : 40 },
          color: { value: particleColor() },
          opacity: { value: 0.6 },
          size: { value: { min: 1, max: 3 } },
          links: {
            enable: true,
            color: linkColor(),
            distance: 150,
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.6,
            outModes: { default: "bounce" },
          },
        },
        interactivity: {
          events: {
            onHover: { enable: false },
            onClick: { enable: false },
          },
        },
        detectRetina: true,
      },
    });
  }

  function reloadParticles() {
    var container = tsParticles.domItem(0);
    if (container) container.destroy();
    initParticles();
  }

  /* ── Charts ── */
  var chartInstances = [];

  var PALETTE = [
    "#e8650a", "#f59e0b", "#d97706", "#b45309",
    "#ea580c", "#c2410c", "#92400e", "#78350f",
  ];

  function chartTextColor() {
    return isDark() ? "#a0a0a0" : "#555555";
  }

  function chartDefaults() {
    return {
      color: chartTextColor(),
      plugins: {
        legend: { labels: { color: chartTextColor(), font: { size: 11 } } },
      },
      scales: {
        x: { ticks: { color: chartTextColor() } },
        y: { ticks: { color: chartTextColor() } },
      },
    };
  }

  function initCharts() {
    if (typeof Chart === "undefined") return;

    var el = document.getElementById("chart-data");
    if (!el) return;
    var data;
    try { data = JSON.parse(el.textContent); } catch (e) { return; }

    Chart.defaults.color = chartTextColor();

    /* Specializations — horizontal bar */
    var specLabels = Object.keys(data.specializations).slice(0, 8);
    var specValues = specLabels.map(function (k) { return data.specializations[k]; });

    chartInstances.push(new Chart(document.getElementById("chart-specs"), {
      type: "bar",
      data: {
        labels: specLabels,
        datasets: [{
          data: specValues,
          backgroundColor: PALETTE.slice(0, specLabels.length),
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: chartTextColor(), stepSize: 1 }, grid: { display: false } },
          y: { ticks: { color: chartTextColor() }, grid: { display: false } },
        },
      },
    }));

    /* Frameworks — doughnut */
    var fwLabels = Object.keys(data.frameworks).slice(0, 8);
    var fwValues = fwLabels.map(function (k) { return data.frameworks[k]; });

    chartInstances.push(new Chart(document.getElementById("chart-frameworks"), {
      type: "doughnut",
      data: {
        labels: fwLabels,
        datasets: [{
          data: fwValues,
          backgroundColor: PALETTE.slice(0, fwLabels.length),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { color: chartTextColor(), font: { size: 10 }, boxWidth: 12 } },
        },
      },
    }));

    /* Languages — horizontal bar */
    var langLabels = Object.keys(data.languages || {}).slice(0, 8);
    var langValues = langLabels.map(function (k) { return data.languages[k]; });

    if (langLabels.length) {
      chartInstances.push(new Chart(document.getElementById("chart-languages"), {
        type: "bar",
        data: {
          labels: langLabels,
          datasets: [{
            data: langValues,
            backgroundColor: PALETTE.slice(0, langLabels.length),
            borderWidth: 0,
          }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: chartTextColor(), stepSize: 1 }, grid: { display: false } },
            y: { ticks: { color: chartTextColor() }, grid: { display: false } },
          },
        },
      }));
    }

    /* Availability — polar area */
    var availLabels = Object.keys(data.available_for);
    var availValues = availLabels.map(function (k) { return data.available_for[k]; });

    chartInstances.push(new Chart(document.getElementById("chart-available"), {
      type: "polarArea",
      data: {
        labels: availLabels,
        datasets: [{
          data: availValues,
          backgroundColor: PALETTE.slice(0, availLabels.length).map(function (c) { return c + "cc"; }),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { color: chartTextColor(), font: { size: 10 }, boxWidth: 12 } },
        },
        scales: {
          r: { ticks: { display: false }, grid: { color: isDark() ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" } },
        },
      },
    }));
  }

  function destroyCharts() {
    chartInstances.forEach(function (c) { c.destroy(); });
    chartInstances = [];
  }

  /* ── Theme reactivity ── */
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === "data-theme") {
        if (!reducedMotion && !lowEnd && typeof tsParticles !== "undefined") {
          reloadParticles();
        }
        destroyCharts();
        initCharts();
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  /* ── Init ── */
  function init() {
    initParticles();
    initCharts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(init, 50);
    });
  } else {
    setTimeout(init, 50);
  }
})();
