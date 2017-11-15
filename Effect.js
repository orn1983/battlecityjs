// ======
// EFFECT
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

    if (this.type === consts.EFFECT_INVULNERABLE)
        if (this.caller.forceFieldType === 2)
            this.metaData[consts.EFFECT_INVULNERABLE].numCycles = 200;

    if (this.type === consts.EFFECT_POINTS)
        this.animationFrame = (this.caller.points / 100) - 1;
}

Effect.prototype = new Entity();

// Velocity is only used for scores

Effect.prototype.animationFrame = 0;
Effect.prototype.animationFrameCounter = 0;
Effect.prototype.animationCycles = 0;
// countDelta is 1 if we're counting up and -1 if we're counting down
Effect.prototype.countDelta = 1;

Effect.prototype.metaData = [];
Effect.prototype.metaData[consts.EFFECT_SPAWNFLASH] =  {numFrames: 4, cycleSpeed: 3, numCycles: 2.5};
Effect.prototype.metaData[consts.EFFECT_SMALLEXPLOSION] = {numFrames: 3, cycleSpeed: 3, numCycles: 0.5};
Effect.prototype.metaData[consts.EFFECT_LARGEEXPLOSION] = {numFrames: 2, cycleSpeed: 3, numCycles: 1};
Effect.prototype.metaData[consts.EFFECT_INVULNERABLE] = {numFrames: 2, cycleSpeed: 2, numCycles: 50};
Effect.prototype.metaData[consts.EFFECT_POINTS] = {numFrames: 1, cycleSpeed: 15, numCycles: 1};

// Convert times from milliseconds to "nominal" time units.
//Bullet.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

Effect.prototype.update = function (du) {
    console.log(this.type);
    var numFrames = this.metaData[this.type].numFrames;
    var cycleSpeed = this.metaData[this.type].cycleSpeed;
    var numCycles = this.metaData[this.type].numCycles;
    // A cycle is defined as going from frame 0 to frame N and back to 0 again
    // without doing the highest frame 2x in a row
    var numFramesSingleCycle = (2*numFrames)-1;
    var numFramesTotal = ((numFramesSingleCycle-1) * numCycles)+1;
    this.animationFrameCounter++;
    // Check if it's time to update the frame
    if (this.animationFrameCounter % cycleSpeed === 0) {
        this.animationFrame += this.countDelta;
        // Check if it's time to reverse the frame delta direction
        if (this.animationFrame % (numFrames-1) === 0) {
            this.countDelta = -this.countDelta;
        }
    }

    if ((this.animationFrameCounter/cycleSpeed) >= numFramesTotal) {
        if (this.callWhenDone)
            this.callWhenDone();
        return entityManager.KILL_ME_NOW;
    }
};

Effect.prototype.render = function (ctx) {
    // fetch sprite from spriteManager
    this.sprite = spriteManager.spriteEffect(this.type, this.animationFrame);
    if (this.caller)
        this.sprite.drawBulletAt(ctx, this.caller.cx, this.caller.cy, 1, g_spriteScale);
    else
        console.log("Trying to spawn effect but have no co-ordinates");
};
