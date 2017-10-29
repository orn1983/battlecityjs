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

    // Default sprite, if not otherwise specified

    //TODO: Swap out sprite code for Tank
    this.sprite = this.sprite || g_sprites.ship;

    // Set normal drawing scale
    this._scale = 1;

};

PlayerTank.prototype = new Entity();

PlayerTank.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;

    //TODO: Decide how to handle rotation. Easiest hack right now
    //could be something like int 0,1,2,3 for up, down, left, right
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

//TODO: Initialize xy coords based on correct location for tank in environment
PlayerTank.prototype.cx = 200;
PlayerTank.prototype.cy = 200;

//HD NB: Need these for calculations, but I'm just making up numbers.
//Adjust them later based on tank size.
PlayerTank.prototype.halfHeight = 50;
PlayerTank.prototype.halfWidth = 50;

//HD: This is set to a positive integer when the tank is on ice, and is used
//to increment its movement. It is then decremented with each du
PlayerTank.prototype.slideCounter = 0;

//HD: This is how far you move in a single step, either through a keypress
//or by sliding on ice. (I picked the value simply because it's what part
//used for the thrust value in Asteroids)
PlayerTank.prototype.moveDistance = 0.2

//HD: Starting off facing up.
PlayerTank.prototype.orientation = NORTH;


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


PlayerTank.prototype.update = function (du) {

  spatialManager.unregister(this);
  if (this._isDeadNow)
    return entityManager.KILL_ME_NOW;

  var sliding = false;
  if(this.slideCounter > 0)
    sliding = true;

  if(sliding)
  {
    //HD NB: It's possible we may have to check first for a keypress,
    //to see if the orientation has changed. Let's try this version for now,
    //since it makes for simpler code.
    switch(this.orientation)
    {
      case(NORTH):
        this.move(this.cx, this.cy - this.moveDistance);
        break;
      case(SOUTH):
        this.move(this.cx, this.cy + this.moveDistance);
        break;
      case(WEST):
        this.move(this.cx - this.moveDistance, this.cy);
        break;
      case(EAST):
        this.move(this.cx + this.moveDistance, this.cy);
        break;
    }
    this.SlideCounter -= 1;
  }

  //Check for keypress, but don't move if you've already slid.
  if (keys[this.KEY_UP])
  {
    this.orientation = NORTH;
    if(!sliding)
      this.move(this.cx, this.cy - this.moveDistance);
  }
  if (keys[this.KEY_DOWN])
  {
    this.orientation = SOUTH;
    if(!sliding)
      this.move(this.cx, this.cy + this.moveDistance);

  }
  if (keys[this.KEY_LEFT])
  {
    this.orientation = WEST;
    if(!sliding)
        this.move(this.cx - this.moveDistance, this.cy);
  }
  if (keys[this.KEY_RIGHT])
  {
    this.orientation = EAST;
    if(!sliding)
      this.move(this.cx + this.moveDistance, this.cy);
  }

  //HD: Handle firing. (Remember that we can fire even if we can't move.)
  this.maybeFireBullet();

  spatialManager.register(this);

};

PlayerTank.prototype.move = function(du, newX, newY)
{

  //HD: Check if we're driving into anything. If not, move.
  var hitEntity = this.findHitEntity(moveX, moveY);
  if (!hitEntity)
  {
    this.cx = moveX;
    this.cy = moveY;
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

    var turretX, turretY, velX, velY;

    switch(this.orientation)
    {
      case(NORTH):
        //HD: We *could* simply use the old this.radius - it'd work
        //just fine for a perfect square - but we'll need height and width
        //anyway for collision detection.
        turretX = this.cx;
        turretY = this.cY - this.halfHeight;
        velX = 0;
        velY = -2;
        break;
      case(SOUTH):
        turretX = this.cx;
        turretY = this.cY + this.halfHeight;
        velX = 0;
        velY = 2;
        break;
      case(WEST):
        turretX = this.cx - this.halfWidth;
        turretY = this.cY;
        velX = -2;
        velY = 0;
        break;
      case(EAST):
        turretX = this.cx + this.halfWidth;
        turretY = this.cY;
        velX = 2;
        velY = 0;
        break;
      }

      //HD NB: The fireBullet function variables may also need to include
      //the entity's identity, or at least a friend-or-foe switch so that
      //Player2's bullets don't kill Player1.
      //Also, this.rotation is now only 0..3, so it'll break the code within
      //firebullet() in some way.
      entityManager.fireBullet(
         turretX, turretY, velX, velY, this.orientation);

    }

};

PlayerTank.prototype.takeBulletHit = function () {
  //TODO: Code accordingly. Do we call this only when we've been hit by an
  //enemy's bullet, or by any bullet?

};

PlayerTank.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.rotation = this.reset_rotation;

    this.halt();
};

//HD: Commenting this out for now, probably won't need it
/*
PlayerTank.prototype.updateRotation = function (du) {
  if (keys[this.KEY_UP]) {
      this.rotation = NORTH;
  }
  if (keys[this.KEY_DOWN]) {
      this.rotation = SOUTH;
  }
  if (keys[this.KEY_LEFT]) {
      this.rotation = EAST;
  }
  if (keys[this.KEY_RIGHT]) {
      this.rotation = WEST;
  }
};
*/
PlayerTank.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this._scale;
    this.sprite.drawCentredAt(
	ctx, this.cx, this.cy, this.rotation
    );
    this.sprite.scale = origScale;
};
