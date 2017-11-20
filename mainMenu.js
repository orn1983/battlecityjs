// main menu

var mainMenu = {

menuItems : ["1 PLAYER", "2 PLAYERS", "VS MODE", "INSTRUCTIONS"],

selectedItem : 0,

// indicated whether to show the level select menu or not
levelSelect : false,

// whether to show the instructions menu
helpMenu : false,

init : function() {
    // lots of stuff that needs to be reset
    entityManager._playerTanks.length = 0;
    entityManager.destroyLevel();
    g_gameStarted = false;
    gameState.setFreezeTimerToZero();
    gameState.resetSpawnTimer();
    this.levelSelect = false;
    this.menuItems.length = 0;
    this.selectedItem = 0;
    this.menuItems = ["1 PLAYER", "2 PLAYERS", "VS MODE", "INSTRUCTIONS"];
    g_backgroundCtx.save();
    // hide playfield
    g_canvas.style.display = "none";
    g_doClear = false;
},

close : function() {
    util.clearBackgroundCanvas(g_backgroundCtx);
    g_backgroundCtx.restore();
    g_doClear = true;
    g_gameStarted = true;
    g_canvas.style.display = "";
    entityManager.init();
    gameState.init();
    createBorder();
    gameState.createLevel();

},

switchToLevelSelect : function() {
    this.levelSelect = true;
    this.menuItems.length = 0;
    for (var i = 0; i < 35; i++)
        this.menuItems[i] = i+1;
    this.selectedItem = 0;
},

switchToHelpMenu : function() {

    setInterval(gamepadManager.updateMenuInputs(), 3000);

    if (eatKey(13) || eatKey(keyCode(' ')))
    //enter key, go back to main menu
    {
        this.helpMenu = false;
    }
},

drawHelpMenu : function(ctx) {
    util.clearBackgroundCanvas(ctx, "black");
    ctx.fillStyle = "white";
    ctx.textAlign="center";
    var headerFont = "20px Georgia";
    var regularFont = "14px Georgia";
    var smallFont = "10px Georgia";
    ctx.font=headerFont;
    var centerX = g_backgroundCanvas.width/2;
    var centerY = g_backgroundCanvas.height/2;
    var canvasWidth = g_backgroundCanvas.width;
    var canvasHeight = g_backgroundCanvas.height;

    ctx.fillText("Controls",centerX,30);

    ctx.textAlign="left";
    ctx.fillText("Player 1",30,60);
    var spritePlayer1 = spriteManager.spriteTank(consts.TANK_PLAYER1,
        consts.TANK_POWER_NONE, consts.DIRECTION_RIGHT, 0);
    ctx.save();
    ctx.scale(g_spriteScale, g_spriteScale);
    spritePlayer1.drawAt(ctx, 16, 26);
    ctx.restore();
    ctx.font=regularFont;
    ctx.fillText("W",194,74);
    ctx.fillText("Movement: A-|-D",110,85);
    ctx.fillText("S",197,100);
    ctx.fillText("Fire: SPACEBAR",110,123);

    ctx.textAlign="right";
    ctx.font=headerFont;
    ctx.fillText("Player 2",canvasWidth-30,60);
    var spritePlayer2 = spriteManager.spriteTank( consts.TANK_PLAYER2,
         consts.TANK_POWER_NONE, consts.DIRECTION_LEFT, 0);
    ctx.save();
    ctx.scale(g_spriteScale, g_spriteScale);
    spritePlayer2.drawAt(ctx, canvasWidth-513, 26);
    ctx.restore();
    ctx.font=regularFont;
    ctx.fillText("^",canvasWidth-123,76);
    ctx.fillText("Movement: <-|->",canvasWidth-110,85);
    ctx.fillText("v",canvasWidth-124,100);
    ctx.fillText("Fire: CONTROL",canvasWidth-115,123);
    ctx.font=smallFont;
    ctx.fillText("(arrow keys)",canvasWidth-153,100);
    ctx.font=regularFont;

    ctx.font=headerFont;
    ctx.textAlign="center";
    ctx.fillText("------",centerX,150);
    ctx.fillText("Hotkeys & Toggles",centerX,180);

    var toggleHeightLine1 = 205;
    ctx.font=regularFont;
    ctx.textAlign="left";
    ctx.fillText("Sound: N",5,toggleHeightLine1);
    ctx.fillText("Previous Level: 9",80,toggleHeightLine1);
    ctx.fillText("Next Level: 0",210,toggleHeightLine1);
    ctx.fillText("Add Player 2: 2",320,toggleHeightLine1);
    ctx.fillText("Pause: P",450,toggleHeightLine1);
    ctx.fillText("Collision boxes: X",530,toggleHeightLine1);

    var toggleHeightLine2 = 230;
    ctx.fillText("Rendering: R",5,toggleHeightLine2);
    ctx.fillText("Trail: C",110,toggleHeightLine2);
    ctx.fillText("Framerate: T",180,toggleHeightLine2);
    ctx.fillText("Odd/Even boxes: F",290,toggleHeightLine2);
    ctx.fillText("Graybox: U",440,toggleHeightLine2);
    ctx.fillText("Redbox: R",550,toggleHeightLine2);

    ctx.font=headerFont;
    ctx.textAlign="center";
    ctx.fillText("------",centerX,toggleHeightLine2+20);
    ctx.fillText("How to Play",centerX,toggleHeightLine2+50);
    ctx.font=regularFont;
    ctx.textAlign="center";
    var howtoLine = toggleHeightLine2+80;
    ctx.fillText("Shoot these",135,howtoLine);
    ctx.fillText("Protect this",centerX,howtoLine);
    ctx.fillText("Pick up these",canvasWidth-140,howtoLine);

    var spriteScaledRow = 112;
    var spriteLeftOffset = 25;
    var spriteRightOffset = 170;
    var spriteRowMultiplier = 35;
    var spriteColumnMultiplier = 30;
    var spriteEnemyBasic = spriteManager.spriteTank(consts.TANK_ENEMY_BASIC,
        consts.TANK_POWER_NONE, consts.DIRECTION_LEFT, 0);
    var spriteEnemyFast = spriteManager.spriteTank(consts.TANK_ENEMY_FAST,
        consts.TANK_POWER_NONE, consts.DIRECTION_UP, 0);
    var spriteEnemyPower = spriteManager.spriteTank(consts.TANK_ENEMY_POWER,
        consts.TANK_POWER_NONE, consts.DIRECTION_RIGHT, 0);
    var spriteEnemyArmor = spriteManager.spriteTank(consts.TANK_ENEMY_ARMOR,
        consts.TANK_POWER_NONE, consts.DIRECTION_DOWN, 0);
    var spriteStatue = spriteManager.spriteStructure(consts.STRUCTURE_FLAG,
        consts.STRUCTURE_WHOLE);
    var spritePowerupHelmet = spriteManager.spritePowerup(consts.POWERUP_HELMET);
    var spritePowerupTimer = spriteManager.spritePowerup(consts.POWERUP_TIMER);
    var spritePowerupShovel = spriteManager.spritePowerup(consts.POWERUP_SHOVEL);
    var spritePowerupStar = spriteManager.spritePowerup(consts.POWERUP_STAR);
    var spritePowerupGrenade = spriteManager.spritePowerup(consts.POWERUP_GRENADE);
    var spritePowerupTank = spriteManager.spritePowerup(consts.POWERUP_TANK);
    ctx.save();
    ctx.scale(g_spriteScale, g_spriteScale);
    spriteEnemyBasic.drawAt(ctx, spriteLeftOffset+spriteColumnMultiplier*0,
        spriteScaledRow + spriteRowMultiplier*0);
    spriteEnemyFast.drawAt(ctx, spriteLeftOffset+spriteColumnMultiplier*1,
        spriteScaledRow + spriteRowMultiplier*0);
    spriteEnemyPower.drawAt(ctx, spriteLeftOffset+spriteColumnMultiplier*0,
        spriteScaledRow + spriteRowMultiplier*1);
    spriteEnemyArmor.drawAt(ctx, spriteLeftOffset+spriteColumnMultiplier*1,
        spriteScaledRow + spriteRowMultiplier*1);
    spriteStatue.drawAt(ctx, 120, spriteScaledRow + spriteRowMultiplier*0);
    spritePowerupHelmet.drawAt(ctx,spriteRightOffset+spriteColumnMultiplier*0,
        spriteScaledRow + spriteRowMultiplier*0);
    spritePowerupTimer.drawAt(ctx,spriteRightOffset+spriteColumnMultiplier*1,
            spriteScaledRow + spriteRowMultiplier*0);
    spritePowerupShovel.drawAt(ctx,spriteRightOffset+spriteColumnMultiplier*2,
        spriteScaledRow + spriteRowMultiplier*0);
    spritePowerupStar.drawAt(ctx,spriteRightOffset+spriteColumnMultiplier*0,
        spriteScaledRow + spriteRowMultiplier*1);
    spritePowerupGrenade.drawAt(ctx,spriteRightOffset+spriteColumnMultiplier*1,
        spriteScaledRow + spriteRowMultiplier*1);
    spritePowerupTank.drawAt(ctx,spriteRightOffset+spriteColumnMultiplier*2,
        spriteScaledRow + spriteRowMultiplier*1);
    ctx.restore();

    ctx.textAlign="center"; //For explanation texts
    ctx.font=smallFont;
    var spriteTextRow1 = spriteScaledRow + 270;
    var spriteTextRow2 = spriteTextRow1 + 15;
    var spriteTextRow3 = spriteTextRow1 + 100;
    var spriteTextRow4 = spriteTextRow3 + 15;
    var spriteTextLeftOffset = 95;
    var spriteTextRightOffset = 514;
    var spriteTextColumnMultiplier = 85;

    //Text for enemy tanks
    ctx.fillText("Drives slow",spriteTextLeftOffset+spriteTextColumnMultiplier*0,
        spriteTextRow1);
    ctx.fillText("Fires slow",spriteTextLeftOffset+spriteTextColumnMultiplier*0,
        spriteTextRow2);
    ctx.fillText("Drives fast",spriteTextLeftOffset+spriteTextColumnMultiplier*1,
        spriteTextRow1);
    ctx.fillText("Fires normally",spriteTextLeftOffset+spriteTextColumnMultiplier*1,
        spriteTextRow2);
    ctx.fillText("Drives normally",spriteTextLeftOffset+spriteTextColumnMultiplier*0,
        spriteTextRow3);
    ctx.fillText("Fires fast",spriteTextLeftOffset+spriteTextColumnMultiplier*0,
        spriteTextRow4);
    ctx.fillText("Drives normally",spriteTextLeftOffset+spriteTextColumnMultiplier*1,
        spriteTextRow3);
    ctx.fillText("Fires normally",spriteTextLeftOffset+spriteTextColumnMultiplier*1,
        spriteTextRow4);

    //Text for statue.
    ctx.fillText("If the flag is destroyed,",centerX, spriteTextRow1);
    ctx.fillText("YOU LOSE THE GAME",centerX, spriteTextRow2);

    //Text for powerups
    ctx.fillText("Force field",spriteTextRightOffset+spriteTextColumnMultiplier*0,
        spriteTextRow1);
    ctx.fillText("Freeze",spriteTextRightOffset+spriteTextColumnMultiplier*1,
        spriteTextRow1);
    ctx.fillText("enemies",spriteTextRightOffset+spriteTextColumnMultiplier*1,
        spriteTextRow2);
    ctx.fillText("Barricade",spriteTextRightOffset+spriteTextColumnMultiplier*2,
        spriteTextRow1);
    ctx.fillText("the flag",spriteTextRightOffset+spriteTextColumnMultiplier*2,
        spriteTextRow2);
    ctx.fillText("Augment",spriteTextRightOffset+spriteTextColumnMultiplier*0,
        spriteTextRow3);
    ctx.fillText("your bullets",spriteTextRightOffset+spriteTextColumnMultiplier*0,
        spriteTextRow4);
    ctx.fillText("Enemies",spriteTextRightOffset+spriteTextColumnMultiplier*1,
        spriteTextRow3);
    ctx.fillText("self-destruct",spriteTextRightOffset+spriteTextColumnMultiplier*1,
        spriteTextRow4);
    ctx.fillText("Extra life",spriteTextRightOffset+spriteTextColumnMultiplier*2,
        spriteTextRow3);

    ctx.font=headerFont;
    ctx.textAlign="center";
    ctx.fillText("------",centerX,520);
    ctx.fillText("Environment",centerX,540);

    var spriteBrick = spriteManager.spriteStructure(consts.STRUCTURE_BRICK,
        consts.STRUCTURE_WHOLE);
    var spriteSteel = spriteManager.spriteStructure(consts.STRUCTURE_STEEL,
        consts.STRUCTURE_WHOLE);
    var spriteTrees = spriteManager.spriteTerrain(consts.TERRAIN_TREES,0);
    var spriteWater = spriteManager.spriteTerrain(consts.TERRAIN_WATER,0);
    var spriteIce = spriteManager.spriteTerrain(consts.TERRAIN_ICE,0);

    var spriteEnvLeftOffset = 30;
    var spriteEnvColumnMultiplier = 47;
    var spriteEnvScaledRow = 195;

    ctx.save();
    ctx.scale(g_spriteScale, g_spriteScale);
    spriteBrick.drawAt(ctx, spriteEnvLeftOffset+spriteEnvColumnMultiplier*0,
        spriteEnvScaledRow);
    spriteSteel.drawAt(ctx, spriteEnvLeftOffset+spriteEnvColumnMultiplier*1,
        spriteEnvScaledRow);
    spriteTrees.drawAt(ctx, spriteEnvLeftOffset+spriteEnvColumnMultiplier*2,
        spriteEnvScaledRow);
    spriteWater.drawAt(ctx, spriteEnvLeftOffset+spriteEnvColumnMultiplier*3,
        spriteEnvScaledRow);
    spriteIce.drawAt(ctx, spriteEnvLeftOffset+spriteEnvColumnMultiplier*4,
        spriteEnvScaledRow);
    ctx.restore();

    //Text for environment
    ctx.font=regularFont;
    ctx.textAlign="center";
    var envLine = spriteEnvScaledRow + 410;
    var envOffset = spriteEnvLeftOffset + 69;
    var envMultiplier = 135;
    ctx.fillText("Brick",envOffset+envMultiplier*0, envLine);
    ctx.fillText("Steel",envOffset+envMultiplier*1, envLine);
    ctx.fillText("Trees",envOffset+envMultiplier*2, envLine);
    ctx.fillText("Water",envOffset+envMultiplier*3, envLine);
    ctx.fillText("Ice",envOffset+envMultiplier*4+2, envLine);

    ctx.textAlign="center"; //For explanation texts
    ctx.font=smallFont;
    var spriteTextRow1 = spriteScaledRow + 270;
    var spriteTextRow2 = spriteTextRow1 + 15;
    var spriteTextRow3 = spriteTextRow1 + 100;
    var spriteTextRow4 = spriteTextRow3 + 15;
    var spriteTextLeftOffset = 95;
    var spriteTextRightOffset = 514;
    var spriteTextColumnMultiplier = 85;

    ctx.font=headerFont;
    ctx.textAlign="center";
    ctx.fillStyle = "red";
    ctx.fillText("Press ENTER to go back",centerX,canvasHeight-30);
    ctx.fillStyle = "white";
},

update : function() {

    setInterval(gamepadManager.updateMenuInputs(), 3000);

    if (eatKey(13) || eatKey(keyCode(' '))) {
        // enter key, go to level select menu
        if ( (!this.levelSelect) && (!this.helpMenu)) {
            if (this.selectedItem === 0) {
                // 1 player
                g_friendlyFire = false;
                g_enemiesEnabled = true;
                g_numPlayers = 1;
            }
            else if (this.selectedItem === 1) {
                // 2 players
                g_friendlyFire = false;
                g_enemiesEnabled = true;
                g_numPlayers = 2;
            }
            else if (this.selectedItem === 2) {
                // VS mode
                g_friendlyFire = true;
                g_enemiesEnabled = false;
                g_numPlayers = 2;
            }
            else if (this.selectedItem === 3) {
                //Instructions menu
                this.helpMenu = true;
            }
            // enter pressed in main menu, and not going to help, so go to level select
            if(!this.helpMenu) {
                this.switchToLevelSelect();
            }
        }
        else if(this.helpMenu){
            //enter pressed in help menu, go back to main menu
            this.helpMenu = false;
        }
        else if (this.levelSelect) {
            // enter pressed in level select, close menu and start game
            gameState._currentLevel = this.selectedItem;
            this.close();
        }
    }
    else if ((!this.helpMenu) && (eatKey(38) || eatKey(keyCode('W')))) {
        // up arrow
        this.selectedItem = (this.selectedItem - 1);
        if (this.selectedItem < 0) {
            this.selectedItem = this.menuItems.length - 1;
        }
    }

    else if  ((!this.helpMenu) && (eatKey(40) || eatKey(keyCode('S')))) {
        // down arrow
        this.selectedItem = (this.selectedItem + 1) % this.menuItems.length;
    }
},

render : function(ctx) {
    util.clearBackgroundCanvas(ctx, "black");
    var centerX = g_backgroundCanvas.width/2;
    var centerY = g_backgroundCanvas.height/2;
    ctx.textAlign="center";
    ctx.font="20px Georgia";
    // iterate through menuItems and draw on screen

    if (!this.levelSelect) {

        if(!this.helpMenu) {
            // if main menu then draw all items
            for (var i = 0; i < this.menuItems.length; i++) {
                if (i === this.selectedItem) {
                    // draw selected item in different color
                    ctx.fillStyle = "red";
                }
                else {
                    ctx.fillStyle = "white";
                }
                ctx.fillText(this.menuItems[i],centerX,centerY-30+i*30);
            }
        }
        else {
            //Draw help menu.
            this.drawHelpMenu(ctx);
        }
    }
    else {
        // if level select the draw only selected stage
        ctx.fillStyle = "white";
        ctx.fillText("STAGE " + this.menuItems[this.selectedItem],centerX,centerY);
    }

}

};
