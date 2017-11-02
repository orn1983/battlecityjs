/*

spriteManager.js

A module which manages and serves requests by various game entities
for the sprites they need to draw themselves.


*/


"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


var spriteManager = {

// HD: TODO: MAYBE move preloading logic - or at least the global g_images
// variable - into the initialization of spatialManager, and let
// spatialManager encapsulate g_images (basically, just change it to an
// internal variable in here).
// I'm a bit hesitant to move *all* the preloading into here, because the logic
// of what entities to load should be in the hands of Battlecity.js

/*


g_sprites.bullet = {0: new Sprite(g_images.spritesheet, 323, 102, 4, 4, 1,1),
                    3 : new Sprite(g_images.spritesheet, 330, 102, 4, 4, 1,1),
                    2 : new Sprite(g_images.spritesheet, 339, 102, 4, 4, 1,1),
                    1 : new Sprite(g_images.spritesheet, 346, 102, 4, 4, 1,1)
                   }
g_sprites.bullet.scale = 2;

*/

    var _spritesheet = "images/spritesheet.png";


/*
var consts = {

    FULL_CIRCLE: Math.PI * 2,
    RADIANS_PER_DEGREE: Math.PI / 180.0,
    DIRECTION_UP    : 0,
    DIRECTION_RIGHT : 1,
    DIRECTION_DOWN  : 2,
    DIRECTION_LEFT  : 3


};
*/

    spriteTank : function(type, power, direction) {
        var sx,sy;
        var width = 16;
        var height = 16;

        switch(type)
        {
            case(consts.DIRECTION_UP):
                turretX = this.cx;
                turretY = this.cy - this.halfHeight - alpha;
                break;
        }
/*g_sprites.playerTank1  = new animatedSprite(g_images.spritesheet, 0, 0, 16, 16, 2, 1, 1);
g_sprites.playerTank2  = new animatedSprite(g_images.spritesheet, 128, 0, 16, 16, 2, 1, 1);*/



        return new Sprite(_spritesheet, sx, sy, width, height,
            numCols, numRows);

    },

    spriteBullet : function(direction){

    },


    spriteStructure : function(type, look){

    },

    spriteTerrain : function(type){

    },

    spriteEffect: function(type, frame){

    },

    spritePowerup : function(type) {

    },


}
