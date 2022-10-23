const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
// get username and room from url 
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// join chatroom  info sent from client to server 
socket.emit('joinRoom', { username, room });

// get rooms and users 
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
})

// message from server 
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // scroll down 
    chatMessage.scrollTop = chatMessage.scrollHeight;
})

// message submitted from the client 
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    // get the message 
    const msg = e.target.elements.msg.value;

    // Emit the message to the server 
    socket.emit('chatMessage', msg);

    // clear the message value 
    e.target.elements.msg.value = "";
})

// output the message the MSG to DOM 

function outputMessage(message) {
    const div = document.createElement('div');
    // add a the class message HTML related 
    div.classList.add('message');
    // change the content in the inner HTML 
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
          <p class="text">
            ${message.text}
          </p>`;
    // selecting the class chat-messages and appending the child i.e the div part we need to add 
    document.querySelector('.chat-messages').appendChild(div);

}
// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}
//Add users to DOM
function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
        window.location = '../index.html';
    } else {
    }
});