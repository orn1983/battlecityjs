/////////////////////
// GAME STATE MANAGER
/////////////////////

// Stores various information regarding game state,
// draws level information on background canvas,
// and handles progression between levels

var gameState = {
	
	_currentLevel : 0,
    _gameOver     : false,


	// OA: Each type already knows how many points it's woth (this.pointsValue),
	// but let's hold off on refactoring until the end if we have time
	_BASIC_SCORE   : 100,
	_FAST_SCORE    : 200,
	_POWER_SCORE   : 300,
	_ARMOR_SCORE   : 400,
	_POWERUP_SCORE : 500,
	
	_spawnTimer    : 100 / NOMINAL_UPDATE_INTERVAL,
	_freezeTimer   : 0,

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

	_player1Points : 0,
	_player2Points : 0,
	
	_spawnPosition : 1,

  _nextLevelRequested : false,
    
    fortress : [],
	
// sets current level score to zero. use before beginning new level.
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

init : function() {
    createInitialTanks();
},
    
prevLevel : function() {
    //only do something if not already on first level
    if (this._currentLevel > 0) {
        this._currentLevel--;
        entityManager.destroyLevel();
        this.createLevel(g_levels[g_sortedLevelKeys[this._currentLevel]]);
        entityManager.initLevel();
		this._spawnPosition = 1;
        this._nextLevelRequested = false;
        this.resetSpawnTimer();
    }
},

nextLevel : function() {
    this.nextLevelRequested = false;
    //only do something if not already on last level
    if (this._currentLevel < 34) {
        this._currentLevel++;
        entityManager.destroyLevel();
        this.createLevel(g_levels[g_sortedLevelKeys[this._currentLevel]]);
        entityManager.initLevel();
		this._spawnPosition = 1;
        this._nextLevelRequested = false;
        this.resetSpawnTimer();
    }
},

// draws current level info (lives, enemy tanks left, level number)
// on background canvas (sidebar)
drawInfo : function() {

    // used for both player 1 and player 2
    var playerTankIcon = spriteManager.spritePlayerTankIcon();

    // draw player 1 icon
    var p1icon = spriteManager.spritePlayerIcon(1);
    p1icon.drawScaledAt(g_backgroundCtx, 685, 390, consts.DIRECTION_UP, 3);

    playerTankIcon.drawScaledAt(g_backgroundCtx, 670, 422, consts.DIRECTION_UP, 3);

    // just putting 2 here as starting value for now
    p1lives = spriteManager.spriteNumber(entityManager.getPlayerLives(1));
    p1lives.drawScaledAt(g_backgroundCtx, 695, 422, consts.DIRECTION_UP, 3);

    if (g_numPlayers === 2) {
        // draw player 2 icon
        var p2icon = spriteManager.spritePlayerIcon(2);
        p2icon.drawScaledAt(g_backgroundCtx, 685, 470, consts.DIRECTION_UP, 3);

        playerTankIcon.drawScaledAt(g_backgroundCtx, 670, 502, consts.DIRECTION_UP, 3);

        p2lives = spriteManager.spriteNumber(entityManager.getPlayerLives(2));
        p2lives.drawScaledAt(g_backgroundCtx, 695, 502, consts.DIRECTION_UP, 3);
    }

    // draw flag icon
    var flagIcon = spriteManager.spriteFlagIcon();
    flagIcon.drawScaledAt(g_backgroundCtx, 685, 555, consts.DIRECTION_UP, 3);

    this.drawLevelNumber(this._currentLevel + 1);
    this.drawNumberOfEnemyTanksLeft();
},

drawLevelNumber : function(number) {
    var firstDigit = Math.floor(number / 10);
    var secondDigit = number % 10;

    if (firstDigit > 0) {
        var firstDigitIcon = spriteManager.spriteNumber(firstDigit);
        firstDigitIcon.drawScaledAt(g_backgroundCtx, 670, 595, consts.DIRECTION_UP, 3);
    }

    var secondDigitIcon = spriteManager.spriteNumber(secondDigit);
    secondDigitIcon.drawScaledAt(g_backgroundCtx, 695, 595, consts.DIRECTION_UP, 3);
},

drawNumberOfEnemyTanksLeft : function() {
    var num = entityManager.getNumberOfEnemyTanksLeft();
    var enemyTankIcon = spriteManager.spriteEnemyIcon();
    var x = 675;
    var y = 70;
    for (var i = 0; i < num; i++) {
        y = y + ((i+1) % 2) * 24;
        enemyTankIcon.drawScaledAt(g_backgroundCtx, x + (i % 2) * 24, y, consts.DIRECTION_UP, g_spriteScale);
    }
    
},


// saves the state of the "fortress" around he statue
saveFortress : function(bricks) {
    // empty fortress array
    this.fortress.length = 0;
    
    for (var i = 0; i < bricks.length; i++) {
        if (bricks[i].cx >= g_canvas.width/g_gridSize*11 && bricks[i].cx <= g_canvas.width/g_gridSize*15 && bricks[i].cy >= g_canvas.width/g_gridSize*22) {
            this.fortress.push(bricks[i]);
        }
    }
},

restoreFortress : function(bricks) {
    // destroy default fortress
    entityManager.removeFortress();
   
    // restore saved fortress
    for (var i = 0; i < this.fortress.length; i++) {
        bricks.push(this.fortress[i]);
    }
},

createSteelFortress : function() {
    // remove the current fortress first
    entityManager.removeFortress();
  
    // create 8 steel bricks around statue
    entityManager.generateBrick({
        cx      : g_first_step + g_gridStep*11,
        cy      : g_first_step + g_gridStep*23,
        type    : consts.STRUCTURE_STEEL,
        look    : consts.STRUCTURE_WHOLE
    });
    entityManager.generateBrick({
        cx      : g_first_step + g_gridStep*12,
        cy      : g_first_step + g_gridStep*23,
        type    : consts.STRUCTURE_STEEL,
        look    : consts.STRUCTURE_WHOLE
    });    
    entityManager.generateBrick({
        cx      : g_first_step + g_gridStep*13,
        cy      : g_first_step + g_gridStep*23,
        type    : consts.STRUCTURE_STEEL,
        look    : consts.STRUCTURE_WHOLE
    });
    entityManager.generateBrick({
        cx      : g_first_step + g_gridStep*14,
        cy      : g_first_step + g_gridStep*23,
        type    : consts.STRUCTURE_STEEL,
        look    : consts.STRUCTURE_WHOLE
    });
    entityManager.generateBrick({
        cx      : g_first_step + g_gridStep*11,
        cy      : g_first_step + g_gridStep*24,
        type    : consts.STRUCTURE_STEEL,
        look    : consts.STRUCTURE_WHOLE
    });
    entityManager.generateBrick({
        cx      : g_first_step + g_gridStep*14,
        cy      : g_first_step + g_gridStep*24,
        type    : consts.STRUCTURE_STEEL,
        look    : consts.STRUCTURE_WHOLE
    });
    entityManager.generateBrick({
        cx      : g_first_step + g_gridStep*11,
        cy      : g_first_step + g_gridStep*25,
        type    : consts.STRUCTURE_STEEL,
        look    : consts.STRUCTURE_WHOLE
    });
    entityManager.generateBrick({
        cx      : g_first_step + g_gridStep*14,
        cy      : g_first_step + g_gridStep*25,
        type    : consts.STRUCTURE_STEEL,
        look    : consts.STRUCTURE_WHOLE
    });
    
    // remove steel after timeout
    setTimeout(function() {entityManager.removeSteelFortress(entityManager);}, 20000);
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
    createEnemies(g_enemies[g_sortedEnemyKeys[this._currentLevel]]);
    entityManager.generateStatue();
}, 

resetSpawnTimer : function() {
	this._spawnTimer = 3000 / NOMINAL_UPDATE_INTERVAL;
},

setFreezeTimer : function () {
	this._freezeTimer = 15000 / NOMINAL_UPDATE_INTERVAL;
},

getFreezeTimer : function () {
	return this._freezeTimer;
},

setGameOver : function () {
    if (!this._gameOver) {
        this._gameOver = true;
        this.gameOverSprite = spriteManager.spriteGameOver();
        this.goX = g_canvas.width/2;
        this.goY = g_canvas.height;    
    }
},

update : function(du) {
    
    if (this._gameOver) {
        // update position of game over graphic
        this.goY = Math.max(g_canvas.height/2, this.goY - 2 * du);
        if (this.goY === g_canvas.height/2 && !this._nextLevelRequested) {
            // return to main menu after a while
            this._nextLevelRequested = true;
            var that = this;
            setTimeout(function() {that._nextLevelRequested = false; that.goY = g_canvas.height; that._gameOver = false; main._isGameOver = false; mainMenu.init();}, 2000);
        }
    }
    
    // update spawn timer
	this._spawnTimer -= du;
	
	// update freezeTimer
	this._freezeTimer -= du;
    
    // end game if player(s) is/are dead
    if (entityManager._playerTanks[0].numberOfLives < 0) {
        if (g_numPlayers === 1 || (g_numPlayers === 2 && entityManager._playerTanks[1].numberOfLives < 0)) {
            setTimeout(function () { main.gameOver(); } , 1000);
        }
    }
    
	// see if level is over, then start next level
	if(entityManager.getNumberOfEnemyTanks() === 0 && !this._nextLevelRequested){
        var that = this;
        setTimeout(function() { that.nextLevel() }, 2000);
        this._nextLevelRequested = true;
	}
	var nr = entityManager.getNumberOfEnemyTanks();
	
	// spawn another enemy if we should
	if(this._spawnTimer < 0 && entityManager._enemyTanksInPlay.length < 4 && entityManager._enemyTanks.length > 0){
		entityManager.spawnEnemyTank();
		this.resetSpawnTimer();
	}
},

render : function(ctx) {
    if (this._gameOver) {
        // draws scrolling game over graphic
        this.gameOverSprite.drawScaledAt(ctx, this.goX, this.goY, consts.DIRECTION_UP, g_spriteScale);
    }
    
    this.drawInfo();
},


    
}
