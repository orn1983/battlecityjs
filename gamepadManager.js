/*

gamepadManager.js

A module which handles gamepads and 
maps buttons to player keys

Only tested in Chrome.
Probably still very buggy and NOT WORKING in e.g. Firefox!

Instructions:
1. Connect gamepad(s)
2. Open browser (Chrome)
3. Mash buttons so Chrome will detect gamepad(s)
4. Open new tab and load game (only refresh does not work? 
                               or maybe it does?)
                               
NB: If only one gamepad is connected it will get assigned to player 1
                               
*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var gamepadManager = {

// "PRIVATE" DATA

// stores connected gamepads
_gamepads : [],

// counts how many associations have been made to player tanks
// and used to index _gamepads
_connected : 0,

// "PRIVATE" METHODS
//
// <none yet>


// PUBLIC METHODS

// reads inputs from gamepads
updateGamepads : function() {
    this._gamepads = navigator.getGamepads();
},

// maps tank keys to gamepad buttons and updates keys array accordingly
// EAH: this is done on every update, maybe find a way to store it?
updateInputs : function(gp, tank) {
    // first update gamepads:
    this._gamepads = navigator.getGamepads();
    
    var x = gp.axes[0];
    var y = gp.axes[1];
    
    // maps keys
    var up    = tank.KEY_UP;
    var down  = tank.KEY_DOWN;
    var left  = tank.KEY_LEFT;
    var right = tank.KEY_RIGHT;
    var fire  = tank.KEY_FIRE;
    
    var button0 = gp.buttons[0];
    var button1 = gp.buttons[1];
    
    // horizontal movement
    // 0: center, -1: left, 1: right
    if (x < -0.5) {
        keys[left] = true;
        keys[right] = false;
    }
    else if (x > 0.5) {
        keys[right] = true;
        keys[left] = false;
    }
    else {
        keys[right] = false;
        keys[left] = false;
    }
    
    // vertical movement
    // 0: center, -1: up, 1: down
    if (y < -0.5) {
        keys[up] = true;
        keys[down] = false;
    }
    else if (y > 0.5) {
        keys[down] = true;
        keys[up] = false;
    }
    else {
        keys[up] = false;
        keys[down] = false;
    }
    
    // fire
    if (button0.pressed || button1.pressed) {
        keys[fire] = true;
    }
    else {
        keys[fire] = false;
    }
},

// returns a gamepad if connected
getGamepad : function() {
    console.log("getting gamepad");
    console.log(this._gamepads[this._connected]);
    if (this._gamepads[this._connected]) {
        return this._gamepads[this._connected++];
        // increment so that next player gets next gamepad
    }
    console.log("no gamepad connected");
    return false;
},

}

// intialization
gamepadManager.updateGamepads();
