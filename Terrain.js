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
Terrain.prototype.halfHeight = g_canvas.height/g_gridSize/2;
Terrain.prototype.halfWidth = g_canvas.width/g_gridSize/2;

//Determined which frame of the water animation is "rendered"
// (i.e. fetched from spriteManager): 0 or 1
Terrain.prototype.animationFrame = 0;

//counts number of updates called
Terrain.prototype.animationFrameCounter = 0;


Terrain.prototype.update = function (du) {
    // check if terrain type is tree or ice, if so then just return
    if (this.type === consts.TERRAIN_TREES || this.type === consts.TERRAIN_ICE) {
        return;
    }
 
    spatialManager.unregister(this);    
    
    // if water then update animationFrameCounter
    if (this.type === consts.TERRAIN_WATER) {
        this.animationFrameCounter++;
        if (this.animationFrameCounter % 30 === 0) {
            // switch frame every 30 update looks okay I guess?
            this.animationFrame === 0 ? this.animationFrame = 1
                                      : this.animationFrame = 0;
        }
    }
    
    spatialManager.register(this);
};


Terrain.prototype.render = function (ctx) {
    // if terrain type is water cycle through sprites to create animation
    if (this.type === consts.TERRAIN_WATER) {
        this.sprite = spriteManager.spriteTerrain(this.type, this.animationFrame);
    }
    
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;
    this.sprite.drawCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );
};
