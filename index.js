express = require("express");
const app = express();
const server = require("http").createServer(app);
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

	socket.on("match", () => {
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

				let starter = Boolean(Math.floor(rand * 2)) ? socket.id : enemy.id;
				let king = Boolean(Math.floor(rand * 2)) ? socket.id : enemy.id;

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
	});	
	
	socket.on("put", (id) => {
		console.log("put " + socket.id + " boxId: " + id);
		console.log(socket.turn);
		if(socket.turn == true)
		{
			console.log("it's turn")
			io.to(socket.roomId).emit("player_put", {id: socket.id, boxId: id});
			socket.turn = false;
			socket.other.turn = true;
			io.to(socket.roomId).emit("turn_change", {to: socket.other.id});
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
	console.log(`room ${room} was left by ${player}`);
	console.log(room);
	io.to(room).emit("game-over", "User Disconnected");
});



function getSocket (id) {
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

server.listen(3000, () => console.log('server running...'))