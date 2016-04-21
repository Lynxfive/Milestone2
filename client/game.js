var canvas;
var ctx;
var socket; 
var mousePos;
//var score = 0;		
//var draws = {};	
var squares = {};
var users ={};		
var player = {
	name: "",
	score: 0
}

var roomName = "";

var square = {
    x: 0, 
    y: 0, 
    height: 100, 
    width: 100,
	color: "black"
	// red - "#FF0000"
};

function ball(x, y){
	//console.log(x + " " + y);
	this.x = x;
	this.y = y;
	this.xSpeed = 3;
	this.ySpeed = 0;
	this.radius = 10;
	this.color = "black";
	/*this.draw = function() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.fillStyle = 'white';
		ctx.fill();
		ctx.lineWidth = 3;
		ctx.strokeStyle = 'red';
		ctx.stroke();
	};*/
}

ball.prototype.draw = function() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.fillStyle = 'white';
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'red';
		ctx.stroke();
	};

var pongBall;

var chat = document.getElementById('chat');

function connectUser(data){
	

	users[data.name] = data.name;
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.style.left = '32px'; div.style.top = '-16px';
	div.id = data.name;
	div.textContent = data.name + ": " + data.score;

	
 }
 
 function updatePlayers(data){
	var keys = Object.keys(data.users);
	for(var i = 0; i < keys.length; i++){
		if(!users[keys[i]]){
			var newPlayer = data.users[keys[i]];
			users[newPlayer.name] = newPlayer;
			var parentDiv = document.getElementById('players');
			var div = document.createElement('div');
			parentDiv.appendChild(div);
			div.style.left = '32px';
			div.style.top = '-16px';
			div.id = newPlayer.name;
			div.textContent = newPlayer.name + ": " + newPlayer.score;
			chat.value += newPlayer.name + " has joined the game.\n";
		}
	}

	drawPlayers();
 }


function drawPlayers(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var keys = Object.keys(users);
	for(var i = 0; i < keys.length; i++){
		var drawCall = users[keys[i]].info;				
		ctx.fillStyle = drawCall.color;
		ctx.fillRect(drawCall.x, drawCall.y, drawCall.width, drawCall.height);

	}
	if(pongBall){
		drawBall(pongBall);
	}	
	
}

function drawBall(ball){
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
	ctx.fillStyle = 'white';
	ctx.fill();
	ctx.lineWidth = 3;
	ctx.strokeStyle = 'red';
	ctx.stroke();
}

function updateBall(data){

	pongBall = new ball(data.x, data.y); 

	if(pongBall){
		drawBall(pongBall);
	}
	
}


function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
	  x: evt.clientX - rect.left,
	  y: evt.clientY - rect.top
	};
}

function updatePlayerPos(data){

	if(data != null){
		users[data.name].info = data.info
		drawPlayers();
	}
	
}

function updateScore(data){
	var keys = Object.keys(data);
	for(var i = 0; i < keys.length; i++){
		if(users[keys[i]] != null){
			var newPlayer = data[keys[i]];
			var div = document.getElementById(newPlayer.name);
			div.textContent = newPlayer.name + ": " + newPlayer.score;
		}
	}
}

function updateChat(data){
	chat.value += data.name + " clicked the square first!\n" +
	data.name + "'s new score: " + 	data.score + "\n";
}

function removeUser(data){
	var div = document.getElementById(data);
	div.parentNode.removeChild(div);
	delete users[data];
	chat.value += data + " has left the game. :(\n";
	drawPlayers();
}

function connectSocket(){
	socket = io.connect();
    chat.value = "";
	//var connect = document.querySelector("#connect");
	//connect.disabled = true;
    
    socket.on('connect', function () {
		console.log("connected");

		var userN = document.getElementsByClassName('playerName');
		var userName = userN[0].innerHTML;
		
		var user = userName;//document.querySelector("#username").value;
		if(!user) {
			user = 'unknown';
		}
		player.name = user;		
		var centerX = canvas.width / 2;
		var centerY = canvas.height / 2;
		var tempBall = new ball(centerX, centerY);	

		socket.emit('join', {name: user, score: 0, room: roomName, ball: tempBall});



		setInterval(function (){
			//console.log(users[player.name].info);
			socket.emit('updatePlayer', users[player.name]);
		}, 10);

		

    }); 


	
	socket.on('joined', connectUser);
	socket.on('updateBall', updateBall);
	//socket.on('updateUsers', updateUsers);
	socket.on('updatePlayers', updatePlayers);
	socket.on('updatePlayerPos', updatePlayerPos);
	socket.on('updateScore', updateScore);
	socket.on('removeUser', removeUser);
	//socket.on('updateSquares', updateSquares);
	socket.on('updateChat', updateChat);
	
		
}

function doKeyDown(e){
	//console.log(e.keyCode);

	// W
	if ( e.keyCode == 87 ) {
		users[player.name].info.y -= 5;
	}
	// A
	if ( e.keyCode == 65 ) {
		users[player.name].info.x -= 5;
	}
	// S
	if ( e.keyCode == 83 ) {
		users[player.name].info.y += 5;
	}			
	// D
	if ( e.keyCode == 68 ) {
		users[player.name].info.x += 5;		
	}

	//console.log(users[player.name].info);

	//socket.emit('updatePlayer', users[player.name]);
}

function init() {
	//var connect = document.querySelector("#connect");
	//connect.addEventListener('click', connectSocket);

	var lobName = document.getElementsByClassName('lobName');
	roomName = lobName[0].innerHTML;
	console.log("Room" + roomName);
	
    canvas = document.querySelector("#canvas");
    canvas.focus();
    ctx = canvas.getContext("2d");
	canvas.addEventListener( "keydown", doKeyDown, true);

	connectSocket();
	
}

window.onload = init;