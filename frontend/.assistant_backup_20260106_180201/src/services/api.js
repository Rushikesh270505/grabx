import { store } from "../store";
import { logout } from "../store/auth.slice";

const API_BASE = "http://localhost:4000/api";

export async function apiFetch(
  endpoint,
  { method = "GET", body, headers = {} } = {}
) {
  const token = store.getState().auth.token;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 401) {
    store.dispatch(logout());
    throw new Error("Unauthorized");
  }

  return res.json();
}

export async function fetchBots(){
  try{ return await apiFetch('/bots'); }catch(e){
    // fallback to static list if backend down
    return [];
  }
}

export async function fetchBot(id){
  return apiFetch(`/bots/${id}`);
}

export async function fetchActive(){
  try{ return await apiFetch('/active'); }catch(e){
    try{ return JSON.parse(localStorage.getItem('activeBots')||'[]'); }catch(e){ return []; }
  }
}

export async function startBotRemote(id, payload){
  return apiFetch(`/bots/${id}/start`, { method: 'POST', body: payload });
}

export async function stopBotRemote(id){
  return apiFetch(`/bots/${id}/stop`, { method: 'POST' });
}

