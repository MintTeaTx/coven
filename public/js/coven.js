var username = 'anon';


var socket = io();

$(document).ready(function() {


  $("#x").on({
    mouseenter: function() {
      $(this).css("color", "red");
    },
    mouseleave: function() {
      $(this).css("color", "white");
    },
    click: function() {
      if (hidden) {
        $(".terminal.body").show();
      } else {
        $(".terminal.body").hide();
      }
      hidden = !hidden;
    }
  });

  $("#cursor").remove();
  $("#input").focus();

  $("button").on('click', function() {
    console.log("Clicked! " + $(this).attr('id'));
    switch ($(this).attr('id')) {
      case 'sendMessage':
        sendMessage();
        break;
      case 'setUser':
        $("#userModal").css("display", "block");
        break;
      case 'submitProfile':
        changeUsername();
        break;
      default:

    }
  });

  socket.onAny((event, ...args) => {

    let json = args;

    console.log(event);
    console.log(args);
    switch (event) {

      case "sentMessage":
        json = JSON.parse(args[0]);
        $("#messageList").append('<div class="entry">> <span style="color:' + json.user.color + '">' + json.user.name + '</span>:' + json.msg + '</div>');
        break;
      case 'errorMessage':
        json = JSON.parse(args[0]);
        $("#messageList").append('<div class="entry" style="color:#FF0000">> SERVER</span>:' + json.msg + '</div>');
        break;
      case 'systemMessage':
        json = JSON.parse(args[0]);
        $("#messageList").append('<div class="entry">> <span style="color:#00FF00">SERVER</span>:' + json.msg + '</div>');
        break;
      case 'userConnected':
        json = JSON.parse(args[0]);
        $("#messageList").append('<div class="entry">> ' + json.name + ' has connected!</div>');
        break;
      case 'userDisconnected':
        json = JSON.parse(args[0]);
        $("#messageList").append('<div class="entry">> ' + json.name + ' has disconnected!</div>');
        break;
      default:

    }
  });
});



function sendMessage() {
  let input = $("#messageInput").val();
  socket.emit('sendMessage', $("#messageInput").val());
  $("#messageInput").val('');
  return true;
}

function changeUsername() {
  let nameInput = $("#usernameField").val();
  let colorInput = $("#colorField").val();
  if (nameInput.length > 3) {
    socket.emit('changeUsername', nameInput);
    socket.auth = {nameInput};
  }
  if (colorInput.length > 0) {
    socket.emit('changeColor', colorInput);
  }
  $("#userModal").hide();
  return true;
}
