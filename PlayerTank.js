// ==========
// SHIP STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

//HD:Starting work on the player tank. Differentiating it from enemy tanks
//at the moment, part since some of their attributes (sprites,
//powerups, AI behavior) seem sufficiently exclusive to warrant having
//them as separate entity types, and part so we can at least get the player
//character driving around the place before we do anything more complicated.
//Player 2 could be the exact same code, except for different movement
//key values, starting location, and sprite.
//ALMOST DEFINITELY NOT WORKING AT THE MOMENT, BTW.

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
PlayerTank.prototype.halfHeight = 20;
PlayerTank.prototype.halfWidth = 20;

//HD: This is set to a positive integer when the tank is on ice, and is used
//to increment its movement. It is then decremented with each du
PlayerTank.prototype.slideCounter = 0;

//HD: Normal bullet speed. Will be changed if player gets a powerup.
PlayerTank.prototype.bulletVelocity = 1;

//HD: Normal bullet strength. Will be changed if player gets a powerup.
PlayerTank.prototype.bulletStrength = 1;

//HD: Can only fire one shot at a time. Changed with powerup.
PlayerTank.prototype.canFireTwice = false;

//HD: Counter while tank is frozen. Will only apply to AI tanks (when a player
//tank drives over a freeze-time powerup, it'll send a message up to the
//entityManager, who will then send down a positive integer value for
//frozenCounter to all tanks who are NOT player1 or player2).
//When this reaches 0, the tank can move again.
PlayerTank.prototype.frozenCounter = 0;

//HD: This is how far you move in a single step, either through a keypress
//or by sliding on ice. (I picked the value simply because it's what part
//used for the thrust value in Asteroids)
PlayerTank.prototype.moveDistance = 2;

//HD: Starting off facing up. Defined as a global in entityManager
PlayerTank.prototype.orientation = entityManager.DIRECTION_UP;

PlayerTank.prototype.numberOfLives = 14;

//HD: Used when creating bullets, to avoid friendly fire.
PlayerTank.prototype.isPlayer = true;

//HD: Commenting out for now - we likely don't need this
//PlayerTank.prototype.numSubSteps = 1;

// HACKED-IN AUDIO (no preloading)
PlayerTank.prototype.warpSound = new Audio(
    "sounds/shipWarp.ogg");

//HD NB: We're not using this function right now, but I'm adding it just to
//show how the code would look
//Playertank.prototype.playSound = function()
//{
//  this.warpSound.play();
//}

//HD: Using this as a "1-2" tick between two animation frames in .render()
PlayerTank.prototype.animationTicker = true;


PlayerTank.prototype.update = function (du) {
    spatialManager.unregister(this);

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
    
    // EAH: currently possible to move diagonally!
    //Check for keypress, but don't move if you've already slid.
    if (keys[this.KEY_UP]) {
        this.orientation = consts.DIRECTION_UP;
        if(!sliding)
            this.move(du, this.cx, this.cy - this.moveDistance);
    }
    if (keys[this.KEY_DOWN]) {
        this.orientation = consts.DIRECTION_DOWN;
        if(!sliding)
            this.move(du, this.cx, this.cy + this.moveDistance);
    }
    if (keys[this.KEY_LEFT]) {
        this.orientation = consts.DIRECTION_LEFT;
        if(!sliding)
            this.move(du, this.cx - this.moveDistance, this.cy);
    }
    if (keys[this.KEY_RIGHT]) {
        this.orientation = consts.DIRECTION_RIGHT;
        if(!sliding)
          this.move(du, this.cx + this.moveDistance, this.cy);
    }

    //HD: Handle firing. (Remember that we can fire even if we can't move.)
    this.maybeFireBullet();

    spatialManager.register(this);

};

PlayerTank.prototype.move = function(du, newX, newY)
{
    //HD: Check if we're driving into anything. If not, move.
    var hitEntity = this.findHitEntity(newX, newY);
    if (!hitEntity)
    {
        this.cx = newX;
        this.cy = newY;
        //HD: Old substep code. Commenting it out in case we need it for
        //reference later
        //var steps = this.numSubSteps;
        //var dStep = du / steps;
        //for (var i = 0; i < steps; ++i)
        //{
        //    this.computeSubStep(dStep);
        //}
  }
}

PlayerTank.prototype.maybeFireBullet = function () {

    if (keys[this.KEY_FIRE]) {

        var turretX, turretY;

        switch(this.orientation) {
            case(consts.DIRECTION_UP):
                turretX = this.cx;
                turretY = this.cy - this.halfHeight;
                break;
            case(consts.DIRECTION_DOWN):
                turretX = this.cx;
                turretY = this.cy + this.halfHeight;
                break;
            case(consts.DIRECTION_LEFT):
                turretX = this.cx - this.halfWidth;
                turretY = this.cy;
                break;
            case(consts.DIRECTION_RIGHT):
                turretX = this.cx + this.halfWidth;
                turretY = this.cy;
                break;
        }

        //HD: We send in "this" so that entityManager can calculate
        //whether the tank is allowed to fire again, if it tries to.
        //console.log(turretX, turretY, this.bulletVelocity,
           // this.orientation, this.isPlayer, this.bulletStrength, this);
        entityManager.fireBullet(turretX, turretY, this.bulletVelocity,
            this.orientation, this.isPlayer, this.bulletStrength, this);
    }

};

PlayerTank.prototype.takeBulletHit = function (bullet) {
    //HD: Player got shot by enemy
    if((this.isPlayer) && (!bullet.isPlayer))
        this.kill();

    //HD: Enemy got shot by player. We'll have to do other things here later on,
    //such as incrementing the score for the player who owned the bullet,
    //and possibly simply lower the tank's health instead of killing it.
    if((!this.isPlayer) && (bullet.isPlayer))
        this.kill();

    };

PlayerTank.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.orientation = this.reset_orientation;

    this.halt();
};

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

PlayerTank.prototype.render = function (ctx) {
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

  /*  this.sprite.drawCentredAt(
        ctx, this.cx, this.cy, this.orientation
    );
    */
};
