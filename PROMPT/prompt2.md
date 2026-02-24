PROMPT 2 — MODÈLE DE BASE DE DONNÉES

“Crée un schéma PostgreSQL optimisé pour un système de tournoi d’échecs hebdomadaire.

Tables nécessaires :
users (role: user/admin)
tournaments (date, status: registration/pool/knockout/finished)
registrations (user_id, tournament_id, payment_status: pending/validated)
groups (tournament_id, name)
matches (round_type: pool/quarter/semi/final, player1_id, player2_id, score, winner_id)
standings (points, tie_break)

Contraintes :
	•	Un utilisateur ne peut s’inscrire qu’une fois par tournoi
	•	Seuls les registrations validées participent au tirage
	•	Le système doit pouvoir générer automatiquement :
	•	poules si 9–16 joueurs
	•	round robin si 6–8 joueurs

Ajoute index, clés étrangères, relations propres.”
