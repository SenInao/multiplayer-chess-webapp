const {Player} = require("./Player");
const { handlePackage } = require("./gameLogic");
const CD = require("lodash");

function handler(io, players, games) {
	io.on("connection", (socket) => {
		socket.on("chessPlayer", (player) => {
			console.log("New player connected");
			player = new Player(player.name, socket.id);
			players.push(player);
			socket.emit("id", socket.id);
		});

		socket.on("chessReady", (packet) => {
			for (let player = 0; player < players.length; player++) {
				if (players[player].id === socket.id) {
					players[player].name = packet.name;
					players[player].queue = packet.queue;
				};
			};
		});

		socket.on("chessMove", (packet) => {
			let i = handlePackage(games, packet, socket.id, io);
			var gameData = CD.cloneDeep(games[i]);
			delete gameData.timerId;
			io.emit("gameUpdate",gameData) 
			if (games[i].player1.winner || games[i].player2.winner) {
				games[i].player1.winner = false;
				games[i].player2.winner = false;
				games.splice(i, 1);
			};
		});

		socket.on("disconnect", (reason) => {
			console.log("Player disconnected");
			for (var game = 0; game < games.length; game++) {
				if (games[game].player1.id === socket.id) {
					disconnectPlayer(io, games[game].player2, games[game]);
					games.splice(game, 1);
					break;
				} else if (games[game].player2.id === socket.id) {
					disconnectPlayer(io, games[game].player1, games[game]);
					games.splice(game, 1);
					break;
				};
			};

			for (let p = 0; p < players.length; p++) {
				if (players[p].id === socket.id) {
					players.splice(p, 1);
					break;
				};
			};
		});
	});
};

function disconnectPlayer(io, player, game) {
	player.winner = true;
	player.inGame = false;
	game.stopTimer()
	io.emit("gameUpdate", game);
	player.winner = false;
};

module.exports = {handler};
