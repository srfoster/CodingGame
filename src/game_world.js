Crafty.c("World", {
    worldBounds: function(w,h,ox,oy)
    {
      this._worldWidth = w;
      this._worldHeight = h;
      this._worldOffsetX = ox;
      this._worldOffsetY = oy;

      return this
    },


    drawWorld: function() {


    for (var x = this._worldOffsetX; x < this._worldOffsetX + this._worldWidth; x++) {
      for (var y = this._worldOffsetY; y < this._worldOffsetY + this._worldHeight; y++) {
           var at_edge = x == this._worldOffsetX || x == this._worldOffsetX + this._worldWidth - 1 || y == this._worldOffsetY || y == this._worldOffsetY + this._worldHeight - 1;
 
        if (at_edge) {
          Crafty.e('Block')
            .attr({
              x: x * Game.map_grid.tile.width,
              y: y * Game.map_grid.tile.height,
              w: Game.map_grid.tile.width,
              h: Game.map_grid.tile.height
            })
        } else if (Math.random() < 0.06) {
          Crafty.e('Block')
            .attr({
              x: x * Game.map_grid.tile.width,
              y: y * Game.map_grid.tile.height,
              w: Game.map_grid.tile.width,
              h: Game.map_grid.tile.height
            })
            .color('rgb(20, 185, 40)');
        }
      }
    }

    return this
  }

});
