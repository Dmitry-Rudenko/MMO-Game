var game = new Phaser.Game(1000, 500, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var bg;
var addNewPlayer;
var playerMap = {};
var keybord;
var removePlayer;
var updatePos;
var moveLeft;
var i;


var Client = {};
Client.socket = io.connect();

function init() {
    game.stage.disableVisibilityChange = true;
};

function preload() {
    game.load.image('map', 'img/sky.jpg');
    game.load.image('sprite', 'img/red.png');
};

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    bg = game.add.tileSprite(0, 0, 1000, 500, 'map');
    Client.askNewPlayer();
    addNewPlayer = function(id, x, y) {
        playerMap[id] = game.add.sprite(x, y, 'sprite');
        game.physics.enable(playerMap[id], Phaser.Physics.ARCADE);
    }
    removePlayer = function(id) {
        playerMap[id].destroy();
        delete playerMap[id];
    };
    updatePos = function(id,x,y) {
        playerMap[id].x += x;
        playerMap[id].y += y;
    }

    keybord = game.input.keyboard.createCursorKeys();


};




Client.askNewPlayer = function() {
    Client.socket.emit('newplayer');
};

Client.socket.on('newplayer', function(data) {
    addNewPlayer(data.id, data.x, data.y);
});

Client.socket.on('allplayers', function(data) {
    console.log(data);
    for (var i = 0; i < data.length; i++) {
        addNewPlayer(data[i].id, data[i].x, data[i].y);
    }
});

Client.socket.on('remove', function(id) {
    removePlayer(id);
});






function update() {
    controller();
    //playerMap[i].body.velocity.x = 0;
    //playerMap[i].body.velocity.y = 0;
}




function controller() {
    if (keybord.left.isDown) {
        Client.socket.on('eventClient', function(data) {
            updatePos(data.id, data.x, data.y);
        });
        Client.socket.emit('eventServer', { unit_x : -1, unit_y : 0});
        //player.body.velocity.x = -150;
    } else if (keybord.right.isDown) {
        Client.socket.on('eventClient', function(data) {
            updatePos(data.id, data.x, data.y);
        });
        Client.socket.emit('eventServer', { unit_x : 1, unit_y : 0});
        //playerMap[i].body.velocity.x = 150;
    } else if (keybord.down.isDown) {
        Client.socket.on('eventClient', function(data) {
            updatePos(data.id, data.x, data.y);
        });
        Client.socket.emit('eventServer', { unit_x : 0, unit_y : 1});
        //playerMap[i].body.velocity.y = 150;
    } else if (keybord.up.isDown) {
        Client.socket.on('eventClient', function(data) {
            updatePos(data.id, data.x, data.y);
        });
        Client.socket.emit('eventServer', { unit_x : 0, unit_y : -1});
        //playerMap[i].body.velocity.y = -150;
    }
}



/*function moveRight(id, x) {

}*/

function render() {

}
