function game(){
  return the_game
}

Game = {
  // This defines our grid's size and the size of each of its tiles
  map_grid: {
    width:  30,
    height: 22,
    tile: {
      width:  16,
      height: 16
    }
  },

  inventory_grid: {
    width:  14,
    height: 22,
    tile: {
      width:  16,
      height: 16
    }
  },

  height: function(){
    return this.map_height()
  },
  width: function(){
    return this.map_width() + this.inventory_width();
  },

  map_width: function() {
    return this.map_grid.width * this.map_grid.tile.width;
  },
  map_height: function() {
    return this.map_grid.height * this.map_grid.tile.height;
  },

  inventory_width: function() {
    return this.inventory_grid.width * this.inventory_grid.tile.width;
  },
  inventory_height: function() {
    return this.inventory_grid.height * this.inventory_grid.tile.height;
  },
 
  start: function(){
    Crafty.init(Game.width(), Game.height());
    Crafty.background('rgb(0, 0, 0)');

    document.getElementById("input").style.width = Game.width() + "px"

    Crafty.e("Game")
  
  }
}
