'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import type { SyncManifest } from '@/types/hymn';

export default function DashboardPage() {
  const [manifest, setManifest] = useState<SyncManifest | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<SyncManifest>('/api/sync/manifest')
      .then(setManifest)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'));
  }, []);

  return (
    <>
      <h1 style={{ marginTop: 0 }}>Tableau de bord</h1>

      {error && (
        <div className="alert error">
          {error} — la base n&apos;est peut-être pas encore connectée (Phase 2).
        </div>
      )}

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat">
          <div className="n">{manifest?.counts.hymns ?? '—'}</div>
          <div className="l">Cantiques</div>
        </div>
        <div className="stat">
          <div className="n">{manifest?.counts.collections ?? '—'}</div>
          <div className="l">Collections</div>
        </div>
        <div className="stat">
          <div className="n">{manifest?.dataVersion ?? '—'}</div>
          <div className="l">Version des données</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Actions</h2>
        <div className="row">
          <Link className="btn" href="/admin/hymns">
            Gérer les cantiques
          </Link>
          <Link className="btn secondary" href="/admin/collections">
            Gérer les collections
          </Link>
          <a className="btn secondary" href="/api/admin/export">
            Télécharger un backup
          </a>
        </div>
      </div>

      {manifest && (
        <p className="muted" style={{ fontSize: 13 }}>
          Dernière mise à jour : {new Date(manifest.lastUpdated).toLocaleString('fr-FR')}
          {manifest.latestAppVersion && ` · App publiée : v${manifest.latestAppVersion}`}
        </p>
      )}
    </>
  );
}
