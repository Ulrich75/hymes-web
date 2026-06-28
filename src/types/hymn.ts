// Types partagés avec l'app mobile (HYMNES-/src/data/types.ts).
// Garder les deux fichiers synchronisés.

export interface Verset {
  id: string;
  numero: number;
  type: 'couplet' | 'refrain' | 'pont';
  contenu: string;
}

export type VoiceType = 'soprano' | 'alto' | 'tenor' | 'bass';

export interface AudioInfo {
  soprano?: string;
  alto?: string;
  tenor?: string;
  bass?: string;
  full?: string;
  tempo?: number;
  key?: string;
  duration?: number;
}

export interface Hymn {
  id: string;
  numero: number;
  titre: string;
  collection_id: string;
  auteur?: string;
  versets: Verset[];
  audio?: AudioInfo;
}

export interface Collection {
  id: string;
  nom: string;
  langue: string;
  couleur: string;
  emoji: string;
  description: string;
}

// ── Types de synchronisation (API ⇄ mobile) ──────────────────────────────

/** Élément renvoyé dans un delta : peut être un soft-delete. */
export type SyncEntity<T> = T & {
  updatedAt: string; // ISO
  deleted: boolean;
};

export interface SyncManifest {
  dataVersion: number;
  lastUpdated: string; // ISO
  counts: { hymns: number; collections: number };
  latestAppVersion: string | null;
  minAppVersion: string | null;
  updateUrl: string | null;
}

export interface SyncDelta<T> {
  since: string | null;
  serverTime: string; // ISO — à stocker par le client comme prochain "since"
  dataVersion: number;
  items: SyncEntity<T>[];
}
