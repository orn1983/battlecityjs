// ====
// Terrain
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Terrain(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);
      
    // Use spriteManager when it works
    this.sprite = spriteManager.spriteTerrain(this.type);
    // this.sprite = new Sprite(g_images.spritesheet, 256, 32, 16, 16, 1, 1);
    this.scale  = this.scale  || 1;

};

Terrain.prototype = new Entity();

//AVG NB: Need these for calculations, but I'm just making up numbers.
//Adjust them later based on tank size.
Terrain.prototype.halfHeight = 20;
Terrain.prototype.halfWidth = 20;


Terrain.prototype.update = function (du) {
    spatialManager.unregister(this);    
    spatialManager.register(this)
};


Terrain.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;
    this.sprite.drawCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );
};
