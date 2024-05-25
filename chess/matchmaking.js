const { wrap } = require("lodash");
const { Game } = require("./Game");
const { updateAllowedMoves } = require("./utils1");

function matchmaking(games, players, io) {
	let blitzQueue = [];
	let rapidQueue = [];
	for (let i = 0; i < players.length; i++) {
		if (!players[i].inGame && players[i].queue === "blitz") {
			blitzQueue.push(players[i]);
		} else if (!players[i].inGame && players[i].queue === "rapid") {
			rapidQueue.push(players[i]);
		};
	};


	if (blitzQueue.length >= 2) {
		createNewGame(games, io, blitzQueue[0], blitzQueue[1], 3);
	};

	if (rapidQueue.length >= 2) {
		createNewGame(games, io, rapidQueue[0], rapidQueue[1], 10);
	};
};

function createNewGame(games, io, player1, player2, minutes) {
	console.log("new game created");
	player1.inGame = true;
	player2.inGame = true;
	player1.queue = null;
	player2.queue = null;

	let i = Math.round(Math.random());

	if (i == 1) {
		player1.colour = "W";
		player2.colour = "B";
		player1.turn = true;
		player2.turn = false;
	} else {
		player2.colour = "W";
		player1.colour = "B";
		player1.turn = false;
		player2.turn = true;
	};

	let game = new Game(player1,player2, minutes);
	games.push(game);

	updateAllowedMoves(game, "B");

	io.emit("newGame", game);
};

module.exports = {matchmaking};
