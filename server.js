var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ffmpeg = require('fluent-ffmpeg');
var stream = require('stream');

app.use(express.static('static'));

io.on('connection', function(socket){
	console.log('a user connected');
	socket.emit('message','Hello from socket.io server!');
	socket.on('message',function(m){
		console.log('recv cli msg',m);
	});
	
	var command, videoStream=false;
	socket.on('config_rtmpDestination',function(m){
		if(typeof m != 'string'){
			socket.emit('error','rtmp destination setup error.');
			return;
		}
		var regexValidator=/^rtmp:\/\//;//TODO: should read config
		if(!regexValidator.test(m)){
			socket.emit('error','rtmp address rejected.');
			return;
		}
		socket._rtmpDestination=m;

		videoStream = new stream.Readable();
		command=ffmpeg()
			.input(videoStream)
			//.videoCodec('libvpx')
			.output(socket._rtmpDestination)
			.videoCodec('libx264')
			.on('error', function(err, stdout, stderr) {
			    console.log('ffmpeg error: ' + err.message);
			    console.log(stdout);
			    console.log(stderr);
			    videoStream=false;
			})
			.run();
	}); 
	
	socket.on('binarystream',function(m){
		if(!videoStream){
			socket.emit('error','rtmp setup failed.');
			return;
		}
		videoStream.push(m);
		console.log('pushed',m.length);
		//process.stdout.write(m);//console.log('recv cli binarystream',m);
	});
});

http.listen(8888, function(){
  //console.log('listening on *:8888');
});