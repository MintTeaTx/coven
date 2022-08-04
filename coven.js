const express = require('express');
const config = require('config');
const app = express();
const http = require('http');
const server = http.createServer(app);
const sanitize = require('sanitize-html');
const {
  Server
} = require("socket.io");
const io = new Server(server);

let userMap = [];

app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('templates/template', {
    filename: "/chat"
  });
});


io.use((socket, next) => {
  // const sessionID = socket.handshake.auth.sessionID;
  // if (sessionID) {
  //   const session = sessionStore.findSession(sessionID);
  //   if (session) {
  //     socket.sessionID = sessionID;
  //     socket.userID = session.userID;
  //     socket.username = session.username;
  //     return next();
  //   }
  // }
  const username = socket.handshake.auth.username;
  const color = socket.handshake.auth.color;
  if(!username){
    return next(new Error("invalid user"));
  }
  if(!color) {
    color = "#00FF00";
  }
  // socket.sessionID = randomId();
  // socket.userID = randomId();
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
 socket.emit("users", users);
 socket.broadcast.emit("userConnected", {
   userID: socket.id,
   user: user(socket)
 });
 socket.join("general");
 socket.join("general2");

  let res = {};
    socket.emit("session", {
      sessionID: socket.sessionID,
      userID: socket.userID
    });

    socket.on('joinChannel', ()=> {

    });

    //on client disconnect
    socket.on('disconnect', () => {
      console.log('user disconnected');
      socket.emit('userDisconnected', {
        userID: socket.id,
        username: socket.username
      });
    });

    socket.on('sendMessage', (json) => {
        console.log("Message recieved");
        console.log(json);
        if (json.msg.length < 1) {
          sendError(socket, "Message must be longer");
          return;
        }
        io.to(json.channel).emit('sentMessage', {
          channel: json.channel,
          user: user(socket),
          msg: sanitize(json.msg)
        });
      });

      //on client changinge user
      socket.on('changeUsername', (msg) => {
        if (msg.length < 3) {
          sendError(socket, "username must be at least three long");
          return;
        }
        let old = socket.username;
        res = {
          msg: old + " has changed their name to " + msg
        };
        socket.username = msg;
        sendError(socket, old + " has changed their name to " + msg);
        io.emit('systemMessage', JSON.stringify(res));
      });
      //on client change color

/*
  io.emit('userConnected', JSON.stringify(userMap[socket.client.id]));
  //on client disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected');
    console.log(userMap);
    userMap = userMap.splice(userMap.indexOf(socket.client.id), 1);
    socket.emit('userDisconnected', JSON.stringify(userMap[socket.client.id]));
  });
  //on client sending a message


  */
});

function user(socket){
  return {
    name:sanitize(socket.username),
    color:sanitize(socket.color)
  };
}

function sendError(socket, msg) {
  res = {
    msg: msg
  };
  socket.emit('errorMessage', res);
}

function simpleStringify(object) {
  // stringify an object, avoiding circular structures
  // https://stackoverflow.com/a/31557814
  var simpleObject = {};
  for (var prop in object) {
    if (!object.hasOwnProperty(prop)) {
      continue;
    }
    if (typeof(object[prop]) == 'object') {
      continue;
    }
    if (typeof(object[prop]) == 'function') {
      continue;
    }
    simpleObject[prop] = object[prop];
  }
  return JSON.stringify(simpleObject); // returns cleaned up JSON
};

server.listen(3000, () => {
  console.log('listening on *:3000');
});
