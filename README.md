# GreenIT

# Projet Ubelicious - GreenIT 2024-2025

## Présentation
Ubelicious est une plateforme web dédiée à la découverte de l'ube violet (igname violet) à travers :
- des recettes 
- des informations sur ses bienfaits
- son histoire culturelle
- et des recommandations personnalisées de lieux

Le projet intègre une partie **front-end** et une partie **back-end** complète.

## Déploiement
Le site est déployé via [Render](https://render.com), avec une application Node.js/Express.js pour le serveur et l'accès à la base de données.

Lien vers le site :  
**(lien Render)**

## Remarques techniques
- Ce dépôt contient à la fois :
  - La partie front-end (HTML/CSS/JS)
  - La partie back-end (Node.js + Express.js + SQLite)
- La base de données SQLite est utilisée pour stocker les utilisateurs, recettes, et recommandations.
- Les utilisateurs peuvent créer un compte, se connecter, ajouter et supprimer leurs recommandations.
- Un administrateur peut ajouter, modifier et supprimer des recettes.

## Technologies utilisées
- HTML5 / CSS3
- JavaScript (Vanilla JS)
- Node.js / Express.js
- SQLite3
- Hébergement : Render

## Structure du projet
```
/ (racine)
|-- app.js
|-- database.js
|-- package.json
|-- ubelicious.db (base SQLite)
|-- /html
|   |-- index.html
|   |-- bienfait.html
|   |-- histoire.html
|   |-- recommandation.html
|   |-- apropos.html
|   |-- connexion.html
|   |-- compte.html
|   |-- ajout.html
|   |-- reco_ajout.html
|   |-- mes_recommandations.html
|   |-- modifier_recette.html
|-- /css
|   |-- style.css
|   |-- accueil.css
|   |-- recommandation.css
|   |-- ajout.css
|   |-- reco_ajout.css
|-- /js
|   |-- accueil.js
|   |-- recommandation.js
|   |-- header.js
|   |-- compte.js
|   |-- connexion.js
|   |-- modifier_recette.js
|-- /img
|   |-- bienfait_droit.png
|   |-- bienfait_gauche.png
|   |-- bread.png
|   |-- cake.png
|   |-- cookie.png
|   |-- fond_carte.png
|   |-- green_1.png
|   |-- green_2.png
|   |-- green_3.png
|   |-- green_4.png
|   |-- image_recette_droit.png
|   |-- image_recette_gauche.png
|   |-- late.png
|   |-- map_phil.png
|   |-- ube_accueil.png
|   |-- ube_header.png
|   |-- ubelicious_logo.png
|   |-- /icone_svg/
|   |-- /img-originales/
|-- README.md
```

## Fonctionnalités principales
- **Gestion des utilisateurs :**
  - Inscription, connexion et déconnexion.
  - Affichage du bouton "Déconnexion" uniquement si l'utilisateur est connecté.

- **Recettes :**
  - Carrousel interactif de recettes.
  - Ajout, modification et suppression par un administrateur.

- **Recommandations :**
  - Ajout de recommandations personnelles pour les lieux où goûter l'ube.
  - Suppression possible uniquement pour ses propres recommandations.

- **Interface Responsive :**
  - Site adapté pour mobile, tablette et desktop.

## Conventions de contribution
- **Branches de travail :**
  - `main` : branche principale (stabilisée)
  - `loriana` : développements réalisés par Loriana
  - `laura` :  développements réalisés par Laura

- **Conventions de commit :**
  - `feat:` ajout de fonctionnalité
  - `fix:` correction de bug
  - `docs:` mise à jour de la documentation
  - `style:` changements purement esthétiques

- **Procédure :**
  - Travailler sur sa propre branche.
  - Faire des pull requests vers `main` après relecture.

## Équipe
- Loriana RATOVO
- Laura DONATO
- Maël CASTELLAN
- Rémi DESJARDINS
- Anne Laure PARQUET

---

© 2025 - Projet Ubelicious | EFREI Paris
