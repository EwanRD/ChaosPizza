# Grille d’analyse — Tests de charge Chaos Pizza (Avant changement)

## Objectif
Ce document présente les performances initiales de l’API avant optimisation.

---

# 1. Configuration du test

| Élément | Valeur |
|--------|--------|
| Route testée | POST /orders |
| Nombre total de requêtes | 100 |
| Durée du test | 5s |
| Taux de requêtes (req/sec) | 20/sec |
| Nombre d'utilisateurs simulés | 100 |

---

# 2. Résultats globaux

## Temps de réponse

| Indicateur | Valeur | Interprétation |
|-----------|--------|----------------|
| Min | 1ms | Requêtes rejetées immédiatement (400) |
| Moyenne | 4ms | Tirée vers le bas par les nombreux 400 rapides |
| Médiane | 2ms | 50% des requêtes répondent en moins de 2ms |
| p95 | 10.1ms | 95% des requêtes répondent en moins de 10ms |
| p99 | 13.1ms | 99% des requêtes répondent en moins de 13ms |
| Max | 42ms | Pic sur les requêtes 200 qui touchent la base |

### Questions

- Les temps de réponse sont-ils **stables** ?  
  Non — il y a deux populations très distinctes : les 400 (≈2ms) et les 200 (≈10ms), ce qui crée une forte disparité.

- Y a-t-il une grande différence entre moyenne et p95 ?  
  Oui : moyenne à 4ms, p95 à 10.1ms — x2.5. L'écart s'explique par les 73% de 400 qui tirent la moyenne vers le bas.

- Certaines requêtes sont-elles **beaucoup plus lentes que les autres** ?  
  Oui. Les requêtes 200 (avec accès base de données : SELECT + UPDATE + INSERT) sont 6x plus lentes que les 400 rejetées sans accès base.

---

## Erreurs

| Indicateur | Valeur |
|-----------|--------|
| Nombre d'erreurs | 73 (HTTP 400) |
| Taux de succès (%) | 27% |

### Questions

- Y a-t-il des erreurs ?  
  Oui — 73 erreurs 400 sur 100 requêtes.

- Si oui, à quel moment apparaissent-elles ?  
  Dès le début du test, en concurrence avec les premières requêtes réussies. Le stock de 50 Margheritas est épuisé rapidement, mais seulement 27 commandes ont réussi au lieu de 50 attendues — signe d'une race condition : plusieurs requêtes lisent le même stock simultanément avant qu'il soit décrémenté.

- Le système reste-t-il fiable sous charge ?  
  Partiellement. Le serveur ne crashe pas (vusers.failed: 0), mais la logique métier ne supporte pas les accès concurrents : 23 commandes qui auraient dû passer ont été rejetées à tort.

---

## Débit

| Indicateur | Valeur |
|-----------|--------|
| Requests/sec | 20/sec |
| Total requêtes | 100 |

### Questions

- Le système tient-il le débit demandé ?  
  Oui — les 100 requêtes ont bien été traitées au rythme de 20/sec sans perte ni timeout.

- Observe-t-on un ralentissement progressif ?  
  Non — les temps de réponse restent constants tout au long du test.

---

# 3. Analyse du comportement

## Évolution dans le temps

- Le temps de réponse :
  - ☐ reste stable  
  - ☐ augmente  
  - ☑ fluctue fortement  

Deux comportements coexistent selon le type de réponse. Les 400 répondent en 1–3ms de façon très stable (rejet immédiat sans base de données). Les 200 varient entre 8ms et 42ms selon la contention SQLite. La session_length (temps total par utilisateur) présente un écart important entre la médiane (6.5ms) et le p95 (44.3ms), ce qui suggère que certaines requêtes attendent un verrou base de données pendant que d'autres écritures sont en cours.
