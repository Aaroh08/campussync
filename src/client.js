import { $, Y, boot, context, notice, bindText, escape } from "./shared.js";
boot(() => {
  const { doc } = context();
  $("#mode").textContent = "Offline-first · CRDT sync";
  $("#content").innerHTML =
    `<div class="columns"><section class="panel"><h2>Shared notebook</h2><p class="muted">Notes stay in this browser's IndexedDB and merge when connection returns. Keep this device's browser storage to retain offline work.</p><textarea id="notes" class="editor" aria-label="Shared campus notes" placeholder="Meeting notes, club plans, study material…"></textarea><div class="toolbar"><span class="pill" id="wordcount">0 words</span><button id="download">Download notes</button></div></section><section class="panel"><h2>Team task board</h2><form id="add-task"><label>New task<input id="task-title" maxlength="160" required placeholder="Prepare the workshop slides"></label><button class="primary">Add</button></form><label>Filter tasks<input id="filter" placeholder="Search by title"></label><p class="muted" id="counts"></p><div id="tasks"></div></section></div><section class="panel"><h2>Try the offline workflow</h2><p class="muted">Open the same invite in two browser profiles. Disconnect one device, edit notes and add tasks in both, then reconnect. Text merges with Yjs; concurrent edits to the same task field use Yjs's deterministic map conflict resolution. Different task IDs remain independent.</p></section>`;
  const notes = doc.getText("notes"),
    tasks = doc.getMap("tasks");
  bindText($("#notes"), notes);
  const count = () =>
    ($("#wordcount").textContent =
      (notes.toString().trim().match(/\S+/g) || []).length + " words");
  notes.observe(count);
  count();
  const render = () => {
    const all = [...tasks.entries()]
      .filter(([id, t]) => !t.get("deleted"))
      .sort((a, b) => a[0].localeCompare(b[0]));
    const query = $("#filter").value.toLowerCase();
    $("#counts").textContent =
      `${all.filter(([id, t]) => t.get("done")).length} completed / ${all.length} tasks`;
    $("#tasks").innerHTML =
      all
        .filter(([id, t]) =>
          String(t.get("title")).toLowerCase().includes(query),
        )
        .map(
          ([id, t]) =>
            `<div class="task"><input type="checkbox" aria-label="Complete ${escape(t.get("title"))}" data-id="${id}" ${t.get("done") ? "checked" : ""}><span>${escape(t.get("title"))}</span><button data-delete="${id}" aria-label="Remove ${escape(t.get("title"))}">×</button></div>`,
        )
        .join("") ||
      '<p class="muted">No matching tasks. Add your first one above.</p>';
  };
  tasks.observeDeep(render);
  $("#filter").oninput = render;
  render();
  $("#add-task").onsubmit = (e) => {
    e.preventDefault();
    const title = $("#task-title").value.trim();
    if (!title) return;
    const task = new Y.Map();
    task.set("title", title);
    task.set("done", false);
    task.set("created", new Date().toISOString());
    tasks.set(crypto.randomUUID(), task);
    $("#task-title").value = "";
  };
  $("#tasks").onchange = (e) => {
    if (e.target.dataset.id)
      tasks.get(e.target.dataset.id)?.set("done", e.target.checked);
  };
  $("#tasks").onclick = (e) => {
    if (e.target.dataset.delete)
      tasks.get(e.target.dataset.delete)?.set("deleted", true);
  };
  $("#download").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([notes.toString()], { type: "text/markdown" }),
    );
    a.download = "campus-notes.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
}).catch((e) => notice(e.message));
