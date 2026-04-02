# Chaos Pizza API

Simple pizza delivery API.

## Prérequis

- Node.js (version>=16) et `npm`

## Installation

Installez les dépendances :

```
npm install
```

## Démarrer l'API

Lancer le serveur en local :

```
npm start
```

Le serveur écoute sur le port configuré dans `index.js` (par défaut 3000 si présent).

## Exécuter les tests de non-régression

La suite de tests utilise Jest :

```
npm test
```


## Lancer le script de montée en charge

Le projet intègre Artillery pour les tests de montée en charge :

```
npm run load-test
```

Cela exécute le scénario défini dans `loadtest.yml`.


## Remarques

Ayant travaillé sur github, l'équivalent du fichier "gitlab-ci.yml" est "build.yml" dans "/.github/workflows".