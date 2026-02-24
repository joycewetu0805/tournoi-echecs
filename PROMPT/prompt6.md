PROMPT 6 — SÉCURITÉ & AUDIT

“Ajoute un système de sécurité avancé au projet tournoi d’échecs.

Exigences :
	•	Middleware de protection par rôle (USER / ADMIN)
	•	Vérification serveur obligatoire pour toute action admin
	•	Protection contre double inscription
	•	Validation stricte côté backend (pas seulement frontend)
	•	Journalisation complète des actions admin (validation paiement, modification score, génération tirage)

Créer une table audit_logs :
(id, admin_id, action_type, target_id, timestamp, details_json)

Empêcher toute modification d’un match une fois le round suivant généré.
Prévoir protection contre manipulation API (rate limit, token validation Supabase).

Fournis code complet des middlewares + policies Supabase.”