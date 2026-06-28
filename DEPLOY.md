# Déploiement sur Render

`hymes-web` se déploie comme **Blueprint** Render (lecture de `render.yaml`).

## 1. Créer le service (Blueprint)

1. Aller sur https://dashboard.render.com → **New** ▸ **Blueprint**.
2. Connecter GitHub et choisir le dépôt **`Ulrich75/hymes-web`** (branche `main`).
3. Render lit `render.yaml` et propose le service **hymes-web** (Frankfurt, plan free).
4. Cliquer **Apply**.

## 2. Renseigner les variables d'environnement

Les variables marquées `sync: false` doivent être saisies manuellement
(Render ne les lit pas depuis le repo, pour la sécurité). Copier les valeurs
**depuis ton fichier `.env` local** :

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env` (secret) |
| `DATABASE_URL` | `.env` (pooler, port 6543, `?pgbouncer=true`) |
| `DIRECT_URL` | `.env` (direct, port 5432) |
| `ADMIN_PASSWORD` | `.env` (mot de passe du login web) |
| `ADMIN_TOKEN` | `.env` (jeton Bearer API, secret) |

> `NODE_VERSION` est déjà fixé dans `render.yaml`.

## 3. Déployer

- Render lance `npm install && npm run build` puis `npm run start`.
- Health check : `GET /api/health` (doit répondre `{"status":"ok","db":"ok"}`).

## 4. Vérifier en ligne

```
GET https://<app>.onrender.com/api/health
GET https://<app>.onrender.com/api/sync/manifest   # 40 hymns / 4 collections
https://<app>.onrender.com/login                   # mot de passe = ADMIN_PASSWORD
```

## Notes

- Le schéma a déjà été poussé via `npm run db:push` ; aucune migration n'est
  exécutée au build. En cas de changement de schéma : relancer `db:push` en local.
- Plan **free** : le service se met en veille après inactivité (premier accès
  plus lent). Passer à un plan payant pour éviter le cold start.
- `autoDeploy: true` : chaque push sur `main` redéploie automatiquement.
