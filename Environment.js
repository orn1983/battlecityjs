function Environment(descr) {
    for (var property in descr) {
        this[property] = descr[property];
    }

    this.cubes = JSON.parse(JSON.stringify(g_levels[this.level]));
}
    
// Play area is comprised of 13x13 cubes. Each dimension of the cube is then
// visually subdivided into 4 segments visually, but 2 segments collision wise.
// This is probably a limitation of the sprite size of the NES.
// Let's just go with 4 for both things for now.
Environment.prototype.playAreaColumns = 13 * 4;
Environment.prototype.playAreaRows = 13 * 4;
// Figure out the number of pixels from the width of the canvas.
// Note: Maybe we should change this to 1/4 of its size
// Note: Maybe we should define a play-area that is less than the canvas and use
// the width of that instead of the width of the canvas.
Environment.prototype.cubeWidth = g_canvas.width / 13;
Environment.prototype.cubeHeight = g_canvas.width / 13;

Environment.prototype.drawCube = function (ctx, row, column) {
    var coords = this.gridToCoordinates(row, column);
    // If we make the cubes objects, we should maybe just tell them
    // to draw themselves.
    ctx.save();
    ctx.fillStyle = g_cubeStyles[this.cubes[row][column]];
    ctx.fillRect(coords[0], coords[1], this.cubeWidth, this.cubeHeight);
    ctx.restore();
}

Environment.prototype.gridToCoordinates = function (row, column) {
    // Note: If we will be using a smaller play area, we will need to change
    // this function to use offsets for the positioning.
    var leftX = column * this.cubeWidth;
    var topY = row * this.cubeHeight;
    return [leftX, topY];
}

Environment.prototype.coordinatesToGrid = function (x, y) {
    // TODO update this to be able to return two locations, as a shot can hit
    // two cubes at once.
    // Maybe change the return type to the actual objects themselves?
    var quotientY = Math.floor(y / this.cubeHeight);
    var quotientX = Math.floor(x / this.cubeWidth);
    return [quotientY, quotientX]
}

