var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('static'));

io.on('connection', function(socket){
	//console.log('a user connected');
	socket.emit('message','Hello from socket.io server!');
	socket.on('message',function(m){
		//console.log('recv cli msg',m);
	});
	socket.on('binarystream',function(m){
		process.stdout.write(m);//console.log('recv cli binarystream',m);
	});
});

http.listen(8888, function(){
  //console.log('listening on *:8888');
});