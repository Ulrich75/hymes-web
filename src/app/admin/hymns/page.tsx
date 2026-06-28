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

  const grouped = useMemo(() => {
    const colOrder = collections.map((c) => c.id);
    const map = new Map<string, Hymn[]>();
    for (const h of filtered) {
      const arr = map.get(h.collection_id) ?? [];
      arr.push(h);
      map.set(h.collection_id, arr);
    }
    const colMap = new Map(collections.map((c) => [c.id, c]));
    const result: Array<{ collection: Collection | null; hymns: Hymn[] }> = [];
    for (const id of colOrder) {
      if (map.has(id)) result.push({ collection: colMap.get(id) ?? null, hymns: map.get(id)! });
    }
    for (const [id, hs] of map) {
      if (!colOrder.includes(id)) result.push({ collection: colMap.get(id) ?? null, hymns: hs });
    }
    return result;
  }, [filtered, collections]);

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
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Bibliothèque
          </p>
          <h1 style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>Cantiques</h1>
        </div>
        <Link
          href="/admin/hymns/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bordeaux)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
            padding: '11px 20px',
            borderRadius: 10,
          }}
        >
          + Nouveau cantique
        </Link>
      </div>

      {error && <div className="alert error">{error}</div>}

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', fontSize: 15 }}>
            🔍
          </span>
          <input
            placeholder="Rechercher par titre ou numéro…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>
        <select
          value={colFilter}
          onChange={(e) => setColFilter(e.target.value)}
          style={{ minWidth: 200 }}
        >
          <option value="">Toutes les collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Grouped list */}
      {loading ? (
        <p className="muted">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="muted">Aucun cantique.</p>
      ) : (
        grouped.map(({ collection, hymns: groupHymns }) => (
          <div key={collection?.id ?? 'unknown'} style={{ marginBottom: 32 }}>
            {/* Collection heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              {collection?.emoji && (
                <span style={{ fontSize: 18 }}>{collection.emoji}</span>
              )}
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--bordeaux)' }}>
                {collection?.nom ?? 'Sans collection'}
              </span>
              <span
                style={{
                  background: '#f0e8ec',
                  color: 'var(--bordeaux)',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '2px 10px',
                  borderRadius: 999,
                }}
              >
                {groupHymns.length} cantique{groupHymns.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Hymn rows */}
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {groupHymns.map((h, i) => (
                <div
                  key={h.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 20px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {/* Number badge */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: '#f0e8ec',
                      color: 'var(--bordeaux)',
                      fontWeight: 700,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {h.numero}
                  </div>

                  {/* Title + author */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/admin/hymns/${encodeURIComponent(h.id)}`}
                      style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', textDecoration: 'none' }}
                    >
                      {h.titre}
                    </Link>
                    {h.auteur && (
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 1 }}>{h.auteur}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <Link
                      href={`/admin/hymns/${encodeURIComponent(h.id)}`}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: '#fff',
                        color: 'var(--text)',
                        fontWeight: 600,
                        fontSize: 13,
                        textDecoration: 'none',
                      }}
                    >
                      Éditer
                    </Link>
                    <button
                      onClick={() => remove(h)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--bordeaux)',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        padding: '6px 4px',
                      }}
                    >
                      Suppr.
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {!loading && (
        <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
          {filtered.length} cantique(s) affiché(s) sur {hymns.length}.
        </p>
      )}
    </>
  );
}
