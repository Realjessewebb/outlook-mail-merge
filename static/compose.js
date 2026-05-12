(async () => {
  try {
    const resp = await fetch("/from_email");
    const { email } = await resp.json();
    document.getElementById("from-display").textContent = email;
  } catch {
    document.getElementById("from-display").textContent = "(see lib/config.py)";
  }
})();

window.quill = new Quill("#body-editor", {
  theme: "snow",
  placeholder: "Hi {{ first_name }}, …",
  modules: {
    toolbar: ["bold", "italic", "underline", "link", { list: "ordered" }, { list: "bullet" }]
  }
});

function getCompose() {
  const ccRaw = document.getElementById("cc").value;
  const cc = ccRaw.split(",").map(s => s.trim()).filter(Boolean);
  return {
    template: window.quill.root.innerHTML,
    subject: document.getElementById("subject").value,
    delay: parseInt(document.getElementById("delay").value),
    cc
  };
}

const delaySlider = document.getElementById("delay");
const delayLabel  = document.getElementById("delay-label");

function updateDelayLabel() {
  const d = parseInt(delaySlider.value);
  const n = getRows().length;
  const secs = n > 1 ? (n - 1) * d : 0;
  const mins = (secs / 60).toFixed(1);
  const timeStr = secs > 60 ? `~${mins} min` : `${secs}s`;
  delayLabel.textContent = `Delay between sends: ${d}s` + (n > 0 ? ` (${timeStr} for ${n} recipients)` : "");
}

delaySlider.addEventListener("input", updateDelayLabel);
document.addEventListener("recipientChanged", updateDelayLabel);

document.getElementById("btn-preview").addEventListener("click", () => {
  const sel = document.getElementById("recipient-select");
  const rows = getRows();
  const row = rows[parseInt(sel.value)];
  if (row) document.dispatchEvent(new CustomEvent("recipientChanged", { detail: { row } }));
});

document.getElementById("btn-dryrun").addEventListener("click", () => dryRun());
document.getElementById("btn-send").addEventListener("click", () => confirmAndSend());
