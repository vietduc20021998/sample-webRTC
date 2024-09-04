const socket = new WebSocket('ws://localhost:8080');
$('#div-chat').hide();

let current = "";

socket.addEventListener("message", (event) => {
  const arrUserInfo = JSON.parse(event.data);
  const dataRender = [];

  dataRender.push(arrUserInfo.currentUser);

  if (arrUserInfo.message === "duplicated") return alert("Username already in use!");
  if (arrUserInfo.message === "userLeave") {
    alert(`${arrUserInfo.currentUser.name} left the room!`);
  }

  if (arrUserInfo.currentUser.name === current) {
    $('#div-chat').show();
    $('#div-dang-ky').hide();
  }

  $('#ulUser').empty();

  arrUserInfo.data.map(user => {
    const { name, userId, message } = user;
    $('#ulUser').append(`<li id="${userId}">${name}</li>`);
  });
});

socket.addEventListener("close", (event) => {
  console.log(event)
});

function openStream() {
  const config = { audio: false, video: true };
  return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
  const video = document.getElementById(idVideoTag);
  video.srcObject = stream;
  video.play();
}

const peer = new Peer();

peer.on('open', id => {
  $('#my-peer').append(id);
  $('#btnSignUp').click(() => {
    const username = $('#txtUsername').val();
    if (username.length === 0) return alert("Username is not empty!");
    const newData = JSON.stringify({
      name: username,
      userId: id,
    })
    current = username;
    socket.send(newData);
  });
});

// Caller
$('#btnCall').click(() => {
  const id = $('#remoteId').val();
  openStream()
    .then(stream => {
      playStream('localStream', stream);
      const call = peer.call(id, stream);
      call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

// Answerer
peer.on('call', call => {
  openStream()
    .then(stream => {
      call.answer(stream);
      playStream('localStream', stream);
      call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

$("#ulUser").on("click", "li", function () {
  const id = $(this).attr("id");
  openStream()
    .then(stream => {
      playStream('localStream', stream);
      const call = peer.call(id, stream);
      call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});