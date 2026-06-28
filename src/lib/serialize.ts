import type { Hymn as PrismaHymn, Collection as PrismaCollection } from '@prisma/client';
import type { Hymn, Collection, Verset, AudioInfo, SyncEntity } from '@/types/hymn';

// Convertit une ligne Prisma en payload Hymn (forme attendue par le mobile).
export function toHymn(row: PrismaHymn): Hymn {
  return {
    id: row.id,
    numero: row.numero,
    titre: row.titre,
    collection_id: row.collectionId,
    auteur: row.auteur ?? undefined,
    versets: (row.versets as unknown as Verset[]) ?? [],
    audio: (row.audio as unknown as AudioInfo) ?? undefined,
  };
}

export function toCollection(row: PrismaCollection): Collection {
  return {
    id: row.id,
    nom: row.nom,
    langue: row.langue,
    couleur: row.couleur,
    emoji: row.emoji,
    description: row.description,
  };
}

// Variante pour les deltas de synchro : ajoute updatedAt + flag deleted.
export function toHymnSync(row: PrismaHymn): SyncEntity<Hymn> {
  return {
    ...toHymn(row),
    updatedAt: row.updatedAt.toISOString(),
    deleted: row.deletedAt != null,
  };
}

export function toCollectionSync(row: PrismaCollection): SyncEntity<Collection> {
  return {
    ...toCollection(row),
    updatedAt: row.updatedAt.toISOString(),
    deleted: row.deletedAt != null,
  };
}
