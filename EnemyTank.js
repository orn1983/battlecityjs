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
function EnemyTank(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.rememberResets();

};

EnemyTank.prototype = new Entity();

EnemyTank.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;

    this.reset_orientation = this.orientation;
};

EnemyTank.prototype.NORTH = 0;
EnemyTank.prototype.SOUTH = 1;
EnemyTank.prototype.WEST = 2;
EnemyTank.prototype.EAST = 3;

//TODO: Initialize xy coords based on default location for tank in environment
EnemyTank.prototype.cx = 200;
EnemyTank.prototype.cy = 200;

//HD NB: Need these for calculations, but I'm just making up numbers.
//Adjust them later based on tank size.
EnemyTank.prototype.halfHeight = g_canvas.height/g_gridSize-3;
EnemyTank.prototype.halfWidth = g_canvas.width/g_gridSize-3;

/*
TANK_ENEMY_BASIC    : 3,
TANK_ENEMY_FAST     : 4,
TANK_ENEMY_POWER    : 5,
TANK_ENEMY_ARMOR    : 6,
*/

EnemyTank.prototype.tanktype = consts.TANK_ENEMY_BASIC;

//HD: This is the default for most tanks. For those that drop powerups,
//it'll be consts.TANK_POWER_DROPSPOWERUP
EnemyTank.prototype.powerLevel = consts.TANK_POWER_NONE;

//HD: This is set to a positive integer when the tank is on ice, and is used
//to increment its movement. It is then decremented with each du
EnemyTank.prototype.slideCounter = 0;

//Normal bullet speed. Will be changed if player gets a powerup, or if the
//tank is the enemy time that shoots faster bullets.
EnemyTank.prototype.bulletVelocity = 6;

//HD: Normal bullet strength. Will be changed if player gets a powerup.
EnemyTank.prototype.bulletStrength = 1;

//HD: Can only fire one shot at a time. Changed with powerup.
EnemyTank.prototype.canFireTwice = false;

//counter for bullets alive that belong to tank
//increments when bullet fired, decrements when bullet is destroyed
EnemyTank.prototype.bulletsAlive = 0;

//Counter while tank is frozen. Only affects AI tanks when a player tank picks
//up a "freeze-time" powerup: The entityManager then sets this to some positive
//integer, and the tank needs to let it count down. When it reaches 0, the tank
//can move again.
EnemyTank.prototype.frozenCounter = 0;

//TODO: Implement higher speed when player picks up a powerup, plus permanent
//lower and higher speeds when entityManager creates certain enemy types
EnemyTank.prototype.moveDistance = 2;

EnemyTank.prototype.orientation = consts.DIRECTION_UP;

EnemyTank.prototype.numberOfLives = 1;

EnemyTank.prototype.isPlayer = false;

//Determined which frame of the tank animation is "rendered"
// (i.e. fetched from spriteManager): 0 or 1
EnemyTank.prototype.animationFrame = 0;

//counts number of updates called
EnemyTank.prototype.animationFrameCounter = 0;

// HACKED-IN AUDIO (no preloading)
EnemyTank.prototype.soundIdle = "tankIdle";
EnemyTank.prototype.soundMove = "tankMove";

EnemyTank.prototype.isMoving = false;

//HD: Using this to check when the tank should turn
EnemyTank.prototype.bumpedIntoObstacle = false;

EnemyTank.prototype.update = function (du) {
    spatialManager.unregister(this);

    // store old value of isMoving to detect if tank
    // has stopped (used for slide effect on ice)
    var wasMoving = this.isMoving;

    // OA: Set movement state to false -- if move will be called, this will be set
    // to true. At the end of the update loop, we will decide which audio to play
    this.isMoving = false;

    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;

    switch (this.orientation) {
        case(consts.DIRECTION_UP):
	        this.lockToNearestGrid();
            this.move(du, this.cx, this.cy - this.moveDistance);
        break;
        case(consts.DIRECTION_DOWN):
            this.lockToNearestGrid();
            this.move(du, this.cx, this.cy + this.moveDistance);
        break;
        case(consts.DIRECTION_LEFT):
            this.lockToNearestGrid();
            this.move(du, this.cx - this.moveDistance, this.cy);
        break;
        case(consts.DIRECTION_RIGHT):
            this.lockToNearestGrid();
            this.move(du, this.cx + this.moveDistance, this.cy);
        break;
    }

    //Handle firing. (Remember that we can fire even if we can't move.)
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

EnemyTank.prototype.slide = function(du, newX, newY) {
    var hitEntity = this.findHitEntity(newX, newY);
    if (!hitEntity)
    {
        this.cx = newX;
        this.cy = newY;
    }
};

EnemyTank.prototype.move = function(du, newX, newY)
{
    var hitEntity = this.findHitEntity(newX, newY);
    if (!hitEntity)
    {
        this.cx = newX;
        this.cy = newY;
    }

    else {
        var aimedAtFlag = false;
        if(hitEntity.type == consts.STRUCTURE_FLAG) {
            aimedAtFlag = true;
        }
        this.changeDirection(aimedAtFlag);
    }

    //var hitType = hitEntity.
    //console.log(hitEntity);
    /*if(hitEntity.type === consts.POWERUP)
    //Púlla frekar string start.
    {
        hitEntity.getPickedUp(this);
        this.cx = newX;
        this.cy = newY;
    }*/

    // update animation frame
    this.animationFrameCounter++;
    if (this.animationFrameCounter % 3 === 0) {
        // switch frame every 3rd update
        this.animationFrame === 0 ? this.animationFrame = 1
                                  : this.animationFrame = 0;
    }

    this.isMoving = true;
};

EnemyTank.prototype.changeDirection = function(aimedAtFlag){
    //HD: If a tank is aimed at a flag, it'll stay where it is and keep firing.
    //Otherwise, it will change direction to something other than its current
    //one. We want the tanks to slightly head toward the flag, so the odds
    //are skewed toward that: 30% Down, 25% Left, 25% Right and 20% Up.
    //I reroll if the unavailable direction comes up.

    //NB: I've seen enemy tanks try to hammer against a structure, so if we
    //want we could eliminate the reroll - but that might be misunderstood and
    //look like we simply didn't think of it.

    //(We COULD also give preference to direction based on the tank's grid location
    // relative to the center, but honestly, in the original version they're
    // not that smart).

    var newDirection = -1;
    if(!aimedAtFlag) {
        switch (this.orientation) {
            case(consts.DIRECTION_DOWN):  //1 to 30
            newDirection = 1;
            while(newDirection<=30) {
                newDirection = Math.floor(Math.random() * 100 + 1);
            }
            break;
            case(consts.DIRECTION_LEFT): //30 to 55
            newDirection = 35;
            while( (newDirection>30) && (newDirection <=55) ) {
                newDirection = Math.floor(Math.random() * 100 + 1);
            }
            break;
            case(consts.DIRECTION_RIGHT): //56 to 80
            newDirection = 60;
            while( (newDirection>55) && (newDirection <=80) ) {
                newDirection = Math.floor(Math.random() * 100 + 1);
            }
            break;
            case(consts.DIRECTION_UP): //81 to 100
                newDirection = 99;
                while(newDirection>80) {
                    newDirection = Math.floor(Math.random() * 100 + 1);
                }
            break;
        }

        if(newDirection <= 33) {
            this.orientation = consts.DIRECTION_DOWN;
        }
        else if( (newDirection>30) && (newDirection <=55) )
        {
            this.orientation = consts.DIRECTION_LEFT;
        }
        else if( (newDirection>55) && (newDirection <=80) )
        {
            this.orientation = consts.DIRECTION_RIGHT;
        }
        else {
            this.orientation = consts.DIRECTION_UP;
        }

    }

};


// use direction to determine wether we lock to X-grid og Y-grid
EnemyTank.prototype.lockToNearestGrid = function(){
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

EnemyTank.prototype.maybeFireBullet = function () {

        if (this.bulletsAlive === 0 ) {
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

            this.bulletsAlive++;
            entityManager.fireBullet(turretX, turretY, this.bulletVelocity,
                this.orientation, this.isPlayer, this.bulletStrength, this);
        }

};

EnemyTank.prototype.takeBulletHit = function (bullet) {

    //Enemy got shot by player
    if((!this.isPlayer) && (bullet.player)) {
        this.kill();
        g_SFX.request(bullet.soundDestroyPlayer);
        //HD: #1: Do we also use "soundDestroyPlayer" for enemy tank deaths?
        //HD #2: Also, do we need to send some value up to a manager so that the
        // player who shot this tank gets points for it? (btw, different enemy)
        // tank types will give you different points.
        //HD #3: Remember to let the powerup manager create a new powerup
        // if this.powerLevel === consts.TANK_POWER_DROPSPOWERUP.

    }


    };

EnemyTank.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.orientation = this.reset_orientation;

    //this.halt();
};


// EAH; don't need this function anymore?
EnemyTank.prototype.addSprite = function(image, sx, sy, width, height,
    numCols=1, numRows=1)
{
    // HD TODO: This is the basic 1st version of having an object load its own
    // sprites, so I'm skipping animation code for now. We let the tank assume
    // that every two entries in spriteList are animation frames pointing in
    //the same direction.
    this.spriteList.push(new Sprite(image, sx, sy, width, height,
        numCols, numRows));
};

EnemyTank.prototype.render = function (ctx, du) {
    
    // fetch correct sprite from spriteManager
    this.sprite = spriteManager.spriteTank(
        //consts.TANK_ENEMY_POWER,
        this.tanktype,
        //consts.TANK_POWER_DROPSPOWERUP,
        //consts.TANK_POWER_NONE,
        this.powerLevel,
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