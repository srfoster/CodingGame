Crafty.c("Inventory", {
  init: function(){
    this.addContext();
    this.addContext();
  },  

  addContext: function(){
    this.contexts.push({
      items: []
    })
  },

  switchContext: function(c){
    for(var i = 0; i < this.items().length; i++)
    {
      this.items()[i].hide()
    }

    this._current_context = c

    for(var i = 0; i < this.items().length; i++)
    {
      this.items()[i].show()
    }
  },

  inventoryBounds: function(w,h,ox,oy)
  {
    this._inventoryWidth = w;
    this._inventoryHeight = h;
    this._inventoryOffsetX = ox;
    this._inventoryOffsetY = oy;

    return this
  },

  drawInventory: function(){
    for (var x = this._inventoryOffsetX; x < this._inventoryOffsetX + this._inventoryWidth; x++) {
      for (var y = this._inventoryOffsetY; y < this._inventoryOffsetY + this._inventoryHeight; y++) {
        var at_edge = x == this._inventoryOffsetX || x == this._inventoryOffsetX + this._inventoryWidth - 1 || y == this._inventoryOffsetY || y == this._inventoryOffsetY + this._inventoryHeight - 1;

        if (at_edge) {


          // Place a tree entity at the current tile
          Crafty.e('Block')
            .attr({
              x: x * Game.map_grid.tile.width,
              y: y * Game.map_grid.tile.height,
              w: Game.map_grid.tile.width,
              h: Game.map_grid.tile.height
            })
        }
      }
    }
    return this
  },

  addItem: function(data) {
    if(typeof data === "number")
    {
      return this.addInteger(data)  
    } else if (typeof data == "object" && data.length != undefined) {
      return this.addArray(data)  
    } else {
      //Shouldn't get here ever.
      alert("Error.  Inventory could not recognize that data.")
    }
    
    
  },


  addArray: function(data){
    var blocks = []
    var last_block = undefined;
    for(var i = 0; i < data.length; i++)
    {
      var block = this.addInteger(data[i]);
      if(last_block == undefined)
      {
        last_block = block;
      } else {
        last_block.link(block);
        last_block = block
      }

      blocks.push(block)
    }        

    return blocks
  },


  addInteger: function(data){
     var centering = -1;
     if (data < 10)
         centering = 3

     var border_size = 2        
     var text = Crafty.e('2D, Canvas, Text, Hideable')
        .attr({
           x: this.slotX() + border_size,
           y: this.slotY() - 3 + border_size,
           w: Game.inventory_grid.tile.width - border_size*2,
           h: Game.inventory_grid.tile.height - border_size*2,
           z: 2
         })
         .textFont({ type: 'italic', family: 'Arial', size: '10px', weight: 'bold' })
         .textColor("#FFFFFF")
         .text(data)

     var block = Crafty.e('Item')
       .attr({
           x: this.slotX() + border_size,
           y: this.slotY() + border_size,
           w: Game.inventory_grid.tile.width - border_size*2,
           h: Game.inventory_grid.tile.height - border_size*2,
           z: 1
        })
        .color("red")
        .attach(text)
        .border({size: border_size, color:"white"})

        this.items().push(block)
      
        var me = this

        block.bind("DoubleClick", function(){me.select(block)})
    this._slotNumber++;

    return block
  },

  slotX: function(){
    var ret = (this._slotNumber % (this._inventoryWidth - 2))
        * (Game.inventory_grid.tile.width)
       
        + (this._inventoryOffsetX + 1) * Game.inventory_grid.tile.width 
    return ret
  },

  slotY: function(){
    var ret = (Math.floor(this._slotNumber / (this._inventoryWidth - 2)) + 1)
        * (Game.inventory_grid.tile.width)


    return ret
  },

  _slotNumber: 0,

  select: function(item) {
    for(var i = 0; i < this.items().length; i++)
    {
      this.items()[i].unselect() 
    }

    for(var i = 0; i < this.items().length; i++)
    {
      if(this.items()[i] == item)
        if(this.items()[i].has('Linkable'))
        {
          var curr = this.items()[i]
          while(curr != undefined)
          {
            curr.select();
            curr = curr._next;
          }

          curr = this.items()[i]
          while(curr != undefined)
          {
            curr.select();
            curr = curr._prev;
          }
        } 
        else
          this.items()[i].select()
    }
  },
  
  contexts: [],
  _current_context: 0,

  currentContext: function()
  {
    return this.contexts[this._current_context]
  },

  items: function(){
    return this.currentContext().items
  }


});

