'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import type { Hymn, Collection } from '@/types/hymn';

export default function HymnsListPage() {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [query, setQuery] = useState('');
  const [colFilter, setColFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [h, c] = await Promise.all([
        api.get<Hymn[]>('/api/admin/hymns'),
        api.get<Collection[]>('/api/admin/collections'),
      ]);
      setHymns(h);
      setCollections(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const colName = useMemo(() => {
    const m = new Map(collections.map((c) => [c.id, `${c.emoji} ${c.nom}`]));
    return (id: string) => m.get(id) ?? id;
  }, [collections]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return hymns
      .filter((h) => (colFilter ? h.collection_id === colFilter : true))
      .filter((h) =>
        q ? h.titre.toLowerCase().includes(q) || String(h.numero).includes(q) : true,
      )
      .sort((a, b) =>
        a.collection_id === b.collection_id
          ? a.numero - b.numero
          : a.collection_id.localeCompare(b.collection_id),
      );
  }, [hymns, query, colFilter]);

  async function remove(h: Hymn) {
    if (!confirm(`Supprimer « ${h.titre} » (n°${h.numero}) ?`)) return;
    try {
      await api.del(`/api/admin/hymns?id=${encodeURIComponent(h.id)}`);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Échec de la suppression');
    }
  }

  return (
    <>
      <div className="toolbar">
        <h1 style={{ margin: 0, marginRight: 'auto' }}>Cantiques</h1>
        <Link className="btn" href="/admin/hymns/new">
          + Nouveau cantique
        </Link>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="toolbar">
        <input
          className="grow"
          placeholder="Rechercher par titre ou numéro…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={colFilter} onChange={(e) => setColFilter(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="">Toutes les collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>N°</th>
              <th>Titre</th>
              <th>Collection</th>
              <th>Auteur</th>
              <th style={{ width: 150 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="muted" style={{ padding: 20 }}>
                  Chargement…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted" style={{ padding: 20 }}>
                  Aucun cantique.
                </td>
              </tr>
            ) : (
              filtered.map((h) => (
                <tr key={h.id}>
                  <td>{h.numero}</td>
                  <td>
                    <Link href={`/admin/hymns/${encodeURIComponent(h.id)}`}>{h.titre}</Link>
                  </td>
                  <td>
                    <span className="tag">{colName(h.collection_id)}</span>
                  </td>
                  <td className="muted">{h.auteur || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link className="btn secondary sm" href={`/admin/hymns/${encodeURIComponent(h.id)}`}>
                        Éditer
                      </Link>
                      <button className="btn danger sm" onClick={() => remove(h)}>
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

      {!loading && (
        <p className="muted" style={{ fontSize: 13 }}>
          {filtered.length} cantique(s) affiché(s) sur {hymns.length}.
        </p>
      )}
    </>
  );
}
