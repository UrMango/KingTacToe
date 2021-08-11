const socket = io();

const consts = {
	empty: -1,
	x: 0,
	o: 1,
	king: 2,
	slayer: 3,
	kingAvt: "assets/characters/king.png",
	enemyAvt: "assets/characters/enemy.png"
} 

var spaces = [consts.empty, consts.empty, consts.empty, consts.empty, consts.empty, consts.empty, consts.empty, consts.empty, consts.empty];
var curr_player = consts.empty;
var my_char = consts.empty;
var enemy_char = consts.empty;
var steps = 0;
var boxes;


const startGame = () => {
	document.querySelector(".gameBoardContainer").innerHTML = `<div id="gameboard">
	<div class="box" id="0"></div>
	<div class="box" id="1"></div>
	<div class="box" id="2"></div>
	<div class="box" id="3"></div>
	<div class="box" id="4"></div>
	<div class="box" id="5"></div>
	<div class="box" id="6"></div>
	<div class="box" id="7"></div>
	<div class="box" id="8"></div>
</div>`;

	boxes = Array.from(document.getElementsByClassName("box"));
	drawBoard();
}

const drawBoard = () => {
	boxes.forEach((box, index) => {
		const borderWidth = "7px";
		const borderType = "solid"
		const borderColor = "white";

		let styleString = "";

		if(index < 3) {
			styleString += `border-bottom: ${borderWidth} ${borderType} ${borderColor};`;
		}
		if(index % 3 == 0) {
			styleString += `border-right: ${borderWidth} ${borderType} ${borderColor};`;
		}
		if(index % 3 == 2) {
			styleString += `border-left: ${borderWidth} ${borderType} ${borderColor};`;
		}
		if(index > 5) {
			styleString += `border-top: ${borderWidth} ${borderType} ${borderColor};`;
		}
		box.style = styleString;
		box.addEventListener("click", boxClicked);
	});
};


const boxClicked = (e) => {
	if(my_char == curr_player)
	{
		console.log("box: " + e.target.id + " was clicked");
		const boxId = e.target.id;
		if(spaces[boxId] == consts.empty) {
			if(curr_player == my_char)
			{
				console.log("put");
				socket.emit("put", boxId);
			}
		}
	}
};

socket.on("connect", () => {
	console.log(socket.id);
});

socket.on("game-over", err => {
	console.log("Game Over -> " + err);
	// show error, clear board and un-display: none play button

	spaces = [consts.empty, consts.empty, consts.empty, consts.empty, consts.empty, consts.empty, consts.empty, consts.empty, consts.empty];
	curr_player = consts.empty;
	my_char = consts.empty;
	enemy_char = consts.empty;
	steps = 0;

	clearBoard();
	startMatch();
})

socket.on("startgame", (res) => {
	startGame();
	console.log(res);

	document.getElementById("loadingText").remove();
	
	// use king and starter to start the game

	if(res.king == socket.id)
	{
		console.log("YOU ARE KING! DON'T GET SLAYED!")
		my_char = consts.king;
		enemy_char = consts.slayer;
	}else {
		console.log("YOU ARE THE SLAYER! COVER YOURSELF TO KILL THE KING!");
		my_char = consts.slayer;
		enemy_char = consts.king;
	}
	
	if(res.starter == socket.id)
	{
		console.log("You are starting. Be smart!");
		curr_player = my_char;
	} else {
		console.log("Other player is starting...");
		curr_player = enemy_char;
	}
});

socket.on("player_put", res => {
	console.log(`player: ${res.id}, box: ${res.boxId}`);
	if(res.id == socket.id) {
		putCharacter(res.boxId, my_char);
	} else {
		putCharacter(res.boxId, enemy_char);
	}
})

socket.io .on("reconnect", (attempt) => {
	console.log("reconnect");
	location.reload();
})

const startMatch = () => {
	socket.emit("match");
	document.getElementById("playBtn").style = "display: none;";
	let searchingText = document.createElement("h3");
	searchingText.setAttribute("id", "loadingText");
	searchingText.textContent = "Searching for enemy...";
	document.querySelector(".container").appendChild(searchingText);
}

const clearBoard = () => {
	document.querySelector(".gameBoardContainer").innerHTML = "";
}

const putCharacter = (boxId, char) => {
	let box = document.getElementById(boxId);

	box.appendChild("");
}

//startGame();