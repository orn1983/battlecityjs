// =====================
// ANIMATED SPRITE STUFF
// =====================

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// OA: TODO I feel that the tanks should store their own sprites. Maybe they should
// also determine how rapidly to change between sprite animations.
// They definitely need to be controlling WHEN to change them.
// HD: NB: I agree. Devil's advocate: We *could* still let animatedSprite manage
// all of it, if we change drawCentredAt so that it uses "orientation" not as a
// call to ctx.rotate(), but as a way of choosing which sprite sprite it's going
// to draw. But if we do that, we're creating unnecessary code for all the
// sprites that don't have different orientations (powerups, for example).
// So I agree with Örn that each entity should store its own sprites and pick
// which one to display, based on that entity's own internal properties
//("Which way am I oriented", "How damaged am I", "Should I be changing size", etc.)
function animatedSprite(image, sx, sy, width, height, count, numCols=1, numRows=1) {
    this.changeAnimCounter = 0;
    this.activeSprite = 0;
    this.sprites = [];
    for (var i=0; i < count;i++) {
        var xOffset = sx + i*width;
        this.sprites.push(new Sprite(image, xOffset, sy, width, height, numCols, numRows));
    }
}

animatedSprite.prototype.drawCentredAt = function (ctx, cx, cy, orientation) {
    this.changeAnimCounter++;
    // Change animation every second frame
    // OA: TODO get the tank to control when this happens and how rapidly
    if (this.changeAnimCounter > 1) {
        this.activeSprite = (this.activeSprite + 1) % 2;
        this.changeAnimCounter = 0;
    }
    this.sprites[this.activeSprite].drawCentredAt(ctx, cx, cy, orientation);
}
