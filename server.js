var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3000;

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.lastPlayderID = 0;

io.on('connection', function(socket) {
    console.log('an user connected ' + socket.id);
    socket.on('newplayer', function() {
        socket.player = {
            id: server.lastPlayderID++,
            x: randomInt(10, 1000),
            y: randomInt(10, 500)
        };
        console.log("PlayerID - " + socket.player.id);
        socket.emit('allplayers', getAllPlayers());
        socket.broadcast.emit('newplayer', socket.player);
        socket.on('disconnect', function() {
            console.log("an user disconnected " + socket.id);
            io.emit('remove', socket.player.id);
        });

        socket.on('eventServer', function(data) {
            socket.emit('eventClient', { id : socket.player.id, x : data.unit_x, y : data.unit_y });
        });

    });
});

function getAllPlayers() {
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID) {
        var player = io.sockets.connected[socketID].player;
        if (player) players.push(player);
    });
    return players;
}

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

server.listen(port, function() { // Listens to port 3000
    console.log('Listening on ' + port);
});
