function checkHorizontalPath(pieces, x1,y1,x2) {
	let direction = x1 < x2 ? 1 : -1;
	let distance = Math.abs(x1 - x2);
	for (let i = 1; i < distance + 1; i++) {
		for (let p = 0; p < pieces.length; p++) {
			if (pieces[p].x == x1 + i * direction && y1 == pieces[p].y) {
				return pieces[p];
			};
		};
	};
	return true;
};

function checkVerticalPath(pieces, x1,y1,y2) {
	let direction = y1 < y2 ? 1 : -1;
	let distance = Math.abs(y1 - y2);
	for (let i = 1; i < distance + 1; i++) {
		for (let p = 0; p < pieces.length; p++) {
			if (pieces[p].y == y1 + i * direction && x1 == pieces[p].x) {
				return pieces[p];
			};
		};
	};
	return true;
};

function checkDiagonalPath(pieces, x1,y1,x2,y2) {
	let xdirection = x1 < x2 ? 1 : -1;
	let ydirection = y1 < y2 ? 1 : -1;
	let distance = Math.abs(x1 - x2);
	for (let i = 1; i < distance + 1; i++ ) {
		for (let p = 0; p < pieces.length; p++) {
			if (pieces[p].x == x1 + i * xdirection && pieces[p].y == y1 + i * ydirection) {
				return pieces[p];
			};
		};
	};
	return true;
};

function checkMove(pieces, moves, piece, x, y) {
	let dy = y - piece.y;
	let dx = x - piece.x;

	let validMove = false;

	for (let m = 0; m < moves.length; m++) {
		if (moves[m][0] == dx && moves[m][1] == dy) {
			validMove = true;
			break;
		};
	};

	if (!validMove) {
		return false;
	};

	for (let i = 0; i < pieces.length; i++) {
		if (pieces[i].x == x && pieces[i].y == y) {
			return pieces[i];
		};
	};

	return true;
};

function checkPawnPath(pieces, piece, x, y, lastPieces) {
	let moves = [[0,1],[1,1],[-1,1],[0,2]];
	let rank = 4;
	if (piece.type == "W") {
		moves = [[0,-1],[-1,-1],[1,-1],[0,-2]];
		rank = 3;
	};

	if (![1,6].includes(piece.y)) {
		moves.pop()
	};

	let check = checkMove(pieces, moves, piece, x, y);
	let dx = x - piece.x;
	let dy = y - piece.y;

	if (check.piece == null) {
		if ((dx == moves[1][0] && dy == moves[1][1]) || (dx == moves[2][0] && dy == moves[2][1])) {
			if (piece.y == rank) {
				for (let p = 0; p < pieces.length; p++) {
					if (pieces[p].x == piece.x+dx && pieces[p].y == piece.y) {
						if (Math.abs(pieces[p].y - lastPieces[p].y) == 2 && pieces[p].x == lastPieces[p].x) {
							return pieces[p];
						};
					};
				};
			};
			return false;
		};
		return check;
	};

	if (dx == moves[0][0] && dy == moves[0][1]) {
		return false;
	};

	return check;
};

function checkRookPath(pieces, piece, x,y) {
	if (piece.y == y) {
		return checkHorizontalPath(pieces, piece.x, piece.y, x);
	} else if (piece.x == x){
		return checkVerticalPath(pieces, piece.x, piece.y, y);
	} else {
		return false;
	};
};

function checkKnightPath(pieces, piece, x,y) {
	let moves = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[-1,2],[1,-2],[-1,-2]];

	return checkMove(pieces, moves, piece, x, y);
};

function checkBishopPath(pieces, piece, x, y) {
	if (Math.abs((piece.x-x)/(piece.y-y)) == 1) {
		return checkDiagonalPath(pieces, piece.x, piece.y, x, y);
	} else {
		return false;
	};
};

function checkKingPath(pieces, piece, x,y) {
	if (x - piece.x == 2 & piece.y == y) {
		for (let p = 0; p < pieces.length; p++) {
			if ([5,6].includes(pieces[p].x) && pieces[p].y == y) {
				return false;
			};
		};
		return "castle";
	};

	let moves = [[1,0],[0,-1],[0,1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]];

	return checkMove(pieces, moves, piece, x, y);
};

function checkQueenPath(pieces, piece, x,y) {
	if (Math.abs((piece.x-x)/(piece.y-y)) == 1) {
		return checkDiagonalPath(pieces, piece.x, piece.y, x, y);
	} else if (piece.y == y){
		return checkHorizontalPath(pieces, piece.x, piece.y, x);
	} else if (piece.x == x) {
		return checkVerticalPath(pieces, piece.x, piece.y, y);
	} else {
		return false;
	};
};

function doMove(game, packet, pieceToRemove) {
	let me;
	let enemy;
	if (game.player1.colour == packet.piece.type) {
		me = game.player1;
		enemy = game.player2;
	} else {
		me = game.player2;
		enemy = game.player1;
	};

	let selfKing;
	let enemyKing;
	for (let piece = 0; piece < game.pieces.length; piece++) {
		if (game.pieces[piece].piece == "K") {
			if (game.pieces[piece].type == packet.piece.type) {
				selfKing = game.pieces[piece];
			} else {
				enemyKing = game.pieces[piece];
			};
		};
	};
	
	for (var a = 0; a<game.pieces.length; a++) {
		if (game.pieces[a].x == packet.piece.x && game.pieces[a].y == packet.piece.y) {
			var gameCopy = JSON.parse(JSON.stringify(game));
			var kingCopy;

			for (let p = 0; p < gameCopy.pieces.length; p++) {
				if (gameCopy.pieces[p].piece == "K" && gameCopy.pieces[p].type == selfKing.type) {
					kingCopy = gameCopy.pieces[p];
				};
			};

			gameCopy.pieces[a].x = packet.newX;
			gameCopy.pieces[a].y = packet.newY;
			gameCopy.pieces[a].drawx = packet.newX;
			gameCopy.pieces[a].drawy = packet.newY;
			if (pieceToRemove.piece != null) {
				for (let p = 0; p < gameCopy.pieces.length; p++) {
					if (gameCopy.pieces[p].x == pieceToRemove.x && gameCopy.pieces[p].y == pieceToRemove.y && gameCopy.pieces[p].piece == pieceToRemove.piece) {
						gameCopy.pieces.splice(p, 1);
						break;
					};
				};
			};
			break;
		};
	};

	if (checkCheck(gameCopy, kingCopy)) {
		return false;
	};

	if (pieceToRemove == "castle") {
		if (game.pieces[a].hasMoved || me.inCheck) {
			return false;
		};
		for (let p = 0; p < game.pieces.length; p++) {
			if (game.pieces[p].piece == "R" && game.pieces[p].x == packet.newX+1 && game.pieces[p].y == packet.newY) {
				if (game.pieces[p].hasMoved) {
					return false;
				};
				let gameCopy = JSON.parse(JSON.stringify(game));
				gameCopy.pieces[p].x -= 2;
				gameCopy.pieces[p].drawx -= 2;

				if (checkCheck(gameCopy, gameCopy.pieces[p])) {
					return false;
				};

				game.pieces[p].x -= 2;
				game.pieces[p].drawx -= 2;
			};
		};
	};

	game.pieces[a].x = packet.newX;
	game.pieces[a].y = packet.newY;
	game.pieces[a].drawx = packet.newX;
	game.pieces[a].drawy = packet.newY;
	game.pieces[a].hasMoved = true;

	if (pieceToRemove.piece != null) {
		game.pieces.splice(game.pieces.indexOf(pieceToRemove), 1);
	};

	if (checkCheck(game, selfKing)) {
		me.inCheck = true;
	} else {
		me.inCheck = false;
	};

	if (checkCheck(game, enemyKing)) {
		enemy.inCheck = true;
	} else {
		enemy.inCheck = false;
	};

	return true;
};

function processMove(game, packet) {
	if (packet.piece.piece == "P") {
		let check = checkPawnPath(game.pieces, packet.piece, packet.newX, packet.newY, game.lastPos);
		if (check) {
			if (packet.piece.type == check.type) {
				return false;
			};
			return doMove(game, packet, check);
		};

	} else if (packet.piece.piece == "R") {
		let check = checkRookPath(game.pieces, packet.piece, packet.newX, packet.newY);
		if (check) {
			if (check.piece != null) {
				if (packet.piece.type == check.type) {
					return false;
				};
			};
			return doMove(game, packet, check);
		};

	} else if (packet.piece.piece == "Kn") {
		let check = checkKnightPath(game.pieces, packet.piece, packet.newX, packet.newY);
		if (check) {
			if (packet.piece.type == check.type) {
				return false;
			};
			return doMove(game, packet, check);
		};

	} else if (packet.piece.piece  == "B") {
		let check = checkBishopPath(game.pieces, packet.piece, packet.newX, packet.newY);
		if (check) {
			if (check.piece != null) {
				if (packet.piece.type == check.type) {
					return false;
				};
			};
			return doMove(game, packet, check);
		};

	} else if (packet.piece.piece == "K") {
		let check = checkKingPath(game.pieces, packet.piece, packet.newX, packet.newY);
		if (check) {
			if (packet.piece.type == check.type) {
				return false;
			};
			return doMove(game, packet, check);
		};

	} else if (packet.piece.piece == "Q") {
		let check =	checkQueenPath(game.pieces, packet.piece, packet.newX, packet.newY);
		if (check) {
			if (check.piece != null) {
				if (packet.piece.type == check.type) {
					return false;
				};
			};
			return doMove(game, packet, check);
		};
	};
	
	return false;
};

function checkHorizontalCheck(pieces, king) {
	let checkH = checkHorizontalPath(pieces, king.x, king.y, 7);
	let checkH1 = checkHorizontalPath(pieces, king.x, king.y, 0);
	if ((checkH.piece == "R" && checkH.type != king.type) || (checkH.piece == "Q" && checkH.type != king.type)) {
		return true;
	} else if ((checkH1.piece == "R" && checkH1.type != king.type) || (checkH1.piece == "Q" && checkH1.type != king.type)) {
		return true;
	};
	return false;
};

function checkVerticalCheck(pieces, king) {
	let checkV = checkVerticalPath(pieces, king.x, king.y, 7);
	let checkV1 = checkVerticalPath(pieces, king.x, king.y, 0);

	if ((checkV.piece == "R" && checkV.type != king.type) || (checkV.piece == "Q" && checkV.type != king.type)) {
		return true;
	} else if ((checkV1.piece == "R" && checkV1.type != king.type) || (checkV1.piece == "Q" && checkV1.type != king.type)) {
		return true;
	};

	return false;
};

function checkDiagonalCheck(pieces, king) {
	let dx = 7;
	let dy = king.y + (7-king.x);

	let checkD = checkDiagonalPath(pieces, king.x, king.y, dx, dy);

	if ((checkD.piece == "B" && checkD.type != king.type) || (checkD.piece == "Q" && checkD.type != king.type)) {
		return true;
	};

	dx = 7;
	dy = king.y - (king.x);

	checkD = checkDiagonalPath(pieces, king.x, king.y, dx, dy);

	if ((checkD.piece == "B" && checkD.type != king.type) || (checkD.piece == "Q" && checkD.type != king.type)) {
		return true;
	};
	dx = 0;
	dy = king.y + king.x;

	checkD = checkDiagonalPath(pieces, king.x, king.y, dx, dy);

	if ((checkD.piece == "B" && checkD.type != king.type) || (checkD.piece == "Q" && checkD.type != king.type)) {
		return true;
	};
	dx = 0;
	dy = king.y - king.x;

	checkD = checkDiagonalPath(pieces, king.x, king.y, dx, dy);

	if ((checkD.piece == "B" && checkD.type != king.type) || (checkD.piece == "Q" && checkD.type != king.type)) {
		return true;
	};

	return false;
};

function checkHorseCheck(pieces, king) {
	let moves = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[-1,2],[1,-2],[-1,-2]];

	for (let move = 0; move < moves.length; move++) {
		let check = checkMove(pieces, moves, king, moves[move][0]+king.x, moves[move][1]+king.y);
		if ((check.piece == "Kn" && check.type != king.type)) {
			return true;
		};
	};

	return false;
};

function checkPawnCheck(pieces, king) {
	let moves = []
	if (king.type == "W") {
		moves.push([-1,-1])
		moves.push([1,-1])
	} else {
		moves.push([-1,1])
		moves.push([1,1])
	};

	for (let move = 0; move < moves.length; move++) {
		let check = checkMove(pieces, moves, king, moves[move][0]+king.x, moves[move][1]+king.y);
		if ((check.piece == "P" && check.type != king.type)) {
			return true;
		};
	};

	return false;
};

function checkCheck(game, king) {
	if (checkHorizontalCheck(game.pieces, king)) {
		return true;
	} else if (checkVerticalCheck(game.pieces, king)) {
		return true;
	} else if (checkDiagonalCheck(game.pieces, king)) {
		return true;
	} else if (checkHorseCheck(game.pieces, king)) {
		return true;
	} else if (checkPawnCheck(game.pieces, king)) {
		return true;
	};
	return false;
};

function checkCollison(piece, game) {
	for (let p = 0; p < game.pieces.length; p++) {
		if (game.pieces[p].x == piece.x && game.pieces[p].y == piece.y) {
			return p;
		};
	};
	return false;
};

function checkVerticalHorizontalCover(game, piece, king) {
	let oldX = piece.x;
	let check = checkHorizontalPath(game.pieces, piece.x, piece.y, 0)
	let check1 = checkHorizontalPath(game.pieces, piece.x, piece.y, 7)
	let start = 0;
	let end = 7;

	if (check.piece) {
		start = check.x + 1;
	};
	if (check1.piece) {
		end = check1.x;
	};

	for (let x = start; x < end; x++) {
		piece.x = x;
		
		if (!checkCheck(game, king)) {
			return true;
		};
	};

	piece.x = oldX;

	let oldY = piece.y;
	check = checkVerticalPath(game.pieces, piece.x, piece.y, 0)
	check1 = checkVerticalPath(game.pieces, piece.x, piece.y, 7)
	start = 0;
	end = 7;
	if (check.piece) {
		start = check.y + 1;
	};

	if (check1.piece) {
		end = check1.y;
	};

	for (let y = start; y < end; y++) {
		piece.y = y;
		if (!checkCheck(game, king)) {
			return true;
		};
	};
	piece.y = oldY;
	piece.x = oldX;
	return false;
};

function checkPawnCover(game, piece, king) {
	let dir;
	let end;
	if (piece.type == "W") {
		dir = -1;
	} else {
		dir = 1;
	};

	if ([1,6].includes(piece.x)) {
		end = 2;
	} else {
		end = 1;
	};

	let oldY = piece.y;
	let oldX = piece.y;
	let gameCopy = JSON.parse(JSON.stringify(game));
	for (var a = 0; a < gameCopy.pieces.length; a++) {
		if (piece.y == gameCopy.pieces[a].y && piece.x == gameCopy.pieces[a].x) {
			break;
		};
	};
	for (let i = 0; i < end; i++) {
		
		gameCopy.pieces[a].y += dir;
		let index = checkCollison(piece, game);
		if (typeof index === "number") {
			if (game.pieces[index].type == piece.type) {
				break;
			} else {
				gameCopy.slice(index, 1);
			};
		};

		if (!checkCheck(gameCopy, king)) {
			return true;
		};
	};
	piece.y = oldY;

	piece.x+=1;
	piece.y+=dir;
	if (checkPawnPath(game.pieces, piece, piece.x, piece.y, game.lastPos)) {
		if (!checkCheck(game,king)) {
			return true;
		};
	};
	piece.x-=2;
	if (checkPawnPath(game.pieces, piece, piece.x, piece.y, game.lastPos)) {
		if (!checkCheck(game,king)) {
			return true;
		};
	};

	piece.y = oldY;
	piece.x = oldX;

	return false;
};

function checkKnightCover(game, piece, king) {
	let moves = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[-1,2],[1,-2],[-1,-2]];
	let oldX = piece.x;
	let oldY = piece.y;
	for (let m = 0; m < moves.length; m++) {
		piece.x += moves[m][0];
		piece.y += moves[m][1];

		if (checkCollison(piece, game)) {
			piece.x = oldX;
			piece.y = oldY;
			continue;
		};

		if (!checkCheck(game, king)) {
			return true;
		};
		piece.x = oldX;
		piece.y = oldY;
	};
	return false;
};

function checkKingCover(game, piece, king) {
	let moves = [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
	let oldX = piece.x;
	let oldY = piece.y;
	for (let m = 0; m < moves.length; m++) {
		piece.x += moves[m][0];
		piece.y += moves[m][1];

		if (piece.x < 0) {
			piece.x = 0;
		};

		if (piece.y < 0) {
			piece.y = 0; 
		};
		
		if (checkCollison(piece, game)) {
			piece.x = oldX;
			piece.y = oldY;
			continue;
		};

		if (!checkCheck(game, king)) {
			return true;
		};
		piece.x = oldX;
		piece.y = oldY;
	};
	return false;
};

function checkDiagonalCover(game, piece, king) {
	let oldX = piece.x;
	let oldY = piece.y;
	let corner1 = [0, piece.y + piece.x];
	let corner2 = [7, piece.y - (7 - piece.x)]
	let check = checkDiagonalPath(piece.x, piece.y, corner1[0], corner1[1]);
	let check1 = checkDiagonalPath(piece.x, piece.y, corner2[0], corner2[1]);
	let startx;
	let starty;
	let endx;

	if (check.piece) {
		startx = check.x - 1;
		starty = check.y + 1;
	} else {
		startx = corner1[0];
		starty = corner1[1];
	};
	if (check1.piece) {
		endx = check1.x;
	} else {
		endx = corner2[0];
	};

	piece.y = starty;
	for (let x = startx; x < endx; x++) {
		piece.x = x;
		
		if (!checkCheck(game, king)) {
			return true;
		};
		piece.y -= 1;
	};
	piece.x = oldX;
	piece.y = oldY;

	corner1 = [0, piece.y - piece.x];
	corner2 = [7, piece.y + (7 - piece.x)]
	check = checkDiagonalPath(piece.x, piece.y, corner1[0], corner1[1]);
	check1 = checkDiagonalPath(piece.x, piece.y, corner2[0], corner2[1]);
	if (check.piece) {
		startx = check.x + 1;
		starty = check.y + 1;
	} else {
		startx = corner1[0];
		starty = corner1[1];
	};
	if (check1.piece) {
		endx = check1.x;
	} else {
		endx = corner2[0];
	};

	piece.y = starty;
	for (let x = startx; x < endx; x++) {
		piece.x = x;
		
		if (!checkCheck(game, king)) {
			return true;
		};
		piece.y += 1;
	};
	piece.x = oldX;
	piece.y = oldY;
	return false;
};

function checkCheckmate(game, colour) {
	var gameCopy = JSON.parse(JSON.stringify(game));
	var king;
	
	for (let p = 0; p < gameCopy.pieces.length; p++) {
		if (gameCopy.pieces[p].piece == "K" && gameCopy.pieces[p].type == colour) {
			king = gameCopy.pieces[p];
			break;
		};
	};

	for (let p = 0; p < gameCopy.pieces.length; p++) {
		if (gameCopy.pieces[p].type != king.type) {
			continue;
		};

		if (gameCopy.pieces[p].piece == "R") {
			if (checkVerticalHorizontalCover(gameCopy, gameCopy.pieces[p], king)) {
				console.log("rook")
				return false;
			};
		} else if (gameCopy.pieces[p].piece == "P") {
			if (checkPawnCover(gameCopy, gameCopy.pieces[p], king)) {
				console.log("pawn")
				return false;
			};
		} else if (gameCopy.pieces[p].piece == "Kn") {
			if (checkKnightCover(gameCopy, gameCopy.pieces[p], king)) {
				console.log("kinight")
				return false;
			};
		} else if (gameCopy.pieces[p].piece == "B") {
			if (checkDiagonalCover(gameCopy, gameCopy.pieces[p], king)) {
				console.log("bishop")
				return false;
			};
		} else if (gameCopy.pieces[p].piece == "Q") {
			if (checkVerticalHorizontalCover(gameCopy, gameCopy.pieces[p], king)) {
				console.log("queenhorizontal")
				return false;
			} else if (checkDiagonalCover(gameCopy, gameCopy.pieces[p], king)) {
				console.log("queenDiagonal")
				return false;
			};
		} else if (gameCopy.pieces[p].piece == "K") {
			if (checkKingCover(gameCopy, gameCopy.pieces[p], king)) {
				console.log("kingCover")
				return false;
			};
		};
	};
	return true;
};

module.exports = {checkMove, checkDiagonalPath, checkHorizontalPath, checkVerticalPath, processMove, checkCheck, checkCheckmate};
