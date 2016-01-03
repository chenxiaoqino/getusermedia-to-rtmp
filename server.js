var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var ffmpeg = require('fluent-ffmpeg');
//var stream = require('stream');
var spawn = require('child_process').spawn;

//testing
spawn('ffmpeg',['-h']).on('error',function(m){
	console.error("FFMpeg not found in system cli; please install ffmpeg properly or make a softlink to ./!");
	process.exit(-1);
});

app.use(express.static('static'));

io.on('connection', function(socket){
	//console.log('a user connected');
	socket.emit('message','Hello from socket.io server!');
	//socket.on('message',function(m){
	//	console.log('client message:',m);
	//});
	
	var ffmpeg_process, feedStream=false;
	socket.on('config_rtmpDestination',function(m){
		if(typeof m != 'string'){
			socket.emit('fatal','rtmp destination setup error.');
			return;
		}
		var regexValidator=/^rtmp:\/\/[^\s]*$/;//TODO: should read config
		if(!regexValidator.test(m)){
			socket.emit('fatal','rtmp address rejected.');
			return;
		}
		socket._rtmpDestination=m;
	}); 
	socket._vcodec='libvpx';//from firefox default encoder
	socket.on('config_vcodec',function(m){
		if(typeof m != 'string'){
			socket.emit('fatal','input codec setup error.');
			return;
		}
		if(!/^[0-9a-z]{2,}$/.test(m)){
			socket.emit('fatal','input codec contains illegal character?.');
			return;
		}//for safety
		socket._vcodec=m;
	}); 	


	socket.on('start',function(m){
		if(ffmpeg_process || feedStream){
			socket.emit('fatal','stream already started.');
			return;
		}
		if(!socket._rtmpDestination){
			socket.emit('fatal','no destination given.');
			return;
		}
		var ops=[
			'-vcodec', socket._vcodec,'-i','-',
			'-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency',
			'-an', //TODO: give up audio for now...
			//'-async', '1', 
			//'-filter_complex', 'aresample=44100', //necessary for trunked streaming?
			//'-strict', 'experimental', '-c:a', 'aac', '-b:a', '128k',
			'-bufsize', '1000',
			'-f', 'flv', socket._rtmpDestination
		];
		ffmpeg_process=spawn('ffmpeg', ops);
		feedStream=function(data){
			try{
				ffmpeg_process.stdin.write(data);
			}catch(e){
				socket.emit('exception',e);
				//ignore some segment in pipe is okay...
			}
		}

		ffmpeg_process.stderr.on('data',function(d){
			//console.log('stderr:'+d);
			socket.emit('ffmpeg_stderr',''+d);
		});
		//ffmpeg_process.stderr.pipe(process.stderr);
		ffmpeg_process.on('error',function(e){
			socket.emit('fatal','ffmpeg error!'+d);
			feedStream=false;
			socket.disconnect();
		});
		//new subprocess process

	});

	socket.on('binarystream',function(m){
		if(!feedStream){
			socket.emit('fatal','rtmp not set yet.');
			return;
		}
		feedStream(m);
	});
	socket.on('disconnect', function () {
		//console.log('user disconnected');
		try{ffmpeg_process.kill('SIGHUP');}catch(e){console.warn('killing ffmoeg process attempt failed...');}
	});
});

http.listen(8888, function(){
  //console.log('listening on *:8888');
});