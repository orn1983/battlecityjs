// ====
// Brick
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Border(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

};

Border.prototype = new Entity();

Border.prototype.type = consts.BORDER

// Attributes used in the spatialManager to determine collision.

Border.prototype.update = function (du) {
    spatialManager.unregister(this);

    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;
    
    spatialManager.register(this);

};

// Use:   brick.takeBulletHit
// After: If bullet strength is 4, it destroys the brick
//        otherwise it partially destroyes a brick
Border.prototype.takeBulletHit = function (bullet) {
    
};

// We update the structure if it has been hit by a bullet
// Hit direction is the direction of which the brick is hit from


Border.prototype.render = function (ctx) {

};
