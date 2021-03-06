/*

spatialManager.js

A module which handles spatial lookup, as required for...
e.g. general collision detection.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

var spatialManager = {

// "PRIVATE" DATA

_nextSpatialID : 1, // make all valid IDs non-falsey (i.e. don't start at 0)

_entities : [],

// "PRIVATE" METHODS
//
// <none yet>


// PUBLIC METHODS

getNewSpatialID : function() {
    // Return the current value and then increment by one
    return this._nextSpatialID++;
},

register: function(entity) {
    var pos = entity.getPos();
    var halfHeight = entity.halfHeight;
    var halfWidth = entity.halfWidth;
    //var radius = entity.getRadius();
    var spatialID = entity.getSpatialID();
    this._entities[spatialID] = {
        posX: pos.posX,
        posY: pos.posY,
        halfWidth: halfWidth,
        halfHeight: halfHeight,
        entity: entity
    };
},

unregister: function(entity) {
    var spatialID = entity.getSpatialID();
    delete(this._entities[spatialID]);
},

// axis-aligned rectangular collision detection
findEntityInRange: function(x1, y1, x2, y2) {
    for (var ID in this._entities) {
        var entity = this._entities[ID];
        var ex1 = entity.posX - entity.halfWidth;
        var ex2 = entity.posX + entity.halfWidth;
        var ey1 = entity.posY - entity.halfHeight;
        var ey2 = entity.posY + entity.halfHeight;

        if (x1 < ex2 && x2 > ex1 && y1 < ey2 && y2 > ey1) {
            return entity;
        }
    }
    
    // check for outer border of playfield
    if (x1 < 0 || x2 > g_canvas.width || y1 < 0 || y2 > g_canvas.height)
        return true;
    
    // no collision
    return false;
},

// Returns emtpy list if no entities in range
// else it returns a list of entities in range
findEntitiesInRange: function(x1, y1, x2, y2) {
	var entities = []
    for (var ID in this._entities) {
        var entity = this._entities[ID];
        var ex1 = entity.posX - entity.halfWidth;
        var ex2 = entity.posX + entity.halfWidth;
        var ey1 = entity.posY - entity.halfHeight;
        var ey2 = entity.posY + entity.halfHeight;

        if (x1 < ex2 && x2 > ex1 && y1 < ey2 && y2 > ey1) {
            entities.push(entity);
        }
    }
    // no collision
    return entities;
},

// clears spatial manager e.g. when changing levels
clear: function() {
    this._entities.length = 0;
},

// uses grid lookup to detect if (x,y) is on ice
isOnIce: function(x, y) {
    var j = Math.floor(x / g_canvas.width * g_gridSize); 
    var i = Math.floor(y / g_canvas.height * g_gridSize); 

    if (g_levels[g_sortedLevelKeys[gameState._currentLevel]][i][j] === 4) {
        // 4 is ice!!!
        return true;
    }
    return false;
},

render: function(ctx) {
    var oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = "red";
    
    for (var ID in this._entities) {
        var e = this._entities[ID];
        util.strokeBox(ctx, e.posX-e.halfWidth, e.posY-e.halfHeight , 2*e.halfWidth, 2*e.halfHeight);
        //util.strokeCircle(ctx, e.posX, e.posY, e.radius);
    }
    ctx.strokeStyle = oldStyle;
}

}
