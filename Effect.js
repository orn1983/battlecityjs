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
}

Effect.prototype = new Entity();

// Velocity is only used for scores
Effect.prototype.vel = 2;

Effect.prototype.animationFrame = 0;
Effect.prototype.animationFrameCounter = 0;
Effect.prototype.animationCycles = 0;
Effect.prototype.delta = 1;

Effect.prototype.metaData = [];
Effect.prototype.metaData[consts.EFFECT_SPAWNFLASH] =  {numFrames: 4, cycleSpeed: 3, numCycles: 2.5};
Effect.prototype.metaData[consts.EFFECT_SMALLEXPLOSION] = {numFrames: 3, cycleSpeed: 3, numCycles: 1};
Effect.prototype.metaData[consts.EFFECT_LARGEEXPLOSION] = {numFrames: 2, cycleSpeed: 3, numCycles: 1};
Effect.prototype.metaData[consts.EFFECT_INVULNERABLE] = {numFrames: 2, cycleSpeed: 2, numCycles: 200};
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
    else if (this.type === consts.EFFECT_SPAWNFLASH) {
        this.animationFrameCounter++;
        if (this.animationFrameCounter % this.metaData[this.type].cycleSpeed === 0) {
            this.animationFrame += this.delta;
            if (this.animationFrame % this.metaData[this.type].numFrames === 0) {
                this.animationCycles += 0.5;
                this.delta = -this.delta;
                // Revert last frame as we overshot
                this.animationFrame += this.delta;

                if (this.animationCycles >= this.metaData[this.type].numCycles) {
                    if (this.callWhenDone) {
                        this.callWhenDone()
                    }
                    return entityManager.KILL_ME_NOW;
                }
            }
        }
    }
    else {
        this.animationFrameCounter++;
        if (this.animationFrameCounter % this.metaData[this.type].cycleSpeed === 0) {
            this.animationFrame++;
            if (this.animationFrame >= this.metaData[this.type].numFrames) {
                // Start new cycle and reset to frame 0
                this.animationCycles++;
                this.animationFrame = 0;

                if (this.animationCycles >= this.metaData[this.type].numCycles) {
                    if (this.callWhenDone) {
                        this.callWhenDone()
                    }
                    return entityManager.KILL_ME_NOW;
                }
            }
        }
    }
};

Effect.prototype.render = function (ctx) {
    // fetch sprite from spriteManager
    this.sprite = spriteManager.spriteEffect(this.type, this.animationFrame);
    this.sprite.drawBulletAt(ctx, this.caller.cx, this.caller.cy, 1, g_spriteScale);
};
