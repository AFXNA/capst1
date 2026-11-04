const STORAGE_KEY = "it-equipment-items";

const itemsBody = document.getElementById("itemsBody");
const emptyState = document.getElementById("emptyState");
const itemForm = document.getElementById("itemForm");
const searchBox = document.getElementById("searchBox");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const statTotal = document.getElementById("statTotal");
const statAvailable = document.getElementById("statAvailable");
const statAssigned = document.getElementById("statAssigned");
const statRepair = document.getElementById("statRepair");

let editingId = null;

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
        <td>${escapeHtml(item.quantity ?? 1)}</td>
        <td>${escapeHtml(item.dateAdded)}</td>
        <td class="row-actions">
          <button class="btn-edit" data-id="${item.id}">Edit</button>
          <button class="btn-delete" data-id="${item.id}">Delete</button>
        </td>
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

function enterEditMode(item) {
  editingId = item.id;
  document.getElementById("name").value = item.name;
  document.getElementById("category").value = item.category;
  document.getElementById("serial").value = item.serial;
  document.getElementById("status").value = item.status;
  document.getElementById("assignedTo").value = item.assignedTo || "";
  document.getElementById("quantity").value = item.quantity ?? 1;

  submitBtn.textContent = "Update Item";
  cancelEditBtn.hidden = false;
  itemForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function exitEditMode() {
  editingId = null;
  itemForm.reset();
  document.getElementById("quantity").value = 1;
  submitBtn.textContent = "Add Item";
  cancelEditBtn.hidden = true;
}

itemForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value;
  const serial = document.getElementById("serial").value.trim();
  const status = document.getElementById("status").value;
  const assignedTo = document.getElementById("assignedTo").value.trim();
  const quantity = Math.max(1, parseInt(document.getElementById("quantity").value, 10) || 1);

  if (!name || !category || !serial || !status) return;

  const items = loadItems();

  if (editingId) {
    const idx = items.findIndex((i) => i.id === editingId);
    if (idx !== -1) {
      items[idx] = { ...items[idx], name, category, serial, status, assignedTo, quantity };
    }
    saveItems(items);
    exitEditMode();
  } else {
    items.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name,
      category,
      serial,
      status,
      assignedTo,
      quantity,
      dateAdded: new Date().toLocaleDateString(),
    });
    saveItems(items);
    itemForm.reset();
    document.getElementById("quantity").value = 1;
  }

  render(searchBox.value);
});

cancelEditBtn.addEventListener("click", () => {
  exitEditMode();
});

itemsBody.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".btn-delete");
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    const items = loadItems().filter((i) => i.id !== id);
    saveItems(items);
    if (editingId === id) exitEditMode();
    render(searchBox.value);
    return;
  }

  const editBtn = e.target.closest(".btn-edit");
  if (editBtn) {
    const id = editBtn.dataset.id;
    const item = loadItems().find((i) => i.id === id);
    if (item) enterEditMode(item);
  }
});

searchBox.addEventListener("input", () => render(searchBox.value));

render();
