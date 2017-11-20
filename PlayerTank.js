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
    this.reset_bulletVelocity = this.bulletVelocity;
    this.reset_canFireTwice = this.canFireTwice;
    this.reset_bulletStrength = this.bulletStrength;

    this.reset_orientation = this.orientation;
};

PlayerTank.prototype.KEY_UP    = 'W'.charCodeAt(0);
PlayerTank.prototype.KEY_DOWN  = 'S'.charCodeAt(0);
PlayerTank.prototype.KEY_LEFT  = 'A'.charCodeAt(0);
PlayerTank.prototype.KEY_RIGHT = 'D'.charCodeAt(0);
PlayerTank.prototype.KEY_FIRE  = ' '.charCodeAt(0);

PlayerTank.prototype.NORTH = 0;
PlayerTank.prototype.SOUTH = 1;
PlayerTank.prototype.WEST  = 2;
PlayerTank.prototype.EAST  = 3;

PlayerTank.prototype.cx = 200;
PlayerTank.prototype.cy = 200;

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

//0 is no forcefield, 1 is brief spawning forcefield, 2 is longer powerfup field.
PlayerTank.prototype.forceFieldType = 0;

//Counter while tank is frozen. Only affects AI tanks when a player tank picks
//up a "freeze-time" powerup: The entityManager then sets this to some positive
//integer, and the tank needs to let it count down. When it reaches 0, the tank
//can move again.
PlayerTank.prototype.frozen = false;

PlayerTank.prototype.moveDistance = 2;

PlayerTank.prototype.orientation = consts.DIRECTION_UP;

PlayerTank.prototype.numberOfLives = 2;

//Used as check to decide whether the tank's bullets will destroy
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

PlayerTank.prototype.isMoving = false;

PlayerTank.prototype.isDead = false;

PlayerTank.prototype.update = function (du) {
    spatialManager.unregister(this);
    
    if (this.numberOfLives <= -1) {
        this.isDead = true;
        return;
    }

    // store old value of isMoving to detect if tank
    // has stopped (used for slide effect on ice)
    var wasMoving = this.isMoving;

    // Set movement state to false -- if move will be called, this will be set
    // to true. At the end of the update loop, we will decide which audio to play
    this.isMoving = false;

    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;
    
    if (this.frozen) {
        // Do nothing -- just prevent rest of ifs.
    }
    else if (keys[this.KEY_UP]) {
        this.orientation = consts.DIRECTION_UP;
		this.lockToNearestGrid();
        this.move(du, this.cx, this.cy - this.moveDistance * du);
    }
    else if (keys[this.KEY_DOWN]) {
        this.orientation = consts.DIRECTION_DOWN;
		this.lockToNearestGrid();
        this.move(du, this.cx, this.cy + this.moveDistance * du);
    }
    else if (keys[this.KEY_LEFT]) {
        this.orientation = consts.DIRECTION_LEFT;
		this.lockToNearestGrid();
        this.move(du, this.cx - this.moveDistance * du, this.cy);
    }
    else if (keys[this.KEY_RIGHT]) {
        this.orientation = consts.DIRECTION_RIGHT;
		this.lockToNearestGrid();
        this.move(du, this.cx + this.moveDistance * du, this.cy);
    }

    //HD: Handle firing. (Remember that we can fire even if we can't move.)
    //EAH: don't fire if tank is dead (e.g. when spawning)
    if (!this.isDead) 
        this.maybeFireBullet();

    // if tank was moving but isn't moving now and is on ice...
    if (wasMoving && !this.isMoving && spatialManager.isOnIce(this.cx, this.cy)) {
        this.slideCounter = 10;
    }

    // remove slide effect if not on ice or if tank moved
    if (!spatialManager.isOnIce(this.cx, this.cy) || this.isMoving) {
        this.slideCounter = 0;
    }

    if (this.slideCounter > 0) {
        switch(this.orientation) {
            case(consts.DIRECTION_UP):
                this.slide(du, this.cx, this.cy - this.moveDistance * du);
                break;
            case(consts.DIRECTION_DOWN):
                this.slide(du, this.cx, this.cy + this.moveDistance * du);
                break;
            case(consts.DIRECTION_LEFT):
                this.slide(du, this.cx - this.moveDistance * du, this.cy);
                break;
            case(consts.DIRECTION_RIGHT):
                this.slide(du, this.cx + this.moveDistance * du, this.cy);
                break;
        }
        this.slideCounter -= 1;
    }

    if (!this.isDead)
      spatialManager.register(this);

    // Play audio for tank
    if (this.isMoving && !this.isDead) {
        g_SFX.request(this.soundMove);
    } else {
        g_SFX.request(this.soundIdle);
    }

};

PlayerTank.prototype.incrementBulletCount = function () {
    this.bulletsAlive++;
}

PlayerTank.prototype.decrementBulletCount = function () {
    this.bulletsAlive = Math.max(0, this.bulletsAlive -1);
}


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
         (hitEntity.entity.type === consts.POWERUP_HELMET) ||
         (hitEntity.entity.type === consts.POWERUP_TIMER) ||
         (hitEntity.entity.type === consts.POWERUP_SHOVEL) ||
         (hitEntity.entity.type === consts.POWERUP_STAR) ||
         (hitEntity.entity.type === consts.POWERUP_GRENADE) ||
         (hitEntity.entity.type === consts.POWERUP_TANK) )
    {
        this.cx = newX;
        this.cy = newY;
        //React to if we drove over a powerup
        if(hitEntity){
            hitEntity.entity.getPickedUp(this);
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
            // offset so bullet doesn't collide with tank!
            var alpha = Bullet.prototype.halfWidth;

            switch(this.orientation) {
                // added offsets when shooting up or down
                case(consts.DIRECTION_UP):
                    turretX = this.cx - 2;
                    turretY = this.cy - this.halfHeight - alpha;
                    break;
                case(consts.DIRECTION_DOWN):
                    turretX = this.cx - 3;
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
            this.incrementBulletCount();
            entityManager.fireBullet(turretX, turretY, this.bulletVelocity,
                this.orientation, this.isPlayer, this.bulletStrength, this);
        }
    }
};

PlayerTank.prototype.takeBulletHit = function (bullet) {
    
    //Player got shot by enemy
    if(!bullet.player && (this.forceFieldType === 0) && !this.isDead) {
        this.isDead = true;
        var coords = {cx: this.cx, cy: this.cy};
        var that = this;
        var reset = function() { that.reset(true) };
        g_SFX.request(bullet.soundDestroyPlayer);
        this.numberOfLives--;
        if (this.numberOfLives >= 0) {
            entityManager.generateEffect("explosionBig", coords, reset);
        }
        else {
            // don't reset player if out of lives
            entityManager.generateEffect("explosionBig", coords);
        }
    }

    //Player got shot by other player
    else if(bullet.player && (this.forceFieldType === 0)) {
        if (g_friendlyFire) {
            // friendly fire on, kill player
            this.isDead = true;
            var coords = {cx: this.cx, cy: this.cy};
            var that = this;
            var reset = function() { that.reset(true) };
            g_SFX.request(bullet.soundDestroyPlayer);
            this.numberOfLives--;
            if (this.numberOfLives >= 0) {
                entityManager.generateEffect("explosionBig", coords, reset);
            }
            else {
                // don't reset player if out of lives
                entityManager.generateEffect("explosionBig", coords);
            }
        }
        else {  // friendly fire is off
            // freeze player for a while
            this.frozen = true;
            var that = this;
            setTimeout(function () { that.frozen = false; }, 3000);
        }
    }
    return true;
};

PlayerTank.prototype._doReset = function () {
    this.orientation = this.reset_orientation;
    this.frozen = false;
    this.addForceField(1);
    this.isDead = false;
};

PlayerTank.prototype.reset = function (death=false) {
    if (death) {
        this.starLevel = consts.TANK_POWER_NONE;
        this.bulletVelocity = this.reset_bulletVelocity;
        this.canFireTwice = this.reset_canFireTwice;
        this.bulletStrength = this.reset_bulletStrength;
    }
    this.frozen = true;
    this.setPos(this.reset_cx, this.reset_cy);
    var that = this;
    var do_reset = function () { that._doReset() };
    entityManager.generateEffect("spawnFlash", this, do_reset);
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

PlayerTank.prototype.addForceField = function(forceFieldType) {
    this.forceFieldType = forceFieldType;
    var that = this;
    var removeForceField = function () {
        that.removeForceField();
    }
    entityManager.generateEffect("invulnerable", this, removeForceField);
};

PlayerTank.prototype.removeForceField = function() {
    this.forceFieldType = 0;
};

PlayerTank.prototype.render = function (ctx, du) {

    if (this.isDead)
        return;

    // fetch correct sprite from spriteManager
    this.sprite = spriteManager.spriteTank(
        this.type,
        this.starLevel,
        this.orientation,
        this.animationFrame
    );

    //ctx.save();
    //ctx.translate(this.cx, this.cy)
    //ctx.scale(g_spriteScale, g_spriteScale);
    //ctx.translate(-this.cx, -this.cy)
    this.sprite.drawTankAt(ctx, this.cx, this.cy);
    //ctx.restore();
};
