// ============
// SPRITE STUFF
// ============

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// Construct a "sprite" from the given `image`,
//
function Sprite(image, sx, sy, width, height, numCols=1, numRows=1) {
    this.image = image;
    if (sx !== undefined && sy !== undefined && width && height && numCols && numRows) {
        this.width = width;
        this.height = height;
        this.halfWidth = this.width/2;
        this.halfHeight = this.height/2;
        this.sx = sx;
        this.sy = sy;
        // Figure out the scale at which to draw from the number of canvas squares
        // OA: TODO maybe use Environment variables when we've made them publically
        // accessible?
        var squareWidth = g_canvas.width / g_gridSize;
        var squareHeight = g_canvas.height / g_gridSize;
        this.scaleX = (squareWidth / this.width) * numCols;
        this.scaleY = (squareHeight / this.height) * numRows;
    }

    else {
        this.width = this.image.width;
        this.height = this.image.height;
        this.sx = 0;
        this.sy = 0;
        this.scaleX = 1;
        this.scaleY = 1;
    }
}

Sprite.prototype.drawAt = function (ctx, x, y) {
    // ctx.save();
    // ctx.scale(this.scaleX, this.scaleY);
    ctx.drawImage(this.image,
                  this.sx, this.sy, this.width, this.height,
                  x, y, this.width, this.height);
    // ctx.restore();
};

Sprite.prototype.drawCentredAt = function (ctx, cx, cy, orientation) {
    ctx.drawImage(this.image,
                  this.sx, this.sy, this.width, this.height,
                  cx-this.halfWidth*g_spriteScale,
                  cy-this.halfHeight*g_spriteScale,
                  this.width*g_spriteScale,
                  this.height*g_spriteScale);
};

//HD: Adding this temp function so we can still use drawCentredAt until
//we no longer need it
Sprite.prototype.drawTankAt = function (ctx, cx, cy) {
    var w = this.width,
        h = this.height;

    //ctx.save();
    //ctx.translate(cx, cy);
    //ctx.scale(this.scale, this.scale);
    //ctx.scale(this.scaleX, this.scaleY);

    // drawImage expects "top-left" coords, so we offset our destination
    // coords accordingly, to draw our sprite centred at the origin
    ctx.drawImage(this.image,
                  this.sx, this.sy, this.width, this.height,
                  cx-w/2*g_spriteScale, cy-h/2*g_spriteScale, this.width*g_spriteScale, this.height*g_spriteScale);

    //ctx.restore();
};


// draws sprite in specific scale
Sprite.prototype.drawScaledAt = function (ctx, cx, cy, direction, scale) {
    var w = this.width,
        h = this.height;

    //ctx.save();
    //ctx.translate(cx, cy);
    //ctx.scale(scale, scale);

    // drawImage expects "top-left" coords, so we offset our destination
    // coords accordingly, to draw our sprite centred at the origin
    ctx.drawImage(this.image,
                  this.sx, this.sy, this.width, this.height,
                  cx-w/2*g_spriteScale, cy-h/2*g_spriteScale, this.width*g_spriteScale, this.height*g_spriteScale);

    //ctx.restore();    
};
