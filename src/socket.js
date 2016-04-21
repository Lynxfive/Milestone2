var io;

//var shell = require('game-shell')();


var players = [];

var square = {
    x: 0,
    y: 0,
    height: 100,
    width: 100,
	color: "red"
};

var player = {
		number: 0,
		score: 0
};

var numUsers = 0;

var users = {};
var squares = [];
var roomName = "";

// add server ball and calculate movement here
// create it once and check if a new ball comes in
// update ball on the server since they share
// probably do collisions here too
var serverBall = null;

var configureSockets = function (socketio) {
    io = socketio;

    io.on('connection', function (socket) {
	
		onJoined(socket);
		onDisconnect(socket);
	    onMovementUpdate(socket);

		socket.on('draw', function(data) {
			if(squares.length === 0){
				squares.push(data);
			}	
			io.sockets.in(roomName).emit('updateSquares', squares);
		});

	});

};

function handler (req, res) {

	fs.readFile(__dirname + '/../client/index.html', function (err, data) {
		if (err) {
		  throw err;
		}

		res.writeHead(200);
		res.end(data);
	});
 // }

  
}


var onScoreUpdate = function(socket) {
	socket.on('updateScore', function(data) {
		socket.name = data.name;
		users[socket.name] = {name: data.name, score: data.score};	
		io.sockets.in(roomName).emit('updateScore', users);
		io.sockets.in(roomName).emit('updateChat', {name: data.name, score: data.score});
	});
};

var onMovementUpdate = function(socket) {
	socket.on('updatePlayer', function(data) {
			users[socket.name] = data;
			io.sockets.in(roomName).emit('updatePlayerPos', data);		
	});
};
/*
setInterval(function (){
			//console.log(users[player.name].info);
			socket.emit('updateBall', pongBall);
		}, 1000);
		*/

var onBallMovementUpdate = function(socket) {
	socket.on('updateBall', function(data) {
			io.sockets.in(roomName).emit('updateBall', data);		
	});
};

var onJoined = function(socket) {
	socket.on("join", function(data) {
		var numPlayers = Object.keys(users).length;
		if(numPlayers < 2){
			socket.name = data.name;
			var playerInfo;
			// set these variable global/constant
			if(numPlayers === 0){
				playerInfo = {x: 10, y: 225, width: 50, height: 50, color: "red"};
			} else if(numPlayers == 1){
				playerInfo = {x: 440, y: 225, width: 50, height: 50, color: "blue"};
				serverBall = data.ball;
				//console.log(serverBall);
			}
			users[socket.name] = {name: data.name, score: data.score, info: playerInfo};	
			var allUsers = users;
			var keys = Object.keys(allUsers);
			roomName = data.room;	
			socket.join(roomName);
			io.sockets.in(roomName).emit('updatePlayers', {users: allUsers, ball: serverBall});
		}
		
		//io.in('room1').emit('updatePlayers', users[socket.name]);
		if(serverBall != null){

			
			setInterval(function (){

				// turn this into point scoring
				if(serverBall.x + serverBall.radius >= 500 || serverBall.x - serverBall.radius <= 0){
					serverBall.xSpeed = -serverBall.xSpeed;
				}


				// do collision detection here
				checkCollisions();


				serverBall.x += serverBall.xSpeed;
				//console.log(serverBall.x);

				io.sockets.in(roomName).emit('updateBall', serverBall);
			}, 100);
		}
		

	});
  };
  users
var onDisconnect = function(socket) {
	socket.on('disconnect', function(data) {
		var user = socket.name;
		io.sockets.in(roomName).emit('removeUser', user);
		socket.leave(roomName);
		delete users[socket.name];
	});
};

function checkCollisions(){
	var keys = Object.keys(users);
	var ballRight = serverBall.x + serverBall.radius;
	var ballLeft = serverBall.x - serverBall.radius;
	for(var i = 0; i < keys.length; i++){
		if(i == 0){

			var playerOne = users[keys[i]].info;

			if(ballLeft <= playerOne.x + playerOne.width && 
				(serverBall.y >= playerOne.y && serverBall.y <= playerOne.y + playerOne.height)){
				serverBall.xSpeed = -serverBall.xSpeed;
			}
			
		} else if(i == 1) {

			var playerTwo = users[keys[i]].info;

			if(ballRight >= playerTwo.x && 
				(serverBall.y >= playerTwo.y && serverBall.y <= playerTwo.y + playerTwo.height)){
				serverBall.xSpeed = -serverBall.xSpeed;
			}
		}		
	}
}

module.exports.configureSockets = configureSockets;
  

//console.log("listening on port " + PORT);
