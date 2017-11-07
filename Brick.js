// ====
// Brick
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Brick(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);
      
    this.sprite = spriteManager.spriteStructure(this.type, this.look);
    this.scale  = this.scale  || 1;
	
	// These boolean values determine if brick has been destroyed from the left or right side respectfully
	this.horizontal = [true, true];
	// These boolean values determine if brick has been destroyed from the bottom or top side respectfully
	this.vertical   = [true, true];

};

Brick.prototype = new Entity();

// Attributes used in the spatialManager to determine collision.
Brick.prototype.halfHeight = g_canvas.height/g_gridSize/2;
Brick.prototype.halfWidth = g_canvas.width/g_gridSize/2;

Brick.prototype.update = function (du) {
    spatialManager.unregister(this);

    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;
    
    spatialManager.register(this);

};

// Use:   brick.takeBulletHit
// After: If bullet strength is 4, it destroys the brick
//        otherwise it partially destroyes a brick
Brick.prototype.takeBulletHit = function (bullet) {
    
    if(bullet.strength === 4){
        this.kill();
    }
    else{
		if(this.type == consts.STRUCTURE_STEEL){ return;}
		this.updateStructure(bullet.direction)
		this.updateSprite();
    }
};

// We update the structure if it has been hit by a bullet
// Hit direction is the direction of which the brick is hit from
Brick.prototype.updateStructure = function(hitDirection){
	if(hitDirection === consts.DIRECTION_UP){
		if(this.vertical[0] === true)	this.vertical[0] = false;
		else this.kill()
	}
	else if(hitDirection === consts.DIRECTION_DOWN){
		if(this.vertical[1] === true)	this.vertical[1] = false;
		else this.kill()
	}
	else if(hitDirection === consts.DIRECTION_LEFT){
		if(this.horizontal[1] === true)	this.horizontal[1] = false;
		else this.kill()
	}
	else if(hitDirection === consts.DIRECTION_RIGHT){
		if(this.horizontal[0] === true)	this.horizontal[0] = false;
		else this.kill()
	}
	
	if(this.vertical.toString() === [false, false].toString() || this.horizontal.toString() === [false, false].toString())
		this.kill();
}

// update the sprite based on new structural values in this.horizontal & this.vertical
Brick.prototype.updateSprite = function(){
	// take care of last 4 cases later.
	if(this.horizontal.toString() === [true, false].toString())
		this.sprite = spriteManager.spriteStructure(this.type, consts.STRUCTURE_RIGHT_GONE);
	else if(this.horizontal.toString() === [false, true].toString())
		this.sprite = spriteManager.spriteStructure(this.type, consts.STRUCTURE_LEFT_GONE);
	else if(this.vertical.toString() === [true, false].toString())
		this.sprite = spriteManager.spriteStructure(this.type, consts.STRUCTURE_TOP_GONE);
	else if(this.vertical.toString() === [false, true].toString())
		this.sprite = spriteManager.spriteStructure(this.type, consts.STRUCTURE_BOTTOM_GONE);
};

// magic numbers can be tweeked
Brick.prototype.placeBlackSpot = function(ctx){
	if(this.horizontal.toString() === [true, false].toString()){
		if(this.vertical.toString() === [true, false].toString()){
			util.fillBox(ctx, Math.floor(this.cx-this.halfWidth), this.cy-this.halfHeight-1, this.halfWidth+2, this.halfHeight+1, "#000");
		}
		if(this.vertical.toString() === [false, true].toString()){
			util.fillBox(ctx, Math.floor(this.cx-this.halfWidth)+1, this.cy, this.halfWidth+2, this.halfHeight+1, "#000");
		}
	}
	else if(this.horizontal.toString() === [false, true].toString()){
		if(this.vertical.toString() === [true, false].toString()){
			util.fillBox(ctx, this.cx-1, this.cy-this.halfHeight-1, this.halfWidth+2, this.halfHeight+1, "#000");
		}
		if(this.vertical.toString() === [false, true].toString()){
			util.fillBox(ctx, this.cx-1, this.cy, this.halfWidth+2, this.halfHeight+1, "#000");
		}
	}
};


Brick.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;
    this.sprite.drawCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );
	this.placeBlackSpot(ctx)
};
