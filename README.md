# Jeu de Hex

## Description

Ce projet est un jeu de Hex développé en JavaScript, avec D3.js pour le rendu graphique, Express pour le serveur web, et Socket.io pour la communication en temps réel entre les joueurs. Hex est un jeu de stratégie abstrait dans lequel deux joueurs s'affrontent pour établir une chaîne ininterrompue reliant deux côtés opposés d'un plateau hexagonal.

## Règles du Jeu

Le jeu de Hex se joue sur un plateau en forme de losange composé de cellules hexagonales. Voici les règles principales :

1. **Objectif du jeu** : Le joueur 1 (joueur bleu) doit connecter le côté gauche au côté droit du plateau avec une chaîne ininterrompue de ses pions bleus. Le joueur 2 (joueur rouge) doit connecter le côté supérieur au côté inférieur du plateau avec une chaîne ininterrompue de ses pions rouges.

2. **Déroulement du jeu** :
   - Les deux joueurs jouent à tour de rôle.
   - À chaque tour, un joueur place un pion de sa couleur dans une cellule hexagonale vide de son choix.
   - Une fois qu’un pion est placé, il ne peut plus être déplacé ou retiré du plateau.

3. **Conditions de victoire** : 
   - Le premier joueur qui relie ses deux côtés opposés avec une chaîne continue de pions de sa couleur remporte la partie.
   - Étant donné qu'il est impossible qu'une partie se termine sans qu'un des deux joueurs ne parvienne à relier ses côtés, il n'y a jamais de match nul dans le jeu de Hex.

4. **Avantage au premier joueur** : Dans le jeu de Hex, le premier joueur peut avoir un avantage. Afin de compenser cet avantage, une règle de "swap" est parfois appliquée : après le premier coup, le deuxième joueur peut choisir de continuer en tant que joueur opposé (en inversant les couleurs et les côtés) ou de jouer normalement. Cela permet de réduire l'avantage du premier joueur.

## Technologies utilisées

- **JavaScript** : Langage de programmation principal.
- **D3.js** : Bibliothèque pour manipuler des documents basés sur des données et créer des graphiques dynamiques, ici pour générer le plateau hexagonal.
- **Express** : Framework web pour Node.js qui simplifie la création de serveurs.
- **Socket.io** : Bibliothèque pour gérer la communication en temps réel entre le client et le serveur, permettant ainsi de jouer à plusieurs.

## Installation

1. Clonez ce dépôt sur votre machine locale :
   ```bash
   git clone https://github.com/hydre-lapin/hex-game.git
