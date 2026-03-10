# Réunion de préparation — Sprint 1

## But du Sprint 1

Le but du Sprint 1 n’est pas encore de faire le vrai jeu, ni l’auth, ni la base de données complète.

Le but est de construire une **base propre, minimale et solide** pour que tout le monde puisse :

* comprendre un peu la stack
* contribuer sans se perdre
* lancer le projet facilement
* voir déjà le frontend et le backend communiquer
* garder du temps pour apprendre React, NestJS, TypeScript, Docker

À la fin du Sprint 1, on veut pouvoir montrer :

* un frontend React qui s’affiche
* un backend NestJS qui répond
* un `docker compose up --build` qui lance le projet
* une communication simple frontend ↔ backend
* un repo propre, vivant, avec des PR et des branches claires

---

# Ce qu’on construit pendant Sprint 1

## Résultat attendu

On veut une base minimale avec :

* **frontend** : page simple avec “Hello from frontend”
* **backend** : route simple qui répond “Hello from backend”
* **liaison** : un bouton côté frontend qui appelle le backend
* **infra** : Dockerfile frontend, Dockerfile backend, docker-compose minimal
* **documentation** : README simple pour lancer le projet

---

# Architecture minimale du projet

```txt
ft_transcendence/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   └── api/
│   │       └── hello.ts
│   └── ...
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   └── app.service.ts
│   └── ...
├── docker-compose.yml
├── .env.example
└── README.md
```

## Flux minimal

```txt
Navigateur
   ↓
Frontend React
   ↓ fetch /hello
Backend NestJS
   ↓
Réponse texte JSON ou string
```

---

# Les rôles à choisir

* **infra** : Dockerfile frontend, Dockerfile backend, docker-compose minimal
* **frontend** : page simple avec “Hello from frontend” => front 1
* **backend** : route simple qui répond “Hello from backend” => back 2
* **liaison** : un bouton côté frontend qui appelle le backend => back + front 3
* **documentation** : README simple pour lancer le projet 4


jordan = doc
nico   = back 2
nassim = back + front 3
simo   = front 1


L’infra est déjà connue, donc il reste :
* Infra = Andrew
* Dev 1 = simo
* Dev 2 = nico
* Dev 3 = nassim
* Dev 4 = jordan

L’idée n’est pas de faire des rôles trop rigides.
Le but est que les 4 dev touchent à des choses utiles sans que ce soit lourd.

---

# Rôle INFRA

## Ce que fait l’infra

* préparer `Dockerfile` frontend
* préparer `Dockerfile` backend
* préparer `docker-compose.yml`
* faire en sorte que le projet se lance
* aider sur les ports, commandes, problèmes de build
* expliquer rapidement au groupe comment ça marche
* makefile 
* demander pour branche dev + prod

## Livrable infra

* `docker compose up --build` fonctionne
* frontend accessible
* backend accessible

---

# Rôle DEV 1 — Frontend base

## Mission

Créer la base visible côté React.

## Tâches

* initialiser ou nettoyer le frontend React
* supprimer le boilerplate inutile
* afficher une page simple
* mettre un texte du style :

  * titre du projet
  * “Hello from frontend”
* faire une structure propre dans `src/`

## Livrable

Une page React propre qui s’affiche sans logique compliquée.

---

# Rôle DEV 2 — Backend base

## Mission

Créer la base visible côté NestJS.

## Tâches

* initialiser ou nettoyer le backend NestJS
* créer une route simple `GET /hello`
* faire répondre le backend avec un message simple
* vérifier que le backend répond bien dans le navigateur ou via curl
* activer CORS si besoin

## Livrable

Le backend répond correctement à une route minimale.

---

# Rôle DEV 3 — Connexion front / back

## Mission

Faire la première communication entre les deux.

## Tâches

* ajouter un bouton côté frontend
* au clic, appeler le backend
* afficher la réponse dans la page
* gérer un petit message d’erreur si le backend ne répond pas

## Livrable

Le frontend appelle le backend et affiche la réponse.

---

# Rôle DEV 4 — Documentation / structure / support

## Mission

Rendre la base compréhensible et facile à reprendre.

## Tâches

* compléter le README
* écrire les commandes de lancement
* noter les ports utilisés
* aider aux tests croisés
* prendre une petite tâche de support front ou back si besoin

## Livrable

Un README simple et utile, avec une mini doc de démarrage.

---

# Ce qu’on attend de tout le monde

Même si chacun choisit un rôle, tout le monde doit :

* créer sa branche
* faire au moins une petite PR propre
* comprendre globalement ce que font frontend, backend et infra
* être capable d’expliquer sa contribution
             
Le Sprint 1 ne doit pas être lourd.
Il doit juste rendre le projet **vivant**.

---

# Issues à créer pour Sprint 1

Je te propose des issues très simples.

## Setup général

* `[SETUP] Clean frontend boilerplate`
* `[SETUP] Clean backend boilerplate`
* `[DOC] Write initial README`
* `[DOC] Add .env.example`

## Frontend

* `[FRONT] Display Hello from frontend`
* `[FRONT] Add simple layout/title`
* `[FRONT] Add button to test backend`
* `[FRONT] Display backend response`

## Backend

* `[BACK] Create GET /hello endpoint`
* `[BACK] Enable CORS`
* `[BACK] Return simple response payload`

## Infra

* `[INFRA] Create frontend Dockerfile`
* `[INFRA] Create backend Dockerfile`
* `[INFRA] Create minimal docker-compose`
* `[INFRA] Make frontend and backend accessible`

## Finalisation

* `[TEST] Verify project starts on fresh clone`
* `[DOC] Add run instructions to README`
* `[CLEAN] Final cleanup before merge`

---

# Exemple de branches feature

Je te conseille des branches simples et lisibles.

## Infra

* `feature/docker-frontend`
* `feature/docker-backend`
* `feature/docker-compose`

## Dev 1

* `feature/frontend-hello`

## Dev 2

* `feature/backend-hello`

## Dev 3

* `feature/frontend-call-backend`

## Dev 4

* `feature/readme-project-base`

Ou alors encore plus simple :

* `feature/dev1-frontend-base`
* `feature/dev2-backend-base`
* `feature/dev3-front-back-link`
* `feature/dev4-readme-doc`
* `feature/infra-compose`

Le plus important, c’est d’être cohérent.

---

# Règle de travail Git pendant le sprint

## Ce qu’on fait

* on part tous de `main`
* chacun travaille sur sa branche
* chacun pousse sa branche
* chacun ouvre une Pull Request
* on merge seulement quand c’est propre

## Ce qu’on évite

* ne pas coder directement sur `main`
* ne pas faire une énorme PR avec tout d’un coup
* ne pas mélanger 4 sujets différents dans une seule PR

---

# Ce qu’on attend dans les Pull Requests

Chaque PR doit être petite et claire.

## Exemple de PR correctes

* “Add frontend hello page”
* “Add backend hello endpoint”
* “Connect frontend button to backend”
* “Add minimal docker compose”
* “Write initial README”

## Une PR doit contenir

* un titre clair
* une description courte
* ce qui a été fait
* comment tester

## Exemple de structure

**Titre**
`Add backend hello endpoint`

**Description**

* add GET /hello
* return simple hello message
* tested in browser and curl

**How to test**

* launch backend
* open `/hello`

---

# Charge de travail voulue

Le mot-clé pour ce sprint c’est :

**léger**

On ne veut pas que le Sprint 1 devienne un sprint technique trop ambitieux.
On veut :

* de petites tâches
* des petites PR
* du temps pour apprendre
* du temps pour lire la doc
* du temps pour comprendre React et NestJS sans pression

Donc le but n’est pas “produire beaucoup”.
Le but est “poser bien”.

---

# Définition de fin de Sprint 1

Le Sprint 1 est réussi si :

* le repo reste propre
* chacun a choisi un rôle
* chacun a fait une petite contribution
* le frontend affiche une page
* le backend répond
* le frontend peut appeler le backend
* `docker compose up --build` fonctionne
* le README explique comment lancer

---

# Ce qu’on ne fait PAS pendant Sprint 1

Pour ne pas vous disperser, on ne vise pas encore :

* authentification
* PostgreSQL branché réellement
* logique de morpion complète
* websocket
* matchmaking
* tournoi
* profils utilisateurs
* stats
* design avancé

Tout ça viendra après.

---

# Ce qui vous attend ensuite au Sprint 2

C’est important de leur montrer qu’il y a une suite motivante.

## Idée Sprint 2

Une fois la base en place, Sprint 2 peut commencer à rendre le projet “réel”.

### Objectif Sprint 2 possible

* créer la vraie page du morpion
* afficher une grille 3x3
* jouer localement en X/O
* gérer victoire, nul, reset
* commencer la structure Postgres
* préparer une vraie API de partie

### En clair

Sprint 1 = on allume la machine
Sprint 2 = on commence à voir le jeu exister

---****

# ce qu'on dois comprendre de la réunion

> Pour le Sprint 1, on ne cherche pas à faire le jeu ni l’auth.
> On veut juste une base solide : un frontend React, un backend NestJS, une communication simple entre les deux et un docker-compose minimal.
> L’infra est déjà prise. Pour les 4 devs, chacun choisit un rôle léger : frontend base, backend base, connexion front/back, ou doc/support.
> Chacun travaille sur sa branche, fait une petite PR propre, et on garde du temps pour apprendre la stack.
> Le Sprint 2 sera plus motivant techniquement, parce qu’on commencera à construire le vrai morpion.

---

# Répartition finale proposée

## Infra

* Dockerfiles
* compose
* lancement global

## Dev 1

* frontend hello

## Dev 2

* backend hello

## Dev 3

* bouton + fetch backend

## Dev 4

* README + tests + support + petite aide code

