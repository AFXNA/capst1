const LOW_QUANTITY_THRESHOLD = 5;

export default function Stats({ items }) {
  const total = items.length;
  const available = items.filter((i) => i.status === "Available").length;
  const assigned = items.filter((i) => i.status === "Assigned").length;
  const repair = items.filter((i) => i.status === "In Repair").length;
  const lowStock = items.filter((i) => (i.quantity ?? 0) <= LOW_QUANTITY_THRESHOLD).length;

  return (
    <section className="stats">
      <div className="stat-card stat-total">
        <div className="stat-info">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total Items</div>
        </div>
      </div>
      <div className="stat-card stat-available">
        <div className="stat-info">
          <div className="stat-value">{available}</div>
          <div className="stat-label">Available</div>
        </div>
      </div>
      <div className="stat-card stat-assigned">
        <div className="stat-info">
          <div className="stat-value">{assigned}</div>
          <div className="stat-label">Assigned</div>
        </div>
      </div>
      <div className="stat-card stat-repair">
        <div className="stat-info">
          <div className="stat-value">{repair}</div>
          <div className="stat-label">In Repair</div>
        </div>
      </div>
      <div className="stat-card stat-low">
        <div className="stat-info">
          <div className="stat-value">{lowStock}</div>
          <div className="stat-label">Low Stock</div>
        </div>
      </div>
    </section>
  );
}
