const socket = io();

var canvas;
var ctx;
var menu;
var nameInput;
var nameChangeButton;
var playButton;
var nameTag;
var canvasInfo;
var gameWrapper;
var timers;
var timer1;
var timer2;
var queueInput;

var mouseY;
var mouseX;

var WIDTH;
var CELLWIDTH;
var IMGSIZE;
var XOFFSET;

const LIGHT_BROWN = "rgba(196, 164, 132)";
const BROWN = "rgba(160,82,45)";
const BLACK = "rgba(0,0,0,0.2)";
const YELLOW = "rgba(139,128,0, 0.6)";

const pictureFolder = "chess_pieces/";

const seconds = 0.001;
const margin = 0.9;
const takenImgMargin = 0.5;

var pieceToMove;
var selectedPiece;

var player = {
	name: "",
	queue: null,
	inGame: false
};

var enemyPlayer = {
	name: ""
};

var pieces = [];
var piecesTaken = [];

var originalSquare = [];
var newSquare = [];

var shouldDraw = true;

function valueToOpposite(value) {
	return Math.abs(value - 7);
};

function draw(ctx, piece) {
	let x;
	let y;
	ctx.beginPath();
	if (piece.mousemove) {
		x = mouseX - IMGSIZE/2;
		y = mouseY - IMGSIZE/2;

		for (let m = 0; m < piece.allowedMoves.length; m++) {
			let moveX;
			let moveY
			if (piece.type === "B") {
				moveX = valueToOpposite(piece.allowedMoves[m][0]) * CELLWIDTH + CELLWIDTH/2;
				moveY = valueToOpposite(piece.allowedMoves[m][1]) * CELLWIDTH + CELLWIDTH/2;
			} else {
				moveX = piece.allowedMoves[m][0] * CELLWIDTH + CELLWIDTH/2;
				moveY = piece.allowedMoves[m][1] * CELLWIDTH + CELLWIDTH/2;
			};

			ctx.beginPath();
			ctx.fillStyle = BLACK;
			ctx.arc(moveX + XOFFSET, moveY, CELLWIDTH/8, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
		};

	} else if (selectedPiece && selectedPiece.x === piece.x && selectedPiece.y === piece.y) {
		x = piece.drawx * CELLWIDTH + CELLWIDTH/2 - IMGSIZE/2 + XOFFSET;
		y = piece.drawy * CELLWIDTH + CELLWIDTH/2 - IMGSIZE/2;

		for (let m = 0; m < piece.allowedMoves.length; m++) {
			let moveX;
			let moveY
			if (piece.type === "B") {
				moveX = valueToOpposite(piece.allowedMoves[m][0]) * CELLWIDTH + CELLWIDTH/2;
				moveY = valueToOpposite(piece.allowedMoves[m][1]) * CELLWIDTH + CELLWIDTH/2;
			} else {
				moveX = piece.allowedMoves[m][0] * CELLWIDTH + CELLWIDTH/2;
				moveY = piece.allowedMoves[m][1] * CELLWIDTH + CELLWIDTH/2;
			};

			ctx.beginPath();
			ctx.fillStyle = BLACK;
			ctx.arc(moveX + XOFFSET, moveY, CELLWIDTH/8, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
		};

	} else {
		x = piece.drawx * CELLWIDTH + CELLWIDTH/2 - IMGSIZE/2 + XOFFSET;
		y = piece.drawy * CELLWIDTH + CELLWIDTH/2 - IMGSIZE/2;
	};

	if (piece.image.complete) {
		ctx.drawImage(piece.image, x, y, IMGSIZE,IMGSIZE);
	};
	ctx.closePath();
};

function drawTaken(ctx) {
	let playerPieces = 0;
	let enemyPlayerPieces = 0;
	let y;
	let ps = ["P", "B", "Kn", "R", "Q"];
	for (let p = 0; p<ps.length; p++) {
		for (let i = 0; i < piecesTaken.length; i++) {
			if (piecesTaken[i].piece !== ps[p]) {
				continue;
			};
			if (piecesTaken[i].type !== player.colour) {
				y = (4 + enemyPlayerPieces) * CELLWIDTH;
				enemyPlayerPieces += (XOFFSET*0.8)/CELLWIDTH;
			} else {
				y = playerPieces * CELLWIDTH;
				playerPieces += (XOFFSET*0.8)/CELLWIDTH;
			};

			if (piecesTaken[i].image.complete) {
				ctx.drawImage(piecesTaken[i].image, 0, y, IMGSIZE*takenImgMargin,IMGSIZE*takenImgMargin);
			};
		};
	};
	
};

function drawBoard(ctx) {
	for (let x = 0; x < 8; x++) {
		for (let y = 0; y < 8; y++) {
			ctx.beginPath();
			if (originalSquare[0] === x && originalSquare[1] === y) {
				ctx.fillStyle = YELLOW;
			} else if (newSquare[0] === x && newSquare[1] === y) {
				ctx.fillStyle = YELLOW;
			} else {
				ctx.fillStyle = (x ^ y) % 2 ? BROWN : LIGHT_BROWN;
			};
			ctx.rect(x*CELLWIDTH + XOFFSET, y*CELLWIDTH, CELLWIDTH, CELLWIDTH);
			ctx.fill();
			ctx.closePath();
		};
	};
};

function updateDrawPos() {
	for (let i = 0; i < pieces.length; i++) {
		if (player.colour == "B") {
			pieces[i].drawx = valueToOpposite(pieces[i].x);
			pieces[i].drawy = valueToOpposite(pieces[i].y);
		};
	};
};

function drawPieces(ctx) {
	updateDrawPos()
	for (let i = 0; i < pieces.length; i++) {
		draw(ctx, pieces[i]);
	};
};

function checkCollision(piece, x,y) {
	updateDrawPos()
	return (Math.abs(piece.drawx*CELLWIDTH + CELLWIDTH/2 - x) < IMGSIZE/2 && Math.abs(piece.drawy*CELLWIDTH+ CELLWIDTH/2 - y) < IMGSIZE/2);
};

function getImage(piece) {
	const img = new Image();
	img.src = pictureFolder + piece.type + piece.piece + ".png";
	piece.image = img;
};

function drawGame(ctx) {
	ctx.clearRect(0,0,WIDTH,WIDTH);
	drawBoard(ctx);
	drawPieces(ctx);
	drawTaken(ctx);
};

async function gameLoop(ctx) {
	while (true) {
		if (shouldDraw) {
			ctx.canvas.width = WIDTH;
			ctx.canvas.height = WIDTH;
			drawGame(ctx);
		};

		if (player.winner || enemyPlayer.winner) {
			break;
		};

		await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
	};

	let text;

	if (player.winner && enemyPlayer.winner) {
		text = "DRAW!"
	} else if (enemyPlayer.winner) {
		text = "YOU HAVE LOST!";
	} else {
		text = "YOU HAVE WON!";
	};
	canvasInfo.innerText = text;

	await new Promise(resolve => setTimeout(resolve, 3 * 1000))

	ctx.clearRect(0,0,WIDTH,WIDTH);

	gameWrapper.style.display = "none";
	menu.style.display = "flex";
};

window.onload = function () {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	menu = document.getElementsByClassName("menu")[0];
	nameInput = document.getElementById("nameInput");
	nameChangeButton = document.getElementById("nameChange");
	playButton = document.getElementById("play");
	nameTag = document.getElementById("name");
	canvasInfo = document.getElementById("canvasInfo");
	gameWrapper = document.getElementsByClassName("gameWrapper")[0];
	timers = document.getElementsByClassName("timers")[0];
	timer1 = document.getElementById("timer1");
	timer2 = document.getElementById("timer2");
	queueInput = document.getElementById("queueInput");

	gameWrapper.style.display = "none";

	if (window.innerWidth < window.innerHeight) {
		WIDTH = window.innerWidth * 0.94;
		gameWrapper.style.flexDirection = "column";
		timers.style.flexDirection = "row";
	} else {
		WIDTH = Math.min(window.innerWidth*margin, window.innerHeight*margin);
		gameWrapper.style.flexDirection = "row";
		timers.style.flexDirection = "column";
	};

	CELLWIDTH = WIDTH/8;
	IMGSIZE = CELLWIDTH/1.5;

	XOFFSET = IMGSIZE*takenImgMargin;
	WIDTH += XOFFSET;

	socket.emit("chessPlayer", player);

	nameChangeButton.addEventListener("click", function() {
		let name = nameInput.value;
		player.name = name;

		nameTag.innerText = "NAME: " + name;
	}, false);

	playButton.addEventListener("click", function() {
		menu.style.display = "none";
		gameWrapper.style.display = "flex";
		timers.style.display = "none";

		if (player.name === "") {
			player.name = "guest";
		};

		canvasInfo.innerText = "finding match..."

		player.queue = queueInput.value;
		socket.emit("chessReady", player);
	}, false);

};

window.onresize = function() {
	if (window.innerWidth < window.innerHeight) {
		WIDTH = window.innerWidth * 0.94;
		gameWrapper.style.flexDirection = "column";
		timers.style.flexDirection = "row";
	} else {
		WIDTH = Math.min(window.innerWidth*margin, window.innerHeight*margin);
		gameWrapper.style.flexDirection = "row";
		timers.style.flexDirection = "column";
	};

	CELLWIDTH = WIDTH/8;
	IMGSIZE = CELLWIDTH/1.5;
	XOFFSET = IMGSIZE*takenImgMargin;
	WIDTH += XOFFSET;
};

document.addEventListener("click", (event) => {
	if (!player.inGame) {
		return;
	};

	let rect = canvas.getBoundingClientRect();
	mouseX = event.clientX - rect.left;
	mouseY = event.clientY - rect.top;

	if (selectedPiece) {
		let x = Math.round(Math.abs((mouseX-IMGSIZE/2-XOFFSET)/CELLWIDTH));
		let y = Math.round(Math.abs((mouseY-IMGSIZE/2)/CELLWIDTH));

		if (pieceToMove.type == "B") {
			x = valueToOpposite(x);
			y = valueToOpposite(y);
		};

		let packet = {
			piece:selectedPiece,
			newX:x,
			newY:y
		};

		socket.emit("chessMove", packet);

		selectedPiece = null;

		shouldDraw = false;
	} else {

		for (let i = 0; i < pieces.length; i++) {
			if (checkCollision(pieces[i], mouseX - XOFFSET,mouseY) && player.turn && pieces[i].type == player.colour) {
				pieceToMove = pieces[i];
			};
		};

		selectedPiece = pieceToMove
	};
});

document.addEventListener("mousedown", (event) => {
	selectedPiece = null;
	if (!player.inGame) {
		return;
	};

	let rect = canvas.getBoundingClientRect();
	mouseX = event.clientX - rect.left;
	mouseY = event.clientY - rect.top;

	for (let i = 0; i < pieces.length; i++) {
		if (checkCollision(pieces[i], mouseX - XOFFSET,mouseY) && player.turn && pieces[i].type == player.colour) {
			pieces[i].mousemove = true;
			pieceToMove = pieces[i];
		};
	};
});

document.addEventListener("mouseup", (event) => {
	if (!player.inGame) {
		return;
	};

	let rect = canvas.getBoundingClientRect();
	mouseX = event.clientX - rect.left;
	mouseY = event.clientY - rect.top;

	if (pieceToMove) {
		let x = Math.round(Math.abs((mouseX-IMGSIZE/2-XOFFSET)/CELLWIDTH));
		let y = Math.round(Math.abs((mouseY-IMGSIZE/2)/CELLWIDTH));

		if (pieceToMove.type == "B") {
			x = valueToOpposite(x);
			y = valueToOpposite(y);
		};

		let packet = {
			piece:pieceToMove,
			newX:x,
			newY:y
		};

		socket.emit("chessMove", packet);

		pieceToMove.mousemove = false;
		pieceToMove = null;

		shouldDraw = false;
	};
});

document.addEventListener("mousemove", (event) => {
	if (!player.inGame) {
		return;
	};

	let rect = canvas.getBoundingClientRect();
	mouseX = event.clientX - rect.left;
	mouseY = event.clientY - rect.top;

});

socket.on("id", (id) => {
	player.id = id;
});

socket.on("newGame", (game) => {

	if (game.player1.id == player.id ) {
		enemyPlayer = game.player2;
		player = game.player1;
	} else if (game.player2.id == player.id) {
		enemyPlayer = game.player1;
		player = game.player2;
	} else {
		return;
	};

	timers.style.display = "flex";
	ctx.canvas.width = WIDTH;
	ctx.canvas.height = WIDTH;

	canvasInfo.innerText = "opponent: " + enemyPlayer.name;
	let minutes = Math.floor(player.time / 60);
	let seconds = player.time % 60;

	if (seconds.toString().length < 2) {
		seconds = "0" + seconds.toString()
	};

	timer1.innerText = minutes + ":" + seconds;
	timer2.innerText = minutes + ":" + seconds;
	
	pieces = game.pieces;

	for (let i = 0; i < pieces.length; i++) {
		getImage(pieces[i]);
	};

	gameLoop(ctx);
});

socket.on("timerUpdate", (timer) => {
	if (timer.id === player.id) {
		let minutes = Math.floor(timer.time / 60);
		let seconds = timer.time % 60;
		if (seconds.toString().length < 2) {
			seconds = "0" + seconds.toString()
		};
		timer2.innerText = minutes + ":" + seconds;
	} else if (timer.id === enemyPlayer.id) {
		let minutes = Math.floor(timer.time / 60);
		let seconds = timer.time % 60;
		if (seconds.toString().length < 2) {
			seconds = "0" + seconds.toString()
		};
		timer1.innerText = minutes + ":" + seconds;
	};
});

socket.on("gameUpdate",(game) => {
	if (game.player1.id == player.id ) {
		player = game.player1;
		enemyPlayer = game.player2;

		if (player.colour === "B") {
			originalSquare = [valueToOpposite(game.originalSquare[0]), valueToOpposite(game.originalSquare[1])];
			newSquare = [valueToOpposite(game.newSquare[0]), valueToOpposite(game.newSquare[1])];
		} else {
			originalSquare = game.originalSquare;
			newSquare = game.newSquare;
		};

	} else if (game.player2.id == player.id) {
		player = game.player2;
		enemyPlayer = game.player1;

		if (player.colour === "B") {
			originalSquare = [valueToOpposite(game.originalSquare[0]), valueToOpposite(game.originalSquare[1])];
			newSquare = [valueToOpposite(game.newSquare[0]), valueToOpposite(game.newSquare[1])];
		} else {
			originalSquare = game.originalSquare;
			newSquare = game.newSquare;
		};
	} else {
		return;
	};

	pieces = game.pieces;
	piecesTaken = game.piecesTaken;

	for (let i = 0; i < pieces.length; i++) {
		getImage(pieces[i]);
	};

	for (let i = 0; i < piecesTaken.length; i++) {
		getImage(piecesTaken[i]);
	};

	shouldDraw = true;
});
