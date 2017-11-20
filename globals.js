// =======
// GLOBALS
// =======
/*

Evil, ugly (but "necessary") globals, which everyone can use.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");
var g_backgroundCanvas = document.getElementById("backgroundCanvas");
var g_backgroundCtx = g_backgroundCanvas.getContext("2d");
g_ctx.webkitImageSmoothingEnabled = false;
g_ctx.mozImageSmoothingEnabled = false;
g_ctx.imageSmoothingEnabled = false;
g_backgroundCtx.webkitImageSmoothingEnabled = false;
g_backgroundCtx.mozImageSmoothingEnabled = false;
g_backgroundCtx.imageSmoothingEnabled = false;
// Grid is symmetric, so g_gridSize N means NxN
var g_gridSize = 26;

// number of players, starts as 1
var g_numPlayers = 1;

// stores "index" of current level, ranges from 0 to 34
//var g_currentLevel = 0; not used anymore

var g_sortedLevelKeys = Object.keys(g_levels).sort();
var g_sortedEnemyKeys = Object.keys(g_enemies).sort();

var g_friendlyFire = false;

var g_enemiesEnabled = true;

var g_gameStarted = false;

// used to scale sprites from spritesheet to our canvas
// original playfield was 208px w/h, our is 600px w/h
var g_spriteScale = 600 / 208;

// The "nominal interval" is the one that all of our time-based units are
// calibrated to e.g. a velocity unit is "pixels per nominal interval"
//
var NOMINAL_UPDATE_INTERVAL = 16.666;

// Multiply by this to convert seconds into "nominals"
var SECS_TO_NOMINALS = 1000 / NOMINAL_UPDATE_INTERVAL;
