const express = require('express');
const {Server} = require("socket.io");
const {createServer} = require("node:http");
const app = express();

const server = createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/" ,(req,res) => {
	res.render("index.ejs");
});

const chessPlayers = [];
const games = [];

const {handler} = require("./chess/socketHandler");
const { matchmaking } = require('./chess/matchmaking');

handler(io, chessPlayers, games);

setInterval(() => {
	matchmaking(games, chessPlayers, io);
}, 1000);

const PORT = 80;
server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
