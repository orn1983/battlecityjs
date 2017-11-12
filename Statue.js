// ====
// Statue
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Statue(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);
      
    this.sprite = spriteManager.spriteStructure(consts.STRUCTURE_FLAG);
};

Statue.prototype = new Entity();

// Attributes used in the spatialManager to determine collision.
Statue.prototype.halfHeight = g_canvas.height/g_gridSize;
Statue.prototype.halfWidth = g_canvas.width/g_gridSize;


Statue.prototype.cx = g_first_step + g_gridStep*12.5;
Statue.prototype.cy = g_first_step + g_gridStep*24.5;
Statue.prototype.rotation = consts.DIRECTION_UP;
Statue.prototype.scale = g_spriteScale;

Statue.prototype.update = function (du) {
    spatialManager.unregister(this);

    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;
    
    spatialManager.register(this);

};

// Use:   brick.takeBulletHit
// After: If bullet strength is 4, it destroys the brick
//        otherwise it partially destroyes a brick
Statue.prototype.takeBulletHit = function (bullet) {


};

Statue.prototype.render = function (ctx) {
	//ctx.save();
	//ctx.translate(this.cx, this.cy)
	//ctx.scale(g_spriteScale, g_spriteScale);
	//ctx.translate(-this.cx, -this.cy)
    this.sprite.drawBulletAt(ctx, this.cx, this.cy, this.direction, g_spriteScale);
    //ctx.restore();
};
