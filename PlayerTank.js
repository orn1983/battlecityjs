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

PlayerTank.prototype.tanktype = consts.TANK_PLAYER1;

//HD: This is set to a positive integer when the tank is on ice, and is used
//to increment its movement. It is then decremented with each du
PlayerTank.prototype.slideCounter = 0;

//Normal bullet speed. Will be changed if player gets a powerup, or if the
//tank is the enemy time that shoots faster bullets.
PlayerTank.prototype.bulletVelocity = 3;

//HD: Normal bullet strength. Will be changed if player gets a powerup.
PlayerTank.prototype.bulletStrength = 1;

//HD: Can only fire one shot at a time. Changed with powerup.
PlayerTank.prototype.canFireTwice = false;

//Counter while tank is frozen. Only affects AI tanks when a player tank picks
//up a "freeze-time" powerup: The entityManager then sets this to some positive
//integer, and the tank needs to let it count down. When it reaches 0, the tank
//can move again.
PlayerTank.prototype.frozenCounter = 0;

//TODO: Implement higher speed when player picks up a powerup, plus permanent
//lower and higher speeds when entityManager creates certain enemy types
PlayerTank.prototype.moveDistance = 2;

PlayerTank.prototype.orientation = consts.DIRECTION_UP;

PlayerTank.prototype.numberOfLives = 14;

//TODO: Use this as check to decide whether the tank's bullets will destroy
//an enemy tank (player->enemy or enemy->player, maybe also enemy->enemy) or
//temporarily paralyze it (player->player)
PlayerTank.prototype.isPlayer = true;

//HD: Commenting this one out. Instead, we can check if the tanks is of type
//tanktype.TANK_POWER_DROPSPOWERUP when we're deciding what sprite to get
//and whether the tank should drop a powerup when killed.
//PlayerTank.prototype.isPoweredUp = false;

//Determined which frame of the tank animation is "rendered"
// (i.e. fetched from spriteManager): 0 or 1
PlayerTank.prototype.animationFrame = 0;

//counts number of updates called
PlayerTank.prototype.animationFrameCounter = 0;

// HACKED-IN AUDIO (no preloading)
PlayerTank.prototype.soundIdle = "tankIdle";
PlayerTank.prototype.soundMove = "tankMove";

//HD: Using this as a "1-2" tick between two animation frames in .render()
//PlayerTank.prototype.animationTicker = true;

PlayerTank.prototype.isMoving = false;

PlayerTank.prototype.update = function (du) {
    spatialManager.unregister(this);

    // OA: Set movement state to false -- if move will be called, this will be set
    // to true. At the end of the update loop, we will decide which audio to play
    this.isMoving = false;

    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;

    var sliding = false;
    if(this.slideCounter > 0)
        sliding = true;

    if(sliding) {
        //HD NB: It's possible we may have to check first for a keypress,
        //to see if the orientation has changed. Let's try this version for now,
        //since it makes for simpler code.
        switch(this.orientation) {
            case(consts.DIRECTION_UP):
                this.move(du, this.cx, this.cy - this.moveDistance);
                break;
            case(consts.DIRECTION_DOWN):
                this.move(du, this.cx, this.cy + this.moveDistance);
                break;
            case(consts.DIRECTION_LEFT):
                this.move(du, this.cx - this.moveDistance, this.cy);
                break;
            case(consts.DIRECTION_RIGHT):
                this.move(du, this.cx + this.moveDistance, this.cy);
                break;
        }
        this.SlideCounter -= 1;
    }

    //Check for keypress, but don't move if you've already slid.
    // EAH: only first key pressed is applied
    //      to prevent diagonal movement:
    //      "One key to rule them all..."
    if (keys[this.KEY_UP]) {
        this.orientation = consts.DIRECTION_UP;
        if(!sliding)
            this.move(du, this.cx, this.cy - this.moveDistance);
    }
    else if (keys[this.KEY_DOWN]) {
        this.orientation = consts.DIRECTION_DOWN;
        if(!sliding)
            this.move(du, this.cx, this.cy + this.moveDistance);
    }
    else if (keys[this.KEY_LEFT]) {
        this.orientation = consts.DIRECTION_LEFT;
        if(!sliding)
            this.move(du, this.cx - this.moveDistance, this.cy);
    }
    else if (keys[this.KEY_RIGHT]) {
        this.orientation = consts.DIRECTION_RIGHT;
        if(!sliding)
          this.move(du, this.cx + this.moveDistance, this.cy);
    }

    //HD: Handle firing. (Remember that we can fire even if we can't move.)
    this.maybeFireBullet();


    spatialManager.register(this);

    // Play audio for tank
    if (this.isMoving) {
        g_SFX.request(this.soundMove);
    } else {
        g_SFX.request(this.soundIdle);
    }

};

PlayerTank.prototype.move = function(du, newX, newY)
{
    var hitEntity = this.findHitEntity(newX, newY);
    if (!hitEntity)
    {
        this.cx = newX;
        this.cy = newY;
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
}

PlayerTank.prototype.maybeFireBullet = function () {

    //if (keys[this.KEY_FIRE]) {
    // EAH: better to use eatKey here I think
    //      even if you can fire more than one bullet at one, you
    //      probably don't want to fire them all with one button push!
    if (eatKey(this.KEY_FIRE)) {

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

        //HD: We send in "this" so that entityManager can calculate
        //whether the tank is allowed to fire again, if it tries to.
        entityManager.fireBullet(turretX, turretY, this.bulletVelocity,
            this.orientation, this.isPlayer, this.bulletStrength, this);
    }

};

PlayerTank.prototype.takeBulletHit = function (bullet) {

    //Player got shot by enemy
    if((this.isPlayer) && (!bullet.player)) {
        this.kill();
    }

    //EAH: enabling friendly fire for now
    if((this.isPlayer) && (bullet.player)) {
        // just do a reset for now
        this.reset();
    }


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
        this.tanktype,
        consts.TANK_POWER_NONE,
        this.orientation,
        this.animationFrame
    );

	ctx.save();
	ctx.translate(this.cx, this.cy)
	ctx.scale(2,2);
	ctx.translate(-this.cx, -this.cy)
    this.sprite.drawTankAt(ctx, this.cx, this.cy);
    ctx.restore();

    /*

    var spriteCount = 0;

    // HD: Unlike other direction-focused switch statements in PlayerTank, this
    // particular switch is ordered up-left-down-right. That's the reading order
    // of images in spritesheet.png, so it's probably a good idea to keep that
    // same order here.
    // TODO: Only change animation if the tank is actually moving
    // TODO #2: Fix how rapidly the animatiaion changes.
        switch(this.orientation) {
        case(consts.DIRECTION_UP):
            if(this.animationTicker)
            {
                spriteCount = 0;
            }
            else
            {
                spriteCount = 1;
            }
        break;
        case(consts.DIRECTION_LEFT):
            if(this.animationTicker)
            {
                spriteCount = 2;
            }
            else
            {
                spriteCount = 3;
            }
        break;
        case(consts.DIRECTION_DOWN):
            if(this.animationTicker)
            {
                spriteCount = 4;
            }
            else
            {
                spriteCount = 5;
            }
        break;
        case(consts.DIRECTION_RIGHT):
            if(this.animationTicker)
            {
                spriteCount = 6;
            }
            else
            {
                spriteCount = 7;
            }
        break;
    }

    this.animationTicker = !this.animationTicker;

    //HD: Adding a new temp function for this so that we can still use
    //this.sprite.drawCentredAt() until we don't need it anymore.
    this.spriteList[spriteCount].drawTankAt(
      ctx, this.cx, this.cy
    );
    */

};
