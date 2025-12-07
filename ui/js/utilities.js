// js/utilities.js
(() => {

  const API = "http://localhost:8000";

  // UI elements
  const sosBtn = document.getElementById("sosBtn");
  const announcementsEl = document.getElementById("announcements");
  const faqListEl = document.getElementById("faqList");
  const toast = document.getElementById("utilToast");

  /* -------------------------- TOAST -------------------------- */
  function showToast(msg, time = 3000) {
    toast.textContent = msg;
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, time);
  }

  /* -------------------------- EMERGENCY SOS -------------------------- */
async function sendSos() {
  try {
    sosBtn.classList.add("disabled");
    showToast("Sending emergency SOS...");

    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

    const payload = {
      alert_type: "Alert: Emergency SOS",
      description: "Manual SOS triggered.",
      timestamp: timestamp
    };

    const res = await fetch("http://localhost:8000/alerts/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("SOS failed:", err);
      showToast("Failed — couldn't send SOS");
      sosBtn.classList.remove("disabled");
      return;
    }

    showToast("🚨 SOS sent successfully!");

    // small visual confirmation
    sosBtn.classList.add("sent");
    setTimeout(() => sosBtn.classList.remove("sent"), 2000);

  } catch (err) {
    console.error(err);
    showToast("Error sending SOS");
  } finally {
    sosBtn.classList.remove("disabled");
  }
}


  /* -------------------------- ANNOUNCEMENTS -------------------------- */
  async function fetchAnnouncements() {
    announcementsEl.innerHTML = `<div class="muted">Loading announcements…</div>`;

    try {
      const res = await fetch(`${API}/announcements/all`);
      if (!res.ok) throw new Error("Announcements fetch failed");

      const arr = await res.json();
      announcementsEl.innerHTML = "";

      if (!arr || arr.length === 0) {
        announcementsEl.innerHTML = `<div class="muted">No announcements</div>`;
        return;
      }

      arr.forEach(a => {
        // classify tag
        const text = `${a.title} ${a.message}`.toLowerCase();
        let tag = "general";

        if (text.includes("fire") || text.includes("urgent") || text.includes("security"))
          tag = "urgent";

        const card = document.createElement("div");
        card.className = "announcement-card";

        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
            <div style="flex:1;">
              <span class="announcement-tag ${tag}">${tag.toUpperCase()}</span>
              <strong style="font-size:1rem;">${escapeHtml(a.title)}</strong>
              <div class="muted" style="margin-top:6px;font-size:0.95rem;">
                ${escapeHtml(a.message)}
              </div>
            </div>

            <div style="white-space:nowrap;color:#9fb6d8;font-size:0.85rem;">
              ${a.timestamp || ""}
            </div>
          </div>
        `;

        announcementsEl.appendChild(card);
      });

    } catch (e) {
      console.error("Announcements error:", e);
      announcementsEl.innerHTML = `<div class="muted">Error loading announcements</div>`;
    }
  }

  /* -------------------------- FAQ ACCORDION -------------------------- */
  async function fetchFAQ() {
    faqListEl.innerHTML = `<div class="muted">Loading FAQ…</div>`;

    try {
      const res = await fetch(`${API}/faq/all`);
      if (!res.ok) throw new Error("FAQ fetch failed");

      const arr = await res.json();
      faqListEl.innerHTML = "";

      if (!arr || arr.length === 0) {
        faqListEl.innerHTML = `<div class="muted">No FAQ found</div>`;
        return;
      }

      arr.slice(0, 6).forEach(f => {
        const item = document.createElement("div");
        item.className = "faq-item glass";

        item.innerHTML = `
          <div class="faq-question">
            ${escapeHtml(f.question)}
            <span style="font-size:18px;opacity:0.7;">+</span>
          </div>
          <div class="faq-answer">${escapeHtml(f.answer)}</div>
        `;

        // Accordion toggle
        item.addEventListener("click", () => {
          item.classList.toggle("open");
          const icon = item.querySelector(".faq-question span");
          icon.textContent = item.classList.contains("open") ? "−" : "+";
        });

        faqListEl.appendChild(item);
      });

    } catch (e) {
      console.error("FAQ fetch error:", e);
      faqListEl.innerHTML = `<div class="muted">Error loading FAQ</div>`;
    }
  }

  /* -------------------------- HTML ESCAPER -------------------------- */
  function escapeHtml(s = "") {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  /* -------------------------- INIT -------------------------- */
  function attachEvents() {
    if (sosBtn) sosBtn.addEventListener("click", sendSos);
  }

  document.addEventListener("DOMContentLoaded", () => {
    attachEvents();
    fetchAnnouncements();
    fetchFAQ();
  });

})();


