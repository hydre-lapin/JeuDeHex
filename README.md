# Jeu de Hex

## Étudiants sur le projet :
Lucas Goubert
Maxime Maurin

## Lien du GitHub
"https://github.com/hydre-lapin/JeuDeHex/"
à noter que durant la période de mise en public du projet pour permettre une correction d'autres personnes (4) ont cloné le projet (9 décembre)

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


## Fonctionnalités 

-connexion de la page web avec le serveur  
-définition automatique du mode de l'utilisateur (Joueur/Spectateur)  
-gestion des possibilités selon le mode de l'utilisateur  
-grille de jeu interactive  
-vérification automatique de victoire  
-possibilité de déconnexion, conséquences prises en compte  
-possiblité de rejouer la partie à partir de zéro (reset)  
-capacité de disposer d'un nom  
-capacité de communiquer avec les autres personnes connectées par chat écrit  
-mise en avant des coups joués et des victoires par des émissions sonores  
-possibilité d'écouter une musique et de ne plus l'écouter au fil de la partie  
-possibilité de regarder la partie en direct avec actualisation au prochain coup  
-possibilité de revoir la partie coup par coup sans actualisation au prochain coup (spectateur)  




## Technologies utilisées

- **JavaScript** : Langage de programmation principal.
- **D3.js** : Bibliothèque pour manipuler des documents basés sur des données et créer des graphiques dynamiques, ici pour générer le plateau hexagonal.
- **Express** : Framework web pour Node.js qui simplifie la création de serveurs.
- **Socket.io** : Bibliothèque pour gérer la communication en temps réel entre le client et le serveur, permettant ainsi de jouer à plusieurs.

## Installation

1. Clonez ce dépôt sur votre machine locale :
   ```bash
   git clone https://github.com/hydre-lapin/hex-game.git
