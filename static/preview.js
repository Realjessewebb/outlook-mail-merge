async function renderPreview(row) {
  const { template, subject } = getCompose();
  if (!template && !subject) return;

  let result;
  try {
    const resp = await fetch("/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template, subject, row })
    });
    result = await resp.json();
    if (!resp.ok) { console.warn("Preview error:", result.error); return; }
  } catch (e) {
    console.warn("Preview fetch failed:", e);
    return;
  }

  document.getElementById("preview-subject").textContent = "Subject: " + result.subject;
  document.getElementById("preview-frame").srcdoc = result.html;
}

document.addEventListener("recipientChanged", e => renderPreview(e.detail.row));
