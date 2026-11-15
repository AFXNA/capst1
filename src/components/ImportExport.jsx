import { useRef } from "react";
import { itemsToCsv, csvToItems } from "../csv.js";

export default function ImportExport({ items, onImport, canImport }) {
  const fileInputRef = useRef(null);

  function handleExport() {
    const csv = itemsToCsv(items);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `it-equipment-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const parsed = csvToItems(text);
      onImport(parsed);
    };
    reader.readAsText(file);

    e.target.value = "";
  }

  return (
    <div className="import-export">
      <button type="button" className="btn-secondary" onClick={handleExport}>
        Export CSV
      </button>
      {canImport && (
        <>
          <button type="button" className="btn-secondary" onClick={handleImportClick}>
            Import CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}
