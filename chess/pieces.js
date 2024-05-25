const CD = require("lodash");
const {checkCollision, isCheck} = require("./utils1");

const pictureFolder = "chess_pieces/";

function enPassentAvailable(game, piece, x, dir) {
	let [i, collision] = checkCollision(game, piece.x + x, piece.y)
	if (collision.piece !== "P" || collision.type === piece.type) {
		return false;
	} else {
		if (piece.type === "W") {
			if (piece.y !== 3) {
				return false;
			};
		} else {
			if (piece.y !== 4) {
				return false;
			};
		};
		if (!(game.lastPos[i].y === collision.y + dir*2 && game.lastPos[i].x === collision.x)) {
			return false;
		};
	};
	return true;
};


function checkPossibleMoves(game, possibleMoves, moves, piece) {
	for (let m = 0; m < possibleMoves.length; m++) {
		let [_, collision] = checkCollision(game, piece.x+possibleMoves[m][0], piece.y + possibleMoves[m][1]);
		if (collision.type === piece.type || piece.x+possibleMoves[m][0] < 0 || piece.x+possibleMoves[m][0] > 7 || piece.y+possibleMoves[m][1] < 0 || piece.y+possibleMoves[m][1] > 7 ) {
			continue;
		};
		moves.push([piece.x+possibleMoves[m][0], piece.y + possibleMoves[m][1]]);
	};

	return moves;
};

function checkHorizontalMoves(game, moves, piece) {
	let dx = 7;

	for (let x = piece.x+1; x <= dx; x++) {
		let [_, collision] = checkCollision(game, x, piece.y);
		if (collision) {
			if (collision.type !== piece.type) {
				moves.push([x,piece.y]);
			};
			break;
		};
		moves.push([x,piece.y]);
	};
		
	dx = 0;
	for (let x = piece.x-1; x >= dx; x--) {
		let [_, collision] = checkCollision(game, x, piece.y);
		if (collision) {
			if (collision.type !== piece.type) {
				moves.push([x,piece.y]);
			};
			break;
		};
		moves.push([x,piece.y]);
	};

	return moves;
};

function checkVerticalMoves(game, moves, piece) {
	let dy = 7;
	for (let y = piece.y+1; y <= dy; y++) {
		let [_, collision] = checkCollision(game, piece.x, y);
		if (collision) {
			if (collision.type !== piece.type) {
				moves.push([piece.x, y]);
			};
			break;
		};
		moves.push([piece.x,y]);
	};

	dy = 0;
	for (let y = piece.y-1; y >= dy; y--) {
		let [_, collision] = checkCollision(game, piece.x, y);
		if (collision) {
			if (collision.type !== piece.type) {
				moves.push([piece.x, y]);
			};
			break;
		};
		moves.push([piece.x,y]);
	};
	return moves;
};

function checkDiagonalMoves(game, moves, piece) {
	let dx = piece.x;

	for (let x = 1; x <= dx; x++) {
		let [_, collision] = checkCollision(game, piece.x - x, piece.y - x);
		if (collision) {
			if (collision.type !== piece.type) {
				moves.push([piece.x - x, piece.y - x]);
			};
			break;
		};
		moves.push([piece.x - x, piece.y - x]);
	};

	dx = 7 - piece.x;
	for (let x = 1; x <= dx; x++) {
		let [_, collision] = checkCollision(game, piece.x + x, piece.y + x);
		if (collision) {
			if (collision.type !== piece.type) {
				moves.push([piece.x + x, piece.y + x]);
			};
			break;
		};
		moves.push([piece.x + x, piece.y + x]);
	};

	dx = piece.x;
	for (let x = 1; x <= dx; x++) {
		let [_, collision] = checkCollision(game, piece.x - x, piece.y + x);
		if (collision) {
			if (collision.type !== piece.type) {
				moves.push([piece.x - x, piece.y + x]);
			};
			break;
		};
		moves.push([piece.x - x, piece.y + x]);
	};

	dx = 7 - piece.x;
	for (let x = 1; x <= dx; x++) {
		let [_, collision] = checkCollision(game, piece.x + x, piece.y - x);
		if (collision) {
			if (collision.type !== piece.type) {
				moves.push([piece.x + x, piece.y - x]);
			};
			break;
		};
		moves.push([piece.x + x, piece.y - x]);
	};

	return moves;
};

class Piece {
	constructor(x, y, color) {
		this.drawx = x;
		this.drawy = y;
		this.x = x;
		this.y = y;
		this.mousemove = false;
		this.hasMoved = false;
		this.allowedMoves = [];

		if (color == "white") {
			this.type = "W";
		} else {
			this.type = "B";
		};
	};

	newX(x) {
		this.x = x;
		this.drawx = x;
	};

	newY(y) {
		this.y = y;
		this.drawy = y;
	};

	initImage() {
		const img = new Image();
		img.src = pictureFolder + this.type + this.piece + ".png";
		this.image = img;
	};
};

class Pawn extends Piece {
	constructor(x,y, color) {
		super(x,y, color);
		this.piece = "P"
	};

	getMoves(game) {
		let dir = 1;
		if (this.type === "W") {
			dir = -1
		};

		let moves = [];
		let possibleMoves;

		let [_, collision] = checkCollision(game, this.x, this.y + dir);
		if (collision) {
			possibleMoves = [];
		} else {
			[_, collision] = checkCollision(game, this.x, this.y + dir*2);
			if (collision) {
				possibleMoves = [[0,dir]];
			} else if (!this.hasMoved) {
				possibleMoves = [[0,dir*2],[0,dir]] ;
			} else {
				possibleMoves = [[0,dir]];
			};
		};

		[_, collision] = checkCollision(game, this.x + 1, this.y + dir);
		if (!collision) {
			if (enPassentAvailable(game, this, 1, dir)) {
				possibleMoves.push([1,dir]);
			};
		} else {
			possibleMoves.push([1,dir]);
		};

		[_, collision] = checkCollision(game, this.x - 1, this.y + dir);
		if (!collision) {
			if (enPassentAvailable(game, this, -1, dir)) {
				possibleMoves.push([-1,dir]);
			};
		} else {
			possibleMoves.push([-1,dir]);
		};

		moves =  checkPossibleMoves(game, possibleMoves, moves, this);

		return moves;
	};
};

class Rook extends Piece {
	constructor(x,y, color) {
		super(x,y,color);
		this.piece = "R"
	};

	getMoves(game) {
		let moves = [];

		moves = checkHorizontalMoves(game, moves, this);
		moves = checkVerticalMoves(game, moves, this);
		
		return moves;
	};
};

class Knight extends Piece {
	constructor(x,y, color) {
		super(x,y,color);
		this.piece = "Kn"
	};

	getMoves(game) {
		let moves = [];
		let possibleMoves = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];

		moves = checkPossibleMoves(game, possibleMoves, moves, this);

		return moves;
	};
};

class Bishop extends Piece {
	constructor(x,y, color) {
		super(x,y,color);
		this.piece = "B"
	};

	getMoves(game) {
		let moves = [];
		moves = checkDiagonalMoves(game, moves, this);
		return moves;
	};
};

class King extends Piece {
	constructor(x,y, color) {
		super(x,y,color);
		this.piece = "K"
	};

	getMoves(game) {
		let moves = [];
		let possibleMoves = [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];

		if ([0,7].includes(this.y) && !this.hasMoved) {
			let [_, collision] = checkCollision(game, this.x + 3, this.y);
			if (collision.piece === "R" && !collision.piece.hasMoved) {
				if (!checkCollision(game, this.x + 1, this.y)[0] && !checkCollision(game, this.x + 2, this.y)[0]) {
					let [i, _] = checkCollision(game, this.x, this.y);
					let gameCopy = CD.cloneDeep(game);
					gameCopy.pieces[i].x += 1;
					if (!isCheck(gameCopy, this.type)) {
						possibleMoves.push([2,0]);
					};

				};
			};

			let [_1, collision1] = checkCollision(game, this.x - 4, this.y);
			if (collision1.piece === "R" && !collision1.piece.hasMoved) {
				let check1 = checkCollision(game, this.x - 1, this.y)[0];
				let check2 = checkCollision(game, this.x - 2, this.y)[0];
				let check3 = checkCollision(game, this.x - 3, this.y)[0];
				if (!check1 && !check2 && !check3) {
					let [i, _] = checkCollision(game, this.x, this.y);
					let gameCopy = CD.cloneDeep(game);
					gameCopy.pieces[i].x -= 1;
					if (!isCheck(gameCopy, this.type)) {
						possibleMoves.push([-2,0]);
					};
				};
			};
		};

		moves = checkPossibleMoves(game, possibleMoves, moves, this);
		return moves;
	};
};

class Queen extends Piece {
	constructor(x,y, color) {
		super(x,y,color);
		this.piece = "Q"
	};

	getMoves(game) {
		let moves = [];
		
		moves = checkDiagonalMoves(game, moves, this);
		moves = checkVerticalMoves(game, moves, this);
		moves = checkHorizontalMoves(game, moves, this);
		
		return moves;
	};
};

function createPieces() {
	let pieces = [];

	for (let i = 0; i < 8; i++) {
		const pawn = new Pawn(i, 1, "black");
		pieces.push(pawn);
	};

	for (let i = 0; i < 8; i++) {
		const pawn = new Pawn(i, 6, "white");
		pieces.push(pawn);
	};

	pieces.push(new Bishop(2,0,"black"));
	pieces.push(new Bishop(2,7,"white"));
	pieces.push(new Bishop(5,0,"black"));
	pieces.push(new Bishop(5,7,"white"));

	pieces.push(new Rook(0,0,"black"));
	pieces.push(new Rook(0,7,"white"));
	pieces.push(new Rook(7,0,"black"));
	pieces.push(new Rook(7,7,"white"));

	pieces.push(new Knight(1,0,"black"));
	pieces.push(new Knight(1,7,"white"));
	pieces.push(new Knight(6,0,"black"));
	pieces.push(new Knight(6,7,"white"));

	pieces.push(new King(4,0,"black"));
	pieces.push(new King(4,7,"white"));

	pieces.push(new Queen(3,0,"black"));
	pieces.push(new Queen(3,7,"white"));

	return pieces;
};

module.exports = {Pawn, Rook, Knight, King, Bishop, Queen, createPieces};
