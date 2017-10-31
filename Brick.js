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
function Brick(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.randomisePosition();
    this.randomiseVelocity();
      
    // Default sprite and scale, if not otherwise specified
    this.sprite = this.sprite || g_sprites.rock;
    this.scale  = this.scale  || 1;

/*
    // Diagnostics to check inheritance stuff
    this._rockProperty = true;
    console.dir(this);
*/

};

Brick.prototype = new Entity();


Brick.prototype.update = function (du) {
	// TODO Update sprite if it has taken damage
	// or destroy it if we use smaller objects

	// If it has been destroyd partially, then we have to change spatialManager. Which makes me want to use smaller objects
    spatialManager.unregister(this);

    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;
    
    spatialManager.register(this);

};

// Perhaps I need a high level data structure that handles which bricks get destroyd.
Brick.prototype.takeBulletHit = function (bullet) {
	// TODO implement in such a way that it destroys it partially
	// OR should we just have many smaller brick objects?
	if(bullet.strength === 4){
		// destroy 2 layers of bricks
		// allow steel bricks to get destroyed
	}
	else{
		// destroy 1 layer of bricks
		// do not allow steel bricks to get destroyed
	}
};


Brick.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;
    this.sprite.drawCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );
};