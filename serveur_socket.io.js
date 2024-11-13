const express = require('express');
const UnionFind = require('./UnionFind');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);
app.use(express.static(__dirname));
server.listen(8888, () => { console.log('Le serveur écoute sur le port 8888'); });

let players = [];
let currentTurn = 1;  // Variable pour suivre à qui c'est le tour
let hexjouer = [];
const boardSize = 11;
let uf = new UnionFind(boardSize * boardSize + 4);
let LEFT_BORDER = boardSize * boardSize;
let RIGHT_BORDER = boardSize * boardSize + 1;
let TOP_BORDER = boardSize * boardSize + 2;
let BOTTOM_BORDER = boardSize * boardSize + 3;

app.get('/', (request, response) => {
    response.sendFile('client_socket.io.html', {root: __dirname});
});

io.on('connection', (socket) => {
    let currentPlayer = '';
    let playerNumber = 0;

    // Lorsqu'un joueur rejoint la partie
    socket.on('join', playerName => {
        if (players.length >= 2) {
            socket.emit('gameFull', { message: 'La partie est pleine. Veuillez réessayer plus tard.' });
            console.log(`${playerName} a essayé de rejoindre, mais la partie est pleine.`);
            return;
        }

        currentPlayer = playerName;
        players.push({ name: playerName, id: socket.id });
        playerNumber = players.length; // Attribue 1 ou 2

        socket.emit('playerNumber', playerNumber);

        // Informer tous les joueurs des connexions
        io.emit('players', players.map(player => player.name));
        io.emit('message', { playerName: 'Système', message: `${playerName} a rejoint la partie`, type: 'connection', time: new Date().toLocaleTimeString() });
        console.log(`${playerName} a rejoint la partie en tant que joueur ${playerNumber}`);

        // Si c'est le premier joueur, il commence
        if (players.length === 1) {
            currentTurn = 1;
            socket.emit('yourTurn', { message: 'C\'est votre tour', isTurn: true });
        } else if (players.length === 2) {
            // Si c'est le second joueur, il attend le tour
            socket.emit('waitTurn', { message: 'Attendez votre tour', isTurn: false });

            // Informer le joueur 1 que c'est toujours son tour
            const player1Socket = players[0];
            if (player1Socket) {
                io.to(player1Socket.id).emit('yourTurn', { message: 'C\'est votre tour', isTurn: true });
            }
        }
    });

    // Réception de l'événement de sélection d'hexagone
    socket.on('hexagoneSelectionne', data => {
        if (data.joueur === currentTurn) {
            console.log(`Le joueur ${data.joueur} a sélectionné l'hexagone numéro ${data.hexagone}`);
            hexjouer.push({ hexagones: data.hexagone, joueur: data.joueur });
    
            // Informer tous les joueurs de la sélection
            io.emit('colorHex', { hexagones: hexjouer });
    
            // Connecter les hexagones et vérifier la victoire
            if (connectHexagones(data.hexagone, data.joueur)) {
                io.emit('win', { message: `Le joueur ${data.joueur} a gagné !` });
                console.log(`Le joueur ${data.joueur} a gagné !`);
                io.emit('message', { playerName: 'Système', message: `${data.joueur} a reset la partie`, time: new Date().toLocaleTimeString() });
                return;
            }
    
            // Passage au joueur suivant
            currentTurn = currentTurn === 1 ? 2 : 1;
            console.log(`C'est au tour du joueur ${currentTurn}`);
    
            // Informer le joueur dont c'est le tour qu'il peut jouer
            const playerNext = players.find(player => players.indexOf(player) + 1 === currentTurn);
            const playerWaiting = players.find(player => players.indexOf(player) + 1 !== currentTurn);
    
            if (playerNext) {
                io.to(playerNext.id).emit('yourTurn', { message: 'C\'est votre tour', isTurn: true });
            }
    
            if (playerWaiting) {
                io.to(playerWaiting.id).emit('waitTurn', { message: 'Attendez votre tour', isTurn: false });
            }
        } else {
            socket.emit('waitTurn', { message: 'Ce n\'est pas votre tour', isTurn: false });
            console.log(`Le joueur ${data.joueur} a essayé de jouer hors de son tour.`);
        }
    });

    // Lorsque le joueur quitte la partie
    socket.on('leave', playerName => {
        players = players.filter(player => player.name !== playerName);
        io.emit('players', players.map(player => player.name));
        io.emit('message', { playerName: 'Système', message: `${playerName} a quitté la partie`, time: new Date().toLocaleTimeString() });
        console.log(`${playerName} a quitté la partie`);
    });

    socket.on('disconnect', () => {
        if (currentPlayer) {
            players = players.filter(player => player.name !== currentPlayer);
            io.emit('players', players.map(player => player.name));
            io.emit('message', { playerName: 'Système', message: `${currentPlayer} s'est déconnecté`, time: new Date().toLocaleTimeString() });
            console.log(`${currentPlayer} s'est déconnecté`);
    
            // Réinitialiser le jeu si un joueur quitte
            currentTurn = 1;
            hexjouer = [];
            io.emit('ResetParty', { hexagones: hexjouer });
        }
    });    

    // Gestion des tours de jeu
    socket.on('endTurn', () => {
        currentTurn = currentTurn === 1 ? 2 : 1;  // Alterner le tour
        console.log(`C'est au tour du joueur ${currentTurn}`);

        // Informer le joueur dont c'est le tour
        const currentPlayerSocket = players.find(player => playerNumber === currentTurn);
        if (currentPlayerSocket) {
            io.to(currentPlayerSocket.id).emit('yourTurn', { message: 'C\'est votre tour', isTurn: true });
            io.to(players.find(player => playerNumber !== currentTurn).id).emit('waitTurn', { message: 'Attendez votre tour', isTurn: false });
        }
    });

    // Réception des messages
    socket.on('message', data => {
        data.time = new Date().toLocaleTimeString();
        io.emit('message', data);
        console.log(`${data.playerName}: ${data.message}`);
    });

    // Réinitialisation de la partie
    socket.on('ResetParty', data => {
        // Réinitialiser les variables
        currentTurn = 1;  // Le premier joueur commence
        hexjouer = [];    // Réinitialiser les hexagones joués
    
        // Informer tous les joueurs que la partie est réinitialisée
        io.emit('ResetParty', { hexagones: hexjouer });

        // Informer tout les joueurs par le chat
        io.emit('message', { playerName: 'Système', message: `${data.Name} a reset la partie`, time: new Date().toLocaleTimeString() });
        
        // Informer le premier joueur que c'est à lui de jouer
        const firstPlayerSocket = players[0];
        const secondPlayerSocket = players[1];
    
        if (firstPlayerSocket) {
            io.to(firstPlayerSocket.id).emit('yourTurn', { message: 'C\'est votre tour', isTurn: true });
        }
    
        // Si un second joueur est présent, l'informer qu'il doit attendre son tour
        if (secondPlayerSocket) {
            io.to(secondPlayerSocket.id).emit('waitTurn', { message: 'Attendez votre tour', isTurn: false });
        }

        // Réinitialiser la structure de données Union-Find
        uf = new UnionFind(boardSize * boardSize + 4);
        LEFT_BORDER = boardSize * boardSize;
        RIGHT_BORDER = boardSize * boardSize + 1;
        TOP_BORDER = boardSize * boardSize + 2;
        BOTTOM_BORDER = boardSize * boardSize + 3;        

        console.log('La partie a été réinitialisée. C\'est au tour du joueur 1.');
    });

    // Fonction pour connecter l'hexagone et ses voisins si possible
    function connectHexagones(hex, player) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], [-1, 1], [1, -1]
        ];

        const row = Math.floor(hex / boardSize);
        const col = hex % boardSize;

        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                const neighborIndex = newRow * boardSize + newCol;
                if (hexjouer.some(h => h.hexagones === neighborIndex && h.joueur === player)) {
                    uf.union(hex, neighborIndex);
                }
            }
        });

        // Connecter aux bords virtuels
        if (player === 1) {
            if (col === 0) uf.union(hex, LEFT_BORDER);
            if (col === boardSize - 1) uf.union(hex, RIGHT_BORDER);
        } else if (player === 2) {
            if (row === 0) uf.union(hex, TOP_BORDER);
            if (row === boardSize - 1) uf.union(hex, BOTTOM_BORDER);
        }

        // Vérifier si le joueur a gagné
        if (player === 1 && uf.find(LEFT_BORDER) === uf.find(RIGHT_BORDER)) {
            return true;
        } else if (player === 2 && uf.find(TOP_BORDER) === uf.find(BOTTOM_BORDER)) {
            return true;
        }

        return false;
    }
    
});