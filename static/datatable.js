let _rows = [];
let _columns = [];

function getRows() { return _rows; }
function getColumns() { return _columns; }

document.getElementById("file-input").addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append("file", file);

  let result;
  try {
    const resp = await fetch("/parse", { method: "POST", body: fd });
    result = await resp.json();
    if (!resp.ok) { alert(result.error || "Parse failed"); return; }
  } catch (e) {
    alert("Upload failed: " + e.message);
    return;
  }

  _rows = result.rows;
  _columns = result.columns;

  renderTable(_rows.slice(0, 5), _columns);
  populateDropdown(_rows, _columns);
  renderVariableChips(_columns);
});

function renderTable(rows, columns) {
  const wrap = document.getElementById("recipient-table-wrap");
  if (!rows.length) { wrap.innerHTML = ""; return; }

  const th = columns.map(c => `<th>${esc(c)}</th>`).join("");
  const tbody = rows.map(r =>
    `<tr>${columns.map(c => `<td>${esc(r[c] ?? "")}</td>`).join("")}</tr>`
  ).join("");

  wrap.innerHTML = `<table><thead><tr>${th}</tr></thead><tbody>${tbody}</tbody></table>`;
}

function populateDropdown(rows, columns) {
  const sel = document.getElementById("recipient-select");
  const emailCol = columns.find(c => /email/i.test(c)) || columns[0];

  sel.innerHTML = rows.map((r, i) =>
    `<option value="${i}">${i + 1}. ${esc(r[emailCol] ?? "")}</option>`
  ).join("");

  if (rows.length) {
    sel.value = "0";
    dispatchRecipientChanged(rows[0]);
  }
}

document.getElementById("recipient-select").addEventListener("change", function () {
  const row = _rows[parseInt(this.value)];
  if (row) dispatchRecipientChanged(row);
});

function dispatchRecipientChanged(row) {
  document.dispatchEvent(new CustomEvent("recipientChanged", { detail: { row } }));
}

function renderVariableChips(columns) {
  const wrap = document.getElementById("variable-chips");
  const lbl  = document.getElementById("variable-chips-label");
  wrap.innerHTML = "";
  if (!columns.length) { lbl.style.display = "none"; return; }
  lbl.style.display = "block";
  columns.forEach(col => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = col;
    btn.title = `Insert {{ ${col} }}`;
    btn.addEventListener("click", () => {
      const q = window.quill;
      const range = q.getSelection(true);
      q.insertText(range.index, `{{ ${col} }}`);
      q.setSelection(range.index + col.length + 6);
    });
    wrap.appendChild(btn);
  });
}

function esc(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
