'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import HymnForm from '@/components/HymnForm';
import { api } from '@/lib/api-client';
import type { Hymn } from '@/types/hymn';

export default function EditHymnPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // "new" est géré par sa propre route ; ignore si jamais on arrive ici.
    api
      .get<Hymn>(`/api/admin/hymns/${encodeURIComponent(id)}`)
      .then(setHymn)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'));
  }, [id]);

  if (error) return <div className="alert error">{error}</div>;
  if (!hymn) return <p className="muted">Chargement…</p>;

  return <HymnForm mode="edit" initial={hymn} />;
}
