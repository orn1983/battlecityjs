/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/


var entityManager = {

// "PRIVATE" DATA

_terrain           : [],
_bricks           : [],
_bullets         : [],
_playerTanks    : [],
_powerups       : [],

//_bShowRocks : true,

// "PRIVATE" METHODS

_forEachOf: function(aCategory, fn) {
    for (var i = 0; i < aCategory.length; ++i) {
        fn.call(aCategory[i]);
    }
},

// PUBLIC METHODS

// A special return value, used by other objects,
// to request the blessed release of death!
//
KILL_ME_NOW : -1,

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//
deferredSetup : function () {
    this._categories = [ this._terrain, this._bricks, this._bullets,
        this._playerTanks, this._powerups];

},

init: function() {
    //this._generateRocks();
    //this._generateShip();
},

fireBullet: function(cx, cy, vel, direction, player, strength, tank) {
    this._bullets.push(new Bullet({
        cx           : cx,
        cy            : cy,
        vel          : vel,
        direction     : direction,
        strength     : strength,
        player          : player,
        tank          : tank
        //sprite      : g_sprites.bullet
    }));
},


generateTerrain : function(descr) {
    this._terrain.push(new Terrain(descr));
},

generateBrick : function(descr) {
    this._bricks.push(new Brick(descr));
},

generatePlayerTank : function(descr) {
    this._playerTanks.push(new PlayerTank(descr));
    var tankIndex = this._playerTanks.length - 1;

      //HD NB: When we start creating different tanks, we can use properties of
      //descr to determine where spriteXOffset should start.
      /*for(var i=0; i<8; i++)
      {
            var spriteXOffset = i*16;
            var spriteYOffset = this._playerTanks[tankIndex].playerSpriteOffset;
            this._playerTanks[tankIndex].addSprite(g_images.spritesheet,
                spriteXOffset, spriteYOffset, 16, 16, 1, 1);
      }*/

},

// updates gamepad inputs for each tank (if gamepad connected)
handleGamepads : function() {
    gamepadManager.updateGamepads();
    for (var i = 0; i < this._playerTanks.length; i++) {
        var tank = this._playerTanks[i];
        if (tank.gamepad) {
            gamepadManager.updateInputs(tank.gamepad, tank);
        }
    }
},


resetPlayerTanks: function() {
    this._forEachOf(this._playerTanks, PlayerTank.prototype.reset);
},



generatePowerup : function(){
    //TODO: Pick random type of Powerup
    //this._powerups.push(new Powerup(descr));
    this._powerups.push(new Powerup());
},

update: function(du) {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];
        var i = 0;

        while (i < aCategory.length) {

            var status = aCategory[i].update(du);

            if (status === this.KILL_ME_NOW) {

                //Check if this was a powerup tank; if so, create a new
                //powerup (maybe at some location the player can
                //actually reach)
                //N.B.: deferredSetup() creates this._categories, and
                //this._categories[3] in that function is the tanks array
                if( (c === 3) && (aCategory[i].tanktype == consts.POWERUP_TANK) ) {
                    generatePowerup();

                }
                // remove the dead guy, and shuffle the others down to
                // prevent a confusing gap from appearing in the array
                aCategory.splice(i,1);
            }
            else {
                ++i;
            }
        }
    }

    //if (this._rocks.length === 0) this._generateRocks();

},

render: function(ctx) {

    var debugX = 10, debugY = 100;

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        /* if (!this._bShowRocks &&
            aCategory == this._rocks)
            continue;
        */
        for (var i = 0; i < aCategory.length; ++i) {

            aCategory[i].render(ctx);
            //debug.text(".", debugX + i * 10, debugY);

        }
        debugY += 10;
    }
}

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();
