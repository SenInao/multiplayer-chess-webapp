class Player {
	constructor(name, id) {
		this.name = name;
		this.id = id;
		this.inGame = false;
		this.colour = null;
		this.turn;
		this.inCheck = false;
		this.winner;
		this.ready = false;
		this.time;
		this.timerId;
	};
};

module.exports = {Player};
