const express = require('express');
const http = require('http');
const socketio = require('socket.io')
const path = require('path')
const app = express();
const server = http.createServer(app);
const formatMessage = require('./utils/messages')
const io = socketio(server);
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')
// setting a static folder to view contents on frontned 
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'Chat bot'

// run when client connects 
io.on('connection', socket => {
    console.log('new WS connection..');

    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        // Welcome the current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

        // boardcast the message to everyone except the user
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has joined the chat`));
        // send users and room info 
        io.to(user.room).emit('roomUser', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });



    // listen for the chat message from client and emit it back to the client 
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));

    });
    // Runs when the client disconnects 
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                "message",
                formatMessage(botName, `${user.username} has left the chat`)
            );

            // Send users and room info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});


const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
