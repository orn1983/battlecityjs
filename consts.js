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

    TANK_PLAYER1        : 1,
    TANK_PLAYER2        : 2,
    TANK_ENEMY_BASIC    : 3,
    TANK_ENEMY_FAST     : 4,
    TANK_ENEMY_POWER    : 5,
    TANK_ENEMY_ARMOR    : 6,

    //HD: These are permanent looks for tanks that they keep until they die.
    //They are used to deliver specific tank sprites (i.e. not sprites of
    //powerups).The "DROPSPOWERUP" is for certain unique enemy tank sprites.
    TANK_POWER_NONE         : 0,
    TANK_POWER_1STAR        : 1,
    TANK_POWER_2STARS       : 2,
    TANK_POWER_3STARS       : 3,
    TANK_POWER_DROPSPOWERUP : 4,

    STRUCTURE_BRICK : 0,
    STRUCTURE_STEEL : 1,
    //HD: The flag can't be driven over, so I'm filing it with other structures
    STRUCTURE_FLAG  : 2,

    //HD: These are basically "direction" for structures.
    STRUCTURE_WHOLE         : 0,
    STRUCTURE_LEFT_GONE     : 1,
    STRUCTURE_TOP_GONE      : 2,
    STRUCTURE_BOTTOM_GONE   : 3,
    STRUCTURE_RIGHT_GONE    : 4,
    STRUCTURE_ALL_GONE      : 5,
    //HD: Note that we have two uses for ALL_GONE: One for a structure that
    //no longer has collision and will be drawn as a blank; and another for the
    //flag when it has been destroyed.

    //HD NOTE: Water is the only terrain that's constantly animated
    //EAH: changing these values to correspond to those used in LevelMaker
    TERRAIN_WATER   : 2,
    TERRAIN_TREES   : 3,
    TERRAIN_ICE     : 4,
    TERRAIN_BLANK   : 5,

    POWERUP_HELMET  : 0,
    POWERUP_TIMER   : 1,
    POWERUP_SHOVEL  : 2,
    POWERUP_STAR    : 3,
    POWERUP_GRENADE : 4,
    POWERUP_TANK    : 5,

    EFFECT_SPAWNFLASH       : 0,
    EFFECT_SMALLEXPLOSION   : 1,
    EFFECT_LARGEEXPLOSION   : 2,
    EFFECT_INVULNERABLE     : 3,
    EFFECT_POINTS          : 4





};
