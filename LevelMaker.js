// ====
// Levels jerry, levels!
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_level_start_x = 0;
var g_level_start_y = 0;
var g_levelWidth = g_canvas.width;
var g_levelHeight = g_canvas.height;
var g_gridMultiplier = 26;
var g_first_step = g_level_start_x + g_levelWidth/g_gridSize/2;
var g_gridStep = g_levelWidth/g_gridSize;

// there are always 20 enemies in each level, so array has to have length 20
function createEnemies(array){
	var position = 1;
	var thisPowerup = consts.TANK_POWER_NONE;
	// 4 11 18
	for (var i = 0; i<20; i++){
		if(i === 3 || i === 10 || i === 17)
		{
			thisPowerup = consts.TANK_POWER_DROPSPOWERUP;
		}
		else {
			thisPowerup = consts.TANK_POWER_NONE;
		}
		switch(array[i])
		{
			case(0):
				createTank(position%3, consts.TANK_ENEMY_BASIC, thisPowerup);
			break;
			case(1):
				createTank(position%3, consts.TANK_ENEMY_FAST, thisPowerup);
			break;
			case(2):
				createTank(position%3, consts.TANK_ENEMY_POWER, thisPowerup);
			break;
			case(3):
				createTank(position%3, consts.TANK_ENEMY_ARMOR, thisPowerup);
			break;
		}
		position = (position + 1);
	}
}

function createTank(position, type, powerlevel){
	entityManager.generateEnemyTank({
					cx :  g_canvas.width/26 + position*(g_canvas.width/2-g_canvas.width/26),
					cy :  g_canvas.height/26,
					type : type,
					powerLevel : powerlevel,
	});
}

//level is 26 X 26 small bricks
function createLevel(array) {
    // just for testing
    for (var i = 0; i < g_gridSize; i++){
        for(var j = 0; j < g_gridSize; j++){
            switch(array[i][j])
                {
                    case(0):
                        entityManager.generateBrick({
                            cx      : g_first_step + g_gridStep*j,
                            cy      : g_first_step + g_gridStep*i,
                            type    : consts.STRUCTURE_BRICK,
                            look    : consts.STRUCTURE_WHOLE
                        });
                    break;
                    case(1):
                        entityManager.generateBrick({
                            cx      : g_first_step + g_gridStep*j,
                            cy      : g_first_step + g_gridStep*i,
                            type    : consts.STRUCTURE_STEEL,
                            look    : consts.STRUCTURE_WHOLE
                        });
                    break;
                    case(2):
                        entityManager.generateTerrain({
                            cx      : g_first_step + g_gridStep*j,
                            cy      : g_first_step + g_gridStep*i,
                            type    : consts.TERRAIN_WATER
                        });
                    break;
                    case(3):
                        entityManager.generateTerrain({
                            cx      : g_first_step + g_gridStep*j,
                            cy      : g_first_step + g_gridStep*i,
                            type    : consts.TERRAIN_TREES
                        });
                    break;
                    case(4):
                        entityManager.generateTerrain({
                            cx      : g_first_step + g_gridStep*j,
                            cy      : g_first_step + g_gridStep*i,
                            type    : consts.TERRAIN_ICE
                        });
                    break;
                    case(5):
                    break;


            }
        }
    }
}
