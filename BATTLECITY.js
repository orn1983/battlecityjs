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
        type: consts.TANK_PLAYER1,
        cx :    g_canvas.width/26 + g_canvas.width/13*4,
        cy :    g_canvas.width/26 + g_canvas.width/13*12,
        playerSpriteOffset : 0,
        gamepad : gamepadManager.getGamepad()
    });

    // also create player 2 tank if 2 players
    if (g_numPlayers >= 2) {
        createPlayerTwoTank();
    }
}

// creates tank for player 2
function createPlayerTwoTank() {
    g_numPlayers = 2;
    entityManager.generatePlayerTank({
        type: consts.TANK_PLAYER2,
        cx :    g_canvas.width/26 + g_canvas.width/13*8,
        cy :    g_canvas.width/26 + g_canvas.width/13*12,
        // overwrite prototype definitions:
        KEY_UP    : 38, // up arrow
        KEY_DOWN  : 40, // down arrow
        KEY_LEFT  : 37, // left arrow
        KEY_RIGHT : 39, // right arrow
        KEY_FIRE  : 17, // (right) control
        // sprite offset
        playerSpriteOffset : 128,
        gamepad : gamepadManager.getGamepad()
    });
}

function createBorder() {
	entityManager.generateBorder({
		cx     : g_canvas.width/2,
		cy     : -50,
		halfWidth : g_canvas.width/2,
		halfHeight : 50,
	});
	
	entityManager.generateBorder({
		cx     : g_canvas.width/2,
		cy     : g_canvas.height+50,
		halfWidth : g_canvas.width/2,
		halfHeight : 50,
	});
	
	entityManager.generateBorder({
		cx     : -50,
		cy     : g_canvas.height/2,
		halfWidth : 50,
		halfHeight : g_canvas.height/2,
	});
	
	entityManager.generateBorder({
		cx     : g_canvas.width+50,
		cy     : g_canvas.height/2,
		halfWidth : 50,
		halfHeight : g_canvas.height/2,
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

    if (g_gameStarted) {
        processDiagnostics();
        entityManager.update(du);   
        gameState.update(du);
    }
    else {
        mainMenu.update();
    }
}

// GAME-SPECIFIC DIAGNOSTICS

var g_renderSpatialDebug = false;

var KEY_SPATIAL = keyCode('X');

var KEY_0 = keyCode('0');

var KEY_2 = keyCode('2'); // for spawning player 2

var KEY_9 = keyCode('9'); // previous level
var KEY_0 = keyCode('0'); // next level


function processDiagnostics() {

    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;

    if (eatKey(KEY_2) && g_numPlayers === 1)
        createPlayerTwoTank();

    if (eatKey(KEY_9))
        gameState.prevLevel();
    if (eatKey(KEY_0))
        gameState.nextLevel();
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
    if (g_gameStarted) {
        entityManager.render(ctx);

        if (g_renderSpatialDebug) spatialManager.render(ctx);
        
        gameState.drawInfo();        
    }
    else {
        mainMenu.render(g_backgroundCtx);
    }
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
    if (g_gameStarted) {
        entityManager.init();
        gameState.init();
		createBorder();
        gameState.createLevel();        
    }
    else {
        mainMenu.init();
        
    }
    main.init();
}

// Kick it off
requestPreloads();
