function game(){
  return the_game
}

function runtime(){
  return top;
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
    Crafty.load(['assets/block_tile.png', 'assets/chests.png'], function(){
        Crafty.sprite(16, 'assets/block_tile.png', {
          spr_green_block:    [0, 0],
          spr_red_block:    [1, 0],
          spr_purple_block:    [0, 1],
          spr_blue_block:    [1, 1]
        });

        Crafty.sprite(32, 'assets/characters/hunter.png', {
          spr_player:    [0, 2]
        });

        Crafty.sprite(50, 'assets/chests.png', {
          spr_add_chest:    [0, 0],
          spr_mul_chest:    [1, 0],
          spr_con_chest:    [2, 0],
          spr_rcon_chest:   [3, 0],
          spr_max_chest:    [0, 1],
          spr_cat_chest:    [1, 1],
          spr_pop_chest:    [2, 1],
          spr_emp_chest:    [3, 1],
          spr_inp_chest:    [0, 2],
          spr_rec_chest:    [1, 2],
          spr_ret_chest:    [2, 2]
        });

        Crafty.audio.add({
            chest: ["assets/beep1.mp3"]
        })

        Crafty.init(Game.width(), Game.height());
        Crafty.background('url("/assets/bg.png")');

        document.getElementById("input").style.width = Game.width() + "px"

        Crafty.e("Game")
    })
  }
}
