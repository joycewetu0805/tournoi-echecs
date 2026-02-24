# Plan de tests (phases + responsive)

## 0) Setup rapide
- Variables `.env.local` avec `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Un compte admin (role=admin).
- Un tournoi actif en `status=registration`.

## 1) Phase Inscription (Registration)
1. Ouvrir `/register`.
2. Soumettre le formulaire.
3. Attendu:
   - Enregistrement dans `registrations` (pending).
   - Enregistrement dans `payments` (method mpesa, status pending).
   - Email de confirmation si SMTP configure.

## 2) Phase Validation paiement
1. Admin -> `/admin`.
2. Valider un paiement (API `POST /api/admin/registrations/validate`).
3. Attendu:
   - `payments.status = validated`.
   - `registrations.payment_status = validated`.
   - Audit log cree.

## 3) Phase Tirage (Pools/Round Robin/Swiss)
1. Admin appelle `POST /api/admin/draw`.
2. Attendu:
   - `tournaments.status = pool`.
   - Groupes crees.
   - Matchs de poules ou swiss round 1 crees.

## 4) Phase Poules (Pool)
1. Admin saisit les scores via `POST /api/admin/score`.
2. Attendu:
   - `matches.status = completed`.
   - `standings` mis a jour.
   - ELO mis a jour et `elo_history` rempli.

## 5) Phase Swiss (si activee)
1. Terminer tous les matchs du round.
2. Appeler `POST /api/admin/advance`.
3. Attendu:
   - Round suivant cree.
   - Matchs precedents verrouilles.

## 6) Phase Knockout
1. Appeler `POST /api/admin/advance` apres poules.
2. Attendu:
   - Quarts generes.
   - Verrouillage des matchs de poule.

## 7) Demi / Finale
1. Saisir scores des quarts.
2. `POST /api/admin/advance` (round_type: quarter -> semi).
3. Saisir scores des demis.
4. `POST /api/admin/advance` (round_type: semi -> final).
5. Saisir score finale.
6. `POST /api/admin/advance` (round_type: final).
7. Attendu:
   - `tournaments.status = finished`.

## 8) Classement ELO
1. Ouvrir `/leaderboard`.
2. Attendu:
   - Liste triee par ELO.
   - Donnees mises a jour.

## 9) Stats joueur
1. Ouvrir `/dashboard`.
2. Attendu:
   - Stats (wins/loses/draws) visibles.
   - Courbe ELO affichee.

## 10) Finance
1. Appeler `GET /api/admin/finance/export?month=...&year=...`.
2. Attendu:
   - CSV genere.
   - Calcul prize pool correct.

## 11) Notifications
1. Apres inscription, validation paiement, tirage, score.
2. Attendu:
   - Envoi d'email si SMTP configure.

## 12) Ban
1. Admin appelle `POST /api/admin/ban`.
2. Attendu:
   - `users.banned_until` mis a jour.
   - Acces bloque si date future.

---

# Tests responsive (mobile / tablette / desktop)

## Mobile (360x640)
- `/` : boutons empiles, pas de debordement.
- `/register` : cards stackees.
- `/dashboard` : timeline scrollable horizontal.
- `/tournament` : header empile + bracket scrollable.
- `/leaderboard` : table scrollable horizontal.
- `/admin` : boutons empiles + table scrollable.

## Tablette (768x1024)
- Toutes les pages doivent garder une mise en page a 2 colonnes si prevu.
- Boutons restes lisibles et non coupes.

## Desktop (1280x800)
- Layouts complets, cards alignees, pas d'espaces excessifs.
