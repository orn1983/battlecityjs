// consts.js
//
// A module of generic constants

"use strict";


var consts = {

    FULL_CIRCLE: Math.PI * 2,
    RADIANS_PER_DEGREE: Math.PI / 180.0,
    DIRECTION_UP    : 0,
    DIRECTION_RIGHT : 1,
    DIRECTION_DOWN  : 2,
    DIRECTION_LEFT  : 3,

    TANK_PLAYER1        : 4,
    TANK_PLAYER2        : 5,
    TANK_ENEMY_BASIC    : 6,
    TANK_ENEMY_FAST     : 7,
    TANK_ENEMY_POWER    : 8,
    TANK_ENEMY_ARMOR    : 9,

    //HD: These are permanent looks for tanks that they keep until they die.
    //They are used to deliver specific tank sprites (i.e. not sprites of
    //powerups).The "DROPSPOWERUP" is for certain unique enemy tank sprites.
    TANK_POWER_NONE         : 10,
    TANK_POWER_1STAR        : 11,
    TANK_POWER_2STARS       : 12,
    TANK_POWER_3STARS       : 13,
    TANK_POWER_DROPSPOWERUP : 14,

    STRUCTURE_BRICK : 15,
    STRUCTURE_STEEL : 16,
    //HD: The flag can't be driven over, so I'm filing it with other structures
    STRUCTURE_FLAG  : 17,

    //HD: These are basically "direction" for structures.
    STRUCTURE_WHOLE         : 18,
    STRUCTURE_LEFT_GONE     : 19,
    STRUCTURE_TOP_GONE      : 20,
    STRUCTURE_BOTTOM_GONE   : 21,
    STRUCTURE_RIGHT_GONE    : 22,
    STRUCTURE_ALL_GONE      : 23,
    //HD: Note that we have two uses for ALL_GONE: One for a structure that
    //no longer has collision and will be drawn as a blank; and another for the
    //flag when it has been destroyed.

    //HD NOTE: Water is the only terrain that's constantly animated
    //EAH: changing these values to correspond to those used in LevelMaker
    TERRAIN_WATER   : 24,
    TERRAIN_TREES   : 25,
    TERRAIN_ICE     : 26,
    TERRAIN_BLANK   : 27,

    POWERUP_HELMET  : 28,
    POWERUP_TIMER   : 29,
    POWERUP_SHOVEL  : 30,
    POWERUP_STAR    : 31,
    POWERUP_GRENADE : 32,
    POWERUP_TANK    : 33,

    EFFECT_SPAWNFLASH       : 34,
    EFFECT_SMALLEXPLOSION   : 35,
    EFFECT_LARGEEXPLOSION   : 36,
    EFFECT_INVULNERABLE     : 37,
    EFFECT_POINTS           : 38,

    BULLET                  : 39
};
