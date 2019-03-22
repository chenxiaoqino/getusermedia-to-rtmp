![image](https://i.imgur.com/1cNMpvg.png)

# HTML5 to RTMP streaming gateway proxy

This project intends to allow an endpoint user to submit RTMP live video streaming directly using web browser and `getUserMedia`, without installing additional software. Currently, only Firefox with `MediaRecorder` API is supported.

## Usage

Start the server by `npm install` and `node server.js`, then open firefox to http://127.0.0.1:8888/ . The rtmp stream will be submitted to rtmp://127.0.0.1/live by default.

Please make sure there's an rtmp server up and running; try `nginx-rtmp-module` if you don't have one.

In production, the server should limit what the client can choose to push stream to.

## How does it work

From `getUserMedia`, `MediaRecorder`, via `socket.io` to `nodejs`, then to `ffmpeg` transcoding and publishing to `rtmp`. You can guess what happened in between.


## Limitation and To-Dos

This is still a relatively primitive project, and a lot of work still need to be done.

- No Audio Yet

The audio stream is corrupted due to timestamp issues if streamed directly. Should be resolved if `ffmpeg` is configured properly.

- No Chrome Yet

Beside MediaRecorder implementation issue, Chrome forces `getUserMedia` to be requested over SSL. (will deal with that later)

- No resolution adjustment on server-side yet

The server should allow resizing the output video. (coming soon)

- Configurable server with SSL (coming soon)

- Configurable client (coming soon)

- `socket.io` has bad efficiency doing binary websocket

Should migrate to raw websocket (later).

- Rate-limiting

Consider automatically adjust upstream rate via WebSocket `bufferedAmount` attribute. (Note that locally the rate can only be adjusted by video size...)

##  Create openssl
openssl genrsa -out abels-key.pem 2048

openssl req -new -sha256 -key  abels-key.pem -out abels-csr.pem

openssl x509 -req -in abels-csr.pem -signkey abels-key.pem -out abels-cert.pem

https://www.youtube.com/watch?v=O3iOWRugHbA

and enjoy

## Server

adobe media server 

livego server

## Add some function....
add customize_source

add auto Reconnection

add display flv use flv.js!!!

The audio stream is corrupted due to timestamp issues if streamed directly. Should be resolved if ffmpeg is configured properly.
over 40 min~ 50 min ......error 
---
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
---
    
