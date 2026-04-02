# Grille d’analyse — Tests de charge Chaos Pizza (BASELINE)

## Objectif
Ce document présente les performances initiales de l’API avant optimisation.

---

# 1. Configuration du test

| Élément | Valeur |
|--------|--------|
| Route testée | POST /orders |
| Nombre total de requêtes | 1500 |
| Durée du test | 30 secondes |
| Taux de requêtes | 50 req/sec |
| Nombre d’utilisateurs simulés | 1500 |

---

# 2. Résultats globaux

## Temps de réponse

| Indicateur | Valeur | Interprétation |
|-----------|--------|----------------|
| Min | 320 ms | Temps minimal correct |
| Moyenne | 425 ms | Dégradation sous charge |
| Médiane | 407 ms | Proche de la moyenne |
| p95 | 572 ms | Requêtes lentes visibles |
| p99 | 658 ms | Forte variabilité |
| Max | 732 ms | Pics importants |

---

### Analyse

- Les temps de réponse **augmentent sous charge**
- L’écart entre moyenne et p95 est significatif
- Certaines requêtes sont **beaucoup plus lentes que d’autres**

👉 Le système est **instable en performance**

---

## Erreurs

| Indicateur | Valeur |
|-----------|--------|
| Nombre d’erreurs | 0 |
| Taux de succès | 100% |

---

### Analyse

- Aucune erreur détectée
- Le système reste fonctionnel malgré la charge

👉 MAIS : la performance se dégrade

---

## Débit

| Indicateur | Valeur |
|-----------|--------|
| Requests/sec | 50 |
| Total requêtes | 1500 |

---

### Analyse

- Le système tient le débit demandé
- Mais avec une dégradation des temps de réponse

---

# 3. Analyse du comportement

## Évolution dans le temps

- ☑ augmente  
- ☑ fluctue  

### Observation

- Début : ~410 ms
- Pic : ~498 ms
- Fin : ~370 ms

👉 Le système montre des signes de **saturation temporaire**

---

## Variabilité

- ☑ non

### Observation

- Certaines requêtes sont 2x plus lentes que d’autres

👉 Le système n’est **pas homogène**

---

# 🔍 4. Identification des problèmes

## Symptômes observés

- ☑ Latence élevée
- ☑ Latence instable
- ☑ Pics de lenteur (p95/p99 élevés)
- ☐ Débit limité
- ☐ Erreurs sous charge
- ☑ Comportement variable

---

## Hypothèses techniques

- ☑ Boucle inutile
- ☑ Recalcul global à chaque requête
- ☑ Accès base de données inefficace
- ☑ Code synchrone bloquant
- ☑ Logique métier complexe (promotions)

---

# 5. Conclusion (baseline)

👉 L’API est :

- fonctionnelle
- stable (pas d’erreurs)
- mais **non optimisée**
