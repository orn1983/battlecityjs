// ===========
// ENEMY TANKS
// ===========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function EnemyTank(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    //Adjusting setup logic (velocity, bullet speed) depending on the tank type
    //that was created
    this.updateAbilities();

    this.rememberResets();

};

EnemyTank.prototype = new Entity();

EnemyTank.prototype.incrementBulletCount = function () {
    this.bulletsAlive++;
};

EnemyTank.prototype.decrementBulletCount = function () {
    this.bulletsAlive = Math.max(0, this.bulletsAlive-1);
};

EnemyTank.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;

    this.reset_orientation = this.orientation;
};

EnemyTank.prototype.NORTH = 0;
EnemyTank.prototype.SOUTH = 1;
EnemyTank.prototype.WEST = 2;
EnemyTank.prototype.EAST = 3;

// Start off with a 95% chance of firing bullets
EnemyTank.prototype.chanceOfBulletFire = 0.95;

EnemyTank.prototype.cx = 200;
EnemyTank.prototype.cy = 200;

EnemyTank.prototype.halfHeight = g_canvas.height/g_gridSize-3;
EnemyTank.prototype.halfWidth = g_canvas.width/g_gridSize-3;


EnemyTank.prototype.type = consts.TANK_ENEMY_BASIC;

//HD: This is the default for most tanks. For those that drop powerups,
//it'll be consts.TANK_POWER_DROPSPOWERUP
EnemyTank.prototype.powerLevel = consts.TANK_POWER_NONE;

//Used only for tanks that drop powerups: They need to switch between two
//different colors of sprites, blinking from red to grey.
EnemyTank.prototype.blinkRed = false;

//HD: This is set to a positive integer when the tank is on ice, and is used
//to increment its movement. It is then decremented with each du
EnemyTank.prototype.slideCounter = 0;

//Normal bullet speed. Changed for some tank types.
EnemyTank.prototype.bulletVelocity = 6;

//HD: Normal bullet strength. Changed for some tank types.
EnemyTank.prototype.bulletStrength = 1;

//counter for bullets alive that belong to tank
//increments when bullet fired, decrements when bullet is destroyed
EnemyTank.prototype.bulletsAlive = 0;

//TODO: Implement higher speed when player picks up a powerup, plus permanent
//lower and higher speeds when entityManager creates certain enemy types
EnemyTank.prototype.moveDistance = 2;

EnemyTank.prototype.orientation = consts.DIRECTION_DOWN;

EnemyTank.prototype.numberOfLives = 1;

EnemyTank.prototype.pointsValue = 100;

EnemyTank.prototype.isPlayer = false;

//Determined which frame of the tank animation is "rendered"
// (i.e. fetched from spriteManager): 0 or 1
EnemyTank.prototype.animationFrame = 0;

//counts number of updates called
EnemyTank.prototype.animationFrameCounter = 0;

//Used as a counter to space apart how often the tank fires bullets
EnemyTank.prototype.bulletDelayCounter = 0;

//For powerup tanks only. Determines whether to pick the red or the gray
//frame for the "blinking" effect.
EnemyTank.prototype.animationFramePowerup = 0;

//For powerup tanks only.
EnemyTank.prototype.animationFramePowerupCounter = 0;

EnemyTank.prototype.isMoving = false;

//Disables collision. Used to get a tank out of another tank, such as when
//one of them has just spawned.
EnemyTank.prototype.noCollision = false;

EnemyTank.prototype.bumpedIntoTank = false;

//This is set to either false //(so we can do a "!lastBumpedTank" check)
//or to the actual tank object we bumped into last.
EnemyTank.prototype.lastBumpedTank = false;

//HD: Using this to check when the tank should turn
EnemyTank.prototype.bumpedIntoObstacle = false;

EnemyTank.prototype.update = function (du) {



    spatialManager.unregister(this);

    // store old value of isMoving to detect if tank
    // has stopped (used for slide effect on ice)
    var wasMoving = this.isMoving;

    // OA: Set movement state to false -- if move will be called, this will be set
    // to true. At the end of the update loop, we will decide which audio to play
    this.isMoving = false;

    if (this._isDeadNow)
        return entityManager.KILL_ME_NOW;

    switch (this.orientation) {
        case(consts.DIRECTION_UP):
	        this.lockToNearestGrid();
            this.move(du, this.cx, this.cy - this.moveDistance * du);
        break;
        case(consts.DIRECTION_DOWN):
            this.lockToNearestGrid();
            this.move(du, this.cx, this.cy + this.moveDistance * du);
        break;
        case(consts.DIRECTION_LEFT):
            this.lockToNearestGrid();
            this.move(du, this.cx - this.moveDistance * du, this.cy);
        break;
        case(consts.DIRECTION_RIGHT):
            this.lockToNearestGrid();
            this.move(du, this.cx + this.moveDistance * du, this.cy);
        break;
    }

    //Handle firing. (Remember that we can fire even if we can't move.)
    // don't shoot if enemy fozen
    if (gameState.getFreezeTimer() <= 0) {
        this.maybeFireBullet();
    }


    // if tank was moving but isn't moving now and is on ice...
    if (wasMoving && !this.isMoving && spatialManager.isOnIce(this.cx, this.cy)) {
        this.slideCounter = 30;
    }

    // remove slide effect if not on ice or if tank moved
    if (!spatialManager.isOnIce(this.cx, this.cy) || this.isMoving) {
        this.slideCounter = 0;
    }

    if (this.slideCounter > 0) {
        switch(this.orientation) {
            case(consts.DIRECTION_UP):
                this.slide(du, this.cx, this.cy - this.moveDistance * du);
                break;
            case(consts.DIRECTION_DOWN):
                this.slide(du, this.cx, this.cy + this.moveDistance * du);
                break;
            case(consts.DIRECTION_LEFT):
                this.slide(du, this.cx - this.moveDistance * du, this.cy);
                break;
            case(consts.DIRECTION_RIGHT):
                this.slide(du, this.cx + this.moveDistance * du, this.cy);
                break;
        }
        this.slideCounter -= 1 * du;
    }

    spatialManager.register(this);

};


EnemyTank.prototype.updateAbilities = function() {

    switch(this.type){
        case(consts.TANK_ENEMY_BASIC):
            this.moveDistance = 1;
            this.bulletVelocity = 6;
            this.numberOfLives = 1;
            this.pointsValue = 100;
        break;
        case(consts.TANK_ENEMY_FAST):
            this.moveDistance = 3;
            this.bulletVelocity = 9;
            this.numberOfLives = 1;
            this.pointsValue = 200;
        break;
        case(consts.TANK_ENEMY_POWER):
            this.moveDistance = 2;
            this.bulletVelocity = 12;
            this.numberOfLives = 1;
            this.pointsValue = 300;
        break;
        case(consts.TANK_ENEMY_ARMOR):
            this.moveDistance = 2;
            this.bulletVelocity = 9;
            this.numberOfLives = 4;
            this.pointsValue = 400;
        break;
    }

};

EnemyTank.prototype.slide = function(du, newX, newY) {
    var hitEntity = this.findHitEntity(newX, newY);
    if (!hitEntity)
    {
        this.cx = newX;
        this.cy = newY;
    }
};

EnemyTank.prototype.moveOLD = function(du, newX, newY)
{
    // return if enemies frozen
    if (gameState.getFreezeTimer() > 0) {
        return;
    }

    var hitEntity = this.findHitEntity(newX, newY);

    //We're extricating ourselves from a tank. (Let's make sure we don't drive
    //into anything else.)
    if(this.noCollision)
    {
        //We found a valid direction to move in.
        if ( (!hitEntity) ||
             (hitEntity.entity.type === consts.POWERUP_HELMET) ||
             (hitEntity.entity.type === consts.POWERUP_TIMER) ||
             (hitEntity.entity.type === consts.POWERUP_SHOVEL) ||
             (hitEntity.entity.type === consts.POWERUP_STAR) ||
             (hitEntity.entity.type === consts.POWERUP_GRENADE) ||
             (hitEntity.entity.type === consts.POWERUP_TANK) )

        {
            this.cx = newX;
            this.cy = newY;
            this.noCollision = false;
            this.bumpedIntoTank = false;
            this.lastBumpedTank = false;

        }

        //We're still driving out of the tank.
        else if (this.lastBumpedTank == hitEntity.entity)
        {

            //We'd get stuck on something else, or go off-map. No good.
            //Change direction and don't move.
            if(this.goingOffMap(newX, newY))
            {
                this.changeDirection();
            }
            //Not going off map. Good. Move there.
            else
            {
                this.cx = newX;
                this.cy = newY;
            }
        }

        //NB: Stuck-in-brick villan likely causes by following else-statement:
        //Collision is off.
        //We're not headed into safe open space (empty lane or powerup).
        //But we're not stuck inside a tank, either.
        //So we're about to drive into something we'll get stuck in.
        else
        {
            var currentEntity = this.findHitEntity(this.cx, this.cy);

            //Edge case: We're stuck inside something other than a tank.
            //Turn off collision again so we can get out.
            if(currentEntity.entity == hitEntity.entity)
            {
                this.noCollision = true;
                this.changeDirection();
            }
            //We're not stuck on anything; we just bumped into it. Turn.
            else
            {
                this.changeDirection();
            }
        }

    }

    //We're not stuck on a tank. We're hitting nothing (or just driving over
    //powerups). Keep moving, don't change direction, and make sure collision
    //is on and bumper checks are off.
    else if ( (!hitEntity) ||
         (hitEntity.entity.type === consts.POWERUP_HELMET) ||
         (hitEntity.entity.type === consts.POWERUP_TIMER) ||
         (hitEntity.entity.type === consts.POWERUP_SHOVEL) ||
         (hitEntity.entity.type === consts.POWERUP_STAR) ||
         (hitEntity.entity.type === consts.POWERUP_GRENADE) ||
         (hitEntity.entity.type === consts.POWERUP_TANK) )
    {
        this.cx = newX;
        this.cy = newY;
        this.noCollision = false;
        this.bumpedIntoTank = false;
        this.lastBumpedTank = false;
    }

    //We're hitting the flag. We want to fire at the flag. Stay put, don't change
    //direction, and make sure collision is on and bumper checks are off.
    else if( hitEntity.entity.type === consts.STRUCTURE_FLAG )
    {
        this.noCollision = false;
        this.bumpedIntoTank = false;
        this.lastBumpedTank = false;
    }

    //We hit something, and it wasn't the flag. We'll probably change direction,
    //but let's make sure we aren't running into collision issues with a tank.
    else
    {
        //We just bumped into a tank.
        if( (hitEntity.entity.type >= 4)
            && (hitEntity.entity.type <= 9) )
            {
                //First time we hit any tank at all. Might not be a collision,
                //but let's set a few parameters to prepare for one.
                if(this.lastBumpedTank == false)
                {
                    this.bumpedIntoTank = true;
                    this.lastBumpedTank = hitEntity.entity;
                    this.changeDirection();
                }
                //Uh-oh. We've hit a tank twice in a row. Might be stuck.
                else
                {
                    //It's not the same tank, so we won't turn off collision
                    //detection quite yet - but let's remember this new one.
                    if(this.lastBumpedTank != hitEntity.entity)
                    {
                        this.bumpedIntoTank = true;
                        this.lastBumpedTank = hitEntity.entity;
                        this.changeDirection();
                    }
                    //It's the same tank. We're stuck inside one another.
                    else
                    {
                        this.bumpedIntoTank = true;
                        //Does the other tank have collision turned off? If so,
                        //we're just going to let that tank drive away, while
                        //we stay right where we are.
                        if(this.lastBumpedTank.noCollision)
                        {
                            //Do nothing. Just wait out this tick of the clock.
                        }
                        //The other tank doesn't have collision turned off.
                        //Let's turn ours off and drive out of that tank.
                        else
                        {

                            this.noCollision = true;
                            this.changeDirection();
                        }
                    }
                }
            }
            //We bumped into something that wasn't a tank (or the statue).
            //Let's reset all collision detectors, and change direction.
            else
            {

                this.noCollision = false;
                this.bumpedIntoTank = false;
                this.lastBumpedTank = false;
                this.changeDirection();
            }

    //End of all bump checks, changeDirection calls and actual moving.
    }

    // update animation frame
    this.animationFrameCounter++;
    if (this.animationFrameCounter % 3 === 0) {
        // switch frame every 3rd update
        this.animationFrame === 0 ? this.animationFrame = 1
                                  : this.animationFrame = 0;
    }

    if(this.powerLevel === consts.TANK_POWER_DROPSPOWERUP)
    {

        this.animationFramePowerupCounter++;
        if (this.animationFrameCounter % 6 === 0) {
            // switch red-grey frame every 3rd update
            this.animationFramePowerup === 0 ? this.animationFramePowerup = 1
                                      : this.animationFramePowerup = 0
        }
    }
    this.isMoving = true;


};

EnemyTank.prototype.move = function(du, newX, newY) {
	// return if enemies frozen
    if (gameState.getFreezeTimer() > 0) {
        return;
    }

    var hitEntities = this.findHitEntities(newX, newY);
	
	// hit nothing, you can move:
    if(hitEntities.length === 0){
		this.cx = newX;
        this.cy = newY;
        this.canMoveWhileColliding = false;
	}
	// we would hit brick, water, border, or eagle:
	else if(this.doesContainUncrossableObject(hitEntities)){
		// do nothing I guess, OR try to change direction
		this.changeDirection();
	}
	// we would hit another Tank
	else if(this.doesContainTank(hitEntities)){
		// check if I am already colliding with another tank:
		var collidingWithTank = false;
		if(this.doesContainTank(this.findHitEntities(this.cx, this.cy))){
			collidingWithTank = true;
		}
		
		var tanks = this.findAllTanksInList(hitEntities);
		if(collidingWithTank === true){
			if(!this.isAnyTankInListAllowedToMove(tanks)){
				this.canMoveWhileColliding = true;
				this.cx = newX;
				this.cy = newY;
			}
			else{
				this.canMoveWhileColliding = false;
			}
		}
		else{
			this.changeDirection();
		}
		
	}
	// rest is powerup, bullet, or crossable terrain
	else {
		this.cx = newX;
        this.cy = newY;
		this.canMoveWhileColliding = false;
	}	
	
	// update animation frame
    this.animationFrameCounter++;
    if (this.animationFrameCounter % 3 === 0) {
        // switch frame every 3rd update
        this.animationFrame === 0 ? this.animationFrame = 1
                                  : this.animationFrame = 0;
    }

    if(this.powerLevel === consts.TANK_POWER_DROPSPOWERUP)
    {

        this.animationFramePowerupCounter++;
        if (this.animationFrameCounter % 6 === 0) {
            // switch red-grey frame every 3rd update
            this.animationFramePowerup === 0 ? this.animationFramePowerup = 1
                                      : this.animationFramePowerup = 0
        }
    }
    this.isMoving = true;
};

// takes in list of tanks
EnemyTank.prototype.isAnyTankInListAllowedToMove = function(list){
	var temp = false;
	for(var i = 0; i < list.length; i++){
		if (list[i].canMoveWhileColliding){
				temp = true;
				break;
			}
	}
	return temp;
}

EnemyTank.prototype.findAllTanksInList = function(list){
	var tankList = [];
	for(var i = 0; i < list.length; i++){
		if (list[i].entity.type >= consts.TANK_PLAYER1 && 
			list[i].entity.type <= consts.TANK_ENEMY_ARMOR){
				tankList.push(list[i].entity);
			}
	}
	return tankList;
}

EnemyTank.prototype.doesContainTank = function(list){
	var temp
	for(var i = 0; i < list.length; i++){
		if (list[i].entity.type >= consts.TANK_PLAYER1 && 
			list[i].entity.type <= consts.TANK_ENEMY_ARMOR){
				temp = true;
				break;
			}
	}
	return temp;
}

// checks if list contains object that is not allowed to move through no matter what
// (Brick, Terrain, Border or Eagle)
EnemyTank.prototype.doesContainUncrossableObject = function(list){
	// is True is we find Brick, Terrain, Border or Eagle in list. False otherwise
	var temp
	for(var i = 0; i<list.length; i++){
		if (list[i].entity.type === consts.STRUCTURE_BRICK || 
			list[i].entity.type === consts.STRUCTURE_STEEL ||
			list[i].entity.type === consts.STRUCTURE_FLAG || 
			list[i].entity.type === consts.STRUCTURE_FLAG ||
			list[i].entity.type === consts.TERRAIN_WATER ||
			list[i].entity.type === consts.TERRAIN_WATER ||
			list[i].entity.type === consts.BORDER){
				temp = true;
				break;
			}
	}
	return temp;
};

EnemyTank.prototype.goingOffMap = function(newX, newY) {
    if(    (newX-this.halfWidth < 0)
        || (newX+this.halfWidth > g_canvas.width)
        || (newY-this.halfHeight < 0)
        || (newY+this.halfHeight > g_canvas.height)
       )
    {
       return true;
    }
    else
    {
        return false;
    }
};

EnemyTank.prototype.changeDirection = function() {
    //HD: If a tank is aimed at a flag, it'll stay where it is and keep firing.
    //Otherwise, it will change direction to something other than its current
    //one. We want the tanks to slightly head toward the flag, so the odds
    //are skewed toward that: 30% Down, 25% Left, 25% Right and 20% Up.
    //I reroll if the unavailable direction comes up.

    //NB: I've seen enemy tanks try to hammer against a structure, so if we
    //want we could eliminate the reroll - but that might be misunderstood and
    //look like we simply didn't think of it.

    //(We COULD also give preference to direction based on the tank's grid location
    // relative to the center, but honestly, in the original version they're
    // not that smart).

    var newDirection = -1;

        switch (this.orientation) {
            case(consts.DIRECTION_DOWN):  //1 to 30
            newDirection = 1;
            while(newDirection<=30) {
                newDirection = Math.floor(Math.random() * 100 + 1);
            }
            break;
            case(consts.DIRECTION_LEFT): //30 to 55
            newDirection = 35;
            while( (newDirection>30) && (newDirection <=55) ) {
                newDirection = Math.floor(Math.random() * 100 + 1);
            }
            break;
            case(consts.DIRECTION_RIGHT): //56 to 80
            newDirection = 60;
            while( (newDirection>55) && (newDirection <=80) ) {
                newDirection = Math.floor(Math.random() * 100 + 1);
            }
            break;
            case(consts.DIRECTION_UP): //81 to 100
                newDirection = 99;
                while(newDirection>80) {
                    newDirection = Math.floor(Math.random() * 100 + 1);
                }
            break;
        }

        if(newDirection <= 30) {
            this.orientation = consts.DIRECTION_DOWN;
        }
        else if( (newDirection>30) && (newDirection <=55) )
        {
            this.orientation = consts.DIRECTION_LEFT;
        }
        else if( (newDirection>55) && (newDirection <=80) )
        {
            this.orientation = consts.DIRECTION_RIGHT;
        }
        else {
            this.orientation = consts.DIRECTION_UP;
        }
};


// use direction to determine wether we lock to X-grid og Y-grid
EnemyTank.prototype.lockToNearestGrid = function() {
	if(this.orientation === consts.DIRECTION_UP || this.orientation == consts.DIRECTION_DOWN){
		// lock to nearest x coordinates on the grid
		var gridStep = g_canvas.width/g_gridSize;
		var mod = this.cx % gridStep;
		if(mod >= gridStep/2)
			this.cx = this.cx-mod+gridStep;
		else
			this.cx = this.cx-mod;
	}
	if(this.orientation === consts.DIRECTION_RIGHT || this.orientation == consts.DIRECTION_LEFT){
		// lock to nearest y coordinates on the grid
		var gridStep = g_canvas.height/g_gridSize;
		var mod = this.cy % gridStep;
		if(mod >= gridStep/2)
			this.cy = this.cy-mod+gridStep;
		else
			this.cy = this.cy-mod;
	}
};

EnemyTank.prototype.maybeFireBullet = function () {

    this.bulletDelayCounter++;

    if( (this.bulletsAlive === 0) && (this.bulletDelayCounter % 30 === 0) ) {
            var turretX, turretY;
            // offset so bullet doesn't collide with tank!
            var alpha = 7;

            switch(this.orientation) {
                case(consts.DIRECTION_UP):
                    turretX = this.cx - 2;
                    turretY = this.cy - this.halfHeight - alpha;
                    break;
                case(consts.DIRECTION_DOWN):
                    turretX = this.cx - 3;
                    turretY = this.cy + this.halfHeight + alpha;
                    break;
                case(consts.DIRECTION_LEFT):
                    turretX = this.cx - this.halfWidth - alpha;
                    turretY = this.cy;
                    break;
                case(consts.DIRECTION_RIGHT):
                    turretX = this.cx + this.halfWidth + alpha;
                    turretY = this.cy;
                    break;
            }


            // Check if we should fire bullet
            if (Math.random() <= this.chanceOfBulletFire) {
                // Reset chances to 30%
                this.chanceOfBulletFire = 0.3;
                this.bulletsAlive++;
                entityManager.fireBullet(turretX, turretY, this.bulletVelocity,
                    this.orientation, this.isPlayer, this.bulletStrength, this);
            }
            else {
                this.chanceOfBulletFire += 0.05;
            }
        }

};

EnemyTank.prototype.takeBulletHit = function (bullet) {

    //Enemy got shot by player
    if((!this.isPlayer) && (bullet.player)) {

        if(this.numberOfLives>1)
        {
            g_SFX.request(bullet.soundHitShield);
            this.numberOfLives -= 1;
        }
        else {
            gameState.addScore(bullet.tank.type, this.type);
            if(this.powerLevel === consts.TANK_POWER_DROPSPOWERUP)
            {
                entityManager.generatePowerup();
            }
            this.kill();
            g_SFX.request(bullet.soundDestroyEnemy);
            var coords = {cx: this.cx, cy: this.cy, points: this.pointsValue};
            var points = function () {
                entityManager.generateEffect("points", coords);
            }
            entityManager.generateEffect("explosionBig", coords, points);
        }
        return true;
    }
    return false;
};

EnemyTank.prototype.explode = function (tank) {
	gameState.addScore(tank.type, consts.POWERUP_GRENADE);
	this.kill();
	var bullet = new Bullet();
	g_SFX.request(bullet.soundDestroyEnemy);
	var coords = {cx: this.cx, cy: this.cy, points: 0};
	var points = function () {
        entityManager.generateEffect("points", coords);
    }
	entityManager.generateEffect("explosionBig", coords, points);
};

EnemyTank.prototype.reset = function () {
    this.setPos(this.reset_cx, this.reset_cy);
    this.orientation = this.reset_orientation;
};

EnemyTank.prototype.render = function (ctx, du) {

    var powerlevelSprite = this.powerLevel;
    if( (this.powerLevel === consts.TANK_POWER_DROPSPOWERUP)
        && (this.animationFramePowerup === 0) )
    {

        powerlevelSprite = consts.TANK_POWER_NONE;
    }

    // fetch correct sprite from spriteManager
    this.sprite = spriteManager.spriteTank(
        this.type,
        powerlevelSprite,
        this.orientation,
        this.animationFrame,
        this.numberOfLives
    );

    this.sprite.drawCentredAt(ctx, this.cx, this.cy, consts.DIRECTION_UP, this.halfWidth, this.halfHeight);

};
