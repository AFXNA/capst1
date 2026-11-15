import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

const SESSION_KEY = "it-equipment-session";

function loadSession() {
  try {
    return localStorage.getItem(SESSION_KEY) || null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [username, setUsername] = useState(loadSession);
  const [isAdmin, setIsAdmin] = useState(false);
  const [restoring, setRestoring] = useState(Boolean(loadSession()));

  useEffect(() => {
    if (username) {
      localStorage.setItem(SESSION_KEY, username);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [username]);

  useEffect(() => {
    const sessionUser = loadSession();
    if (!sessionUser) {
      setRestoring(false);
      return;
    }

    supabase
      .from("users")
      .select("username, adminprivilige")
      .eq("username", sessionUser)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setIsAdmin(Boolean(data.adminprivilige));
        } else {
          setUsername(null);
        }
        setRestoring(false);
      });
  }, []);

  async function signup(name, password) {
    const trimmed = name.trim();
    if (!trimmed || !password) return { ok: false, error: "Username and password are required." };

    const { data: existing, error: lookupError } = await supabase
      .from("users")
      .select("username")
      .eq("username", trimmed)
      .maybeSingle();

    if (lookupError) return { ok: false, error: lookupError.message };
    if (existing) return { ok: false, error: "That username is already taken." };

    const { error: insertError } = await supabase
      .from("users")
      .insert({ username: trimmed, password, adminprivilige: 0 });

    if (insertError) return { ok: false, error: insertError.message };

    setUsername(trimmed);
    setIsAdmin(false);
    return { ok: true };
  }

  async function login(name, password) {
    const trimmed = name.trim();

    const { data: match, error: lookupError } = await supabase
      .from("users")
      .select("username, password, adminprivilige")
      .eq("username", trimmed)
      .maybeSingle();

    if (lookupError) return { ok: false, error: lookupError.message };
    if (!match || match.password !== password) {
      return { ok: false, error: "Invalid username or password." };
    }

    setUsername(match.username);
    setIsAdmin(Boolean(match.adminprivilige));
    return { ok: true };
  }

  function logout() {
    setUsername(null);
    setIsAdmin(false);
  }

  return { username, isAdmin, isAuthenticated: Boolean(username), restoring, signup, login, logout };
}
