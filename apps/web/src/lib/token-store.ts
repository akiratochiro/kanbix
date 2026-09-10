/**
 * Store do token de autenticação (fonte da verdade: localStorage).
 *
 * Exposto no formato que o `useSyncExternalStore` do React espera
 * (subscribe / getSnapshot / getServerSnapshot), para o AuthContext
 * poder "assinar" o token sem useEffect nem useState.
 */

const TOKEN_KEY = "kanbix_token";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function getServerSnapshot(): null {
  return null;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);

  // O evento 'storage' só dispara em OUTRAS abas (nunca na que fez a
  // alteração) — por isso set/clear abaixo chamam emit() manualmente.
  const onStorage = (event: StorageEvent) => {
    if (event.key === TOKEN_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const tokenStore = {
  subscribe,
  getSnapshot: getToken,
  getServerSnapshot,
  set(token: string) {
    window.localStorage.setItem(TOKEN_KEY, token);
    emit();
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY);
    emit();
  },
};
