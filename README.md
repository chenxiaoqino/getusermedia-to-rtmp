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
