# HTML5 to RTMP streaming gateway proxy

This project intends to allow an endpoint user to submit RTMP live video streaming directly using web browser and `getUserMedia`, without installing additional software. Currently, only Firefox with `MediaRecorder` API is supported.

## Usage

Start the server by `npm install` and `node server.js`, then open firefox to http://127.0.0.1:8888/ . The rtmp stream will be submitted to rtmp://127.0.0.1/live .

Please make sure there's an rtmp server up and running; try `nginx-rtmp-module` if you don't have one.

## How does it work

From `getUserMedia`, `MediaRecorder`, via `socket.io` to `nodejs`, then to `ffmpeg` transcoding and publishing to `rtmp`. You can guess what happened in between.


## Limitation and To-Dos

This is still a relatively primitive project, and a lot of work still need to be done.

1. No Audio Yet
The audio stream is corrupted due to timestamp issues if streamed directly. Should be resolved if `ffmpeg` is configured properly.
2. No Chrome Yet
Beside MediaRecorder issue, Chrome forces `getUserMedia` to be requested over SSL. (will deal with that later)
3. No resolution adjustment yet
Firefox does not honor video size constrains as well as Chrome does. Therefore, the server should enforce the correct resolution. (coming soon)
4. Configurable server with SSL (coming soon)
5. Configurable client (coming soon)
6. `socket.io` has bad efficiency doing binary websocket
Should migrate to raw websocket (later).