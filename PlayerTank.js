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
    this.reset_rotation = this.rotation;
};

PlayerTank.prototype.KEY_UP = 'W'.charCodeAt(0);
PlayerTank.prototype.KEY_DOWN  = 'S'.charCodeAt(0);
PlayerTank.prototype.KEY_LEFT   = 'A'.charCodeAt(0);
PlayerTank.prototype.KEY_RIGHT  = 'D'.charCodeAt(0);
PlayerTank.prototype.KEY_FIRE   = ' '.charCodeAt(0);

// Initial, inheritable, default values
PlayerTank.prototype.rotation = 0; //HD:Up

//TODO: Initialize xy coords based on correct location for tank in environment
PlayerTank.prototype.cx = 200;
PlayerTank.prototype.cy = 200;

//HD NB: Need these for calculations, but I'm just making up numbers.
//Adjust them later based on tank size.
PlayerTank.prototype.halfHeight = 50;
PlayerTank.prototype.halfWidth = 50;

//HD: The tank has no ongoing velocity ... unless it's on ice (or sand, or
//whatever). When that happens, we adjust the slideFactor accordingly.
PlayerTank.prototype.velX = 0;
PlayerTank.prototype.velY = 0;
PlayerTank.prototype.slideFactor = 1;

PlayerTank.prototype.numSubSteps = 1;

// HACKED-IN AUDIO (no preloading)
PlayerTank.prototype.warpSound = new Audio(
    "sounds/shipWarp.ogg");

PlayerTank.prototype.warp = function () {

    this._scaleDirn = -1;

//HD NB:Commenting this out so we don't fail by trying to play a nonexistent
//sound, but keeping it to show sound-playing functionality that we might want
//to use later:
//    this.warpSound.play();

    // Unregister me from my old posistion
    // ...so that I can't be collided with while warping
    spatialManager.unregister(this);
};


PlayerTank.prototype.update = function (du) {

  spatialManager.unregister(this);
  if (this._isDeadNow)
    return entityManager.KILL_ME_NOW;

  //HD: Check if we're driving into anything. If not, move.
  //NB: Do we need to perform the hitEntity() check for *every* substep?
  var hitEntity = this.findHitEntity();
  if (!hitEntity)
  {
    // Perform movement substeps
    var steps = this.numSubSteps;
    var dStep = du / steps;
    for (var i = 0; i < steps; ++i)
    {
        this.computeSubStep(dStep);
    }
  }

  //HD: Handle firing. Remember, we can fire even if we can't move.
  this.maybeFireBullet();

  spatialManager.register(this);

};

PlayerTank.prototype.computeSubStep = function (du) {

  var thrustX, thrustY;

  //HD: I got the 0.2 number from the old NOMINAL_THRUST in Ship.js.
  //Going with that until we can fine-tune it.
  if (keys[this.KEY_UP])
  {
      thrustX = 0;
      thrustY = -0.2;
  }
  if (keys[this.KEY_DOWN])
  {
      thrustX = 0;
      thrustY = 0.2;
  }
  if (keys[this.KEY_LEFT])
  {
    thrustX = -0.2;
    thrustY = 0;
  }
  if (keys[this.KEY_RIGHT])
  {
    thrustX = 0.2;
    thrustY = 0;
  }

  //HD: Adjusting velocity depending on the terrain we're driving over
  //(2x for ice, 0.5x for sand, etc). Note that "1" is normal movement.
  var accelX = thrustX * this.computeSlide();
  var accelY = thrustY * this.computeSlide();

  this.applyAccel(accelX, accelY, du);

  this.wrapPosition(); //HD: We don't need this one, right?

  this.updateRotation(du);

};


PlayerTank.prototype.computeSlide = function () {
    //TODO: Make sure slideFactor gets updated according to
    //what terrain the tank is on. Will probably have to do so
    //through entityManager calling a setSlideFactor, so I'll
    //add a dummy function for that below this one.
    return this.slideFactor;
};

PlayerTank.prototype.setSlide = function (multiplier) {
    //TODO: Make sure this gets called correctly in entityManager
    //depending on what terrain we're driving over.
    this.slideFactor *= multiplier;
};


PlayerTank.prototype.applyAccel = function (accelX, accelY, du) {

  //HD NB: Not going to pull this apart right now, but eventually
  //we'll probably have to.

    // u = original velocity
    var oldVelX = this.velX;
    var oldVelY = this.velY;

    // v = u + at
    this.velX += accelX * du;
    this.velY += accelY * du;

    // v_ave = (u + v) / 2
    var aveVelX = (oldVelX + this.velX) / 2;
    var aveVelY = (oldVelY + this.velY) / 2;

    // Decide whether to use the average or not (average is best!)
    var intervalVelX = g_useAveVel ? aveVelX : this.velX;
    var intervalVelY = g_useAveVel ? aveVelY : this.velY;

    // s = s + v_ave * t
    var nextX = this.cx + intervalVelX * du;
    var nextY = this.cy + intervalVelY * du;

    // s = s + v_ave * t
    this.cx += du * intervalVelX;
    this.cy += du * intervalVelY;
};

PlayerTank.prototype.maybeFireBullet = function () {

    if (keys[this.KEY_FIRE]) {

      //HD:Hacking this with simple, readable code for now:
      //Rotation is 0,1,2,3 for up,down,left,right.
      //We can do a fancy array switch() (or whatever) later
      var turretX, turretY, velX, velY;

      if(this.rotation === 0) //Turret pointed up
      {
        //HD: We *could* simply use the old this.radius - it'd work
        //just fine for a perfect square - but we'll need height and width
        //anyway for collision detection.
        turretX = this.cx;
        turretY = this.cY - this.halfHeight;
        velX = 0;
        velY = -2;
      }
      else if(this.rotation === 1) //Turret pointed down
      {
        turretX = this.cx;
        turretY = this.cY + this.halfHeight;
        velX = 0;
        velY = 2;
      }
      else if(this.rotation === 2) //Turret pointed left
      {
        turretX = this.cx - this.halfWidth;
        turretY = this.cY;
        velX = -2;
        velY = 0;
      }
      else if(this.rotation === 3) //Turret pointed right
      {
        turretX = this.cx + this.halfWidth;
        turretY = this.cY;
        velX = 2;
        velY = 0;
      }

      //HD NB: The fireBullet function variables may also need to include
      //the entity's identity, or at least a friend-or-foe switch so that
      //Player2's bullets don't kill Player1.
      //Also, this.rotation is now only 0..3, so it'll break the code within
      //firebullet() in some way.
      entityManager.fireBullet(
         turretX, turretY, velX, velY, this.rotation);

    }

};

PlayerTank.prototype.takeBulletHit = function () {
  //TODO: Code accordingly. Do we call this only when we've been hit by an
  //enemy's bullet, or by any bullet?
  //This used just call this.warp(), but obviously that no longer applies.

};

PlayerTank.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.rotation = this.reset_rotation;

    this.halt();
};

PlayerTank.prototype.halt = function () {
    this.velX = 0;
    this.velY = 0;
};

PlayerTank.prototype.updateRotation = function (du) {
  if (keys[this.KEY_UP]) {
      this.rotation = 0;
  }
  if (keys[this.KEY_DOWN]) {
      this.rotation = 1;
  }
  if (keys[this.KEY_LEFT]) {
      this.rotation = 2;
  }
  if (keys[this.KEY_RIGHT]) {
      this.rotation = 3;
  }
};

PlayerTank.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this._scale;
    this.sprite.drawCentredAt(
	ctx, this.cx, this.cy, this.rotation
    );
    this.sprite.scale = origScale;
};
