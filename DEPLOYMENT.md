# Deploiement et actions restantes

Ce fichier liste les etapes restantes pour faire tourner le projet en local puis le deployer (Vercel + Supabase).

## 1) Pre-requis
- Node.js 18+
- Compte Supabase
- Compte Vercel

## 2) Configuration Supabase
1. Creer un projet Supabase.
2. Dans `SQL Editor`, executer le schema :
   - `/Users/hello/Downloads/tournoi/db/schema.sql`
3. Ensuite, executer les policies RLS :
   - `/Users/hello/Downloads/tournoi/db/policies.sql`
4. Activer l'auth email/password (Auth -> Providers).
5. (Optionnel) Configurer SMTP si vous voulez des emails reels (Auth -> SMTP ou provider externe).

### Creer un admin
Apres avoir cree un compte via l'app :
```sql
update public.users set role = 'admin' where email = 'admin@votre-domaine.com';
```

### Creer un tournoi hebdomadaire (optionnel)
Si vous ne souhaitez pas passer par l'UI admin :
```sql
insert into public.tournaments (date, status, format)
values (current_date + 5, 'registration', 'pools');
```

## 3) Variables d'environnement
Copier `.env.example` vers `.env.local` puis remplir :
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
CRON_SECRET=
```

## 4) Lancer en local
```bash
npm install
npm run dev
```
Puis ouvrir `http://localhost:3000`.

## 5) Deploiement sur Vercel
1. Pousser le repo sur GitHub.
2. Importer le projet dans Vercel.
3. Ajouter les variables d'environnement (les memes que `.env.local`).
4. Build Command: `npm run build`
5. Output: `.next`
6. Deployer.

## 6) Paiement M-Pesa RDC
Le projet est pret pour un flux M-Pesa (paiement joueur + validation admin).
Pour une integration directe, il faut :
- Choisir le fournisseur M-Pesa RDC (Vodacom direct ou agregateur)
- Ajouter les credentials API
- Ajouter un webhook de callback

Dites-moi le provider choisi pour brancher l'API.

## 7) Automation hebdo (creation automatique)
Deux options :
- Vercel Cron : appeler `/api/admin/tournaments/create?secret=CRON_SECRET` chaque lundi a 00h05.
- Ou automatisation externe qui POST sur le meme endpoint.

Important : l'endpoint accepte le secret via `?secret=` ou header `x-cron-secret`.

## 8) Verification rapide
- `/register` : inscription ouverte
- `/admin` : acces admin
- `/admin/tournaments` : creation tournoi
- `/tournament` : bracket live
- `/leaderboard` : classement ELO

## 9) Notes importantes
- Le calcul ELO est applique quand un match passe a `completed` / `draw` / `forfeit`.
- La prevention de double application ELO est geree par `matches.elo_applied`.
- Les scores sont verrouilles quand le round suivant est genere.
- La configuration des emails est optionnelle : si SMTP non renseigne, les emails ne sont pas envoyes.
