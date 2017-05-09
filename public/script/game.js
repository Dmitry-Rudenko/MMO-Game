var width = window.innerWidth;
var height = window.innerHeight;
console.log(width);
var socket, players = {},
    live, bg, keybord, naMe, unit_name;
var game = new Phaser.Game(width, height, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var style = { font: "25px Arial", fill: "white" };
var points = {};



function preload() {
    //game.load.image("player", "img/red.png");
    game.load.spritesheet('player', 'img/unit_sprite.png', 84, 84, 6);
    game.load.spritesheet("point", "img/point.png", 64, 53, 8);
    game.load.image("map", "img/sky.jpg")

}

function create() {
    socket = io.connect(window.location.host);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    bg = game.add.tileSprite(0, 0, 3000, 1000, 'map');   


    socket.on("add_players", function(data) {
        data = JSON.parse(data);
        for (let playerId in data) {
            if (players[playerId] == null && data[playerId].live) {
                addPlayer(playerId, data[playerId].x, data[playerId].y, data[playerId].name, data[playerId].size);
            }
        }
        live = true;
    });

    socket.on("add_player", function(data) {
        data = JSON.parse(data);
        console.log(data);
        if (data.player.live) {
            addPlayer(data.id, data.player.x, data.player.y, data.player.name, data.player.size);
        }
    });

    socket.on("player_position_update", function(data) {
        data = JSON.parse(data);

        players[data.id].player.x += data.x;
        players[data.id].player.y += data.y;

        players[data.id].unit_name.x += data.x;
        players[data.id].unit_name.y += data.y;
        players[data.id].unit_name.anchor.setTo(0.5, 1);

    });

    socket.on("player_rotation_update", function(data) {
        data = JSON.parse(data);
        players[data.id].player.rotation = data.value;
    });



    socket.on('player_disconnect', function(id) {
        players[id].player.kill();
        players[id].unit_name.kill();
        //delete players[id];
    });

    socket.on('create_veg', function(data) {
        data = JSON.parse(data);
        createVeg(data.id, data.coord.x, data.coord.y);
        //console.log(point.id);

        //setTimeout(function(){
          //   point[point.id].kill();
         //}, 5000);
       

    });


    socket.on('clean_dead_player', function(victimId) {
        if (victimId == socket.id) {
            live = false;
        }
        var game_over_style = { font: "85px Arial", fill: "white" };
        var GameOver = game.add.text(game.world.centerX, game.world.centerY, "Game Over", game_over_style);
        GameOver.anchor.setTo(0.5, 0.5);
        players[victimId].player.kill();
        players[victimId].unit_name.kill();
        //players[victimId].weapon.kill();
        //delete players[victimId];
    });

    socket.on('grow_player', function(data) {
        data = JSON.parse(data);
        //console.log(data.size);
        players[data.id].player.size = data.size;
        players[data.id].player.scale.set(data.size, data.size);
    });

    socket.on('clean_dead_point', function(pointDeadId){
        points[pointDeadId].point.kill();
    });

    keybord = game.input.keyboard.createCursorKeys();
}

function update() {
    if (live) {
        characterController();
        players[socket.id].player.rotation = game.physics.arcade.angleToPointer(players[socket.id].player);
        socket.emit("player_rotation", players[socket.id].player.rotation);

    }
    pointCollisions();
    setCollisions();
}

function unitsHitHandler(player) {
    socket.emit("player_killed", player.id);
}

function collisionHandler(player, point) {
    console.log(point.id);
    socket.emit("point_kill", point.id);
    

    socket.emit("player_grow", JSON.stringify({
        "id": player.id,
        "size": player.size
    }));

}

function pointCollisions() {
    for (let x in players) {
        for (let y in points) {
            game.physics.arcade.collide(players[x].player, points[y].point, collisionHandler, null, this)
        }
    }
}

function setCollisions() {
    for (let x in players) {
        for (let y in players) {
            if (x != y) {
                game.physics.arcade.collide(players[x].player, players[y].player, unitsHitHandler, null, this);
            }
        }
    }
}

function sendPosition(character) {
    socket.emit("player_move", JSON.stringify({
        "id": socket.id,
        "character": character
    }));
}

function characterController() {
    /*if (game.input.activePointer.leftButton.isDown) {
        socket.emit("shots_fired", socket.id);
    }*/
    if (game.input.keyboard.isDown(Phaser.Keyboard.A) || keybord.left.isDown) {
        //players[socket.id].player.x -= 5;
        sendPosition("A");
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.D) || keybord.right.isDown) {
        //players[socket.id].player.x += 5;
        sendPosition("D");
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.W) || keybord.up.isDown) {
        //players[socket.id].player.y -= 5;
        sendPosition("W");
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.S) || keybord.down.isDown) {
        //players[socket.id].player.y += 5;
        sendPosition("S");
    }
}

function addPlayer(playerId, x, y, name, size) {
    let player = game.add.sprite(x, y, "player");
    var move = player.animations.add('move');
    player.animations.play('move', 5, true);
    unit_name = game.add.text(x, y, name, style);
    unit_name.anchor.setTo(0.5, 1);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.anchor.set(0.5);
    player.body.drag.set(70);
    player.id = playerId;
    player.size = size;
    players[playerId] = { player, unit_name };
    game.camera.follow(players[playerId].player, Phaser.Camera.FOLLOW_PLATFORMER);
}

function createVeg(id, x, y) {
    let point = game.add.sprite(x, y, 'point');
    var point_move = point.animations.add('point_move');
    point.animations.play('point_move', 30, true);
    game.physics.enable(point, Phaser.Physics.ARCADE);
    point.anchor.set(0.5);
    point.body.drag.set(70);
    point.id = id;
    points[id] = {point};
    
}

function render() {

}
