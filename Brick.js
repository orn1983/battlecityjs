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
      
    // Use sprite manager when it works
    this.sprite = spriteManager.spriteStructure(this.type, this.look);
    this.scale  = this.scale  || 1;
	
	// down, up
	this.horizontal = [true, true];
	// left, right
	this.vertical   = [true, true];

};

Brick.prototype = new Entity();

//AVG NB: Need these for calculations, but I'm just making up numbers.
//Adjust them later based on tank size.
Brick.prototype.halfHeight = g_canvas.height/g_gridSize/2;
Brick.prototype.halfWidth = g_canvas.width/g_gridSize/2;

Brick.prototype.update = function (du) {
    // TODO Update sprite if it has taken damage
    // or destroy it if we use smaller objects

    // If it has been destroyd partially, then we have to change spatialManager. Which makes me want to use smaller objects
    spatialManager.unregister(this);

    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;
    
    spatialManager.register(this);

};

// Perhaps I need a high level data structure that handles which bricks get destroyd.
Brick.prototype.takeBulletHit = function (bullet) {
    // TODO implement in such a way that it destroys it partially
    // OR should we just have many smaller brick objects?
    
    if(bullet.strength === 4){
        this.kill();
    }
    else{
        // destroy 1 layer of bricks
        // do not allow steel bricks to get destroyed
		if(this.type == consts.STRUCTURE_STEEL){ return;}
		this.updateStructure(bullet.direction)
		this.updateSprite();
		console.log(bullet.direction);
		console.log(this.vertical);
		console.log(this.horizontal);
    }
};

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


Brick.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;
    this.sprite.drawCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );
};
