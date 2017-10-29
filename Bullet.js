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
function Bullet(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    // Make a noise when I am created (i.e. fired)
    this.fireSound.play();
    
/*
    // Diagnostics to check inheritance stuff
    this._bulletProperty = true;
    console.dir(this);
*/

}

Bullet.prototype = new Entity();

// HACKED-IN AUDIO (no preloading)
Bullet.prototype.fireSound = new Audio(
    "sounds/bulletFire.ogg");
Bullet.prototype.zappedSound = new Audio(
    "sounds/bulletZapped.ogg");
    
// Initial, inheritable, default values
Bullet.prototype.cx = 200;
Bullet.prototype.cy = 200;
Bullet.prototype.vel = 0;
Bullet.prototype.direction = UP;
Bullet.prototype.strength = 1;
Bullet.prototype.player = true;

// Convert times from milliseconds to "nominal" time units.
//Bullet.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

Bullet.prototype.update = function (du) {

    spatialManager.unregister(this);
	
	// move bullet
	switch (this.direction) {
		UP	  : this.cy -= vel * du; break;
		DOWN  : this.cy += vel * du; break;
		RIGHT : this.cx += vel * du; break;
		LEFT  : this.cx -= vel * du; break;
	}

    //
    // Handle collisions
    //
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeBulletHit;
        if (canTakeHit) canTakeHit.call(hitEntity, this); 
        return entityManager.KILL_ME_NOW;
    }
    
    spatialManager.register(this);

};

Bullet.prototype.getRadius = function () {
    return 4;
};


// takes bullet argument
Bullet.prototype.takeBulletHit = function (bullet) {
    this.kill();
    
    // Make a noise when I am zapped by another bullet
    this.zappedSound.play();
};

Bullet.prototype.render = function (ctx) {

    g_sprites.bullet.drawCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );

};
