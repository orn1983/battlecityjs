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
    g_SFX.request(this.soundSpawn);
}

Powerup.prototype = new Entity();

Powerup.prototype.halfHeight = g_canvas.height/g_gridSize;
Powerup.prototype.halfWidth = g_canvas.width/g_gridSize;

//Default values
Powerup.prototype.cx = 200;
Powerup.prototype.cy = 200;

Powerup.prototype.displayFrame = true;
Powerup.prototype.frameCounter = 0;
Powerup.prototype.cycleSpeed = 7;

Powerup.prototype.soundSpawn = "powerupSpawn";
Powerup.prototype.soundPickup = "powerupPickup";
Powerup.prototype.soundExtraLife = "extraLife";

Powerup.prototype.pointsValue = 500;

Powerup.prototype.update = function (du) {
    // Update the display status
    this.frameCounter++;
    if (this.frameCounter % this.cycleSpeed === 0) {
        this.displayFrame = !this.displayFrame;
    }
    spatialManager.unregister(this);

    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;

    spatialManager.register(this);

};


Powerup.prototype.getPickedUp = function (tank) {
    if (this.type === consts.POWERUP_TANK)
        g_SFX.request(this.soundExtraLife);
    else
        g_SFX.request(this.soundPickup);
    entityManager.activatePowerup(tank, this.type);
    entityManager.generateEffect("points", {cx: this.cx, cy: this.cy, points: this.pointsValue});
    this.kill();
};


Powerup.prototype.render = function (ctx) {

    if(this.displayFrame)
    {

        this.sprite = spriteManager.spritePowerup(this.type);
        this.sprite.scaleX = g_spriteScale;
        this.sprite.scaleY = g_spriteScale;
        this.sprite.drawCentredAt(ctx, this.cx, this.cy, consts.DIRECTION_UP, this.sprite.width/2*g_spriteScale, this.sprite.height/2*g_spriteScale);
    }

};
