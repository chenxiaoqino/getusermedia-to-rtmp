var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('static'));

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(8888, function(){
  //console.log('listening on *:8888');
});