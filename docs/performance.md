Problème identifié
------------------

Une condition de concurrence (race condition) sur le stock de pizzas Margherita entraîne de nombreux rejets (HTTP 400) lors de tests de charge. Plusieurs requêtes lisent simultanément le même stock avant qu'il ne soit décrémenté, ce qui provoque des commandes incorrectement refusées alors que le stock existait au moment de la lecture.

Analyse des métriques
---------------------

- Avant optimisation (résumé des tests avant) :
  - Total requêtes : 100
  - Durée test : 5s, débit ~20 req/sec
  - Erreurs : 73 (HTTP 400) — taux de succès 27%
  - Temps de réponse : min 1 ms (400 rapides), moyenne 4 ms, médiane 2 ms, p95 10.1 ms, p99 13.1 ms, max 42 ms
  - Observation : deux populations distinctes (400 très rapides sans accès BD et 200 plus lentes avec accès BD). Contention SQLite visible (pics jusqu'à 42 ms).

- Après optimisation (résumé des tests après) :
  - Route testée : Acheter une pizza (Margherita)
  - Total requêtes : 100
  - Durée test : 7s, débit ~31 req/sec
  - Erreurs : 0 — taux de succès 100%
  - Temps de réponse : min 4 ms, moyenne 4.6 ms, médiane 5 ms, p95 5 ms, p99 6 ms, max 6 ms
  - Observation : latences très stables (4–6 ms), pas de contention observable.

Interprétation
--------------

La forte proportion de 400 dans l'état initial masque la latence réelle des requêtes qui accèdent à la base. Les rejets massifs montrent que la logique de décrémentation du stock n'est pas atomique et ne supporte pas l'accès concurrent. Après correction, les erreurs disparaissent et les temps de réponse se stabilisent, confirmant que la contention était la cause majeure.

Solution proposée
-----------------

Recommandations pour corriger la race condition et améliorer la fiabilité :

- Utiliser une opération atomique côté base de données pour décrémenter le stock : ex. `UPDATE pizzas SET stock = stock - 1 WHERE id = ? AND stock > 0` puis vérifier le nombre de lignes affectées. Accepter la commande seulement si l'UPDATE a touché 1 ligne.
- Encapsuler la logique dans une transaction courte et/ou utiliser un verrou de type `BEGIN IMMEDIATE` (ou mode WAL pour SQLite) si nécessaire.
- Option alternative : appliquer un verrou optimiste (versioning) ou déplacer la gestion du stock vers un composant dédié (fila FIFO ou service de décompte) pour gros trafics.
- Ajouter des essais automatisés de charge (smoke/load tests) dans la CI pour détecter régressions concurrentes.

Résultats — avant / après
-------------------------

Avant (extraits) :

- Total requêtes : 100
- Erreurs : 73 (HTTP 400) — taux de succès 27%
- Temps : min 1 ms, moyenne 4 ms, médiane 2 ms, p95 10.1 ms, p99 13.1 ms, max 42 ms

Après (extraits) :

- Total requêtes : 100
- Erreurs : 0 — taux de succès 100%
- Temps : min 4 ms, moyenne 4.6 ms, médiane 5 ms, p95 5 ms, p99 6 ms, max 6 ms

Conclusions et prochaines étapes
--------------------------------

- La correction de la mise à jour atomique du stock élimine les échecs et réduit fortement la variance des temps de réponse.
- Prioriser l'implémentation SQL atomique (UPDATE ... WHERE stock > 0) et ajouter des tests de charge en CI.
- Surveillez en production les p95/p99 et le taux d'erreurs après déploiement; si nécessaire, envisager une architecture dédiée pour le comptage de stock.
