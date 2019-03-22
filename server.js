var express = require('express');
var app = express();
//var http = require('http').Server(app);


//var ffmpeg = require('fluent-ffmpeg');
//var stream = require('stream');
var spawn = require('child_process').spawn;
var fs = require('fs');

app.use(express.static('static'));
const server = require('https').createServer({
 key: fs.readFileSync('abels-key.pem'),
  cert: fs.readFileSync('abels-cert.pem')
 
},app);
//testing

var io = require('socket.io')(server);
spawn('ffmpeg',['-h']).on('error',function(m){
	console.error("FFMpeg not found in system cli; please install ffmpeg properly or make a softlink to ./!");
	process.exit(-1);
});


io.on('connection', function(socket){
	socket.emit('message','Hello from mediarecorder-to-rtmp server!');
	socket.emit('message','Please set rtmp destination before start streaming.');
	
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
		socket.emit('message','rtmp destination set to:'+m);
	}); 
	//socket._vcodec='libvpx';//from firefox default encoder
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
			'-re',
			'-fflags', '+igndts',
			'-i','-',
			//'-r','60',
			//'-vcodec', 'libx264',
			'-qp', '0',
			'-vcodec', 'copy',
			'-acodec', 'copy',
			//'-preset','ultrafast',
			//'-b:v','1500K',
			//'-crf' ,'22',
			//'-profile:v', 'baseline',
			//'-minrate' ,'5000k' ,
			//'-b:v', '400k',
			'-s', '1024x768',
			//'-r','30',
			//'-tune' ,'zerolatency',
			//'-preset', 'ultrafast',
			//'-an', //TODO: give up audio for now...
			//'-async', '1', 
			'-filter_complex', 'aresample=44100', //necessary for trunked streaming?
			'-strict', 'experimental',
			//'-strict', 'experimental', '-c:a', 'aac', '-b:a', '128k',
			//'-bufsize', '1000',
			//'-async','1',
			"-fflags",'nobuffer',
			'-analyzeduration','0',
			'-c:a', 'aac' ,
			//'-b:a', '128k',
			
			'-benchmark',
			'-f', 'flv', socket._rtmpDestination
		];
		
		console.log(socket._rtmpDestination);
		ffmpeg_process=spawn('ffmpeg', ops);
		feedStream=function(data){
			
			ffmpeg_process.stdin.write(data);
			//write exception cannot be caught here.	
		}

		ffmpeg_process.stderr.on('data',function(d){
			socket.emit('ffmpeg_stderr',''+d);
		});
		ffmpeg_process.on('error',function(e){
			console.log('child process error'+e);
			socket.emit('fatal','ffmpeg error!'+e);
			feedStream=false;
			socket.disconnect();
		});
		ffmpeg_process.on('exit',function(e){
			console.log('child process exit'+e);
			socket.emit('fatal','ffmpeg exit!'+e);
			socket.disconnect();
		});
	});

	socket.on('binarystream',function(m){
		if(!feedStream){
			socket.emit('fatal','rtmp not set yet.');
			try{
			ffmpeg_process.stdin.end();
			ffmpeg_process.kill('SIGINT');
			}catch(e){console.warn('killing ffmoeg process attempt failed...');}
			return;
		}
		feedStream(m);
	});
	socket.on('disconnect', function () {
		feedStream=false;
		if(ffmpeg_process)
		try{
			ffmpeg_process.stdin.end();
			ffmpeg_process.kill('SIGINT');
		}catch(e){console.warn('killing ffmoeg process attempt failed...');}
	});
	socket.on('error',function(e){
		
		console.log('socket.io error:'+e);
	});
});

io.on('error',function(e){
	console.log('socket.io error:'+e);
});

//http.listen(8888, function(){
 // console.log('http and websocket listening on *:8888');
//});

server.listen(443, function(){
  console.log('https and websocket listening on *:443');
});

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err)
    // Note: after client disconnect, the subprocess will cause an Error EPIPE, which can only be caught this way.
})
