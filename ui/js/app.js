// js/app.js
(() => {
  const fileInput = document.getElementById('fileInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const canvas = document.getElementById('previewCanvas');
  const placeholder = document.getElementById('previewPlaceholder');
  const statusEl = document.getElementById('status');

  const fireCountEl = document.getElementById('fireCount');
  const smokeCountEl = document.getElementById('smokeCount');
  const fightCountEl = document.getElementById('fightCount');
  const recentAlertsEl = document.getElementById('recentAlerts');
  const clearBtn = document.getElementById('clearAlertsBtn');

  let currentImage = null;
  let ctx = null;

  // track alerts to animate new ones
  let lastAlertIds = new Set();

  // hold detection preview for 10 seconds
  let detectionTimeout = null;

  function setStatus(t) {
    if (!statusEl) return;
    statusEl.textContent = t || '';
  }

  function drawImageAndBoxes(img, detections = []) {
    placeholder.style.display = 'none';
    canvas.style.display = 'block';
    canvas.width = img.width;
    canvas.height = img.height;

    if (!ctx) ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // draw boxes
    ctx.lineWidth = 3;
    detections.forEach(det => {
      if (!det.bbox) return;

      const [x1, y1, x2, y2] = det.bbox;

      ctx.strokeStyle =
        det.label === 'fire'
          ? '#ff6b6b'
          : det.label === 'smoke'
          ? '#d1d1d1'
          : '#ffd166';

      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillRect(x1, Math.max(0, y1 - 22), 70, 22);

      ctx.fillStyle = '#00121a';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(det.label, x1 + 6, Math.max(0, y1 - 6));
    });
  }

  // Load image preview
  fileInput &&
    fileInput.addEventListener('change', ev => {
      const f = ev.target.files && ev.target.files[0];
      if (!f) return;

      setStatus('Loaded image — ready');

      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          currentImage = img;
          drawImageAndBoxes(img, []);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(f);
    });

  // Analyze image
  analyzeBtn &&
    analyzeBtn.addEventListener('click', async () => {
      if (!fileInput || !fileInput.files[0])
        return alert('Choose an image first.');

      setStatus('Analyzing image...');
      const fd = new FormData();
      fd.append('file', fileInput.files[0]);

      try {
        const res = await fetch('http://localhost:8000/detection/predict', {
          method: 'POST',
          body: fd
        });

        if (!res.ok) throw new Error('Server error');

        const data = await res.json();

        if (currentImage) {
          drawImageAndBoxes(currentImage, data.detections || []);
        }

        await refreshAlerts();
        setStatus('Detection complete — holding boxes for 10 seconds');

        // --- HOLD THE RESULTS FOR 10 SECONDS ---
        if (detectionTimeout) clearTimeout(detectionTimeout);

        detectionTimeout = setTimeout(() => {
          if (currentImage) {
            drawImageAndBoxes(currentImage, []); // remove boxes, keep image
            setStatus('Preview reset — ready for next upload');
          }
        }, 10000);
      } catch (err) {
        console.error(err);
        setStatus('Analysis failed — check backend');
        alert('Detection failed. See console.');
      }
    });

  // Fetch alerts + animate new ones
  async function refreshAlerts() {
    try {
      const res = await fetch('http://localhost:8000/alerts/all');
      if (!res.ok) throw new Error('Failed to fetch alerts');

      const arr = await res.json();

      // counts
      const fire = arr.filter(a => /fire/i.test(a.alert_type)).length;
      const smoke = arr.filter(a => /smoke/i.test(a.alert_type)).length;
      const fight = arr.filter(a => /fight/i.test(a.alert_type)).length;

      fireCountEl && (fireCountEl.textContent = fire);
      smokeCountEl && (smokeCountEl.textContent = smoke);
      fightCountEl && (fightCountEl.textContent = fight);

      // recent alerts with animation
      if (recentAlertsEl) {
        recentAlertsEl.innerHTML = '';

        arr.slice(0, 6).forEach(a => {
          const d = document.createElement('div');
          d.className = 'item';
          d.textContent = `${a.alert_type} — ${a.description || ''} (${a.timestamp || ''})`;

          // highlight new alerts
          if (!lastAlertIds.has(a.id)) {
            d.classList.add('alert-new');
          }

          recentAlertsEl.appendChild(d);
          lastAlertIds.add(a.id);
        });
      }
    } catch (e) {
      console.warn('refreshAlerts error', e);
    }
  }

  // Clear alerts
  clearBtn &&
    clearBtn.addEventListener('click', async () => {
      if (!confirm('Clear all alerts?')) return;

      try {
        await fetch('http://localhost:8000/alerts/clear', {
          method: 'DELETE'
        });

        lastAlertIds = new Set(); // reset animations
        await refreshAlerts();
      } catch (e) {
        console.warn('clear failed', e);
      }
    });

  // Initial
  document.addEventListener('DOMContentLoaded', () => {
    if (canvas) canvas.style.display = 'none';
    refreshAlerts();
  });
})();
