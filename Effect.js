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

    this.cycleSpeed = this.metaData[this.type].cycleSpeed;
    this.numFrames = this.metaData[this.type].numFrames;
    this.numCycles = this.metaData[this.type].numCycles;

    if (this.type === consts.EFFECT_INVULNERABLE)
        if (this.caller.forceFieldType === 2)
            this.numCycles = 200;

    if (this.type === consts.EFFECT_POINTS) {
        this.animationFrame = (this.caller.points / 100) - 1;
        if (this.caller.points === 500)
            // Poweup points should stay on the screen longer than normal
            this.cycleSpeed = 70;
    }
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
Effect.prototype.metaData[consts.EFFECT_SMALLEXPLOSION] = {numFrames: 3, cycleSpeed: 4, numCycles: 0.5};
Effect.prototype.metaData[consts.EFFECT_LARGEEXPLOSION] = {numFrames: 2, cycleSpeed: 4, numCycles: 1};
Effect.prototype.metaData[consts.EFFECT_INVULNERABLE] = {numFrames: 2, cycleSpeed: 2, numCycles: 100};
Effect.prototype.metaData[consts.EFFECT_POINTS] = {numFrames: 1, cycleSpeed: 15, numCycles: 1};

Effect.prototype.update = function (du) {
    // A cycle is defined as going from frame 0 to frame N and back to 0 again
    // without doing the highest frame 2x in a row
    var numFramesSingleCycle = (2*this.numFrames)-1;
    var numFramesTotal = ((numFramesSingleCycle-1) * this.numCycles)+1;
    this.animationFrameCounter++;
    // Check if it's time to update the frame
    if (this.animationFrameCounter % this.cycleSpeed === 0) {
        this.animationFrame += this.countDelta;
        // Check if it's time to reverse the frame delta direction
        if (this.animationFrame % (this.numFrames-1) === 0) {
            this.countDelta = -this.countDelta;
        }
    }

    if ((this.animationFrameCounter/this.cycleSpeed) >= numFramesTotal) {
        if (this.callWhenDone)
            this.callWhenDone();
        return entityManager.KILL_ME_NOW;
    }
};

//HD: Used when the effect is the invulnerability blink; we want the tank to
//be able to turn it off right away if the tank dies.
Effect.prototype.killEffect = function(){
    return entityManager.KILL_ME_NOW;
};


Effect.prototype.render = function (ctx) {
    // fetch sprite from spriteManager
    this.sprite = spriteManager.spriteEffect(this.type, this.animationFrame);
    
    // save halfWidth and halfHeight of sprite as attribute on Effect
    // so it doesn't have to be recalculated on every render
    if (typeof Effect.prototype.metaData[this.type].halfWidth === "undefined") {
        Effect.prototype.metaData[this.type].halfWidth = this.sprite.width/2 * g_spriteScale;
        Effect.prototype.metaData[this.type].halfHeight = this.sprite.height/2 * g_spriteScale;
    }
    
    if (this.caller)
        this.sprite.drawCentredAt(ctx, this.caller.cx, this.caller.cy, consts.DIRECTION_UP, Effect.prototype.metaData[this.type].halfWidth, Effect.prototype.metaData[this.type].halfHeight = this.sprite.height/2 * g_spriteScale);
    else
        console.log("Trying to spawn effect but have no co-ordinates");
};
