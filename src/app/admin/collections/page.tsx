'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { Collection } from '@/types/hymn';

const EMPTY: Collection = { id: '', nom: '', langue: '', couleur: '#660033', emoji: '', description: '' };

export default function CollectionsPage() {
  const [items, setItems] = useState<Collection[]>([]);
  const [draft, setDraft] = useState<Collection>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setItems(await api.get<Collection[]>('/api/admin/collections'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setDraft(EMPTY);
    setEditing(false);
    setError('');
  }
  function startEdit(c: Collection) {
    setDraft(c);
    setEditing(true);
    setError('');
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!draft.id.trim() || !draft.nom.trim() || !draft.langue.trim() || !draft.emoji.trim()) {
      setError('id, nom, langue et emoji sont requis.');
      return;
    }
    try {
      if (editing) {
        await api.put('/api/admin/collections', draft);
      } else {
        await api.post('/api/admin/collections', draft);
      }
      startNew();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'enregistrement");
    }
  }

  async function remove(c: Collection) {
    if (!confirm(`Supprimer la collection « ${c.nom} » ?`)) return;
    try {
      await api.del(`/api/admin/collections?id=${encodeURIComponent(c.id)}`);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Échec de la suppression');
    }
  }

  return (
    <>
      <h1 style={{ marginTop: 0 }}>Collections</h1>
      {error && <div className="alert error">{error}</div>}

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>
          {editing ? `Éditer : ${draft.nom}` : 'Nouvelle collection'}
        </h2>
        <form onSubmit={save}>
          <div className="row">
            <div className="field">
              <label>Identifiant</label>
              <input
                value={draft.id}
                disabled={editing}
                onChange={(e) => setDraft({ ...draft, id: e.target.value })}
                placeholder="ex: fr"
              />
            </div>
            <div className="field">
              <label>Nom</label>
              <input value={draft.nom} onChange={(e) => setDraft({ ...draft, nom: e.target.value })} />
            </div>
            <div className="field">
              <label>Langue</label>
              <input value={draft.langue} onChange={(e) => setDraft({ ...draft, langue: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Emoji</label>
              <input value={draft.emoji} onChange={(e) => setDraft({ ...draft, emoji: e.target.value })} placeholder="🇫🇷" />
            </div>
            <div className="field">
              <label>Couleur</label>
              <input
                type="color"
                value={draft.couleur}
                onChange={(e) => setDraft({ ...draft, couleur: e.target.value })}
                style={{ height: 40, padding: 4 }}
              />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <input
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>
          <div className="row">
            <button className="btn" type="submit" style={{ flex: 'unset' }}>
              {editing ? 'Mettre à jour' : 'Créer'}
            </button>
            {editing && (
              <button type="button" className="btn secondary" onClick={startNew} style={{ flex: 'unset' }}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Collection</th>
              <th>Langue</th>
              <th>id</th>
              <th style={{ width: 150 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="muted" style={{ padding: 20 }}>
                  Chargement…
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span style={{ marginRight: 6 }}>{c.emoji}</span>
                    {c.nom}
                  </td>
                  <td className="muted">{c.langue}</td>
                  <td className="muted">{c.id}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn secondary sm" onClick={() => startEdit(c)}>
                        Éditer
                      </button>
                      <button className="btn danger sm" onClick={() => remove(c)}>
                        Suppr.
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
