const LOW_QUANTITY_THRESHOLD = 5;

function badgeClass(status) {
  if (status === "Available") return "badge-available";
  if (status === "Assigned") return "badge-assigned";
  return "badge-repair";
}

export default function ItemsTable({ items, totalCount, searchValue, onSearchChange, onEdit, onDelete, isAdmin, toolbar }) {
  return (
    <section className="panel">
      <div className="panel-header-row">
        <h2 className="panel-title">Inventory</h2>
        <div className="panel-header-actions">
          {toolbar}
          <input
            type="text"
            className="search-box"
            placeholder="Search items..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Serial #</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Qty</th>
              <th>Date Added</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isLow = (item.quantity ?? 0) <= LOW_QUANTITY_THRESHOLD;
              return (
              <tr key={item.id} className={isLow ? "row-low-stock" : ""}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.serial}</td>
                <td>
                  <span className={`badge ${badgeClass(item.status)}`}>{item.status}</span>
                </td>
                <td>{item.assignedTo || "—"}</td>
                <td>
                  <span className={isLow ? "qty-low" : ""}>{item.quantity ?? 1}</span>
                  {isLow && <span className="low-stock-tag" title={`At or below ${LOW_QUANTITY_THRESHOLD}`}>⚠ Low</span>}
                </td>
                <td>{item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : "—"}</td>
                {isAdmin && (
                  <td className="row-actions">
                    <button className="btn-edit" onClick={() => onEdit(item)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => onDelete(item.id)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="empty-state">
            {totalCount === 0 ? "No items yet. Add your first item above." : "No items match your search."}
          </div>
        )}
      </div>
    </section>
  );
}
