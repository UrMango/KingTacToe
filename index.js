express = require("express");
const app = express();
const server = require("http").createServer(app);
const e = require("cors");
const { Server } = require("socket.io");
const io = new Server(server);
	
var sockets = [];
var playersSearching = [];
var gameeBoards = [];

io.on("connection" , (socket) => {
	console.log("user connected " + socket.id);
	sockets.push(socket);
	console.log("socket count: " + sockets.length);
	console.log("searchers count: " + playersSearching.length);
	socket.roomId = -1;

	let hacker = false;

	socket.on("match", () => {
		
		if(socket.roomId == -1 && !playersSearching.includes(socket.id))
		{
			console.log("match");
			if(playersSearching.length > 0)
			{
				for(let i = 0; i < playersSearching.length; i++) {
					console.log("id search: " + playersSearching[i]);
					let enemy = getSocket(playersSearching[i]);
					
					socket.other = enemy;
					enemy.other = socket;
	
					//console.log(enemy);
					console.log(io.of("/").adapter.rooms);
	
					let roomId = Array.from(io.of("/").adapter.rooms).length;
					
					socket.join(roomId);
					enemy.join(roomId);
	
					socket.roomId = roomId;
					enemy.roomId = roomId;
	
					console.log(io.of("/").adapter.rooms);
					playersSearching.splice(playersSearching.indexOf(playersSearching[i]), 1);
	
					let rand = Math.random();
					let rand2 = Math.random();
	
					let starter = Boolean(Math.floor(rand * 2)) ? socket.id : enemy.id;
					let king = Boolean(Math.floor(rand2 * 2)) ? socket.id : enemy.id;
	
					if(starter == socket.id) {
						socket.turn = true;
						enemy.turn = false;
					}
					else {
						socket.turn = false;
						enemy.turn = true;
					}
	
					console.log(socket.other.turn);
	
					//gameBoards[]
	
					socket.board = [null, null, null, null, null, null, null, null, null];
					enemy.board = [null, null, null, null, null, null, null, null, null];
	
					io.to(socket.roomId).emit("startgame", {
						starter: starter,
						king: king
					});
					i = playersSearching.length;
				}
			} else {
				playersSearching.push(socket.id);
				console.log("searchers count: " + playersSearching.length);
			}
		} else {
			//hacker
			console.log("1");
			hackerDetected(socket);
		}
	});	
	
	socket.on("put", (id) => {
		console.log("put " + socket.id + " boxId: " + id);
		console.log(socket.turn);
		if(socket.turn == true && socket.board[id] == null && id >= 0 && id <= 8)
		{
			console.log("it's turn");
			socket.board[id] = socket.id;
			socket.other.board[id] = socket.id;

			io.to(socket.roomId).emit("player_put", {id: socket.id, boxId: id});
			
			let gameState = checkWinner(socket.board);

			if(gameState == 0)
			{
				io.to(socket.roomId).emit("turn_change", {to: socket.other.id});
				socket.turn = false;
				socket.other.turn = true;

				console.log("game still going");
			} else if(gameState == 1)
			{
				socket.turn = false;
				socket.other.turn = false;

				console.log("draw");
				io.to(socket.roomId).emit("game-end", {id: 1}); // draw
				socket.roomId = -1;
				socket.other.roomId = -1;
			} else {
				socket.turn = false;
				socket.other.turn = false;
				
				io.to(socket.roomId).emit("game-end", {id: 0, winner: gameState}); // win
				socket.roomId = -1;
				socket.other.roomId = -1;
			}
			
		} else {
			// hacker or bug. most chances it's hacking
			hackerDetected(socket);
		}

	});

	socket.on("disconnecting", () => {
	});

	socket.on("disconnect", () => {
		if(playersSearching.indexOf(socket.id) != -1)
		playersSearching.splice(playersSearching.indexOf(socket.id), 1);
		sockets.splice(sockets.indexOf(socket), 1);
		console.log("user disconnected " + socket.id);
		console.log(sockets.length);
	})
});

io.of("/").adapter.on("leave-room", (room, player) => {
	// add
	if(!isNaN(room))
	{
		console.log(`room ${room} was left by ${player}`);
		console.log(room);
		let clientLeftId = Array.from(io.sockets.adapter.rooms.get(room))[0];

		if(clientLeftId)
		{
			let clientLeft = getSocket(Array.from(io.sockets.adapter.rooms.get(room))[0]);

			if(clientLeft.otherHacker)
			{
				io.to(room).emit("game-over", "You've played with a hacker");
				clientLeft.otherHacker = false;
			}
			else
				io.to(room).emit("game-over", "User Disconnected");

			console.log(getSocket(Array.from(io.sockets.adapter.rooms.get(room))[0]).roomId);

			clientLeft.roomId = -1;
		}

	}
});

function hackerDetected(socket) {
	console.log("hacker");
	if(socket.other)
		socket.other.otherHacker = true;
	socket.emit("special", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
}

function checkWinner(board) {
	if(board[0] == board[4] && board[0] == board[8] && board[0] != null)
		return board[0];
	if(board[2] == board[4] && board[2] == board[6] && board[2] != null)
		return board[2];

	for(let i = 0; i < 3; i++) {
		if(board[i] == board[i+3] && board[i] == board[i+6] && board[i] != null)
			return board[i];
		if(board[i*3] == board[i*3+1] && board[i*3] == board[i*3+2] && board[i*3] != null)
			return board[i*3];
	}

	for(let i = 0; i < board.length; i++)
		if(board[i] == null)
			return 0; // game didn't end yet
	return 1; // it's a draw
}

function getSocket (id) {
	console.log("id to find: " + id);
	for(let i = 0; i < sockets.length; i++) {
		console.log(sockets[i].id);
		if(sockets[i].id == id) {
			console.log("equal");
			return sockets[i];
		}
	};
}

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/public/app.html");
});

app.get("/app.js", (req, res) => {
	res.sendFile(__dirname + "/public/app.js");
});

app.get("/app.css", (req, res) => {
	res.sendFile(__dirname + "/public/app.css");
});

app.get("/assets/characters/king.png", (req, res) => {
	res.sendFile(__dirname + "/assets/characters/king.png");
});

app.get("/assets/characters/knight.png", (req, res) => {
	res.sendFile(__dirname + "/assets/characters/knight.png");
});

app.get("/assets/characters/knife.png", (req, res) => {
	res.sendFile(__dirname + "/assets/characters/knife.png");
});

app.get("/assets/bg/bg.png", (req, res) => {
	res.sendFile(__dirname + "/assets/bg/bg.png");
});

app.get("/assets/story.png", (req, res) => {
	res.sendFile(__dirname + "/assets/story.png");
});

server.listen(80, () => console.log('server running...'))