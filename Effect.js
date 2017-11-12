// ======
// BULLET
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Effect(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);
    this.sprite = spriteManager.spriteEffect(this.type);
}

Effect.prototype = new Entity();

// Initial, inheritable, default values
Effect.prototype.cx = 200;
Effect.prototype.cy = 200;
// Velocity is only used for scores
Effect.prototype.vel = 2;

Effect.prototype.metaData = [];
Effect.prototype.metaData[consts.EFFECT_SPAWNFLASH] =  {numFrames: 4, cycleSpeed: 2, numCycles: 2};
Effect.prototype.metaData[consts.EFFECT_EXPLOSIONSMALL] = {numFrames: 3, cycleSpeed: 2, numCycles: 1};
Effect.prototype.metaData[consts.EFFECT_EXPLOSIONBIG] = {numFrames: 2, cycleSpeed: 2, numCycles: 1};
Effect.prototype.metaData[consts.EFFECT_INVULNERABLE] = {numFrames: 2, cycleSpeed: 2, numCycles: 0};
Effect.prototype.metaData[consts.EFFECT_POINTS] = {numFrames: 1, cycleSpeed: 0, numCycles: 0};

// Convert times from milliseconds to "nominal" time units.
//Bullet.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

Effect.prototype.update = function (du) {
    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;

    // This is the only effect that moves, but ironically has no frames
    if (this.type === consts.EFFECT_POINTS) {
        this.cy -= this.cy * du;
    }
    else {
        this.animationFrameCounter++;
        if (this.animationFrameCounter % this.metaData[this.type].cycleSpeed === 0)
            this.animationFrame++;
    }
};

Effect.prototype.render = function (ctx) {
    // fetch sprite from spriteManager
    this.sprite = spriteManager.spriteBullet(this.direction);
    this.sprite.drawCentredAt(ctx, this.cx, this.cy);
};
