const fileInput = document.getElementById("file-input");
const detectBtn = document.getElementById("detect-btn");
const apiUrlInput = document.getElementById("api-url");
const statusEl = document.getElementById("status");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const resultsTable = document.getElementById("results-table");
const resultsBody = document.getElementById("results-body");

let currentImage = null;

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) {
    detectBtn.disabled = true;
    return;
  }

  const img = new Image();
  img.onload = () => {
    currentImage = img;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    detectBtn.disabled = false;
    resultsTable.hidden = true;
    statusEl.textContent = "";
  };
  img.src = URL.createObjectURL(file);
});

detectBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file || !currentImage) return;

  const apiUrl = apiUrlInput.value.replace(/\/$/, "");
  detectBtn.disabled = true;
  statusEl.textContent = "Detecting...";

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${apiUrl}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    renderResults(data);
    statusEl.textContent = `Found ${data.detections.length} sign(s).`;
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
  } finally {
    detectBtn.disabled = false;
  }
});

function renderResults(data) {
  ctx.drawImage(currentImage, 0, 0);

  ctx.lineWidth = Math.max(2, canvas.width / 400);
  ctx.font = `${Math.max(14, canvas.width / 60)}px system-ui, sans-serif`;
  ctx.textBaseline = "bottom";

  resultsBody.innerHTML = "";

  data.detections.forEach((det) => {
    const { x1, y1, x2, y2 } = det.box;
    const label = `${det.class_name} ${(det.confidence * 100).toFixed(1)}%`;

    ctx.strokeStyle = "#2f6fed";
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = "#2f6fed";
    ctx.fillRect(x1, Math.max(0, y1 - 20), textWidth + 8, 20);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x1 + 4, Math.max(20, y1));

    const row = document.createElement("tr");
    const classCell = document.createElement("td");
    classCell.textContent = det.class_name;
    const confCell = document.createElement("td");
    confCell.textContent = `${(det.confidence * 100).toFixed(1)}%`;
    row.append(classCell, confCell);
    resultsBody.appendChild(row);
  });

  resultsTable.hidden = data.detections.length === 0;
}
