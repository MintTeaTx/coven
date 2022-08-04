const express = require('express');
const config = require('config');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server (server);

let userMap = [];

app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('templates/template', {filename: "/chat"});
});

io.on('connection', (socket)=>{
  let res = {};

  console.log('cunt connected');
  userMap[socket.client.id] = {
    name:"anon",
    color:"#FF0000"
  };
  console.log(JSON.stringify(userMap));

  io.emit('userConnected', JSON.stringify(userMap[socket.client.id]));
  //on client disconnect
  socket.on('disconnect', ()=>{
    console.log('user disconnected');
    console.log(userMap);
    userMap=userMap.splice(userMap.indexOf(socket.client.id),1);
    socket.emit('userDisconnected', JSON.stringify(userMap[socket.client.id]));
  });
  //on client sending a message
  socket.on('sendMessage', (msg) => {
    if(msg.length < 1)
    {
      sendError(socket,"Message must be longer");
      return;
    }
    res = {
        user: userMap[socket.client.id],
        msg: msg
    };
    console.log(res);
    io.emit('sentMessage',JSON.stringify(res));
  });
  //on client changinge user
  socket.on('changeUsername', (msg) => {
    if(msg.length < 3)
    {
      sendError(socket,"username must be at least three long");
      return;
    }
    let old = userMap[socket.client.id].name;
    userMap[socket.client.id].name = msg;
    res = {
        msg:  old+" has changed their name to "+msg
    };
    sendError(socket,old+" has changed their name to "+msg);
    io.emit('systemMessage',JSON.stringify(res));
  });
  //on client change color
  socket.on('changeColor', (msg) => {
    if(!(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(msg)))
    {
          sendError(socket,"hey cheeky cunt it's a hex color");
      return;
    }
    let old = userMap[socket.client.id].color;
    userMap[socket.client.id].color = msg;
    sendError(socket,"Successfully changed color!");
  });
});

function sendError(socket, msg){
  res = {
       msg: msg
   };
 socket.emit('errorMessage', res);
}

function simpleStringify (object){
    // stringify an object, avoiding circular structures
    // https://stackoverflow.com/a/31557814
    var simpleObject = {};
    for (var prop in object ){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        if (typeof(object[prop]) == 'object'){
            continue;
        }
        if (typeof(object[prop]) == 'function'){
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
};

server.listen(3000, () => {
  console.log('listening on *:3000');
});
