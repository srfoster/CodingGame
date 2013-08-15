Crafty.c("Inventory", {
  init: function(){
  },  

  addContext: function(){
    this.contexts.push({
      items: []
    })

    return (this.contexts.length - 1)
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
    return game().createAndLog(function(game){
        if(typeof data === "number" || typeof data === "string"){
          return game.addInteger(data)  
        } else if(typeof data === "boolean") {
          return game.addBoolean(data)  
        } else if (typeof data == "object" && data.length != undefined) {
          return game.addArray(data)  
        } else {
          //Shouldn't get here ever.
          alert("Error.  Inventory could not recognize that data.")
        }
    })
  },

  addItemNoLog: function(data) {
        if(typeof data === "number" || typeof data === "string"){
          return this.addInteger(data)  
        } else if(typeof data === "boolean") {
          return this.addBoolean(data)  
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

      var block = this.addItemNoLog(data[i])

      if(last_block == undefined)
      {
        last_block = block;
      } else {
        last_block.link(block);
        last_block = block
      }

      blocks.push(block)
    }        
    
    //Add the empty list at the end
    var block = this.addEmpty();
    if(last_block)
        last_block.link(block);
    blocks.push(block)

    return blocks
  },

  addEmpty: function(){
     var border_size = 2        

     var block = Crafty.e('Item')
       .attr({
           x: this.slotX() + border_size,
           y: this.slotY() + border_size,
           w: Game.inventory_grid.tile.width - border_size*2,
           h: Game.inventory_grid.tile.height - border_size*2,
           z: 1
        })
        .color("black")
        .border({size: border_size, color:"white"})
        
     block.is_empty = true

        this.items().push(block)
      
        var me = this

        block.bind("DoubleClick", function(){me.select(block)})
    this._slotNumber++;

    return block
  },

  addBoolean: function(data){
     var bool_letter = ""
     if(data)
       bool_letter = "T"
     else
       bool_letter = "F"
      
     var centering = -1;

     var border_size = 2        

     var me = this
     var block = 
           Crafty.e('Item')
           .attr({
               x: me.slotX() + border_size,
               y: me.slotY() + border_size,
               w: Game.inventory_grid.tile.width - border_size*2,
               h: Game.inventory_grid.tile.height - border_size*2,
               z: 1
            })
            .color("teal")
            .border({size: border_size, color:"white"})
            .setText(bool_letter)

            block.type = "boolean"

       this.items().push(block)

        block.bind("DoubleClick", function(){me.select(block)})
    this._slotNumber++;

    return block
  },

  addInteger: function(data){
     var centering = -1;
     if (data < 10)
         centering = 3

     var border_size = 2        

     var me = this

     var block = 
           Crafty.e('Item')
           .attr({
               x: me.slotX() + border_size,
               y: me.slotY() + border_size,
               w: Game.inventory_grid.tile.width - border_size*2,
               h: Game.inventory_grid.tile.height - border_size*2,
               z: 1
            })
            .color("red")
            .border({size: border_size, color:"white"})
            .setText(data)

            me.items().push(block)


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
    game().createAndLog(function(game){

        game.selectedItems = []
        for(var i = 0; i < game.items().length; i++)
        {
          game.items()[i].unselect() 
        }

        for(var i = 0; i < game.items().length; i++)
        {
          if(game.items()[i][0] == item[0])
          {
            if(game.items()[i].has('Linkable'))
            {
              //Seek to the first item in the list
              var curr = game.items()[i]
              while(curr._prev != undefined)
              {
                curr = curr._prev;
              }

              //Traverse list and select all elements
              while(curr != undefined)
              {
                curr.select();
                game.selectedItems.push(curr)
                curr = curr._next;
              }

            } 
            else
            {
              game.selectedItems.push(game.items()[i])
              game.items()[i].select()
            }
         }
       }
   })
  },
  
  contexts: [],
  _current_context: 0,

  currentContext: function()
  {
    return this.contexts[this._current_context]
  },

  items: function(){
    return this.currentContext().items
  },

  selectedItems: []

});

