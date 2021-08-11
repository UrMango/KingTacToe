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

	let roomId = -1;

	socket.on("match", () => {
		console.log("match");	
		if(playersSearching.length > 0)
		{
			for(let i = 0; i < playersSearching.length; i++) {
				console.log("id search: " + playersSearching[i]);
				let enemy = getSocket(playersSearching[i]);
				//console.log(enemy);
				console.log(io.of("/").adapter.rooms);

				roomId = Array.from(io.of("/").adapter.rooms).length;

				socket.join(roomId);
				enemy.join(roomId);
				console.log(io.of("/").adapter.rooms);
				playersSearching.splice(playersSearching.indexOf(playersSearching[i]), 1);

				let rand = Math.random();

				let starter = Boolean(Math.floor(rand * 2)) ? socket.id : enemy.id;
				let king = Boolean(Math.floor(rand * 2)) ? socket.id : enemy.id;

				//gameBoards[]

				io.to(roomId).emit("startgame", {
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
		console.log("put ");
		io.to(roomId).emit("player_put", {id: socket.id, boxId: id});
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
server.listen(3000, () => console.log('server running...'))