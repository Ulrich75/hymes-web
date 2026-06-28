# hymes-web

Console d'administration et **API de synchronisation** des cantiques pour l'application mobile **Hymnes & Louanges**.

🌐 **En production** : https://hymes-web.onrender.com

- **Stack** : Next.js (App Router) + TypeScript
- **Base de données** : Supabase (PostgreSQL) via Prisma + Supabase Storage (audio, à venir)
- **Hébergement** : Render

## Rôle

`hymes-web` est la **source de vérité** des données. L'app mobile (offline-first) télécharge
les cantiques au 1er lancement puis se synchronise (delta) quand une connexion est disponible.

## Architecture des routes API

| Méthode | Route | Rôle |
|--------|-------|------|
| GET | `/api/health` | Sonde de disponibilité (Render) |
| GET | `/api/sync/manifest` | Version des données + version d'app à proposer |
| GET | `/api/hymns?since=ISO` | Cantiques (complet, ou delta depuis `since`) |
| GET | `/api/collections?since=ISO` | Collections (complet ou delta) |
| GET/POST/PUT/DELETE | `/api/admin/hymns` | CRUD cantiques (auth) |
| GET | `/api/admin/export` | Backup JSON complet (auth) |

> Auth admin **Phase 1** : en-tête `Authorization: Bearer <ADMIN_TOKEN>` (temporaire).
> Sera remplacée par une vraie auth en Phase 3.

## Synchronisation — principe

- Chaque `Hymn`/`Collection` porte `updatedAt` et `deletedAt` (soft-delete).
- `AppMeta.dataVersion` est incrémenté à chaque écriture admin.
- Le mobile compare son `dataVersion`/`since` local au manifest et ne récupère que le delta.

## Démarrage local

```bash
cp .env.example .env        # puis renseigner les valeurs Supabase
npm install
npm run db:push             # crée les tables dans Supabase
npm run db:seed             # importe les 40 cantiques depuis ../HYMNES-/src/data
npm run dev                 # http://localhost:3000
```

## Variables d'environnement

Voir `.env.example`. À configurer aussi dans le dashboard Render.

## Déploiement Render

Le fichier `render.yaml` décrit le service. Build : `npm install && npm run build`.
Start : `npm run start`. Renseigner les variables d'environnement Supabase dans Render.

## Console d'administration

- `/admin/login` — connexion (mot de passe = `ADMIN_TOKEN`)
- `/admin` — tableau de bord (compteurs, version des données, backup)
- `/admin/hymns` — liste, recherche, filtre par collection, suppression
- `/admin/hymns/new` · `/admin/hymns/[id]` — formulaire (versets dynamiques + audio)
- `/admin/collections` — CRUD des collections

Le middleware protège `/admin/*` (cookie de session `admin_session`, httpOnly).
Les routes `/api/admin/*` valident le cookie **ou** un en-tête `Authorization: Bearer <ADMIN_TOKEN>`.

## Phases du projet

1. ✅ Scaffold (structure, schéma, routes API)
2. ✅ Seed Supabase (40 cantiques, 4 collections) + synchro testée
3. ✅ UI admin (login + CRUD cantiques/collections + backup)
4. ✅ API de synchro + export backup (en place et testée)
5. ✅ Déployé sur Render (https://hymes-web.onrender.com) et vérifié en live
6. Refactor mobile (seed + NetInfo + synchro delta, retrait de l'admin) — **prochaine étape**
7. Mise à jour app (expo-updates OTA + lien store)
8. Audio (Supabase Storage + offline)
