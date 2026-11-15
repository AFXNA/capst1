import { useState } from "react";
import { useAuth } from "./useAuth.js";
import { useItems } from "./useItems.js";
import Auth from "./components/Auth.jsx";
import Stats from "./components/Stats.jsx";
import ItemForm from "./components/ItemForm.jsx";
import ItemsTable from "./components/ItemsTable.jsx";
import ImportExport from "./components/ImportExport.jsx";

const LOW_QUANTITY_THRESHOLD = 5;

export default function App() {
  const { username, isAdmin, isAuthenticated, restoring, login, signup, logout } = useAuth();
  const { items, loading, error, addItem, updateItem, deleteItem, importItems } = useItems();
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  if (restoring) {
    return <div className="page-loading">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Auth onLogin={login} onSignup={signup} />;
  }

  const editingItem = editingId ? items.find((i) => i.id === editingId) : null;

  const q = search.trim().toLowerCase();
  const filteredItems = q
    ? items.filter((it) =>
        [it.name, it.category, it.serial, it.status, it.assignedTo].join(" ").toLowerCase().includes(q)
      )
    : items;

  const lowStockItems = items.filter((i) => (i.quantity ?? 0) <= LOW_QUANTITY_THRESHOLD);

  function handleSubmit(data) {
    if (!isAdmin) return;
    if (editingId) {
      updateItem(editingId, data);
      setEditingId(null);
    } else {
      addItem(data);
    }
  }

  function handleEdit(item) {
    if (!isAdmin) return;
    setEditingId(item.id);
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  function handleDelete(id) {
    if (!isAdmin) return;
    deleteItem(id);
    if (editingId === id) setEditingId(null);
  }

  function handleImport(records) {
    if (!isAdmin) return;
    importItems(records);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-name">Manage your inventory</span>
        </div>
        <div className="topbar-right">
          <div className="user-chip">
            <strong>{username}</strong>
            <span className={`role-pill ${isAdmin ? "role-pill-admin" : "role-pill-viewer"}`}>
              {isAdmin ? "Admin" : "Viewer"}
            </span>
          </div>
          <button type="button" className="btn-logout" onClick={logout}>
            Log Out
          </button>
        </div>
      </header>

      <main className="content">
        {error && <div className="banner-error">{error}</div>}
        {!isAdmin && (
          <div className="banner-info">
            You're signed in as a viewer. Only admins can add, edit, delete, or import items.
          </div>
        )}
        {lowStockItems.length > 0 && (
          <div className="banner-warning">
            ⚠ {lowStockItems.length} item{lowStockItems.length === 1 ? "" : "s"} at or below{" "}
            {LOW_QUANTITY_THRESHOLD} units:{" "}
            {lowStockItems
              .slice(0, 6)
              .map((i) => `${i.name} (${i.quantity})`)
              .join(", ")}
            {lowStockItems.length > 6 ? `, +${lowStockItems.length - 6} more` : ""}
          </div>
        )}
        {loading ? (
          <div className="empty-state">Loading inventory...</div>
        ) : (
          <>
            <Stats items={items} />

            {isAdmin && (
              <ItemForm editingItem={editingItem} onSubmit={handleSubmit} onCancel={handleCancelEdit} />
            )}

            <ItemsTable
              items={filteredItems}
              totalCount={items.length}
              searchValue={search}
              onSearchChange={setSearch}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
              toolbar={<ImportExport items={items} onImport={handleImport} canImport={isAdmin} />}
            />
          </>
        )}
      </main>
    </div>
  );
}
