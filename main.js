let assets = [
    "sounds/chimes.wav",
    "images/explorer.png",
    "images/dungeon.png",
    "images/blob.png",
    "images/treasure.png",
    "images/door.png"
];

let game = hexi(512, 512, setup, assets, load);

game.fps = 60;
game.border = "1px black dashed";

let dungeon, player, treasure, enemies, chimes, exit,
    healthBar, message, gameScene, gameOverScene;

function play () {

    game.move(player);
    game.contain(
        player,
        {
            x: 32, y: 16,
            width: game.canvas.width - 32,
            height: game.canvas.height - 32
        }
    );

    //Set `playerHit` to `false` before checking for a collision
    let playerHit = false;

    //Loop through all the sprites in the `enemies` array
    enemies.forEach(enemy => {

        //Move the enemy
        game.move(enemy);

        //Check the enemy's screen boundaries
        let enemyHitsEdges = game.contain(
            enemy,
            {
                x: 32, y: 16,
                width: game.canvas.width - 32,
                height: game.canvas.height - 32
            }
        );

        //If the enemy hits the top or bottom of the stage, reverse
        //its direction
        if (enemyHitsEdges) {

            if (enemyHitsEdges.has("top") || enemyHitsEdges.has("bottom")) {

                enemy.vy *= -1;

            }

        }

        //Test for a collision. If any of the enemies are touching
        //the player, set `playerHit` to `true`
        if (game.hitTestRectangle(player, enemy)) {

            playerHit = true;

        }

    });

    //If the player is hit...
    if (playerHit) {

        //Make the player semi-transparent
        player.alpha = 0.5;

        //Reduce the width of the health bar's inner rectangle by 1 pixel
        if (healthBar.inner.width > 0) healthBar.inner.width -= 5;

    } else {

        //Make the player fully opaque (non-transparent) if it hasn't been hit
        player.alpha = 1;

    }

    if (game.hitTestRectangle(player, treasure)) {

        //If the treasure is touching the player, center it over the player
        treasure.x = player.x - 3;
        treasure.y = player.y + 16;

        if(!treasure.pickedUp) {

            //If the treasure hasn't already been picked up,
            //play the `chimes` sound
            chimes.play();
            treasure.pickedUp = true;
        }

    }

    //Does the player have enough health? If the width of the `innerBar`
    //is less than zero, end the game and display "You lost!"
    if (healthBar.inner.width === 0) {

        game.state = end;
        message.content = "You lost!";

    }

    //If the player has brought the treasure to the exit,
    //end the game and display "You won!"
    if (game.hitTestRectangle(treasure, exit)) {

        game.state = end;
        message.content = "You won!";

    }

}

function end () {

    gameScene.visible = false;
    gameOverScene.visible = true;

}

function setup () {

    //Create the `chimes` sound object
    chimes = game.sound("sounds/chimes.wav");

    //Create the `gameScene` group
    gameScene = game.group();

    // Create the dungeon background
    dungeon = game.sprite("images/dungeon.png");
    gameScene.addChild(dungeon);

    //Create the `exit` door sprite
    exit = game.sprite("images/door.png");
    exit.x = 32;
    gameScene.addChild(exit);

    //Create the `player` sprite
    player = game.sprite("images/explorer.png");
    player.x = 68;
    player.y = game.canvas.height / 2 - player.halfHeight;
    gameScene.addChild(player);

    //Create the `treasure` sprite
    treasure = game.sprite("images/treasure.png");
    game.stage.putCenter(treasure, 200, 0);
    treasure.pickedUp = false;
    gameScene.addChild(treasure);

    //An array to store all the enemies
    enemies = [];

    //Make the enemies
    let numberOfEnemies = 6,
        spacing = 48,
        xOffset = 150,
        direction = 1;

    //Make as many enemies as there are `numberOfEnemies`
    for (let i = 0; i < numberOfEnemies; i++) {

        //Each enemy is a red rectangle
        let enemy = game.sprite("images/blob.png");

        //Space each enemey horizontally according to the `spacing` value.
        //`xOffset` determines the point from the left of the screen
        //at which the first enemy should be added.
        let x = spacing * i + xOffset;

        //Give the enemy a random y position
        let y = game.randomInt(0, game.canvas.height - enemy.height);

        //Set the enemy's direction
        enemy.x = x;
        enemy.y = y;

        //Set the enemy's vertical velocity. `direction` will be either `1` or
        //`-1`. `1` means the enemy will move down and `-1` means the enemy will
        //move up. Multiplying `direction` by `speed` determines the enemy's
        //vertical direction
        enemy.vy = game.randomInt(1, 5) * direction;

        //Reverse the direction for the next enemy
        direction *= -1;

        //Push the enemy into the `enemies` array
        enemies.push(enemy);

        //Add the enemy to the `gameScene`
        gameScene.addChild(enemy);
    }

    //Create the health bar
    let outerBar = game.rectangle(120, 16, "black"),
        innerBar = game.rectangle(120, 16, "yellowGreen");

    //Group the inner and outer bars
    healthBar = game.group(outerBar, innerBar);

    //Set the `innerBar` as a property of the `healthBar`
    healthBar.inner = innerBar;

    //Position the health bar
    healthBar.x = game.canvas.width - 160;
    healthBar.y = 8;

    //Add the health bar to the `gameScene`
    gameScene.addChild(healthBar);

    //Add some text for the game over message
    message = game.text("Game Over!", "64px Futura", "black", 20, 20);
    message.x = 120;
    message.y = game.canvas.height / 2 - 64;

    //Create a `gameOverScene` group
    gameOverScene = game.group(message);
    gameOverScene.visible = false;

    game.arrowControl(player, 5);

    game.keyboard(13).press = () => {

        if (game.state === end) {

            reset();

        }

    };

    //set the game state to `play`
    game.state = play;
}

function reset ()  {

    player.x = 68;
    player.y = game.canvas.height / 2 - player.halfHeight;

    game.stage.putCenter(treasure, 200, 0);
    treasure.pickedUp = false;

    let direction = 1;

    enemies.forEach( enemy => {

        enemy.y = game.randomInt(0, game.canvas.height - enemy.height);

        enemy.vy = game.randomInt(1, 5) * direction;

        direction *= -1;

    });

    healthBar.inner.width = healthBar.width;

    gameScene.visible = true;
    gameOverScene.visible = false;

    game.state = play;

}

function load () {



}

game.start();