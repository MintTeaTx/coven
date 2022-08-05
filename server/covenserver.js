const config = require('config');
const app = require('express')();
const http = require('http');
const server = http.createServer(app);
const sanitize = require('sanitize-html');
const PORT = 8080;
var io = require('socket.io')(server, {
  cors: {
    origin: "*"
  }
});

let CHANNELS = [{
    id: "1",
    name: "General"
    users :[]
  }
];
//use an auth middleware, duh
io.use((socket, next) => {

  const username = socket.handshake.auth.username;
  const color = socket.handshake.auth.color;
  if (!username) {
    return next(new Error("invalid user"));
  }
  if (!color) {
    color = "#00FF00";
  }
  socket.username = sanitize(username);
  socket.color = sanitize(color);
  next();
});

io.on('connection', (socket) => {
  const users = [];

  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      user: user(socket)

    });
  }
  //User connected, broadcast to server
  socket.broadcast.emit("userConnected", {
    userID: socket.id,
    user: user(socket)
  });

  socket.join(CHANNELS[0].id);

  console.log('new client connected');

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID
  });


  socket.on('getChannels', (req) => {
    socket.emit('channelList', {
      channels: CHANNELS
    });
  })

  socket.on('joinChannel', id => {

  });

  socket.on("sendMessage", json => {
    io.to(json.channel_id).emit("sentMessage",{
        channel_id: json.channel_id,
        user: user(socket),
        msg: sanitize(json.text),
        id: Date.now()
    });
  });

  socket.on('disconnect', () => {
    console.log('disconnection found');
  })
});


function user(socket){
  return {
    name:sanitize(socket.username),
    color:sanitize(socket.color)
  };
}

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
