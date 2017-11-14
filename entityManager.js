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
_border            : [],

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
        this._playerTanks, this._enemyTanksInPlay, this._trees, this._powerups,
        this._effects, this._border];
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

generateBorder : function(descr) {
	this._terrain.push(new Border(descr));
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

putEnemyInPlay : function(){
    if(this._enemyTanks.length !== 0){
        var take = entityManager._enemyTanks.splice(0,1);
        this._enemyTanksInPlay.push(take[0]);
    }
},

spawnEnemyTank : function(){
	var tank = this._enemyTanks[0];
    var that = this;
	this.generateEffect("spawnFlash", tank, function() { that.putEnemyInPlay() });
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
    //Pick random number from 1 to 6;
    var min = 28;
    min = Math.ceil(min);
    var max = 33;
    max = Math.floor(max);
    var randomPowerUp = Math.floor(Math.random() * (max - min + 1)) + min;

    //this._powerups.push(new Powerup());
    this._powerups.push(new Powerup({type : randomPowerUp}));
},

generateEffect :  function(effect_type, caller, callback) {
    var effect;
    switch (effect_type) {
        case "explosionSmall":
            effect = consts.EFFECT_SMALLEXPLOSION;
            break;
        case "explosionBig":
            effect = consts.EFFECT_SMALLEXPLOSION;
            var originalCallback = callback;
            var explosionBig = function () {
                entityManager.generateEffect("explosionBigHelper", caller, originalCallback);
            };
            callback = explosionBig;
            break;
        case "explosionBigHelper":
            effect = consts.EFFECT_LARGEEXPLOSION;
            break;
        case "points":
            effect = consts.EFFECT_POINTS;
            break;
        case "spawnFlash":
            effect = consts.EFFECT_SPAWNFLASH;
            break;
        case "invulnerable":
            effect = consts.EFFECT_INVULNERABLE;
            break;
    }

    this._effects.push(new Effect({type: effect, caller: caller, callWhenDone: callback}));
},


initLevel : function() {
    gameState.restoreFortress(this._bricks);
    createBorder();
},

removeFortress : function() {
    for (var i = 0; i < this._bricks.length; i++) {
        if (this._bricks[i].cx >= g_canvas.width/g_gridSize*11 && this._bricks[i].cx <= g_canvas.width/g_gridSize*15 && this._bricks[i].cy >= g_canvas.width/g_gridSize*22) {
            this._bricks[i].kill();

        }
    }
},

// when shovel powerup expires, change steel bricks around
// flag into normal bricks
removeSteelFortress : function(em) {
    for (var i = 0; i < em._bricks.length; i++) {
        if (em._bricks[i].cx >= g_canvas.width/g_gridSize*11 && em._bricks[i].cx <= g_canvas.width/g_gridSize*15 && em._bricks[i].cy >= g_canvas.width/g_gridSize*22) {
            // change type to brick and update sprite
            em._bricks[i].type = consts.STRUCTURE_BRICK;
            em._bricks[i].sprite = spriteManager.spriteStructure(em._bricks[i].type, em._bricks[i].look);
        }
    }
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
    this._enemyTanks.length = 0;
    this._enemyTanksInPlay.length = 0;
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
	return this._enemyTanks.length + this._enemyTanksInPlay.length;
},

// returns number of enemy tanks that haven't spawned
// because that is the number that is printed on sidebar
getNumberOfEnemyTanksLeft : function() {
    return this._enemyTanks.length;
},

activatePowerup : function(tank, poweruptype) {

    gameState.addScore(tank.type, poweruptype);

    switch(poweruptype){
        case(consts.POWERUP_HELMET):
            //Gives a temporary force field that shields from enemy shots, like the one at the beginning of every stage.
            tank.addForceField();
            setTimeout(function() {tank.removeForceField();}, 30000);
        break;
        case(consts.POWERUP_TIMER):
            //    The timer power-up temporarily freezes time, stopping all enemy tanks' movement.
            //    Tip: enables the ability to harmlessly approach every tank and destroy them.
            gameState.setFreezeTimer();
        break;
        case(consts.POWERUP_SHOVEL):
            // Turns the brick walls around the fortress to stone,
            // which gives temporary invulnerability to the walls,
            // preventing enemies from destroying it.
            // ALSO repairs all the damage previously done to the wall.
            gameState.createSteelFortress();
        break;
        case(consts.POWERUP_STAR):
            //Increases your offensive power by one tier (tiers are: default, second, third, and fourth). Power level only resets to default when you die.
            //First star (second tier): fired bullets are as fast as Power Tanks' bullets.
            //Second star (third tier): two bullets can be fired on the screen at a time.
            //Third star (fourth tier): fired bullets can destroy steel walls and are twice as effective against brick walls.
            if (tank.bulletStrength < 4) {
                tank.bulletStrength++;
            }
        break;
        case(consts.POWERUP_GRENADE):
            //Destroys every enemy currently on the screen. No points given
            for (var i = 0; i < this._enemyTanksInPlay.length; i++) {
                this._enemyTanksInPlay[i].kill();
            }
        break;
        case(consts.POWERUP_TANK):
            tank.numberOfLives += 1;
        break;
    }

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
                if( (c === 3) && (aCategory[i].powerLevel === consts.TANK_POWER_DROPSPOWERUP) ) {
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
