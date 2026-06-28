// Petit wrapper fetch pour l'UI admin. Le cookie de session est envoyé
// automatiquement (même origine), donc rien à ajouter côté auth.

async function jsonOrThrow(res: Response) {
  if (!res.ok) {
    let msg = `Erreur ${res.status}`;
    try {
      const d = await res.json();
      if (d?.error) msg = d.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

const jsonHeaders = { 'Content-Type': 'application/json' };

export const api = {
  get: <T>(url: string): Promise<T> => fetch(url).then(jsonOrThrow),
  post: <T>(url: string, body: unknown): Promise<T> =>
    fetch(url, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(body) }).then(jsonOrThrow),
  put: <T>(url: string, body: unknown): Promise<T> =>
    fetch(url, { method: 'PUT', headers: jsonHeaders, body: JSON.stringify(body) }).then(jsonOrThrow),
  del: <T>(url: string): Promise<T> => fetch(url, { method: 'DELETE' }).then(jsonOrThrow),
};
