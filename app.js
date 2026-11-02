const STORAGE_KEY = "it-equipment-items";

const itemsBody = document.getElementById("itemsBody");
const emptyState = document.getElementById("emptyState");
const itemForm = document.getElementById("itemForm");
const searchBox = document.getElementById("searchBox");

const statTotal = document.getElementById("statTotal");
const statAvailable = document.getElementById("statAvailable");
const statAssigned = document.getElementById("statAssigned");
const statRepair = document.getElementById("statRepair");

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function badgeClass(status) {
  if (status === "Available") return "badge-available";
  if (status === "Assigned") return "badge-assigned";
  return "badge-repair";
}

function render(filterText = "") {
  const items = loadItems();
  const q = filterText.trim().toLowerCase();
  const filtered = q
    ? items.filter((it) =>
        [it.name, it.category, it.serial, it.status, it.assignedTo]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    : items;

  itemsBody.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = items.length === 0
      ? "No items yet. Add your first item above."
      : "No items match your search.";
  } else {
    emptyState.hidden = true;
    filtered.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td>${escapeHtml(item.serial)}</td>
        <td><span class="badge ${badgeClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td>${escapeHtml(item.assignedTo || "—")}</td>
        <td>${escapeHtml(item.dateAdded)}</td>
        <td><button class="btn-delete" data-id="${item.id}">Delete</button></td>
      `;
      itemsBody.appendChild(tr);
    });
  }

  statTotal.textContent = items.length;
  statAvailable.textContent = items.filter((i) => i.status === "Available").length;
  statAssigned.textContent = items.filter((i) => i.status === "Assigned").length;
  statRepair.textContent = items.filter((i) => i.status === "In Repair").length;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

itemForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value;
  const serial = document.getElementById("serial").value.trim();
  const status = document.getElementById("status").value;
  const assignedTo = document.getElementById("assignedTo").value.trim();

  if (!name || !category || !serial || !status) return;

  const items = loadItems();
  items.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    category,
    serial,
    status,
    assignedTo,
    dateAdded: new Date().toLocaleDateString(),
  });
  saveItems(items);

  itemForm.reset();
  render(searchBox.value);
});

itemsBody.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-delete");
  if (!btn) return;
  const id = btn.dataset.id;
  const items = loadItems().filter((i) => i.id !== id);
  saveItems(items);
  render(searchBox.value);
});

searchBox.addEventListener("input", () => render(searchBox.value));

render();
