# 1. Configuration du test

| Élément | Valeur |
|--------|--------|
| Route testée | Acheter une pizza (Margherita) |
| Nombre total de requêtes | 100 |
| Durée du test | 7 secondes |
| Taux de requêtes (req/sec) | ~31 req/sec |
| Nombre d’utilisateurs simulés | 100 |

---

# 2. Résultats globaux

## Temps de réponse

| Indicateur | Valeur | Interprétation |
|-----------|--------|----------------|
| Min | 4 ms | Très rapide |
| Moyenne | 4.6 ms | Très bonne performance |
| Médiane | 5 ms | Stable |
| p95 | 5 ms | Peu de variations |
| p99 | 6 ms | Quelques pics légers |
| Max | 6 ms | Aucun ralentissement critique |

### Questions

- Les temps de réponse sont-ils **stables** ?  
→ Oui, très stables (entre 4 et 6 ms)

- Y a-t-il une grande différence entre moyenne et p95 ?  
→ Non, elles sont quasiment identiques

- Certaines requêtes sont-elles **beaucoup plus lentes que les autres** ?  
→ Non, les écarts sont très faibles

---

## Erreurs

| Indicateur | Valeur |
|-----------|--------|
| Nombre d’erreurs | 0 |
| Taux de succès (%) | 100% |

### Questions

- Y a-t-il des erreurs ?  
→ Non

- Si oui, à quel moment apparaissent-elles ?  
→ Aucune erreur observée

- Le système reste-t-il fiable sous charge ?  
→ Oui, totalement fiable dans ce test

---

## Débit

| Indicateur | Valeur |
|-----------|--------|
| Requests/sec | ~31 req/sec |
| Total requêtes | 100 |

### Questions

- Le système tient-il le débit demandé ?  
→ Oui, sans difficulté

- Observe-t-on un ralentissement progressif ?  
→ Non, les performances restent constantes

---

# 3. Analyse du comportement

## Évolution dans le temps

- Le temps de réponse :
  - ☑ reste stable  
  - ☐ augmente  
  - ☐ fluctue fortement  

**Description :**  
Le temps de réponse reste très stable sur toute la durée du test. On observe une légère variation (4 à 6 ms), mais aucune dégradation avec la montée en charge. Le système absorbe parfaitement le pic de requêtes ("ruée") sans impact visible sur les performances.
