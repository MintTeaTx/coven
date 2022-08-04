var username = 'anon';

const systemUser={
  name:"SERVER",
  color:"#DDAADD"
};

var socket = io({
  autoConnect: false
});

var selectedChannel = "general";

var userMap = [];

let loggedIn = false;

$(document).ready(function() {

  initialAuth();

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

  $("#close").on({
    mouseenter: function() {
      $(this).css("color", "red");
    },
    mouseleave: function() {
      $(this).css("color", "white");
    },
    click: function() {
      hideModal();
    }
  });

  $("#tabContainer > button").on('click',function() {
    console.log(this.value);
    selectedChannel = this.value;
    $(".channel-button").removeClass('active');
    $(".message-list").removeClass('active');
    $("#"+this.id).addClass('active');
    $("#"+this.value+"-messages").addClass('active');

  });

  socket.on('users', (users) => {
    console.log(users);
    users.forEach((user) => {
      console.log(user);
      user.self = user.userID === socket.id;
      userMap.push(user);
    });
    console.log(users);
    userMap = users.sort((a, b) => {
      if (a.self) return -1;
      if (b.self) return 1;
      if (a.username < b.username) return -1;
      return a.username > b.username ? 1 : 0;
    });

  });
  socket.on("sentMessage", (json) => {
    sentMessage(json.channel, json.user, json.msg);
  });
  socket.on('errorMessage', (args) => {
    sendMessage(selectedChannel,systemUser, json.msg);
  });
  socket.on('systemMessage', (args) => {
    json = JSON.parse(args);
    $("#messageList").append('<div class="entry">> <span style="color:#00FF00">SERVER</span>:' + json.msg + '</div>');
  });
  socket.on('profileEdit', (edit) => {
    console.log(edit);
  })
  socket.on('userConnected', (json) => {
    userMap.push(json.user);
    let user = json.user;
    $("#"+selectedChannel+"-messages").append('<div class="entry">><span style="color:'+user.color+';"> ' + user.name + '</span> has connected!</div>');
  });
  socket.on('userDisconnected', (user) => {
    $("#messageList").append('<div class="entry">> ' + user.name + ' has disconnected!</div>');
  });
  socket.on('session', (args) => {
    console.log(args);
    // socket.auth = {args[0]};
    //
    // localStorage.setItem("sessionID", sessionID);
    // socket.userID = args[1];
  });
  socket.on('error', (err) => {
    json = JSON.parse(args);

    switch (json.code) {
      case 441:
        alert("Username Invalid");
        break;
      case 442:
        alert("Username Taken");
        break;
    }
  });

});

function sentMessage(channel, from, content) {
  $("#"+channel+"-messages").append('<div class="entry"><span style="color:'+(from.color??'#00FF00')+ ';">' + from.name + '</span>>' + content + '</div>');
}

function showUserList() {
  $("#userList").empty();
  userMap.forEach((user) => {
    $("#userList").append('<div class="entry" style="color:'+user.user.color+';">' + user.user.name + '</div>')
  });
  showModal("User List", 'userListCard');

}

function initialAuth() {
  const sessionID = localStorage.getItem("sessionID");
  if (sessionID) {
    alert("Found session ID!");
    loggedIn = true;
    socket.auth = {
      sessionID
    };
    socket.connect();
  } else {
    showModal("Update Profile", 'userProfileForm');
  }

}

function profileSubmit() {
  if (loggedIn) {
    console.log("logged in, changing user");
    changeUsername();
  } else {
    console.log("not logged in, creating user");
    createUser($("#usernameField").val(), $("#colorField").val());
  }
}

function showModal(title, elem) {
  console.log(elem);
  $("#modalTitle").text(title);
  $("#" + elem).show();
  $("#modal").show();
}

function hideModal() {
  $("#modalTitle").text('');
  $(".modal-content").hide();

  $("#modal").hide();
}

function createUser(username, color) {

  socket.auth = {
    username,
    color
  };
  socket.connect();
  loggedIn = true;
  hideModal();
}

function sendMessage() {
  let input = $("#messageInput").val();
  socket.emit('sendMessage', {msg: $("#messageInput").val(), channel:selectedChannel});
  $("#messageInput").val('');
  return true;
}

function changeUsername() {

  let nameInput = $("#usernameField").val();
  let colorInput = $("#colorField").val();
  if (nameInput.length > 3) {
    socket.emit('changeUsername', nameInput);
  }
  if (colorInput.length > 0) {
    socket.emit('changeColor', colorInput);
  }
  hideModal();
  return true;
}

function joinChannel() {

}

function logout() {
  socket.disconnect();
}
