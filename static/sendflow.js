function logLine(text, cls) {
  const div = document.createElement("div");
  div.className = cls || "log-info";
  div.textContent = text;
  document.getElementById("log-lines").appendChild(div);
  div.scrollIntoView({ block: "nearest" });
}

function clearLog() {
  document.getElementById("log-lines").innerHTML = "";
  document.getElementById("summary").textContent = "";
  document.getElementById("progress").value = 0;
  document.getElementById("progress").max = 1;
}

async function dryRun() {
  const rows = getRows();
  const { template, subject } = getCompose();
  if (!rows.length) { alert("Upload a recipient file first."); return; }

  clearLog();
  logLine(`DRY RUN — ${rows.length} recipient(s), no emails will be sent`, "log-info");

  for (let i = 0; i < rows.length; i++) {
    const resp = await fetch("/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template, subject, row: rows[i] })
    });
    const result = await resp.json();
    if (resp.ok) {
      const to = rows[i].email || rows[i].Email || rows[i].EMAIL || "(no email col)";
      logLine(`[${i + 1}/${rows.length}] → ${to} | Subject: ${result.subject}`, "log-ok");
    } else {
      logLine(`[${i + 1}/${rows.length}] render error: ${result.error}`, "log-err");
    }
  }

  logLine("Dry run complete.", "log-info");
}

async function confirmAndSend() {
  const rows = getRows();
  const { template, subject, delay, cc } = getCompose();

  if (!rows.length) { alert("Upload a recipient file first."); return; }
  if (!subject.trim()) { alert("Subject line is empty."); return; }
  if (!template.trim()) { alert("Email body is empty."); return; }

  const secs = (rows.length - 1) * delay;
  const mins = (secs / 60).toFixed(1);
  const timeStr = secs > 60 ? `~${mins} min` : `~${secs}s`;
  const ok = confirm(
    `Send to ${rows.length} recipient(s)?\n` +
    `Delay: ${delay}s between each\n` +
    `Estimated time: ${timeStr}`
  );
  if (!ok) return;

  clearLog();
  const sendBtn = document.getElementById("btn-send");
  sendBtn.disabled = true;

  const progress = document.getElementById("progress");
  progress.max = rows.length;
  progress.value = 0;

  logLine(`Sending to ${rows.length} recipient(s) at ${delay}s delay…`, "log-info");

  let sent = 0, failed = 0;

  try {
    const resp = await fetch("/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template, subject, rows, delay, cc })
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      const parts = buf.split("\n\n");
      buf = parts.pop();

      for (const part of parts) {
        if (!part.startsWith("data: ")) continue;
        const evt = JSON.parse(part.slice(6));

        if (evt.done) {
          sent = evt.sent ?? sent;
          failed = evt.failed ?? failed;
          if (evt.error) logLine("Fatal error: " + evt.error, "log-err");
          break;
        }

        progress.value = evt.i + 1;
        if (evt.status === "ok") {
          sent++;
          logLine(`✓ [${evt.i + 1}/${evt.total}] ${evt.to}`, "log-ok");
        } else {
          failed++;
          logLine(`✗ [${evt.i + 1}/${evt.total}] ${evt.to} — ${evt.error}`, "log-err");
        }
      }
    }
  } catch (e) {
    logLine("Connection error: " + e.message, "log-err");
  }

  progress.value = rows.length;
  document.getElementById("summary").textContent = `Done — ${sent} sent, ${failed} failed`;
  sendBtn.disabled = false;
}
