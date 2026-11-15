import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  category: "",
  serial: "",
  status: "Available",
  assignedTo: "",
  quantity: 1,
};

export default function ItemForm({ editingItem, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name,
        category: editingItem.category,
        serial: editingItem.serial,
        status: editingItem.status,
        assignedTo: editingItem.assignedTo || "",
        quantity: editingItem.quantity ?? 1,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingItem]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const name = form.name.trim();
    const serial = form.serial.trim();
    const assignedTo = form.assignedTo.trim();
    const quantity = Math.max(1, parseInt(form.quantity, 10) || 1);

    if (!name || !form.category || !serial || !form.status) return;

    onSubmit({ name, category: form.category, serial, status: form.status, assignedTo, quantity });

    if (!editingItem) {
      setForm(emptyForm);
    }
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Add New Item</h2>
      <form className="item-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Item Name</label>
          <input
            type="text"
            id="name"
            placeholder="e.g. Dell Latitude 5420"
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            required
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
          >
            <option value="" disabled>
              Select category
            </option>
            <option>Laptop</option>
            <option>Desktop</option>
            <option>Monitor</option>
            <option>Printer</option>
            <option>Networking</option>
            <option>Peripheral</option>
            <option>Other</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="serial">Serial Number</label>
          <input
            type="text"
            id="serial"
            placeholder="e.g. SN-00123"
            required
            value={form.serial}
            onChange={(e) => handleChange("serial", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            required
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option>Available</option>
            <option>Assigned</option>
            <option>In Repair</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="assignedTo">Assigned To (optional)</label>
          <input
            type="text"
            id="assignedTo"
            placeholder="e.g. Jane Doe"
            value={form.assignedTo}
            onChange={(e) => handleChange("assignedTo", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            min="1"
            step="1"
            required
            value={form.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
          />
        </div>
        <div className="field form-actions">
          <button type="submit" className="btn-primary">
            {editingItem ? "Update Item" : "Add Item"}
          </button>
          {editingItem && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
