// ====
// Brick
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */


//level is 26 X 26 small bricks
function createLevel(array) {
    // just for testing
    for (i = 0; i < 26; i++){
        for(j = 0; j < 26; j++){
            switch(array[i][j])
                {
                    case(0):
                        entityManager.generateBrick({
                            x      : 200,
                            y      : 300,
                            type   : consts.STRUCTURE_BRICK
                            look   : consts.STRUCTURE_WHOLE
                        });
                    break;
                    case(1):
                        entityManager.generateBrick({
                            x      : 200,
                            y      : 300,
                            type   : consts.STRUCTURE_STEEL
                            look   : consts.STRUCTURE_WHOLE
                        });
                    break;
                    case(2):
                        entityManager.generateTerrain({
                            x      : 200,
                            y      : 300,
                            type   : consts.TERRAIN_WATER
                        });
                    break;
                    case(3):
                        entityManager.generateTerrain({
                            x      : 200,
                            y      : 300,
                            type   : consts.TERRAIN_TREES
                        });
                    break;
                    case(4):
                        entityManager.generateTerrain({
                            x      : 200,
                            y      : 300,
                            type   : consts.TERRAIN_ICE
                        });
                    break;
                    case(5):
                        entityManager.generateTerrain({
                            x      : 200,
                            y      : 300,
                            type   : consts.TERRAIN_BLANK
                        });
                    break;
                    

            }
        }
    }
}