const CD = require("lodash");

function checkCollision(game, x, y) {
	for (let p = 0; p < game.pieces.length; p++) {
		if (game.pieces[p].x === x && game.pieces[p].y === y) {
			return [p, game.pieces[p]];
		};
	};
	return [false, false];
};

function makeMove(game, packet, player) {
	let gameCopy = CD.cloneDeep(game);
	let packetCopy = CD.cloneDeep(packet);

	if (move(gameCopy, packetCopy)) {
		if (isCheck(gameCopy, player.colour)) {
			return false;
		} else {
			return move(game, packet);
		};
	};
};

function move(game, packet) {
	let [_, piece] = checkCollision(game, packet.piece.x, packet.piece.y);
	let moves = piece.getMoves(game);

	for (let m = 0; m < moves.length; m++) {
		if (moves[m][0] === packet.newX && moves[m][1] == packet.newY) {
			let [i, collision] = checkCollision(game, packet.newX, packet.newY);

			if (collision) {
				game.pieces.splice(i, 1);
				game.piecesTaken.push(collision);

			} else if (packet.piece.piece === "P" && Math.abs(packet.newX - piece.x) === 1) {
				let [i, enPassant] = checkCollision(game, packet.newX, piece.y);
				if (enPassant) {
					game.pieces.splice(i, 1);
					game.piecesTaken.push(enPassant);
				};

			} else if (packet.piece.piece === "K" && packet.newX - piece.x === 2) {
				let [_, rook] = checkCollision(game, piece.x + 3, piece.y);
				rook.newX(piece.x + 1);
				rook.newY(piece.y);
				rook.hasMoved = true;

			} else if (packet.piece.piece === "K" && packet.newX - piece.x === -2) {
				let [_, rook] = checkCollision(game, piece.x - 4, piece.y);
				rook.newX(piece.x - 1);
				rook.newY(piece.y);
			};

			if (packet.piece.piece === "P" && packet.piece.type === "W" && packet.newY === 0) {
				let [pieceLoc, _] = checkCollision(game, packet.piece.x, packet.piece.y);
				game.pieces.splice(pieceLoc, 1);

				piece.hasMoved = true;
				return true;
			} else if (packet.piece.piece === "P" && packet.piece.type === "B" && packet.newY === 7) {
				let [pieceLoc, _] = checkCollision(game, packet.piece.x, packet.piece.y);
				game.pieces.splice(pieceLoc, 1);

				piece.hasMoved = true;
				return true;
			};

			piece.newX(packet.newX);
			piece.newY(packet.newY);

			piece.hasMoved = true;

			return true;
		};
	};

	return false;
};

function isCheck(game, color) {
	let king;
	let moves = [];

	for (let p = 0; p < game.pieces.length; p++) {
		if (game.pieces[p].piece === "K" && game.pieces[p].type === color) {
			king = game.pieces[p];
		};

		if (game.pieces[p].type !== color) {
			moves.push(...game.pieces[p].getMoves(game));
		};
	};

	for (let m = 0; m < moves.length; m++) {
		if (moves[m][0] === king.x && moves[m][1] === king.y) {
			return true;
		};
	};

	return false;
};

function isCheckmateOrDraw(game, color) {
	let king;

	for (let p = 0; p < game.pieces.length; p++) {
		if (game.pieces[p].piece === "K" && game.pieces[p].colour === color) {
			king = game.pieces[p];
		};
	};

	
	for (let p = 0; p < game.pieces.length; p++) {
		if (game.pieces[p].type !== color) {
			continue;
		};

		if (game.pieces[p].allowedMoves.length > 0) {
			return false;
		};
	};

	return true;
};

function updateAllowedMoves(game, color) {
	for (let p = 0; p < game.pieces.length; p++) {
		if (game.pieces[p].type === color) {
			continue;
		};

		let moves = game.pieces[p].getMoves(game);
		game.pieces[p].allowedMoves = [];
		for (let m = 0; m < moves.length; m++) {
			let gameCopy = CD.cloneDeep(game);

			let packet = {piece:game.pieces[p], newX:moves[m][0], newY:moves[m][1]};

			if (move(gameCopy, packet)) {
				if (isCheck(gameCopy, game.pieces[p].type)) {
					continue;
				};
			};

			game.pieces[p].allowedMoves.push(moves[m]);
		};
	};
};

module.exports = {makeMove, isCheckmateOrDraw, checkCollision, isCheck, updateAllowedMoves};
