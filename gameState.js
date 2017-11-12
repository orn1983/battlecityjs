/////////////////////
// GAME STATE MANAGER
/////////////////////

// Stores various information regarding game state,
// draws level information on background canvas,
// and handles progression between levels

var gameState = {
    
    fortress : [],
    
    // EAH: No idea where to put these functions so just stuffing them here for now!
prevLevel : function() {
    //only do something if not already on first level
    if (g_currentLevel > 0) {
        g_currentLevel--;
        entityManager.destroyLevel();
        createInitialTanks();
        createLevel(g_levels[g_sortedLevelKeys[g_currentLevel]]);
    }
},

nextLevel : function() {
    //only do something if not already on last level
    if (g_currentLevel < 34) {
        g_currentLevel++;
        entityManager.destroyLevel();
        createInitialTanks();
        createLevel(g_levels[g_sortedLevelKeys[g_currentLevel]]);
    }
},

// EAH: more stuff that has no home
// Don't want to spend more time on this code atm in case we
// end up throwing it all away, but at least it can be used
// as proof-of-concept
drawInfo : function() {

    // used for both player 1 and player 2
    var playerTankIcon = spriteManager.spritePlayerTankIcon();

    // draw player 1 icon
    var p1icon = spriteManager.spritePlayerIcon(1);
    // using drawBulletAt for now because it takes a "scale" argument
    p1icon.drawBulletAt(g_backgroundCtx, 685, 390, consts.DIRECTION_UP, 3);

    playerTankIcon.drawBulletAt(g_backgroundCtx, 670, 422, consts.DIRECTION_UP, 3);

    // just putting 2 here as starting value for now
    p1lives = spriteManager.spriteNumber(entityManager.getPlayerLives(1));
    p1lives.drawBulletAt(g_backgroundCtx, 695, 422, consts.DIRECTION_UP, 3);

    if (g_numPlayers === 2) {
        // draw player 2 icon
        var p2icon = spriteManager.spritePlayerIcon(2);
        p2icon.drawBulletAt(g_backgroundCtx, 685, 470, consts.DIRECTION_UP, 3);

        playerTankIcon.drawBulletAt(g_backgroundCtx, 670, 502, consts.DIRECTION_UP, 3);

        p2lives = spriteManager.spriteNumber(entityManager.getPlayerLives(2));
        p2lives.drawBulletAt(g_backgroundCtx, 695, 502, consts.DIRECTION_UP, 3);
    }

    // draw flag icon
    var flagIcon = spriteManager.spriteFlagIcon();
    flagIcon.drawBulletAt(g_backgroundCtx, 685, 555, consts.DIRECTION_UP, 3);

    this.drawLevelNumber(g_currentLevel + 1);
},

drawLevelNumber : function(number) {
    var firstDigit = Math.floor(number / 10);
    var secondDigit = number % 10;

    if (firstDigit > 0) {
        var firstDigitIcon = spriteManager.spriteNumber(firstDigit);
        firstDigitIcon.drawBulletAt(g_backgroundCtx, 670, 595, consts.DIRECTION_UP, 3);
    }

    var secondDigitIcon = spriteManager.spriteNumber(secondDigit);
    secondDigitIcon.drawBulletAt(g_backgroundCtx, 695, 595, consts.DIRECTION_UP, 3);
},


// saves the state of the "fortress" around he statue
saveFortress : function(bricks) {
    // coords of fortress bricks:
    // 255 < x < 350
    // y > 530
    
    // empty fortress array
    this.fortress.length = 0;
    
    for (var i = 0; i < bricks.length; i++) {
        if (bricks[i].cx > 255 && bricks[i].cx < 350 && bricks[i].cy > 530) {
            this.fortress.push(bricks[i]);
        }
    }
},

restoreFortress : function(bricks) {
    // destroy default fortress
    for (var i = 0; i < bricks.length; i++) {
        if (bricks[i].cx > 255 && bricks[i].cx < 350 && bricks[i].cy > 530) {
            bricks.splice(i,1);
        }
    }
   
    // restore saved fortress
    for (var i = 0; i < this.fortress.length; i++) {
        bricks.push(this.fortress[i]);
    }
},


addScore : function(player, type) {
    // store values in some arrays?
},
    
    
}