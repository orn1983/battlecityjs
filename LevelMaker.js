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