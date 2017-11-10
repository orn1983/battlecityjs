// main menu

var mainMenu = {
    
menuItems : ["1 PLAYER", "2 PLAYERS", "VS MODE"],

selectedItem : 0,

// indicated whether to show the level select menu or not
levelSelect : false,

init : function() {
    g_backgroundCtx.save();
    // hide playfield
    g_canvas.style.display = "none";
    g_doClear = false;
},

close : function() {
    util.clearBackgroundCanvas(g_backgroundCtx);
    g_backgroundCtx.restore();
    g_doClear = true;
    g_gameStarted = true;
    g_canvas.style.display = "";  
    entityManager.init();
    createInitialTanks();
    createLevel(g_levels[g_sortedLevelKeys[g_currentLevel]]);
},

switchToLevelSelect : function() {
    this.levelSelect = true;
    this.menuItems = [];
    for (var i = 0; i < 35; i++)
        this.menuItems[i] = i+1;
    this.selectedItem = 0;
},

update : function() {
    if (eatKey(13) || eatKey(keyCode(' '))) {
        // enter key, go to level select menu
        if (!this.levelSelect) {
            if (this.selectedItem === 0) {
                // 1 player
                g_friendlyFire = false;
                g_enemiesEnabled = true;
                g_numPlayers = 1;
            }
            else if (this.selectedItem === 1) {
                // 2 players
                g_friendlyFire = false;
                g_enemiesEnabled = true;
                g_numPlayers = 2;                
            }
            else if (this.selectedItem === 2) {
                // VS mode
                g_friendlyFire = true;
                g_enemiesEnabled = false;
                g_numPlayers = 2;                               
            }
            
            // enter pressed in main menu, go to level select
            this.switchToLevelSelect();
        }
        else if (this.levelSelect) {
            // enter pressed in level select, close menu and start game
            g_currentLevel = this.selectedItem;
            this.close();
        }
    }
    else if (eatKey(38) || eatKey(keyCode('W'))) {
        // up arrow
        this.selectedItem = (this.selectedItem - 1);
        if (this.selectedItem < 0) {
            this.selectedItem = this.menuItems.length - 1;
        }
    }
    else if (eatKey(40) || eatKey(keyCode('S'))) {
        // down arrow
        this.selectedItem = (this.selectedItem + 1) % this.menuItems.length;
    }            
},

render : function(ctx) {
    util.clearBackgroundCanvas(ctx, "black");
    var centerX = g_backgroundCanvas.width/2;
    var centerY = g_backgroundCanvas.height/2;
    ctx.textAlign="center";
    ctx.font="20px Georgia";
    // iterate through menuItems and draw on screen
    if (!this.levelSelect) {
        // if main menu then draw all items
        for (var i = 0; i < this.menuItems.length; i++) {
            if (i === this.selectedItem) {
                // draw selected item in different color
                ctx.fillStyle = "red";
            }
            else {
                ctx.fillStyle = "white";
            }
            ctx.fillText(this.menuItems[i],centerX,centerY-30+i*30); 
        } 
    }        
    else {
        // if level select the draw only selected stage
        ctx.fillStyle = "white";
        ctx.fillText("STAGE " + this.menuItems[this.selectedItem],centerX,centerY); 
    }

}

};