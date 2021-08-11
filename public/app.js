const socket = io();

const consts = {
	empty: -1,
	x: 0,
	o: 1
} 

var spaces = [consts.empty, consts.empty, consts.empty, consts.empty, consts.empty, consts.empty, consts.empty, consts.empty, consts.empty];
var curr_player = consts.empty;
var my_char = consts.empty;
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

	document.getElementById("playBtn").style = "display: none;";
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
		const id = e.target.id;
		if(spaces[id] == consts.empty) {
			console.log("put");
			socket.emit("put", id);
		}
	}
};

socket.on("connect", () => {
	console.log(socket.id);
	socket.emit("match");
});

socket.on("game-over", err => {
	console.log("Game Over -> " + err);
	// show error, clear board and un-display: none play button
})

socket.on("startgame", (res) => {
	startGame();
	console.log(res);
	// use king and starter to start the game
});

//startGame();