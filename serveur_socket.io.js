const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);
app.use(express.static(__dirname));
server.listen(8888, () => { console.log('Le serveur écoute sur le port 8888'); });

let players = [];
let currentTurn = 1;  // Variable pour suivre à qui c'est le tour
let hexjouer = [];

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
            const player1Socket = players.find(player => playerNumber === 1);
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

            // Passage au joueur suivant
            currentTurn = currentTurn === 1 ? 2 : 1;
            console.log(`C'est au tour du joueur ${currentTurn}`);

            // Informer le joueur dont c'est le tour qu'il peut jouer
            const playerNext = players.find(player => players.indexOf(player) + 1 === currentTurn);
            const playerWaiting = players.find(player => players.indexOf(player) + 1 !== currentTurn);

            // Envoyer l'événement de tour
            if (playerNext) {
                io.to(playerNext.id).emit('yourTurn', { message: 'C\'est votre tour', isTurn: true });
            }

            // Informer le joueur qui doit attendre
            if (playerWaiting) {
                io.to(playerWaiting.id).emit('waitTurn', { message: 'Attendez votre tour', isTurn: false });
            }
        } else {
            // Si ce n'est pas le tour du joueur, envoyer un message pour lui dire d'attendre
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
        
        // Informer le premier joueur que c'est à lui de jouer
        const firstPlayerSocket = players[0];  // Le premier joueur de la liste
        const secondPlayerSocket = players[1]; // Le second joueur de la liste (s'il existe)
    
        if (firstPlayerSocket) {
            io.to(firstPlayerSocket.id).emit('yourTurn', { message: 'C\'est votre tour', isTurn: true });
        }
    
        // Si un second joueur est présent, l'informer qu'il doit attendre son tour
        if (secondPlayerSocket) {
            io.to(secondPlayerSocket.id).emit('waitTurn', { message: 'Attendez votre tour', isTurn: false });
        }
    
        console.log('La partie a été réinitialisée. C\'est au tour du joueur 1.');
    });
    
});
