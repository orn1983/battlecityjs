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
    g_SFX.request(this.soundFire);

/*
    // Diagnostics to check inheritance stuff
    this._bulletProperty = true;
    console.dir(this);
*/

}

Bullet.prototype = new Entity();

// HACKED-IN AUDIO (no preloading)
Bullet.prototype.soundFire = "bulletFire";
Bullet.prototype.soundHitShield = "bulletShieldHit";
Bullet.prototype.soundHitWall = "bulletWallhit";

// Initial, inheritable, default values
Bullet.prototype.cx = 200;
Bullet.prototype.cy = 200;
Bullet.prototype.vel = 0;
Bullet.prototype.direction = consts.DIRECTION_UP;
Bullet.prototype.strength = 1;
Bullet.prototype.player = true;

// used for collision detection
Bullet.prototype.halfHeight = 2;
Bullet.prototype.halfWidth = 2;

// scale used when rendering bullet
Bullet.prototype.scale = 2;

// Convert times from milliseconds to "nominal" time units.
//Bullet.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

Bullet.prototype.update = function (du) {

    spatialManager.unregister(this);

    // move bullet
    switch (this.direction) {
        case(consts.DIRECTION_UP)     : this.cy -= this.vel * du; break;
        case(consts.DIRECTION_DOWN)  : this.cy += this.vel * du; break;
        case(consts.DIRECTION_RIGHT) : this.cx += this.vel * du; break;
        case(consts.DIRECTION_LEFT)  : this.cx -= this.vel * du; break;
    }

    //
    // Handle collisions
    //
    var hitEntity = this.findHitEntity(this.cx, this.cy);
    // EAH: check if hitEntity is ojbect because it can also be 'true'
    //      for outer border hits
    
    if (hitEntity && typeof hitEntity === 'object') {
        var canTakeHit = hitEntity.entity.takeBulletHit;
        if (canTakeHit){
            canTakeHit.call(hitEntity.entity, this);
            //console.log(hitEntity.type)
            return entityManager.KILL_ME_NOW;
        }
    }
    else if (hitEntity) {
        // bullet hit outer border, just kill it
        //console.log(hitEntity)
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
};

Bullet.prototype.render = function (ctx) {

    // fetch sprite from spriteManager
    this.sprite = spriteManager.spriteBullet(this.direction);
    this.sprite.drawBulletAt(ctx, this.cx, this.cy, this.direction, this.scale);
    
    
//HD: Shouldn't bullet call its own sprite like tank does,
//rather than referencing the g_sprites array?
    //g_sprites.bullet.drawCentredAt(
    //this.sprite[this.direction].drawBulletAt(
    //    ctx, this.cx, this.cy, this.direction
    //);

};
