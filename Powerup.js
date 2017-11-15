// ====
// Powerups
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Powerup(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    // Use sprite manager when it works
    this.sprite = spriteManager.spriteStructure(this.type);
    this.scale  = this.scale  || 1;

}

Powerup.prototype = new Entity();

Powerup.prototype.halfHeight = 20;
Powerup.prototype.halfWidth = 20;

//Default values
Powerup.prototype.cx = 200;
Powerup.prototype.cy = 200;
//Powerup.prototype.type = consts.POWERUP_HELMET;

Powerup.prototype.animateThisFrame = true;


Powerup.prototype.update = function (du) {
    spatialManager.unregister(this);

    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;

    //Change blink
    this.animateThisFrame = !this.animateThisFrame;

    spatialManager.register(this);

};


Powerup.prototype.getPickedUp = function (tank) {
    entityManager.activatePowerup(tank, this.poweruptype);
    this.kill();
};


Powerup.prototype.render = function (ctx) {

    if(this.animateThisFrame)
    {

        this.sprite = spriteManager.spritePowerup(this.type);
        //TODO: Change drawTankAt to the name of whatever function we end up
        // using for drawing everything
        //this.sprite.drawTankAt(ctx, this.cx, this.cy);
        this.sprite.drawCentredAt(ctx, this.cx, this.cy, 1);
    }

};
