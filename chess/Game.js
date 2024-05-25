const {createPieces} = require("./pieces");
const CD = require("lodash");

class Game {
	constructor(player1, player2, minutes) {
		this.player1 = player1;
		this.player2 = player2;

		this.pieces = createPieces();
		this.piecesTaken = [];
		this.lastPos = [...this.pieces];

		this.originalSquare = [];
		this.newSquare = [];

		this.timerId = null;
		this.timer = minutes * 60;
		this.player1.time = this.timer;
		this.player2.time = this.timer;
	};

	startTimer(player, io, games, i) {
		this.timerId = setInterval(() => {
			player.time--;
			if (player.time <= -1) {
				if (this.player1.id === player.id){
					this.player2.winner = true;
				} else {
					this.player1.winner = true;
				};
				
				var gameData = CD.cloneDeep(this);
				delete gameData.timerId;
				io.emit("gameUpdate",gameData) 
				this.player1.winner = false;
				this.player2.winner = false;
				this.player1.inGame = false;
				this.player2.inGame = false;
				this.stopTimer();
				games.splice(i, 1);
			} else {
				io.emit("timerUpdate", {id:player.id, time:player.time});
			};
		}, 1000)
	};

	stopTimer() {
		clearInterval(this.timerId);
		this.timerId = null;
	};
};

module.exports = {Game};
