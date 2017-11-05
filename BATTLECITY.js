// ===========
// BATTLE CITY
// ===========
/*

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

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
        cx :    200,
        cy :    200,
        //HD: If we use a spritemanager, we'd probably pull from that and
        // write it directly into the spriteList below. Since we don't yet
        // have one, I'm going to let entityManager call the tank's
        // addSprite() function when it pushes the tank into _playerTanks.
        spriteList: [],
        playerSpriteOffset : 0,
        gamepad : gamepadManager.getGamepad()
    });
    // TODO if two players
    if (g_numPlayers === 2) {
        createPlayerTwoTank();
    }
}

// creates tank for player 2
function createPlayerTwoTank() {
    g_numPlayers++;
    entityManager.generatePlayerTank({
        type:   "player2",
        //HD: We'll probably drop the "type" once tanktype is fully implemented.
        tanktype: consts.TANK_PLAYER2,
        //sprite: g_sprites.playerTank2,
        cx :    400,
        cy :    200,
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
        type   : consts.STRUCTURE_BRICK
    });
}

// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    // Nothing to do here!
    // The event handlers do everything we need for now.

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

    // Prevent perpetual firing!
    eatKey(PlayerTank.prototype.KEY_FIRE);
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

function processDiagnostics() {

    if (eatKey(KEY_MIXED))
        g_allowMixedActions = !g_allowMixedActions;

    if (eatKey(KEY_AVE_VEL)) g_useAveVel = !g_useAveVel;

    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;

    if (eatKey(KEY_2) && g_numPlayers === 1)
        createPlayerTwoTank();
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
}


// =============
// PRELOAD STUFF
// =============
var g_images = {};

function requestPreloads() {

    var requiredImages = {
        // TODO: change sprite!
        spritesheet    : "images/spritesheet.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

var g_sprites = {};

function preloadDone() {
    g_sprites.playerTank1  = new animatedSprite(g_images.spritesheet, 0, 0, 16, 16, 2, 1, 1);
    g_sprites.playerTank2  = new animatedSprite(g_images.spritesheet, 128, 0, 16, 16, 2, 1, 1);
    
    //g_sprites.ship2 = new Sprite(g_images.ship2);
    //g_sprites.rock  = new Sprite(g_images.rock);

    //g_sprites.bullet = new Sprite(g_images.playerTank1);
    //g_sprites.bullet.scale = 0.25;

    //HD: Just adding sample sprite initialization code for the bullet. It's still
    //broken, but at least now I can remember its coords in the spritesheet :-P
    //g_sprites.bullet = new animatedSprite(g_images.spritesheet, 323, 102, 4, 4, 1,1,1);

    // EAH: quick hack to get bullets to semi-work
    g_sprites.bullet = {0: new Sprite(g_images.spritesheet, 323, 102, 4, 4, 1,1),
                        3 : new Sprite(g_images.spritesheet, 330, 102, 4, 4, 1,1),
                        2 : new Sprite(g_images.spritesheet, 339, 102, 4, 4, 1,1),
                        1 : new Sprite(g_images.spritesheet, 346, 102, 4, 4, 1,1)
                       }
    g_sprites.bullet.scale = 2;

    entityManager.init();
    createInitialTanks();
    createTerrain();
    createBrick();
    

    main.init();
}

// Kick it off
requestPreloads();
