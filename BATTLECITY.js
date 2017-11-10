// ===========
// BATTLE CITY
// ===========
/*

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

var g_backgroundCanvas = document.getElementById("backgroundCanvas");
var g_backgroundCtx = g_backgroundCanvas.getContext("2d");

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// ====================
// CREATE INITIAL TANKS
// ====================

function createInitialTanks() {
    entityManager.generatePlayerTank({
        type:   "player1",
        //HD: Adding a tanktype property with a const value. Will eventually
        //drop the old type:"player1" above this comment, since I'm pretty sure
        //they're used for basically the same thing, but I'm leaving it in for
        //now so that it doesn't break anything with its absence.
        tanktype: consts.TANK_PLAYER1,
        //sprite: g_sprites.playerTank1,
        cx :    g_canvas.width/26 + g_canvas.width/13*4,
        cy :    g_canvas.width/26 + g_canvas.width/13*12,
        //HD: If we use a spritemanager, we'd probably pull from that and
        // write it directly into the spriteList below. Since we don't yet
        // have one, I'm going to let entityManager call the tank's
        // addSprite() function when it pushes the tank into _playerTanks.
        spriteList: [],
        playerSpriteOffset : 0,
        gamepad : gamepadManager.getGamepad()
    });

    //createEnemyTank(1);
    //createEnemyTank(2);
    //createEnemyTank(3);


    // TODO if two players
    if (g_numPlayers >= 2) {
        createPlayerTwoTank();
    }
}

// creates tank for player 2
function createPlayerTwoTank() {
    g_numPlayers = 2;
    entityManager.generatePlayerTank({
        type:   "player2",
        //HD: We'll probably drop the "type" once tanktype is fully implemented.
        tanktype: consts.TANK_PLAYER2,
        //sprite: g_sprites.playerTank2,
        cx :    g_canvas.width/26 + g_canvas.width/13*8,
        cy :    g_canvas.width/26 + g_canvas.width/13*12,
        //HD: Once the spriteManager is working, we can drop spriteList[]
        spriteList: [],
        // overwrite prototype definitions:
        KEY_UP    : 38, // up arrow, is there a'W'.charCodeAt(0) version?
        KEY_DOWN  : 40, // down arrow
        KEY_LEFT  : 37, // left arrow
        KEY_RIGHT : 39, // right arrow
        KEY_FIRE  : 17, // (right) control
        // sprite offset
        playerSpriteOffset : 128,
        gamepad : gamepadManager.getGamepad()
    });
}

function createEnemyTank(start) {
//HD: Temporary function used to create enemy tanks at given starting locations
    var thiscX, thiscY;
    var thisTankType = consts.TANK_ENEMY_BASIC;
    var movementSpeed = 2;
    var bulletSpeed = 6;
    switch(start){
        case 1: //upper left corner, basic tank (half speed, half bullet speed)
            thiscX = g_canvas.width/26;
            thiscY = g_canvas.width/26;
            thisTankType = consts.TANK_ENEMY_BASIC;
            movementSpeed = 1;
            bulletSpeed = 3;
        break;
        case 2: //upper middle, fast tank (double speed, normal bullet speed)
            thiscX = g_canvas.width/26 + g_canvas.width/13*6;
            thiscY = g_canvas.width/26;
            thisTankType = consts.TANK_ENEMY_FAST;
            movementSpeed = 3;
            bulletSpeed = 2;
        break;
        case 3: //upper right corner, power tank (normal speed, fast bullet speed)
            thiscX = g_canvas.width/26 + g_canvas.width/13*12;
            thiscY = g_canvas.width/26;
            thisTankType = consts.TANK_ENEMY_ARMOR;
            movementSpeed = 2;
            bulletSpeed = 3;
        break;
    }


    entityManager.generateEnemyTank({
        //cx :    g_canvas.width/26 + g_canvas.width/13*8,
        //cy :    g_canvas.width/26 + g_canvas.width/13*12,
        cx : thiscX,
        cy :  thiscY,
        tanktype : thisTankType,
        moveDistance : movementSpeed,
        bulletVelocity : bulletSpeed
    });
}

function createTerrain() {
    // Just for testing right now
    entityManager.generateTerrain({
        cx      : 200,
        cy      : 400,
        type    : consts.TERRAIN_WATER
    });
}

function createBrick() {
    // just for testing
    entityManager.generateBrick({
        cx      : 200,
        cy      : 300,
        type    : consts.STRUCTURE_BRICK,
		look    : consts.STRUCTURE_WHOLE
    });
}

// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    // updates gamepad inputs, if any
    entityManager.handleGamepads();

}


// =================
// UPDATE SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `update` routine handles generic stuff such as
// pausing, single-step, and time-handling.
//
// It then delegates the game-specific logic to `updateSimulation`


// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {

    processDiagnostics();

    entityManager.update(du);
}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_useAveVel = true;
var g_renderSpatialDebug = false;

var KEY_MIXED   = keyCode('M');;
var KEY_AVE_VEL = keyCode('V');
var KEY_SPATIAL = keyCode('X');

var KEY_0 = keyCode('0');

var KEY_K = keyCode('K');

var KEY_2 = keyCode('2'); // for spawning player 2

var KEY_9 = keyCode('9'); // previous level
var KEY_0 = keyCode('0'); // next level


function processDiagnostics() {

    if (eatKey(KEY_MIXED))
        g_allowMixedActions = !g_allowMixedActions;

    if (eatKey(KEY_AVE_VEL)) g_useAveVel = !g_useAveVel;

    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;

    if (eatKey(KEY_2) && g_numPlayers === 1)
        createPlayerTwoTank();

    if (eatKey(KEY_9))
        prevLevel();
    if (eatKey(KEY_0))
        nextLevel();
}

// EAH: No idea where to put these functions so just stuffing them here for now!
function prevLevel() {
    //only do something if not already on first level
    if (g_currentLevel > 0) {
        g_currentLevel--;
        entityManager.destroyLevel();
        createInitialTanks();
        createLevel(g_levels[g_sortedLevelKeys[g_currentLevel]]);
    }
}

function nextLevel() {
    //only do something if not already on last level
    if (g_currentLevel < 34) {
        g_currentLevel++;
        entityManager.destroyLevel();
        createInitialTanks();
        createLevel(g_levels[g_sortedLevelKeys[g_currentLevel]]);
    }
}

// EAH: more stuff that has no home
// Don't want to spend more time on this code atm in case we
// end up throwing it all away, but at least it can be used
// as proof-of-concept
function drawInfo() {

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

    drawLevelNumber(g_currentLevel + 1);
}

function drawLevelNumber(number) {
    var firstDigit = Math.floor(number / 10);
    var secondDigit = number % 10;

    if (firstDigit > 0) {
        var firstDigitIcon = spriteManager.spriteNumber(firstDigit);
        firstDigitIcon.drawBulletAt(g_backgroundCtx, 670, 595, consts.DIRECTION_UP, 3);
    }

    var secondDigitIcon = spriteManager.spriteNumber(secondDigit);
    secondDigitIcon.drawBulletAt(g_backgroundCtx, 695, 595, consts.DIRECTION_UP, 3);
}

// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`


// GAME-SPECIFIC RENDERING

function renderSimulation(ctx) {
    entityManager.render(ctx);

    if (g_renderSpatialDebug) spatialManager.render(ctx);

    drawInfo();
}


// =============
// PRELOAD STUFF
// =============
var g_images = {};

function requestPreloads() {

    var requiredImages = {
        spritesheet    : "images/spritesheet.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

var g_sprites = {};

function preloadDone() {
    entityManager.init();
    createInitialTanks();
    createLevel(g_levels[g_sortedLevelKeys[g_currentLevel]]);

    main.init();
}

// Kick it off
requestPreloads();
