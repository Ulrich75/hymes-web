'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import type { Hymn, Collection, Verset, AudioInfo, VoiceType } from '@/types/hymn';

type Mode = 'new' | 'edit';

type VersetDraft = { type: Verset['type']; contenu: string };

const VOICES: VoiceType[] = ['soprano', 'alto', 'tenor', 'bass'];

function pad3(n: number) {
  return String(n).padStart(3, '0');
}

export default function HymnForm({ mode, initial }: { mode: Mode; initial?: Hymn }) {
  const router = useRouter();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [existingHymns, setExistingHymns] = useState<Hymn[]>([]);
  const [id, setId] = useState(initial?.id ?? '');
  const [idTouched, setIdTouched] = useState(mode === 'edit');
  const [numero, setNumero] = useState<number>(initial?.numero ?? 1);
  const [numeroTouched, setNumeroTouched] = useState(mode === 'edit');
  const [titre, setTitre] = useState(initial?.titre ?? '');
  const [collectionId, setCollectionId] = useState(initial?.collection_id ?? '');
  const [auteur, setAuteur] = useState(initial?.auteur ?? '');
  const [versets, setVersets] = useState<VersetDraft[]>(
    initial?.versets.map((v) => ({ type: v.type, contenu: v.contenu })) ?? [
      { type: 'couplet', contenu: '' },
    ],
  );

  const [audioOn, setAudioOn] = useState<boolean>(!!initial?.audio);
  const [audio, setAudio] = useState<AudioInfo>(initial?.audio ?? {});

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Collection[]>('/api/admin/collections').then(setCollections).catch(() => {});
    if (mode === 'new') {
      api.get<Hymn[]>('/api/admin/hymns').then(setExistingHymns).catch(() => {});
    }
  }, [mode]);

  // Auto-calcule le prochain numéro disponible quand la collection change.
  useEffect(() => {
    if (mode !== 'new' || numeroTouched || !collectionId) return;
    const max = existingHymns
      .filter((h) => h.collection_id === collectionId)
      .reduce((acc, h) => Math.max(acc, h.numero), 0);
    setNumero(max + 1);
  }, [mode, numeroTouched, collectionId, existingHymns]);

  // Auto-génère l'id (collection-NNN) tant que l'utilisateur ne l'a pas modifié.
  useEffect(() => {
    if (mode === 'new' && !idTouched && collectionId) {
      setId(`${collectionId}-${pad3(numero)}`);
    }
  }, [mode, idTouched, collectionId, numero]);

  function updateVerset(i: number, patch: Partial<VersetDraft>) {
    setVersets((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }
  function addVerset() {
    setVersets((vs) => [...vs, { type: 'couplet', contenu: '' }]);
  }
  function removeVerset(i: number) {
    setVersets((vs) => vs.filter((_, idx) => idx !== i));
  }
  function moveVerset(i: number, dir: -1 | 1) {
    setVersets((vs) => {
      const j = i + dir;
      if (j < 0 || j >= vs.length) return vs;
      const copy = [...vs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  function buildAudio(): AudioInfo | undefined {
    if (!audioOn) return undefined;
    const a: AudioInfo = {};
    for (const v of VOICES) if (audio[v]) a[v] = audio[v];
    if (audio.full) a.full = audio.full;
    if (audio.tempo) a.tempo = Number(audio.tempo);
    if (audio.key) a.key = audio.key;
    if (audio.duration) a.duration = Number(audio.duration);
    return Object.keys(a).length ? a : undefined;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!id.trim()) return setError("L'identifiant est requis.");
    if (!titre.trim()) return setError('Le titre est requis.');
    if (!collectionId) return setError('La collection est requise.');
    if (versets.length === 0) return setError('Au moins un verset est requis.');
    if (versets.some((v) => !v.contenu.trim())) return setError('Un verset est vide.');

    // Renumérotation séquentielle + ids dérivés de l'id du cantique.
    const versetsPayload: Verset[] = versets.map((v, i) => ({
      id: `${id}-${i + 1}`,
      numero: i + 1,
      type: v.type,
      contenu: v.contenu.trim(),
    }));

    const payload: Hymn = {
      id: id.trim(),
      numero: Number(numero),
      titre: titre.trim(),
      collection_id: collectionId,
      auteur: auteur.trim() || undefined,
      versets: versetsPayload,
      audio: buildAudio(),
    };

    setSaving(true);
    try {
      if (mode === 'new') {
        await api.post('/api/admin/hymns', payload);
      } else {
        await api.put('/api/admin/hymns', payload);
      }
      router.push('/admin/hymns');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="toolbar">
        <h1 style={{ margin: 0, marginRight: 'auto' }}>
          {mode === 'new' ? 'Nouveau cantique' : `Éditer : ${initial?.titre ?? ''}`}
        </h1>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card">
        <div className="row">
          <div className="field">
            <label>Collection</label>
            <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
              <option value="">— choisir —</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Numéro</label>
            <input
              type="number"
              min={1}
              value={numero}
              onChange={(e) => {
                setNumeroTouched(true);
                setNumero(Number(e.target.value));
              }}
            />
          </div>
          <div className="field">
            <label>Identifiant</label>
            <input
              value={id}
              disabled={mode === 'edit'}
              onChange={(e) => {
                setIdTouched(true);
                setId(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Titre</label>
            <input value={titre} onChange={(e) => setTitre(e.target.value)} />
          </div>
          <div className="field">
            <label>Auteur (optionnel)</label>
            <input value={auteur} onChange={(e) => setAuteur(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <h2 style={{ margin: 0, marginRight: 'auto', fontSize: 18 }}>Versets</h2>
          <button type="button" className="btn secondary sm" onClick={addVerset}>
            + Ajouter un verset
          </button>
        </div>

        {versets.map((v, i) => (
          <div key={i} className="field" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div className="toolbar" style={{ marginBottom: 6 }}>
              <span className="tag">#{i + 1}</span>
              <select
                value={v.type}
                onChange={(e) => updateVerset(i, { type: e.target.value as Verset['type'] })}
                style={{ maxWidth: 160 }}
              >
                <option value="couplet">Couplet</option>
                <option value="refrain">Refrain</option>
                <option value="pont">Pont</option>
              </select>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button type="button" className="btn secondary sm" onClick={() => moveVerset(i, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button
                  type="button"
                  className="btn secondary sm"
                  onClick={() => moveVerset(i, 1)}
                  disabled={i === versets.length - 1}
                >
                  ↓
                </button>
                <button type="button" className="btn danger sm" onClick={() => removeVerset(i)}>
                  Suppr.
                </button>
              </span>
            </div>
            <textarea
              value={v.contenu}
              onChange={(e) => updateVerset(i, { contenu: e.target.value })}
              placeholder="Paroles du verset (les sauts de ligne sont conservés)"
            />
          </div>
        ))}
      </div>

      <div className="card">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={audioOn}
            onChange={(e) => setAudioOn(e.target.checked)}
            style={{ width: 'auto' }}
          />
          Informations audio (optionnel)
        </label>

        {audioOn && (
          <>
            <div className="row" style={{ marginTop: 12 }}>
              <div className="field">
                <label>Tempo (BPM)</label>
                <input
                  type="number"
                  value={audio.tempo ?? ''}
                  onChange={(e) => setAudio({ ...audio, tempo: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="field">
                <label>Tonalité</label>
                <input value={audio.key ?? ''} onChange={(e) => setAudio({ ...audio, key: e.target.value })} />
              </div>
              <div className="field">
                <label>Durée (s)</label>
                <input
                  type="number"
                  value={audio.duration ?? ''}
                  onChange={(e) =>
                    setAudio({ ...audio, duration: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </div>
            </div>
            {VOICES.map((voice) => (
              <div className="field" key={voice}>
                <label style={{ textTransform: 'capitalize' }}>{voice}</label>
                <input
                  value={audio[voice] ?? ''}
                  onChange={(e) => setAudio({ ...audio, [voice]: e.target.value })}
                  placeholder={`URL audio ${voice}`}
                />
              </div>
            ))}
            <div className="field">
              <label>Mélodie complète</label>
              <input
                value={audio.full ?? ''}
                onChange={(e) => setAudio({ ...audio, full: e.target.value })}
                placeholder="URL audio (toutes voix)"
              />
            </div>
          </>
        )}
      </div>

      <div className="row">
        <button className="btn" type="submit" disabled={saving} style={{ flex: 'unset' }}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={() => router.push('/admin/hymns')}
          style={{ flex: 'unset' }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
