// ==========
// SHIP STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function PlayerTank(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.rememberResets();

};

PlayerTank.prototype = new Entity();

PlayerTank.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;

    this.reset_orientation = this.orientation;
};

PlayerTank.prototype.KEY_UP = 'W'.charCodeAt(0);
PlayerTank.prototype.KEY_DOWN  = 'S'.charCodeAt(0);
PlayerTank.prototype.KEY_LEFT   = 'A'.charCodeAt(0);
PlayerTank.prototype.KEY_RIGHT  = 'D'.charCodeAt(0);
PlayerTank.prototype.KEY_FIRE   = ' '.charCodeAt(0);

PlayerTank.prototype.NORTH = 0;
PlayerTank.prototype.SOUTH = 1;
PlayerTank.prototype.WEST = 2;
PlayerTank.prototype.EAST = 3;

//TODO: Initialize xy coords based on default location for tank in environment
PlayerTank.prototype.cx = 200;
PlayerTank.prototype.cy = 200;

//HD NB: Need these for calculations, but I'm just making up numbers.
//Adjust them later based on tank size.
PlayerTank.prototype.halfHeight = g_canvas.height/g_gridSize-3;
PlayerTank.prototype.halfWidth = g_canvas.width/g_gridSize-3;

//HD: This is set to a positive integer when the tank is on ice, and is used
//to increment its movement. It is then decremented with each du
PlayerTank.prototype.slideCounter = 0;

//Normal bullet speed. Will be changed if player gets a powerup, or if the
//tank is the enemy time that shoots faster bullets.
PlayerTank.prototype.bulletVelocity = 6;

//HD: Normal bullet strength. Will be changed if player gets a powerup.
PlayerTank.prototype.bulletStrength = 1;

//HD: Can only fire one shot at a time. Changed with powerup.
PlayerTank.prototype.canFireTwice = false;

//counter for bullets alive that belong to tank
//increments when bullet fired, decrements when bullet is destroyed
PlayerTank.prototype.bulletsAlive = 0;

PlayerTank.prototype.hasForceField = false;

//Counter while tank is frozen. Only affects AI tanks when a player tank picks
//up a "freeze-time" powerup: The entityManager then sets this to some positive
//integer, and the tank needs to let it count down. When it reaches 0, the tank
//can move again.
PlayerTank.prototype.frozenCounter = 0;

//TODO: Implement higher speed when player picks up a powerup, plus permanent
//lower and higher speeds when entityManager creates certain enemy types
PlayerTank.prototype.moveDistance = 2;

PlayerTank.prototype.orientation = consts.DIRECTION_UP;

PlayerTank.prototype.numberOfLives = 2;

//TODO: Use this as check to decide whether the tank's bullets will destroy
//an enemy tank (player->enemy or enemy->player, maybe also enemy->enemy) or
//temporarily paralyze it (player->player)
PlayerTank.prototype.isPlayer = true;

PlayerTank.prototype.starLevel = consts.TANK_POWER_NONE;

//Determined which frame of the tank animation is "rendered"
// (i.e. fetched from spriteManager): 0 or 1
PlayerTank.prototype.animationFrame = 0;

//counts number of updates called
PlayerTank.prototype.animationFrameCounter = 0;


//Used as a counter to space apart how often the tank fires bullets
PlayerTank.prototype.bulletDelayCounter = 0;

// HACKED-IN AUDIO (no preloading)
PlayerTank.prototype.soundIdle = "tankIdle";
PlayerTank.prototype.soundMove = "tankMove";

//HD: Using this as a "1-2" tick between two animation frames in .render()
//PlayerTank.prototype.animationTicker = true;

PlayerTank.prototype.isMoving = false;

PlayerTank.prototype.update = function (du) {
    spatialManager.unregister(this);

    // store old value of isMoving to detect if tank
    // has stopped (used for slide effect on ice)
    var wasMoving = this.isMoving;

    // Set movement state to false -- if move will be called, this will be set
    // to true. At the end of the update loop, we will decide which audio to play
    this.isMoving = false;

    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;

    if (keys[this.KEY_UP]) {
        this.orientation = consts.DIRECTION_UP;
		this.lockToNearestGrid();
        this.move(du, this.cx, this.cy - this.moveDistance);
    }
    else if (keys[this.KEY_DOWN]) {
        this.orientation = consts.DIRECTION_DOWN;
		this.lockToNearestGrid();
        this.move(du, this.cx, this.cy + this.moveDistance);
    }
    else if (keys[this.KEY_LEFT]) {
        this.orientation = consts.DIRECTION_LEFT;
		this.lockToNearestGrid();
        this.move(du, this.cx - this.moveDistance, this.cy);
    }
    else if (keys[this.KEY_RIGHT]) {
        this.orientation = consts.DIRECTION_RIGHT;
		this.lockToNearestGrid();
        this.move(du, this.cx + this.moveDistance, this.cy);
    }

    //HD: Handle firing. (Remember that we can fire even if we can't move.)
    this.maybeFireBullet();

    // if tank was moving but isn't moving now and is on ice...
    if (wasMoving && !this.isMoving && spatialManager.isOnIce(this.cx, this.cy)) {
        // EAH: value of 20 looks okay I guess?
        this.slideCounter = 20;
    }

    // remove slide effect if not on ice or if tank moved
    if (!spatialManager.isOnIce(this.cx, this.cy) || this.isMoving) {
        this.slideCounter = 0;
    }

    if (this.slideCounter > 0) {
        switch(this.orientation) {
            case(consts.DIRECTION_UP):
                this.slide(du, this.cx, this.cy - this.moveDistance);
                break;
            case(consts.DIRECTION_DOWN):
                this.slide(du, this.cx, this.cy + this.moveDistance);
                break;
            case(consts.DIRECTION_LEFT):
                this.slide(du, this.cx - this.moveDistance, this.cy);
                break;
            case(consts.DIRECTION_RIGHT):
                this.slide(du, this.cx + this.moveDistance, this.cy);
                break;
        }
        this.slideCounter -= 1;
    }

    spatialManager.register(this);

    // Play audio for tank
    if (this.isMoving) {
        g_SFX.request(this.soundMove);
    } else {
        g_SFX.request(this.soundIdle);
    }

};

PlayerTank.prototype.slide = function(du, newX, newY) {
    var hitEntity = this.findHitEntity(newX, newY);
    if (!hitEntity)
    {
        this.cx = newX;
        this.cy = newY;
    }
};

PlayerTank.prototype.move = function(du, newX, newY)
{

    var hitEntity = this.findHitEntity(newX, newY);
    if ( (!hitEntity) ||
         (hitEntity.type === consts.POWERUP_HELMET) ||
         (hitEntity.type === consts.POWERUP_TIMER) ||
         (hitEntity.type === consts.POWERUP_SHOVEL) ||
         (hitEntity.type === consts.POWERUP_STAR) ||
         (hitEntity.type === consts.POWERUP_GRENADE) ||
         (hitEntity.type === consts.POWERUP_TANK) )
    {
        this.cx = newX;
        this.cy = newY;
        //React to if we drove over a powerup
        if(hitEntity){
            hitEntity.getPickedUp(this);
        }
    }

    // update animation frame
    this.animationFrameCounter++;
    if (this.animationFrameCounter % 3 === 0) {
        // switch frame every 3rd update
        this.animationFrame === 0 ? this.animationFrame = 1
                                  : this.animationFrame = 0;
    }

    this.isMoving = true;
};

// use direction to determine wether we lock to X-grid og Y-grid
PlayerTank.prototype.lockToNearestGrid = function(){
	if(this.orientation === consts.DIRECTION_UP || this.orientation == consts.DIRECTION_DOWN){
		// lock to nearest x coordinates on the grid
		var gridStep = g_canvas.width/g_gridSize;
		var mod = this.cx % gridStep;
		if(mod >= gridStep/2)
			this.cx = this.cx-mod+gridStep;
		else
			this.cx = this.cx-mod;
	}
	if(this.orientation === consts.DIRECTION_RIGHT || this.orientation == consts.DIRECTION_LEFT){
		// lock to nearest y coordinates on the grid
		var gridStep = g_canvas.height/g_gridSize;
		var mod = this.cy % gridStep;
		if(mod >= gridStep/2)
			this.cy = this.cy-mod+gridStep;
		else
			this.cy = this.cy-mod;
	}
};

PlayerTank.prototype.maybeFireBullet = function () {

    if (eatKey(this.KEY_FIRE)) {
        this.bulletDelayCounter++;
        //tank may only fire if no bullets alive
        //or only one bullet alive and canFireTwice is true
        if (this.bulletsAlive === 0 || (this.bulletsAlive === 1 && this.canFireTwice))  {
            var turretX, turretY;
            // EAH: add offset so bullet doesn't collide with tank!
            var alpha = 5;

            switch(this.orientation) {
                case(consts.DIRECTION_UP):
                    turretX = this.cx;
                    turretY = this.cy - this.halfHeight - alpha;
                    break;
                case(consts.DIRECTION_DOWN):
                    turretX = this.cx;
                    turretY = this.cy + this.halfHeight + alpha;
                    break;
                case(consts.DIRECTION_LEFT):
                    turretX = this.cx - this.halfWidth - alpha;
                    turretY = this.cy;
                    break;
                case(consts.DIRECTION_RIGHT):
                    turretX = this.cx + this.halfWidth + alpha;
                    turretY = this.cy;
                    break;
            }

            //We send in "this" so that entityManager can calculate
            //whether the tank is allowed to fire again, if it tries to.
            this.bulletsAlive++;
            entityManager.fireBullet(turretX, turretY, this.bulletVelocity,
                this.orientation, this.isPlayer, this.bulletStrength, this);
        }
    }
};

PlayerTank.prototype.takeBulletHit = function (bullet) {

    //Player got shot by enemy
    if((this.isPlayer) && (!bullet.player) && (!this.hasForceField) ) {
        this.reset();
        g_SFX.request(bullet.soundDestroyPlayer);
    }

    //Player got shot by other player
    if((this.isPlayer) && (bullet.player) && (!this.hasForceField) ) {

        //TODO: Freeze player in place temporarily (he can turn and fire but not move)

        // just do a reset for now
        this.reset();
        g_SFX.request(bullet.soundDestroyPlayer);
    }

    this._numberOfLives--;

    //Enemy got shot by player. We'll have to do other things here later on,
    //such as incrementing the score for the player who owned the bullet,
    //and possibly lower the tank's health instead of killing it.
    if((!this.isPlayer) && (bullet.isPlayer)) {
        this.kill();
    }

    };

PlayerTank.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.orientation = this.reset_orientation;

    //this.halt();
};

PlayerTank.prototype.addStar = function() {

    switch(this.starLevel){
        case(consts.TANK_POWER_NONE):
            //Fired bullets are as fast as Power Tanks' bullets
            this.starLevel = consts.TANK_POWER_1STAR;
            this.bulletVelocity *= 2;
        break;
        case(consts.TANK_POWER_1STAR):
            //Two bullets can be fired on the screen at a time.
            this.starLevel = consts.TANK_POWER_2STARS;
            this.canFireTwice = true;
        break;
        case(consts.TANK_POWER_2STARS):
            //Fired bullets can destroy steel walls and are twice as effective
            //against brick walls.
            this.starLevel = consts.TANK_POWER_3STARS;
            this.bulletStrength = 2;
        break;
        case(consts.TANK_POWER_3STARS):
            //Nothing happens.
        break;
    }
};

PlayerTank.prototype.addForceField = function() {
    this.hasForceField = true;
    entityManager.generateEffect(consts.EFFECT_INVULNERABLE, this, this.removeForceField);
};

PlayerTank.prototype.removeForceField = function() {
    this.hasForceField = false;
};


// EAH; don't need this function anymore?
PlayerTank.prototype.addSprite = function(image, sx, sy, width, height,
    numCols=1, numRows=1)
{
    // HD TODO: This is the basic 1st version of having an object load its own
    // sprites, so I'm skipping animation code for now. We let the tank assume
    // that every two entries in spriteList are animation frames pointing in
    //the same direction.
    this.spriteList.push(new Sprite(image, sx, sy, width, height,
        numCols, numRows));
};

PlayerTank.prototype.render = function (ctx, du) {

    // fetch correct sprite from spriteManager
    this.sprite = spriteManager.spriteTank(
        this.type,
        this.starLevel,
        this.orientation,
        this.animationFrame
    );

	ctx.save();
	ctx.translate(this.cx, this.cy)
	ctx.scale(g_spriteScale, g_spriteScale);
	ctx.translate(-this.cx, -this.cy)
    this.sprite.drawTankAt(ctx, this.cx, this.cy);
    ctx.restore();
};
