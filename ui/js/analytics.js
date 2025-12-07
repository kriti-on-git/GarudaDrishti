// js/analytics.js
(() => {
  const API_URL = "http://localhost:8000";

  const fireCountEl = document.getElementById("countFire");
  const smokeCountEl = document.getElementById("countSmoke");
  const fightCountEl = document.getElementById("countFight");
  const logsList = document.getElementById("logsList");

  let timelineChart = null;
  let typeChart = null;

  document.addEventListener("DOMContentLoaded", () => {
    loadAnalytics();
  });

  async function loadAnalytics() {
    try {
      const res = await fetch(`${API_URL}/alerts/all`);
      const data = await res.json();

      updateCounts(data);
      updateLogs(data);
      renderCharts(data);

    } catch (err) {
      console.error("Analytics error:", err);
    }
  }

  /* ---------------------------------------------------
      COUNTS
  ---------------------------------------------------- */
  function updateCounts(arr) {
    const fire = arr.filter(a => /fire/i.test(a.alert_type)).length;
    const smoke = arr.filter(a => /smoke/i.test(a.alert_type)).length;
    const fight = arr.filter(a => /fight/i.test(a.alert_type)).length;

    fireCountEl.textContent = fire;
    smokeCountEl.textContent = smoke;
    fightCountEl.textContent = fight;

    // subtle animation
    animateCount(fireCountEl);
    animateCount(smokeCountEl);
    animateCount(fightCountEl);
  }

  function animateCount(el) {
    el.style.transform = "scale(1.25)";
    el.style.transition = "0.3s";

    setTimeout(() => {
      el.style.transform = "scale(1)";
    }, 300);
  }

  /* ---------------------------------------------------
      RECENT LOGS
  ---------------------------------------------------- */
  function updateLogs(arr) {
    logsList.innerHTML = "";

    arr.slice(0, 10).forEach(log => {
      const item = document.createElement("div");
      item.className = "item";
      item.innerHTML = `
        <b>${log.alert_type}</b>
        <br>
        <span class="muted">${log.description}</span>
        <br>
        <span class="muted">${log.timestamp}</span>
      `;

      item.style.animation = "fadeIn 0.4s ease";
      logsList.appendChild(item);
    });
  }

  /* ---------------------------------------------------
      CHARTS
  ---------------------------------------------------- */
  function renderCharts(arr) {
    const labels = arr.map(a => a.timestamp.split(" ")[1]); // time only
    const fire = arr.map(a => (/fire/i.test(a.alert_type) ? 1 : 0));
    const smoke = arr.map(a => (/smoke/i.test(a.alert_type) ? 1 : 0));
    const fight = arr.map(a => (/fight/i.test(a.alert_type) ? 1 : 0));

    /* ------------------ TIMELINE ------------------ */
    const ctx1 = document.getElementById("timelineChart").getContext("2d");

    if (timelineChart) timelineChart.destroy();

    timelineChart = new Chart(ctx1, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Fire",
            data: fire,
            borderColor: "#ff6b6b",
            tension: 0.35
          },
          {
            label: "Smoke",
            data: smoke,
            borderColor: "#cfcfcf",
            tension: 0.35
          },
          {
            label: "Fight",
            data: fight,
            borderColor: "#ffd166",
            tension: 0.35
          }
        ]
      },
      options: {
        plugins: { legend: { labels: { color: "#e8e8e8" } } },
        scales: {
          x: { ticks: { color: "#b5b5b5" } },
          y: { ticks: { color: "#b5b5b5" } }
        }
      }
    });

    /* ------------------ DISTRIBUTION PIE ------------------ */
    const ctx2 = document.getElementById("typeChart").getContext("2d");

    if (typeChart) typeChart.destroy();

    const totalFire = fire.reduce((a, b) => a + b, 0);
    const totalSmoke = smoke.reduce((a, b) => a + b, 0);
    const totalFight = fight.reduce((a, b) => a + b, 0);

    typeChart = new Chart(ctx2, {
      type: "doughnut",
      data: {
        labels: ["Fire", "Smoke", "Fight"],
        datasets: [
          {
            data: [totalFire, totalSmoke, totalFight],
            backgroundColor: ["#ff6b6b", "#cfcfcf", "#ffd166"]
          }
        ]
      },
      options: {
        plugins: { legend: { labels: { color: "#e8e8e8" } } }
      }
    });
  }
})();
