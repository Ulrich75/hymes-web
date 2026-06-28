/**
 * Seed de la base Supabase à partir des données de l'app mobile.
 *
 * Les fichiers de données du mobile (HYMNES-/src/data/*) sont du TS pur
 * (aucun import React Native), donc importables ici via tsx.
 *
 * Prérequis :
 *   1. DATABASE_URL / DIRECT_URL configurés dans .env (pointant sur Supabase)
 *   2. Schéma poussé :  npm run db:push
 * Lancement :
 *   npm run db:seed
 *
 * NB : ce script dépend du dossier voisin HYMNES- et n'est exécuté qu'en local
 * (jamais pendant le build Render). Il est exclu du typecheck Next (tsconfig).
 */
import { PrismaClient } from '@prisma/client';
import { ALL_HYMNS } from '../../HYMNES-/src/data';
import { COLLECTIONS } from '../../HYMNES-/src/data/collections';

const prisma = new PrismaClient();

async function main() {
  for (const c of COLLECTIONS) {
    await prisma.collection.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        nom: c.nom,
        langue: c.langue,
        couleur: c.couleur,
        emoji: c.emoji,
        description: c.description,
        deletedAt: null,
      },
      update: {
        nom: c.nom,
        langue: c.langue,
        couleur: c.couleur,
        emoji: c.emoji,
        description: c.description,
        deletedAt: null,
      },
    });
  }

  for (const h of ALL_HYMNS) {
    const data = {
      numero: h.numero,
      titre: h.titre,
      collectionId: h.collection_id,
      auteur: h.auteur ?? null,
      versets: h.versets,
      audio: h.audio ?? undefined,
      deletedAt: null,
    };
    await prisma.hymn.upsert({
      where: { id: h.id },
      create: { id: h.id, ...data },
      update: data,
    });
  }

  await prisma.appMeta.upsert({
    where: { id: 1 },
    create: { id: 1, dataVersion: 1 },
    update: {},
  });

  console.log(`✅ Seed terminé : ${COLLECTIONS.length} collections, ${ALL_HYMNS.length} cantiques.`);
}

main()
  .catch((e) => {
    console.error('❌ Échec du seed :', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
