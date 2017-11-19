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
    if (this.player)
        g_SFX.request(this.soundFire);

/*
    // Diagnostics to check inheritance stuff
    this._bulletProperty = true;
    console.dir(this);
*/

}

Bullet.prototype = new Entity();

Bullet.prototype.soundFire = "bulletFire";
// OA: Maybe the following sounds should be owned by the entities being
// hit rather than the bullets. The bullets are the aggressors, so it
// also kind of makes sense that they own the sounds.
Bullet.prototype.soundHitShield = "bulletShieldHit";
Bullet.prototype.soundHitSteel = "bulletSteelHit";
Bullet.prototype.soundHitBrick = "bulletBrickHit";
Bullet.prototype.soundDestroyPlayer = "destroyPlayer";
Bullet.prototype.soundDestroyEnemy = "destroyEnemy";

// Initial, inheritable, default values
Bullet.prototype.cx = 200;
Bullet.prototype.cy = 200;
Bullet.prototype.vel = 0;
Bullet.prototype.direction = consts.DIRECTION_UP;
Bullet.prototype.strength = 1;
Bullet.prototype.player = true;
Bullet.prototype.type = consts.BULLET;

// used for collision detection
// sprites are 4x4 pixels
Bullet.prototype.halfHeight = 4 * g_spriteScale / 2;
Bullet.prototype.halfWidth = 4 * g_spriteScale / 2;

Bullet.prototype.update = function (du) {

    spatialManager.unregister(this);
    
    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;

    // move bullet
    switch (this.direction) {
        case(consts.DIRECTION_UP)    : this.cy -= this.vel * du; break;
        case(consts.DIRECTION_DOWN)  : this.cy += this.vel * du; break;
        case(consts.DIRECTION_RIGHT) : this.cx += this.vel * du; break;
        case(consts.DIRECTION_LEFT)  : this.cx -= this.vel * du; break;
    }

    //
    // Handle collisions
    //
    var hitEntities = this.findHitEntities(this.cx, this.cy);
    var hitSomething = false;
    if (hitEntities.length > 0) {
        for (var i=0; i<hitEntities.length; i++){
            var hitEntity = hitEntities[i];
            var canTakeHit = hitEntity.entity.takeBulletHit;
            if (canTakeHit) {
                hitSomething = true
                canTakeHit.call(hitEntity.entity, this);
            }
        }
    }
    if (hitSomething) {
        if (hitEntity.entity.type !== consts.BULLET)
            entityManager.generateEffect("explosionSmall", this);
        return this.killMeNow();
    }
    spatialManager.register(this);

};

Bullet.prototype.getRadius = function () {
    return 4;
};

Bullet.prototype.decrementBulletTimeout = function(tank) {
    tank.bulletsAlive--;
}

// decrements bullet counter for tank before killing bullet
Bullet.prototype.killMeNow = function () {
    var that = this;
    setTimeout(function () { that.tank.bulletsAlive--; } , 200);
    return entityManager.KILL_ME_NOW;
};

// takes bullet argument
Bullet.prototype.takeBulletHit = function (bullet) {
    this.killMeNow();
    
    this.kill();
};

Bullet.prototype.render = function (ctx) {

    // fetch sprite from spriteManager
    this.sprite = spriteManager.spriteBullet(this.direction);
    this.sprite.drawScaledAt(ctx, this.cx, this.cy, this.direction, g_spriteScale);
    
};
