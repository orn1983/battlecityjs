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

_terrain          : [],
_bricks           : [],
_statue           : [],
_bullets          : [],
_playerTanks      : [],
_enemyTanks       : [],
_enemyTanksInPlay : [],
_powerups         : [],
_trees            : [],
_effects          : [],
_walls            : [],

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
    this._categories = [ this._terrain, this._bricks, this._statue, this._bullets,
        this._playerTanks, this._enemyTanks, this._trees, this._powerups,
        this._effects, this._walls];
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

generateWall : function(descr) {
	this._terrain.push(new Wall(descr));
},


generateTerrain : function(descr) {
    // if terrain type is trees then add to a seperate
    // _trees array because trees need to be rendered last
    if (descr.type === consts.TERRAIN_TREES) {
        this._trees.push(new Terrain(descr));
        return;
    }
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

generateStatue : function(descr) {
    this._statue.push(new Statue(descr));
},

generateEnemyTank : function(descr) {
    this._enemyTanks.push(new EnemyTank(descr));
    var tankIndex = this._enemyTanks.length - 1;
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

generateEffect :  function(effect_type, x, y) {
    this._effects.push(new Effect({type: effect_type, cx: x, cy: y}));
},

// destroys level completely, i.e. unregisters everything from
// spatial manager and empties all private arrays
destroyLevel : function() {
    spatialManager.clear();

    // EAH: for some reason array = [] doesn't work (???)
    // so using array.length = 0 to clear
    this._terrain.length = 0;
	gameState.saveFortress(this._bricks);
    this._bricks.length = 0;
    this._bullets.length = 0;
    this.resetPlayerTanks();
    this._powerups.length = 0;
    this._trees.length = 0;
},

resetPlayerTanks : function() {
	for (var i = 0; i < this._playerTanks.length ; i++){
		this._playerTanks[i].reset();
	}
},

// getter for player lives to draw on background canvas
getPlayerLives : function(playerNumber) {
    return this._playerTanks[playerNumber-1].numberOfLives;
    //HD NB: Throws an error when enemy tank kills player: the player tank
    //is "undefined"
},

getNumberOfEnemyTanks : function(){
	return this._enemyTanks + this._enemyTanksInPlay;
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

},

render: function(ctx) {

    var debugX = 10, debugY = 100;

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

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
