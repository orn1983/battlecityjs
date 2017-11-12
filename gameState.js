/////////////////////
// GAME STATE MANAGER
/////////////////////

// Stores various information regarding game state,
// draws level information on background canvas,
// and handles progression between levels

var gameState = {
	
	_currentLevel : 0,

	_BASIC_SCORE   : 100,
	_FAST_SCORE    : 200,
	_POWER_SCORE   : 300,
	_ARMOR_SCORE   : 400,
	_POWERUP_SCORE : 500,

	// this will count how many tanks of each type each player kills,
	// This information can then be used for counting scores after each level
	// notice this does not have to keep score
	_currentLevelScore : {
		p1_basic : 0,
		p1_fast  : 0,
		p1_power : 0,
		p1_armor : 0,
		
		p2_basic : 0,
		p2_fast  : 0,
		p2_power : 0,
		p2_armor : 0,
	},

	// skýra þetta kannski eitthvað annað
	_player1Points : 0,
	_player2Points : 0,
    
    fortress : [],
	
// sets current level score to zero when 
resetCurrentLevelScore : function() {
	this._currentLevelScore.p1_basic = 0;
	this._currentLevelScore.p1_fast  = 0;
	this._currentLevelScore.p1_power = 0;
	this._currentLevelScore.p1_armor = 0;
	
	this._currentLevelScore.p2_basic = 0;
	this._currentLevelScore.p2_fast  = 0;
	this._currentLevelScore.p2_power = 0;
	this._currentLevelScore.p2_armor = 0;
},
    
    // EAH: No idea where to put these functions so just stuffing them here for now!
prevLevel : function() {
    //only do something if not already on first level
    if (this._currentLevel > 0) {
        this._currentLevel--;
        entityManager.destroyLevel();
        createInitialTanks();
        this.createLevel(g_levels[g_sortedLevelKeys[g_currentLevel]]);
    }
},

nextLevel : function() {
    //only do something if not already on last level
    if (this._currentLevel < 34) {
        this._currentLevel++;
        entityManager.destroyLevel();
        createInitialTanks();
        this.createLevel(g_levels[g_sortedLevelKeys[g_currentLevel]]);
    }
},

// EAH: more stuff that has no home
// Don't want to spend more time on this code atm in case we
// end up throwing it all away, but at least it can be used
// as proof-of-concept
drawInfo : function() {

    // used for both player 1 and player 2
    var playerTankIcon = spriteManager.spritePlayerTankIcon();

    // draw player 1 icon
    var p1icon = spriteManager.spritePlayerIcon(1);
    // using drawBulletAt for now because it takes a "scale" argument
    p1icon.drawBulletAt(g_backgroundCtx, 685, 390, consts.DIRECTION_UP, 3);

    playerTankIcon.drawBulletAt(g_backgroundCtx, 670, 422, consts.DIRECTION_UP, 3);

    // just putting 2 here as starting value for now
    p1lives = spriteManager.spriteNumber(entityManager.getPlayerLives(1));
    p1lives.drawBulletAt(g_backgroundCtx, 695, 422, consts.DIRECTION_UP, 3);

    if (g_numPlayers === 2) {
        // draw player 2 icon
        var p2icon = spriteManager.spritePlayerIcon(2);
        p2icon.drawBulletAt(g_backgroundCtx, 685, 470, consts.DIRECTION_UP, 3);

        playerTankIcon.drawBulletAt(g_backgroundCtx, 670, 502, consts.DIRECTION_UP, 3);

        p2lives = spriteManager.spriteNumber(entityManager.getPlayerLives(2));
        p2lives.drawBulletAt(g_backgroundCtx, 695, 502, consts.DIRECTION_UP, 3);
    }

    // draw flag icon
    var flagIcon = spriteManager.spriteFlagIcon();
    flagIcon.drawBulletAt(g_backgroundCtx, 685, 555, consts.DIRECTION_UP, 3);

    this.drawLevelNumber(this._currentLevel + 1);
},

drawLevelNumber : function(number) {
    var firstDigit = Math.floor(number / 10);
    var secondDigit = number % 10;

    if (firstDigit > 0) {
        var firstDigitIcon = spriteManager.spriteNumber(firstDigit);
        firstDigitIcon.drawBulletAt(g_backgroundCtx, 670, 595, consts.DIRECTION_UP, 3);
    }

    var secondDigitIcon = spriteManager.spriteNumber(secondDigit);
    secondDigitIcon.drawBulletAt(g_backgroundCtx, 695, 595, consts.DIRECTION_UP, 3);
},


// saves the state of the "fortress" around he statue
saveFortress : function(bricks) {
    // coords of fortress bricks:
    // 255 < x < 350
    // y > 530
    
    // empty fortress array
    this.fortress.length = 0;
    
    for (var i = 0; i < bricks.length; i++) {
        if (bricks[i].cx > 255 && bricks[i].cx < 350 && bricks[i].cy > 530) {
            this.fortress.push(bricks[i]);
        }
    }
},

restoreFortress : function(bricks) {
    // destroy default fortress
    for (var i = 0; i < bricks.length; i++) {
        if (bricks[i].cx > 255 && bricks[i].cx < 350 && bricks[i].cy > 530) {
            bricks.splice(i,1);
        }
    }
   
    // restore saved fortress
    for (var i = 0; i < this.fortress.length; i++) {
        bricks.push(this.fortress[i]);
    }
},

addScore : function(player, type) {
	
	if (type === consts.TANK_ENEMY_BASIC){
		if (player === consts.TANK_PLAYER1){
			this._player1Points += this._BASIC_SCORE;
			this._currentLevelScore.p1_basic += 1;
		}
		else if (player === consts.TANK_PLAYER2){
			this._player2Points += this._BASIC_SCORE;
			this._currentLevelScore.p2_basic += 1;
		}
	}
	
	else if(type === consts.TANK_ENEMY_FAST){
		if (player === consts.TANK_PLAYER1){
			this._player1Points += this._FAST_SCORE;
			this._currentLevelScore.p1_fast += 1;
		}
		else if (player === consts.TANK_PLAYER2){
			this._player2Points += this._FAST_SCORE;
			this._currentLevelScore.p2_fast += 1;
		}
	}
	
	else if(type === consts.TANK_ENEMY_POWER){
		if (player === consts.TANK_PLAYER1){
			this._player1Points += this._POWER_SCORE;
			this._currentLevelScore.p1_power += 1;
		}
		else if (player === consts.TANK_PLAYER2){
			this._player2Points += this._POWER_SCORE;
			this._currentLevelScore.p2_power += 1;
		}
	}
	
	else if(type === consts.TANK_ENEMY_ARMOR){
		if (player === consts.TANK_PLAYER1){
			this._player1Points += this._ARMOR_SCORE;
			this._currentLevelScore.p1_armor += 1;
		}
		else if (player === consts.TANK_PLAYER2){
			this._player2Points += this._ARMOR_SCORE;
			this._currentLevelScore.p2_armor += 1;
		}
	}
	
	else if(type >= consts.POWERUP_HELMET && type <= consts.POWERUP_TANK){
		if (player === consts.TANK_PLAYER1){
			this._player1Points += this._POWERUP_SCORE;
		}
		else if (player === consts.TANK_PLAYER2){
			this._player2Points += this._POWERUP_SCORE;
		}
    }
},

createLevel : function() {
    createLevel(g_levels[g_sortedLevelKeys[this._currentLevel]]);
    entityManager.generateStatue();
}, 
    
}