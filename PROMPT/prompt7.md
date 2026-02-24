PROMPT 7 — SYSTÈME ELO & STATISTIQUES

“Implémente un système de classement ELO interne pour les joueurs.

Exigences :
	•	ELO initial : 1200
	•	Calcul automatique après chaque match validé
	•	Mise à jour dynamique dans la table users
	•	Historique des variations ELO dans table elo_history

Formule standard :
NewRating = OldRating + K * (Score - ExpectedScore)

K variable :
	•	Nouveau joueur : 40
	•	Stable : 20

Ajouter :
	•	Page classement général
	•	Statistiques joueur (victoires, défaites, ratio, progression graphique)

Permettre génération du tirage :
	•	aléatoire
	•	ou semi-seed basé sur ELO.”