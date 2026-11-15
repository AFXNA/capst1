const COLUMNS = ["name", "category", "serial", "status", "assignedTo", "quantity", "dateAdded"];

function escapeCsvField(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function itemsToCsv(items) {
  const header = COLUMNS.join(",");
  const rows = items.map((item) => COLUMNS.map((col) => escapeCsvField(item[col])).join(","));
  return [header, ...rows].join("\r\n");
}

function parseCsvLines(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      if (text[i - 1] !== "\r") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      }
    } else if (char === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export function csvToItems(text) {
  const rows = parseCsvLines(text.trim());
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1);

  return dataRows.map((cells) => {
    const record = {};
    header.forEach((col, idx) => {
      record[col] = cells[idx] ?? "";
    });

    return {
      name: (record.name || "").trim(),
      category: (record.category || "").trim(),
      serial: (record.serial || "").trim(),
      status: (record.status || "Available").trim() || "Available",
      assignedTo: (record.assignedTo || "").trim(),
      quantity: Math.max(1, parseInt(record.quantity, 10) || 1),
      dateAdded: (record.dateAdded || "").trim() || new Date().toLocaleDateString(),
    };
  });
}
