# Vision générale du projet

Notre objectif n’est pas d’essayer d’atteindre les 14 points trop vite.

Notre objectif est de construire le projet par étapes :

* d’abord une base simple et solide
* ensuite un vrai premier jeu jouable
* ensuite un socle mandatory propre
* puis ajouter progressivement les modules qui rapportent des points

L’idée est d’avancer de manière réaliste, sans se noyer au début, tout en gardant en tête les 14 points minimum à atteindre à la fin du projet.

---

# Projection des sprints

## Sprint 1 — Base technique

### Objectif

Poser la base minimale du projet pour que tout le monde comprenne la stack et puisse commencer à travailler proprement.

### Ce qu’on veut obtenir

* frontend React minimal
* backend NestJS minimal
* communication simple frontend ↔ backend
* Dockerfiles de base
* docker-compose minimal
* repo vivant avec branches et pull requests

### Résultat attendu

On peut lancer le projet, voir une page simple, appeler le backend, et comprendre globalement comment le projet est structuré.

### Pourquoi ce sprint est important

Ce sprint ne rapporte pas encore directement de points “module”, mais il prépare toute la suite.
C’est le socle sur lequel reposera le mandatory puis les modules.

---

## Sprint 2 — Premier vrai morceau visible

### Objectif

Commencer à voir le projet ressembler à un vrai produit.

### Ce qu’on veut obtenir

* page du morpion locale
* structure UI plus propre
* composants React plus clairs
* premières bases d’API propres côté backend
* début de réflexion sur la structure des parties

### Résultat attendu

On a déjà une première expérience utilisateur concrète : une page de jeu locale, même simple.

### Pourquoi ce sprint motive

À partir d’ici, le projet commence à devenir “réel”.
On ne fait plus seulement du setup, on commence à voir le morpion prendre forme.

---

## Sprint 3 — Mandatory solide

### Objectif

Construire le cœur technique obligatoire du projet.

### Ce qu’on veut obtenir

* authentification de base
* gestion des utilisateurs
* base de données branchée
* validation des entrées
* profil simple
* structure propre backend / frontend / DB

### Résultat attendu

Le projet ne sera plus juste une démo technique : il commencera à avoir un vrai socle applicatif.

### Pourquoi ce sprint est stratégique

C’est à partir de là qu’on sécurise le mandatory, ce qui est indispensable avant de courir après les modules.

---

## Sprint 4 — Premiers points réellement validables

### Objectif

Transformer notre stack en premiers modules concrets qui comptent dans l’évaluation.

### Modules visés

* **Web major** : utilisation d’un framework frontend + backend
* **ORM minor** : si Prisma ou TypeORM est bien intégré

### Ce que ça représente

* React + NestJS bien intégrés = **Web major**
* ORM bien branché à Postgres = **ORM minor**

### Total probable à ce stade

**3 points**

### Pourquoi ce sprint compte beaucoup

C’est le moment où l’architecture choisie commence enfin à “rapporter” des points.

---

## Sprint 5 — Premier gros module jeu

### Objectif

Avoir un morpion jouable proprement sur le web.

### Module visé

* **Web-based game major** = **+2 points**

### Ce qu’on veut obtenir

* une partie jouable
* règles claires
* détection victoire / nul
* expérience utilisateur correcte
* intégration propre dans l’application

### Total probable à ce stade

**5 points**

### Pourquoi ce sprint est motivant

À ce moment-là, on peut dire qu’on a déjà un vrai jeu fonctionnel dans notre projet.

---

## Sprint 6 — Jeu à distance

### Objectif

Passer du jeu local au jeu entre joueurs distants.

### Module visé

* **Remote players major** = **+2 points**

### Ce qu’on veut obtenir

* deux joueurs à distance
* synchronisation correcte de la partie
* base du temps réel ou de la communication de jeu
* expérience stable

### Total probable à ce stade

**7 points**

### Pourquoi ce sprint est important

Le projet devient beaucoup plus proche de l’esprit de transcendence : interaction réelle entre utilisateurs.

---

## Sprint 7 — Modules rentables et cohérents

### Objectif

Ajouter des modules qui s’intègrent bien au projet sans casser l’architecture.

### Modules envisagés

* **Tournament system minor** = **+1**
* **Game statistics minor** = **+1**
* **OAuth minor** ou **2FA minor** = **+1**

### Total probable à ce stade

**10 points**

### Pourquoi ce sprint est intelligent

On ne choisit pas des modules au hasard : on prend des modules qui renforcent ce qu’on a déjà construit.

---

## Sprint 8 — Passage au seuil des 14 points

### Objectif

Atteindre ou dépasser le seuil demandé avec des modules cohérents.

### Exemples de modules possibles

* **Real-time features major** = **+2**
* **PWA minor** = **+1**
* **Multiple languages minor** = **+1**

### Résultat probable

On atteint ou dépasse les **14 points**.

### Pourquoi ce sprint est décisif

Ce sprint sert à transformer un bon projet en projet réellement validable avec assez de marge.

---

# Résumé simple à montrer au groupe

## Phase 1 — Construire la base

* Sprint 1 : base technique
* Sprint 2 : première version du morpion
* Sprint 3 : mandatory solide

## Phase 2 — Commencer à gagner des points

* Sprint 4 : Web major + ORM minor
* Sprint 5 : Web-based game major
* Sprint 6 : Remote players major

## Phase 3 — Aller chercher les 14 points

* Sprint 7 : tournoi, stats, OAuth ou 2FA
* Sprint 8 : temps réel, PWA, langues, ou autres modules cohérents

---

# L’idée est :

* de poser une base simple
* de monter progressivement en difficulté
* de garder du temps pour apprendre
* d’éviter de casser le projet trop tôt
* et de construire un projet qui reste propre jusqu’à la fin

En avançant comme ça, on garde une trajectoire réaliste :
**base → jeu → mandatory → modules → 14 points**

---

# consclusion

> Sprint 1 sert à poser la base technique.
> Sprint 2 commence le morpion local.
> Sprint 3 solidifie le mandatory avec auth, users et DB.
> Sprint 4 nous donne les premiers points avec React + NestJS + ORM.
> Sprint 5 et 6 transforment le projet en vrai jeu web jouable à distance.
> Sprint 7 et 8 ajoutent les modules complémentaires pour atteindre ou dépasser 14 points.
