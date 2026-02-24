# Tournoi d'echecs universitaire

Plateforme Next.js + Supabase pour un tournoi hebdomadaire d'echecs universitaire. Interface sombre, tirage automatique, swiss dynamique, finance, audit, ELO, et dashboard admin.

## Demarrage

1. Copier `.env.example` vers `.env.local` et remplir les valeurs.
2. Creer les tables Supabase avec `db/schema.sql` puis activer les policies avec `db/policies.sql`.
3. Lancer `npm install` puis `npm run dev`.

## Pages principales

- `/` accueil
- `/register` inscription joueur (paiement M-Pesa RDC + validation admin)
- `/dashboard` espace joueur + stats ELO
- `/tournament` bracket live
- `/leaderboard` classement general ELO
- `/admin` console admin
- `/admin/tournaments` creation de tournoi (sans SQL)

## API principales

- `POST /api/registrations` creer une inscription (payment pending, method mpesa)
- `POST /api/admin/registrations/validate` valider paiement
- `POST /api/admin/draw` generer poules / swiss
- `POST /api/admin/score` valider un score + appliquer ELO
- `POST /api/admin/advance` generer round suivant
- `POST /api/admin/tournaments/create` creer un tournoi
- `GET /api/admin/finance/export` exporter CSV
- `POST /api/admin/notifications/send` envoyer notifications
- `POST /api/admin/awards` generer top 3 mensuel
- `GET /api/admin/metrics` afficher les metriques d'equite
- `POST /api/admin/ban` bannir un joueur
- `GET /api/bracket` recuperer le bracket
- `GET /api/leaderboard` recuperer le classement
- `GET /api/player/stats` stats joueur
- `GET /api/tournament` info tournoi + horaires

## Dossiers principaux

- `app/` pages Next.js + API routes.
- `components/` UI kit sombre + bracket + stats.
- `lib/` logique de tournoi, swiss, finance, audit, ELO.
- `db/` schema SQL + policies RLS.

## Horaires

- Inscriptions : Lundi 00h00 -> Vendredi 22h00.
- Publication liste : Jeudi 11h00.
- Tournoi : Samedi 11h00 -> 16h00.
- Pause : 13h00 -> 13h30.

## Paiement (M-Pesa RDC)

Le flux actuel est : paiement M-Pesa par le joueur + validation admin. L'integration directe M-Pesa (API provider) peut etre branchee sur la table `payments` et les endpoints existants.
# tournoi--checs
