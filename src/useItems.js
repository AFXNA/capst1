import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

const TABLE = "Items";

function fromRow(row) {
  return {
    id: row.id,
    name: row.itemName ?? "",
    category: row.category ?? "",
    serial: row.serial ?? "",
    status: row.status ?? "Available",
    assignedTo: row.assignee ?? "",
    quantity: row.quantity ?? 1,
    dateAdded: row.dateAdded,
  };
}

function toRow(data) {
  return {
    itemName: data.name,
    category: data.category,
    serial: data.serial,
    status: data.status,
    assignee: data.assignedTo,
    quantity: data.quantity,
  };
}

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from(TABLE)
      .select("*")
      .order("dateAdded", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError(null);
      setItems(data.map(fromRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(data) {
    const { data: inserted, error: insertError } = await supabase
      .from(TABLE)
      .insert(toRow(data))
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }
    setItems((prev) => [fromRow(inserted), ...prev]);
  }

  async function updateItem(id, data) {
    const { data: updated, error: updateError } = await supabase
      .from(TABLE)
      .update(toRow(data))
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setItems((prev) => prev.map((item) => (item.id === id ? fromRow(updated) : item)));
  }

  async function deleteItem(id) {
    const { error: deleteError } = await supabase.from(TABLE).delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function importItems(records) {
    const { data: inserted, error: importError } = await supabase
      .from(TABLE)
      .insert(records.map(toRow))
      .select();

    if (importError) {
      setError(importError.message);
      return;
    }
    setItems((prev) => [...inserted.map(fromRow), ...prev]);
  }

  return { items, loading, error, addItem, updateItem, deleteItem, importItems };
}
