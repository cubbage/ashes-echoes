import { SEED_WORKSPACE } from "./seed-workspace.js";
import "./styles.css";

const STORAGE_KEY = "ayesha-interview-dashboard.workspace.v1";
const app = document.querySelector("#app");
let workspace = loadWorkspace();
let view = "today";
let activeDrill = null;
let revealAnswer = false;
let secondsRemaining = 60;
let timerId = null;
let pendingChatUpdate = null;

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadWorkspace() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeWorkspace(JSON.parse(saved)) : clone(SEED_WORKSPACE);
  } catch { return clone(SEED_WORKSPACE); }
}
function normalizeWorkspace(value) {
  const seed = clone(SEED_WORKSPACE);
  const safe = value && typeof value === "object" ? value : {};
  return {
    ...seed, ...safe,
    profile: { ...seed.profile, ...(safe.profile || {}) },
    settings: { ...seed.settings, ...(safe.settings || {}) },
    targets: Array.isArray(safe.targets) ? safe.targets : seed.targets,
    evidenceCards: Array.isArray(safe.evidenceCards) ? safe.evidenceCards : seed.evidenceCards,
    questions: Array.isArray(safe.questions) ? safe.questions : seed.questions,
    challengePrompts: Array.isArray(safe.challengePrompts) ? safe.challengePrompts : seed.challengePrompts,
    coldCallScenarios: Array.isArray(safe.coldCallScenarios) ? safe.coldCallScenarios : seed.coldCallScenarios,
    practiceSessions: Array.isArray(safe.practiceSessions) ? safe.practiceSessions : [],
    importHistory: Array.isArray(safe.importHistory) ? safe.importHistory : []
  };
}
function saveWorkspace() { localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)); }
function targetId() { return workspace.settings.currentTargetId || workspace.targets[0]?.id; }
function target() { return workspace.targets.find((item) => item.id === targetId()) || workspace.targets[0]; }
function forTarget(items) { return items.filter((item) => !item.targetIds || item.targetIds.includes(targetId())); }
function escapeHTML(value = "") { return String(value).replace(/[&<>'"]/g, (character) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[character]); }
function randomItem(items) { return items[Math.floor(Math.random() * items.length)]; }
function dateStamp() { return new Date().toISOString().slice(0, 10); }
function safeId(value) { return String(value || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "item"; }
function uniqueId(desired, collection) { let id = safeId(desired); let counter = 2; while (collection.some((item) => item.id === id)) id = `${safeId(desired)}-${counter++}`; return id; }

function render() {
  const selected = target();
  app.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="app-header">
      <div class="brand"><span aria-hidden="true">✦</span> Interview prep <small>local-first workspace</small></div>
      <label class="target-picker">Preparing for
        <select id="target-select">${workspace.targets.map((item) => `<option value="${escapeHTML(item.id)}" ${item.id === selected.id ? "selected" : ""}>${escapeHTML(item.company)} — ${escapeHTML(item.role)}</option>`).join("")}</select>
      </label>
    </header>
    <nav aria-label="Workspace sections" class="nav-tabs">
      ${navButton("today", "Today")}${navButton("evidence", "Evidence")}${navButton("bridge", "ChatGPT bridge")}${navButton("backups", "Backups")}
    </nav>
    <main id="main" tabindex="-1">${renderView()}</main>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>`;
  bindEvents();
}
function navButton(id, label) { return `<button class="nav-tab ${view === id ? "selected" : ""}" data-view="${id}" ${view === id ? 'aria-current="page"' : ""}>${label}</button>`; }
function renderView() { return ({ today: renderToday, evidence: renderEvidence, bridge: renderBridge, backups: renderBackups })[view](); }
function renderToday() {
  const selected = target();
  const recent = workspace.practiceSessions.slice(-5).reverse();
  return `<section class="page-intro"><p class="eyebrow">Now preparing</p><h1>${escapeHTML(selected.company)}</h1><p>${escapeHTML(selected.role)} · ${escapeHTML(selected.stage)}</p></section>
    <section class="target-summary" aria-label="Preparation focus"><h2>Focus for this interview</h2><p>${escapeHTML(selected.objective)}</p><ul>${selected.priorities.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul></section>
    <section class="section-heading"><div><h2>Choose one short practice rep</h2><p>Say it aloud first. Reveal the coaching notes only after you have tried.</p></div><button class="quiet-button" data-action="new-rep">Choose another</button></section>
    <div class="drill-grid">
      ${drillCard("question", "Interview answer", "Practice a likely question", forTarget(workspace.questions)[0])}
      ${drillCard("cold-call", "Cold-call response", "Handle a realistic objection", forTarget(workspace.coldCallScenarios)[0])}
      ${drillCard("challenge", "Follow-up challenge", "Make a story more specific", workspace.challengePrompts[0])}
    </div>
    ${activeDrill ? renderActiveDrill() : ""}
    <section class="recent"><h2>Recent reps</h2>${recent.length ? `<ul class="session-list">${recent.map((item) => `<li><strong>${escapeHTML(item.type)}</strong><span>${escapeHTML(item.title)} · ${escapeHTML(item.rating)} · ${new Date(item.completedAt).toLocaleDateString()}</span></li>`).join("")}</ul>` : `<p class="muted">No reps logged yet. One 60-second answer is enough to start.</p>`}</section>`;
}
function drillCard(type, label, helper, item) { return `<article class="drill-card"><p class="eyebrow">${label}</p><h3>${escapeHTML(item?.prompt || item?.prospectLine || item?.text || "Ready when you are")}</h3><p>${escapeHTML(helper)}</p><button data-action="start-drill" data-type="${type}" data-id="${escapeHTML(item?.id || "")}">Start a rep</button></article>`; }
function renderActiveDrill() {
  const { type, item } = activeDrill;
  const title = type === "question" ? item.prompt : type === "cold-call" ? item.prospectLine : item.text;
  const notes = type === "question" ? item.answerBullets : type === "cold-call" ? [item.objective, ...item.coachBullets] : [item.purpose];
  return `<section class="active-drill" aria-labelledby="active-drill-title"><div class="active-top"><div><p class="eyebrow">${type === "cold-call" ? "Prospect says" : type === "challenge" ? "Push yourself" : "Your prompt"}</p><h2 id="active-drill-title">${escapeHTML(title)}</h2></div><div class="timer" aria-label="Practice timer">${formatTime(secondsRemaining)}</div></div>
    <p class="practice-instruction">Speak your response aloud. Aim for clarity, not a perfect script.</p>
    <div class="timer-controls"><button data-action="timer-toggle">${timerId ? "Pause" : "Start timer"}</button><button class="quiet-button" data-action="timer-reset">Reset</button><button class="quiet-button" data-action="end-drill">End rep</button></div>
    <button class="reveal" data-action="reveal">${revealAnswer ? "Hide coaching notes" : "Reveal coaching notes after trying"}</button>
    ${revealAnswer ? `<div class="coaching"><h3>Coaching notes</h3><ul>${notes.map((note) => `<li>${escapeHTML(note)}</li>`).join("")}</ul></div>` : ""}
    <fieldset class="rating"><legend>How did that rep feel?</legend><div><button data-action="rate" data-rating="Try again">Try again</button><button data-action="rate" data-rating="Okay">Okay</button><button data-action="rate" data-rating="Strong">Strong</button></div></fieldset>
  </section>`;
}
function renderEvidence() {
  const cards = forTarget(workspace.evidenceCards);
  return `<section class="page-intro"><p class="eyebrow">Your proof</p><h1>Evidence library</h1><p>Use these cards to build concise, truthful answers. They are editable in this browser.</p></section>
  <div class="evidence-layout"><section><div class="section-heading"><div><h2>Saved evidence</h2><p>Open a card when you need a STAR-style example.</p></div></div>
  <div class="evidence-grid">${cards.map((card) => `<details class="evidence-card"><summary><strong>${escapeHTML(card.title)}</strong><span>${card.proves.map(escapeHTML).join(" · ")}</span></summary><dl><dt>Situation</dt><dd>${escapeHTML(card.situation)}</dd><dt>Action</dt><dd>${escapeHTML(card.action)}</dd><dt>Result</dt><dd>${escapeHTML(card.result)}</dd></dl></details>`).join("")}</div></section>
  <aside class="add-card"><h2>Add evidence</h2><p>Use only facts Ayesha can stand behind. This saves on this device.</p><form id="evidence-form"><label>Short title<input required name="title" placeholder="e.g., Solved a booking problem"></label><label>Situation<textarea required name="situation" rows="3"></textarea></label><label>Action<textarea required name="action" rows="3"></textarea></label><label>Result<textarea required name="result" rows="3"></textarea></label><label>What it proves <small>Separate ideas with commas.</small><input name="proves" placeholder="Listening, follow-up"></label><button type="submit">Save evidence card</button></form></aside></div>`;
}
function buildPrepPack() {
  const form = document.querySelector("#bridge-form");
  const data = Object.fromEntries(new FormData(form));
  const selected = target();
  const agentContextUrl = `${window.location.origin}/agent-context.html`;
  const currentEvidence = forTarget(workspace.evidenceCards).map(({ id, title, situation, action, result, proves }) => ({ id, title, situation, action, result, proves }));
  return `You are the preparation partner for Ayesha's local interview dashboard.\n\nAGENT CONTEXT PAGE\n${agentContextUrl}\nIf you have web access, read that page first. It defines the dashboard contract, the candidate's approved background, how to label uncertainty, and what useful next steps to discuss later. If you cannot access it, follow the concise context supplied below and say nothing about the inaccessible page.\n\nWORKING RULES\nDo not invent metrics, job history, company facts, or accomplishments. Mark anything that needs independent research with "needsVerification": true. Keep language clear, candid, and suitable for spoken practice. At the end of the JSON, include up to three concrete next-step questions only when they would materially improve the preparation.\n\nCURRENT DASHBOARD CONTEXT\n${JSON.stringify({ schemaVersion: "1.0", profile: workspace.profile, currentTarget: selected, evidenceCards: currentEvidence }, null, 2)}\n\nNEW MATERIAL TO PROCESS\nCompany: ${data.company || selected.company}\nRole: ${data.role || selected.role}\nPreparation need: ${data.need}\nMaterial pasted by Ayesha:\n${data.material || "(none supplied)"}\n\nTASK\nCreate a practical preparation update. Return exactly one fenced json block labelled DASHBOARD_UPDATE_JSON, with no prose outside it. Use this structure:\n{\n  "schemaVersion": "1.0",\n  "target": {"id": "${selected.id}", "company": "...", "role": "...", "stage": "...", "objective": "...", "priorities": ["..."], "sourceSummary": ["..."], "needsVerification": false},\n  "evidenceCards": [{"id":"short-id", "title":"...", "situation":"...", "action":"...", "result":"...", "proves":["..."], "targetIds":["${selected.id}"]}],\n  "questions": [{"id":"short-id", "prompt":"...", "timeLimitSeconds":60, "answerBullets":["..."], "evidenceIds":["..."], "targetIds":["${selected.id}"]}],\n  "challengePrompts": [{"id":"short-id", "text":"...", "purpose":"..."}],\n  "coldCallScenarios": [{"id":"short-id", "prospectLine":"...", "objective":"...", "coachBullets":["..."], "targetIds":["${selected.id}"]}],\n  "researchNotes": [{"title":"...", "note":"...", "needsVerification":true}],\n  "nextStepQuestions": ["..."]\n}\nInclude only useful entries. Empty arrays are fine. Keep any research notes separate from facts already approved in the dashboard.`;
}
function renderBridge() {
  const selected = target();
  return `<section class="page-intro"><p class="eyebrow">Free ChatGPT handoff</p><h1>Make a prep package</h1><p>Paste materials here, copy one complete prompt into ChatGPT, then paste its JSON reply back for review. Personal dashboard data stays in this browser.</p><p><a href="/agent-context.html" target="_blank" rel="noreferrer">Open the agent context page</a> <span class="muted">— the portable prompt links here after deployment.</span></p></section>
  <section class="bridge-steps" aria-label="Three steps"><span><b>1</b> Add material</span><span><b>2</b> Copy to ChatGPT</span><span><b>3</b> Review before import</span></section>
  <section class="bridge-layout"><form id="bridge-form" class="bridge-form"><label>Company<input name="company" value="${escapeHTML(selected.company)}"></label><label>Role<input name="role" value="${escapeHTML(selected.role)}"></label><label>What do you need to prepare for now?<select name="need"><option>Interview answers and likely follow-up questions</option><option>Company and role research</option><option>Cold-call or roleplay practice</option><option>Written application or screening questions</option></select></label><label>Paste a job description, notes, link text, or a screenshot description<textarea name="material" rows="12" placeholder="Paste anything relevant. For a screenshot, paste a concise description or its text."></textarea></label><p class="form-help">Links and unverified company claims are treated as research leads, not facts. The generated prompt tells ChatGPT to flag them for verification.</p><button type="button" data-action="copy-pack">Copy complete ChatGPT prompt</button></form>
  <section class="import-panel"><h2>Paste ChatGPT's reply</h2><p>Paste the entire response. Nothing is added until you review and choose Import.</p><textarea id="chat-response" rows="15" placeholder="Paste the DASHBOARD_UPDATE_JSON response here"></textarea><button data-action="parse-update">Review proposed update</button>${pendingChatUpdate ? renderImportReview() : ""}</section></section>`;
}
function renderImportReview() {
  const u = pendingChatUpdate;
  const count = (key) => Array.isArray(u[key]) ? u[key].length : 0;
  return `<div class="review-box"><h3>Proposed update</h3><p>${u.target?.needsVerification ? "Includes items marked for independent verification." : "No items are marked as unverified."}</p><ul><li>${count("evidenceCards")} evidence cards</li><li>${count("questions")} questions</li><li>${count("challengePrompts")} challenge prompts</li><li>${count("coldCallScenarios")} cold-call scenarios</li><li>${count("researchNotes")} research notes</li></ul><button data-action="import-update">Import reviewed update</button></div>`;
}
function renderBackups() {
  const backup = workspace.settings.lastBackupAt ? new Date(workspace.settings.lastBackupAt).toLocaleString() : "Not exported yet";
  return `<section class="page-intro"><p class="eyebrow">Portable, private data</p><h1>Backups and restore</h1><p>All working data is stored in this browser. Export after meaningful work or before switching devices.</p></section>
  <div class="backup-grid"><section class="backup-card"><h2>Export workspace</h2><p>Downloads one JSON backup containing targets, evidence, practice prompts, and completed reps.</p><button data-action="export-workspace">Download backup</button><p class="muted">Last export: ${escapeHTML(backup)}</p></section><section class="backup-card"><h2>Restore workspace</h2><p>Choose a JSON backup. Restore replaces the data currently in this browser.</p><input id="restore-file" type="file" accept="application/json,.json"><button data-action="restore-workspace">Restore selected backup</button></section><section class="backup-card danger"><h2>Start over</h2><p>Restores the original starter workspace in this browser. Export first if you need current work.</p><button data-action="reset-workspace">Restore starter workspace</button></section></div>`;
}
function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { stopTimer(); view = button.dataset.view; render(); }));
  document.querySelector("#target-select")?.addEventListener("change", (event) => { workspace.settings.currentTargetId = event.target.value; saveWorkspace(); activeDrill = null; render(); });
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", handleAction));
  document.querySelector("#evidence-form")?.addEventListener("submit", addEvidence);
}
function handleAction(event) {
  const action = event.currentTarget.dataset.action;
  if (action === "new-rep") { activeDrill = null; render(); return; }
  if (action === "start-drill") return startDrill(event.currentTarget.dataset.type, event.currentTarget.dataset.id);
  if (action === "timer-toggle") return toggleTimer();
  if (action === "timer-reset") { stopTimer(); secondsRemaining = activeDrill?.item.timeLimitSeconds || 60; render(); return; }
  if (action === "end-drill") { stopTimer(); activeDrill = null; render(); return; }
  if (action === "reveal") { revealAnswer = !revealAnswer; render(); return; }
  if (action === "rate") return rateRep(event.currentTarget.dataset.rating);
  if (action === "copy-pack") return copyPrepPack();
  if (action === "parse-update") return parseChatUpdate();
  if (action === "import-update") return importChatUpdate();
  if (action === "export-workspace") return exportWorkspace();
  if (action === "restore-workspace") return restoreWorkspace();
  if (action === "reset-workspace") return resetWorkspace();
}
function startDrill(type, id) {
  const source = type === "question" ? workspace.questions : type === "cold-call" ? workspace.coldCallScenarios : workspace.challengePrompts;
  const item = source.find((entry) => entry.id === id) || randomItem(type === "challenge" ? source : forTarget(source));
  activeDrill = { type, item }; revealAnswer = false; secondsRemaining = item.timeLimitSeconds || 60; render(); document.querySelector(".active-drill")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function formatTime(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
function toggleTimer() { if (timerId) return stopTimer(true); timerId = window.setInterval(() => { secondsRemaining -= 1; if (secondsRemaining <= 0) { secondsRemaining = 0; stopTimer(); showToast("Time is up. Rate the rep when you are ready."); } render(); }, 1000); render(); }
function stopTimer(shouldRender = false) { if (timerId) { clearInterval(timerId); timerId = null; } if (shouldRender) render(); }
function rateRep(rating) { if (!activeDrill) return; const item = activeDrill.item; workspace.practiceSessions.push({ id: `${Date.now()}`, type: activeDrill.type === "question" ? "Interview answer" : activeDrill.type === "cold-call" ? "Cold-call response" : "Follow-up challenge", title: item.prompt || item.prospectLine || item.text, rating, completedAt: new Date().toISOString(), targetId: targetId() }); saveWorkspace(); stopTimer(); activeDrill = null; render(); showToast(`Rep saved: ${rating}.`); }
async function copyPrepPack() { const pack = buildPrepPack(); try { await navigator.clipboard.writeText(pack); showToast("Complete ChatGPT prompt copied. Paste it into a new ChatGPT chat."); } catch { window.prompt("Copy this complete prompt:", pack); } }
function extractJson(text) { const fenced = text.match(/```(?:DASHBOARD_UPDATE_JSON|json)?\s*([\s\S]*?)```/i); const raw = fenced ? fenced[1] : text; const first = raw.indexOf("{"); const last = raw.lastIndexOf("}"); if (first < 0 || last < first) throw new Error("No JSON object found."); return JSON.parse(raw.slice(first, last + 1)); }
function parseChatUpdate() { const value = document.querySelector("#chat-response")?.value.trim(); if (!value) return showToast("Paste ChatGPT's reply first."); try { const update = extractJson(value); if (update.schemaVersion !== "1.0") throw new Error("This update does not use dashboard schema 1.0."); pendingChatUpdate = update; render(); showToast("Update parsed. Review the counts before importing."); } catch (error) { showToast(`Could not read the update: ${error.message}`); } }
function importChatUpdate() {
  if (!pendingChatUpdate) return;
  const u = pendingChatUpdate;
  let importedTargetId = targetId();
  if (u.target && typeof u.target === "object") {
    const existing = workspace.targets.find((item) => item.id === u.target.id);
    const sameTarget = existing && (!u.target.company || existing.company.toLowerCase() === u.target.company.toLowerCase()) && (!u.target.role || existing.role.toLowerCase() === u.target.role.toLowerCase());
    if (sameTarget) {
      Object.assign(existing, u.target);
      importedTargetId = existing.id;
    } else {
      importedTargetId = uniqueId(`${u.target.company || "target"}-${u.target.role || ""}`, workspace.targets);
      workspace.targets.push({ ...u.target, id: importedTargetId });
    }
  }
  ["evidenceCards", "questions", "challengePrompts", "coldCallScenarios"].forEach((key) => { if (!Array.isArray(u[key])) return; u[key].forEach((entry) => { const list = workspace[key]; const found = list.findIndex((item) => item.id === entry.id); const clean = { ...entry, id: entry.id ? safeId(entry.id) : uniqueId(entry.title || entry.prompt || entry.text, list) }; if (Array.isArray(clean.targetIds)) clean.targetIds = clean.targetIds.map((id) => id === u.target?.id ? importedTargetId : id); const targetSpecific = ["evidenceCards", "questions", "coldCallScenarios"].includes(key) && !clean.targetIds; if (targetSpecific) clean.targetIds = [importedTargetId]; if (found >= 0) list[found] = { ...list[found], ...clean }; else list.push(clean); }); });
  workspace.settings.currentTargetId = importedTargetId;
  if (Array.isArray(u.researchNotes) && u.researchNotes.length) workspace.importHistory.push({ importedAt: new Date().toISOString(), targetId: importedTargetId, researchNotes: u.researchNotes });
  saveWorkspace(); pendingChatUpdate = null; render(); showToast("Reviewed update imported into this browser.");
}
function addEvidence(event) { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); workspace.evidenceCards.push({ id: uniqueId(data.title, workspace.evidenceCards), title: data.title, situation: data.situation, action: data.action, result: data.result, proves: data.proves.split(",").map((item) => item.trim()).filter(Boolean), targetIds: [targetId()] }); saveWorkspace(); event.currentTarget.reset(); showToast("Evidence card saved locally."); render(); }
function exportWorkspace() { workspace.settings.lastBackupAt = new Date().toISOString(); saveWorkspace(); const file = new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(file); link.download = `ayesha-interview-workspace-${dateStamp()}.json`; link.click(); URL.revokeObjectURL(link.href); render(); showToast("Backup downloaded."); }
function restoreWorkspace() { const input = document.querySelector("#restore-file"); const file = input?.files?.[0]; if (!file) return showToast("Choose a JSON backup first."); const reader = new FileReader(); reader.onload = () => { try { const restored = normalizeWorkspace(JSON.parse(reader.result)); if (!window.confirm("Restore this backup and replace this browser's current workspace?")) return; workspace = restored; saveWorkspace(); render(); showToast("Backup restored."); } catch { showToast("That file is not a valid dashboard backup."); } }; reader.readAsText(file); }
function resetWorkspace() { if (!window.confirm("Restore the starter workspace? This replaces the current browser data.")) return; workspace = clone(SEED_WORKSPACE); saveWorkspace(); render(); showToast("Starter workspace restored."); }
function showToast(message) { const toast = document.querySelector("#toast"); if (toast) toast.textContent = message; }
render();
