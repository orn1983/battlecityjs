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

// HD: TODO: MAYYYYYYBE move some preloading logic into the initialization of
// spatialManager, if we think belongs here. I'm not sure myself; I think the
// logic of what entities to load and in what order should be fully in the
// hands of Battlecity.js.

    // g_images.spritesheet : "images/spritesheet.png",

    spriteTank : function(type, power, direction, frameNumber) {
        //HD: Framenumber should always be 0 or 1 for tanks.
        var sx = 0
        var sy = 0;
        var mul = 16;
        var width = 16;
        var height = 16;

        switch(type)
        {
            case(consts.TANK_PLAYER1):
                sx = 0;
                sy = 0;
            break;
            case(consts.TANK_PLAYER2):
                sx = 0;
                sy = 128;
            break;
            case(consts.TANK_ENEMY_BASIC):
                sx = 128;
                sy = 64+mul*0;
            break;
            case(consts.TANK_ENEMY_FAST):
                sx = 128;
                sy = 64+mul*1;
            break;
            case(consts.TANK_ENEMY_POWER):
                sx = 128;
                sy = 64+mul*2;
            break;
            case(consts.TANK_ENEMY_ARMOR):
                sx = 128;
                sy = 64+mul*3;
            break;
        }


        if( (type == consts.PLAYER1) || (type == consts.PLAYER1) )
        {
            switch(power)
            {
                case(consts.TANK_POWER_NONE):
                break;
                case(consts.TANK_POWER_1STAR):
                    sy += mul*1;
                break;
                case(consts.TANK_POWER_2STARS):
                    sy += mul*2;
                break;
                case(consts.TANK_POWER_3STARS):
                    sy += mul*3;
                break;
            }
        }

        if( power==consts.TANK_POWER_DROPSPOWERUP )
        {
            switch(type)
            {
                case(consts.TANK_ENEMY_BASIC):
                    sy += mul*8;
                break;
                case(consts.TANK_ENEMY_FAST):
                    sy += mul*9;
                break;
                case(consts.TANK_ENEMY_POWER):
                    sy += mul*10;
                break;
                case(consts.TANK_ENEMY_ARMOR):
                    sy += mul*11;
                break;
            }
        }

        switch(direction)
        {
            //HD: Need to be careful here. We're picking a sprite based on both
            //direction and animation count, so we jump over 2 at a time for
            //direction, then shift 1 *depending* on frame value. Remember: The
            // first frame has value 0, the second frame has value 1.
            case(consts.DIRECTION_UP):
                sx = sx + (mul*0) + (mul*frameNumber);
            break;
            case(consts.DIRECTION_LEFT):
                sx = sx + (mul*2) + (mul*frameNumber);
            break;
            case(consts.DIRECTION_DOWN):
                sx = sx + (mul*4) + (mul*frameNumber);
            break;
            case(consts.DIRECTION_RIGHT):
                sx = sx + (mul*6) + (mul*frameNumber);
            break;
        }

        //HD: The "1,1" is for numCols and numRows, which the Sprite constructor
        //requires. Not sure we need them for this, but I don't see that they
        //do any harm.
        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);

    },

    spriteBullet : function(direction){
        var sx = 322;
        var sy = 102;
        var width = 4;
        var height = 4;
        var mul = 8; //There's a 4-pixel gap between bullet sprites, for some reason.


        switch(direction)
        {
            case(consts.DIRECTION_UP):
                sx += mul*0;
            break;
            case(consts.DIRECTION_LEFT):
                sx += mul*1;
            break;
            case(consts.DIRECTION_DOWN):
                sx += mul*2;
            break;
            case(consts.DIRECTION_RIGHT):
                sx += mul*3;
            break;
        }

        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);

    },


    spriteStructure : function(type, look){
        var sx = 256;  //Starting point for whole brick.
        var sy = 64;
        var width = 8;
        var height = 8;
        var mul = 8;

        switch(type)
        {
            case(consts.STRUCTURE_BRICK):
            break;
            case(consts.STRUCTURE_STEEL):
                sy += mul*1;
            break;
            case(consts.STRUCTURE_FLAG):
                sx += mul*6;
                sy -= mul*4;
                width = 16;
                height = 16;
            break;
        }

        switch(look)
        {
            case(consts.STRUCTURE_WHOLE):
            break;
            case(consts.STRUCTURE_LEFT_GONE):
                sx += mul*1;
            break;
            case(consts.STRUCTURE_TOP_GONE):
                sx += mul*2;
            break;
            case(consts.STRUCTURE_RIGHT_GONE):
                sx += mul*3;
            break;
            case(consts.STRUCTURE_BOTTOM_GONE):
                sx += mul*4;
            break;
            case(consts.STRUCTURE_ALL_GONE):
                if(type == consts.STRUCTURE_FLAG)
                {
                    sx += mul*2;
                }
                else
                {
                    sx += mul*5;
                }
            break;
        }

        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);
    },

    spriteTerrain : function(type, frameNum){
        //HD NB: This has no water animation. We can easily add that if we
        //make the two animation frames be different constants: TERRAIN_WATER1
        //and TERRAIN_WATER2. I'm sticking with a single frame for now.
        //EAH: added the parameter frameNum for water to get specific frame;
        //the magic of JavaScript will just ignore the parameter for other
        //terrain types :)
        var sx = 256;
        var sy = 80; //x-and-y starting points for the single water frame.
        var width = 8;
        var height = 8;
        var mul = 8;

        switch(type)
        {
            case(consts.TERRAIN_WATER):
                // water frame at (256,80) isn't actually used in-game(?)
                // so use only those at (264,80) and (272,80)
                sx += mul*(1+frameNum);
            break;
            case(consts.TERRAIN_TREES):
                sx += mul*1;
                sy -= mul*1;
            break;
            case(consts.TERRAIN_ICE):
                sx += mul*2;
                sy -= mul*1;
            break;
            case(consts.TERRAIN_BLANK):
                sx += mul*3;
            break;
        }

        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);
    },

    spriteEffect: function(type, frameNumber){
        var sx = 256;
        var sy = 96; //x-and-y for smallest spawnflash
        var width = 16;
        var height = 16;
        var mul = 16;

        switch(type)
        {
            case(consts.EFFECT_SPAWNFLASH):
                width = 16;
                height = 16;
                sx = sx + (mul*0) + (mul*frameNumber);
            break;
            case(consts.EFFECT_SMALLEXPLOSION):
                width = 16;
                height = 16;
                sx = sx + (mul*frameNumber);
                sy = sy + (mul*2);
            break;
            case(consts.EFFECT_LARGEEXPLOSION):
                width = 32;
                height = 32;
                sx = sx + (mul*3) + (mul*2*frameNumber);
                sy = sy + (mul*2);
            break;
            case(consts.EFFECT_INVULNERABLE):
                width = 16;
                height = 16;
                sx = sx + (mul*frameNumber);
                sy = sy + (mul*3);
            break;
            case(consts.EFFECT_POINTS):
                width = 16;
                height = 16;
                //HD NOTE: Here, frameNumber isn't animation, but rather which
                //points value (100..500) we've given. It looks a little weird, but
                //is much cleaner than if we had special cases for all 5 values.
                sx = sx + (mul*2) + (mul*frameNumber);
                sy += mul*4;
            break;
        }
        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);

    },

    spritePowerup : function(type) {

        var sx = 256;
        var sy = 112; //x-and-y starting points for the "helmet" powerup.
        var width = 16;
        var height = 16;
        var mul = 16;

        switch(type)
        {
            case(consts.POWERUP_HELMET):
            break;
            case(consts.POWERUP_TIMER):
                sx += mul*1;
            break;
            case(consts.POWERUP_SHOVEL):
                sx += mul*2;
            break;
            case(consts.POWERUP_STAR):
                sx += mul*3;
            break;
            case(consts.POWERUP_GRENADE):
                sx += mul*4;
            break;
            case(consts.POWERUP_TANK):
                sx += mul*5;
            break;

        }

        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);
    },

    spritePlayerIcon : function(player) {
        var sx = 377;
        var sy = 136;
        var width = 16;
        var height = 7;

        if (player === 2) {
            sy = 160;
        }

        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);
    },

    spritePlayerTankIcon : function() {
        var sx = 377;
        var sy = 144;
        var width = 7;
        var height = 8;

        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);
    },

    spriteFlagIcon : function() {
        var sx = 376;
        var sy = 184;
        var width = 16;
        var height = 15;

        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);
    },

    spriteEnemyIcon : function() {
        var sx = 320;
        var sy = 192;
        var width = 8;
        var height = 8;

        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);
    },

    spritePause : function() {
        var sx = 289;
        var sy = 176;
        var width = 39;
        var height = 7;

        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);
    },

    spriteGameOver : function() {
        var sx = 289;
        var sy = 184;
        var width = 31;
        var height = 15;

        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);
    },

    spriteStage : function() {
        var sx = 328;
        var sy = 176;
        var width = 40;
        var height = 8;

        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);
    },

    spriteNumber : function(number) {
        var sx = 329;
        var sy = 184;
        var width = 7;
        var height = 7;
        var mul = 8;

        sx += (number % 5) * mul;

        if (number > 4) {
            sy += mul;
        }

        return new Sprite(g_images.spritesheet, sx, sy, width, height, 1, 1);
    },
}
