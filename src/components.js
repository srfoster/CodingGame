Crafty.c("Game", {
  init: function(){
    this.requires("World, Inventory")

    the_game = this

    this.worldBounds(Game.map_grid.width, Game.map_grid.height, 0, 0)
    .drawWorld()
    .inventoryBounds(Game.inventory_grid.width, Game.inventory_grid.height, Game.map_grid.width, 0)
    .drawInventory()

    this.Crafty = Crafty

    console.log("Started Game "+myId())

    if(top.callbacks && top.callbacks[myId()])
      top.callbacks[myId()]()

  },

  findByRecordingId: function(id){
    for(var i=0;i<this.recordables.length;i++)
    {
      if(this.recordables[i]._recordingId == id)
        return this.recordables[i]
    }
  },
 
  return_type: "Int",

  players: [],

  recordables: [],

  _replayMode: false,

  next_var_name: 0,
  
  createPlayer: function(){
    return this.createAndLog(function(game){
      var player = game.Crafty.e('PlayerCharacter').at(20, 5)

      if(game.input)
         game.addItem(game.input, "input")

      player._recordingId = "Player"
    })
  },

  createChest: function(name, x, y){
    return this.createAndLog(function(game){
      var chest = game.Crafty.e(name)
      chest._recordingId = "Chest" + game.recordables.length

      if(x && y)
      {
        chest.attr({
          x: x,
          y: y
        })
      }
    })
  },

  log: function(fun){
     game()._recordedMoves.push({type: "create", create: fun})
  },

  createAndLog: function(fun){
     game()._recordedMoves.push({type: "create", create: fun})
     return fun(this)
  },

  _recordedMoves: [],

  _replayStreams: [],

  //The match condition
  condition: function(){ return true },

  addReplayStream: function(condition,stream){
    this._replayStreams.push({
      condition: condition,
      stream: stream
    }); 
  },

  replay: function(){
    console.log("Replaying in " + myId())
    console.log("Input is:")
    console.log(this.input)

    for(var i=0; i<this._replayStreams.length; i++)
    {
      var cond_stream = this._replayStreams[i]
      if(cond_stream.condition(this))
      {
        this.replayMoves(cond_stream.stream)
        return
      }
    }
  },

  stopReplay: function(){
    clearInterval(this.replay_interval)
  },

  replayMoves: function(moves){
    this._replayMode = true
    if(moves.length == 0)
        return;

    var me = this
    this.replay_interval = setInterval(function(){me.replayMove(moves)}, 10)
  },

  current_move: 0,

  replayMove: function(moves){
    var move = moves[this.current_move++]

    if(move == undefined)
        clearInterval(this.replay_interval)

    if(move.type == "move")
    {
        if(!move.id || !move.obj(game()))
           return

        if(!move.obj(game()).disableRecording)
           return


        //Turn off gravity
        if(move.obj(game()).antigravity)
            move.obj(game()).antigravity()

        //Turn off user input
        if(move.obj(game()).disableControl)
            move.obj(game()).disableControl()

        //Turn off recording
        move.obj(game()).disableRecording()

        if(move.obj(game()).x != move.x)
            move.obj(game()).x = move.x

        if(move.obj(game()).y != move.y)
            move.obj(game()).y = move.y
    } else if (move.type == "create"){
        move.create(game())
    }
  }


});


Crafty.c('Chest', {
  init: function(){
    var me = this

    this.requires('2D, Canvas, Color, Particles, Draggable, Recordable')
    //.particles()
    .attr({
        x: 50,
        y: 50,
        w: 50,
        h: 50
     })
     .color("rgba(0,0,0,0)")
     .bind("Draw", function(obj){this._draw(obj)})
     .particles({
        maxParticles: 10,
        offsets:{x: 15, y: 15},
        gravity:{x: 0, y: 0},
        angle: 0,
        startColour: [0, 131, 255, 1],
        startColourRandom: [48, 50, 45, 0],
        endColour: [0, 35, 245, 0],
        endColourRandom: [60, 60, 60, 0],
      })
      .bind("EnterFrame", function(){this.recordMove(me)})
     
     this.ready = true
  },

  _draw: function(obj){
    var context = obj.ctx

    context.beginPath();
    context.arc(this.x + this.w/2, this.y + this.h/2, this.w/2 - 1, 0, 2 * Math.PI, false);
    context.fillStyle = this._fill_color;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = 'rgba(255, 255, 255, 1)';
    context.stroke();
  },

  fillColor: function(color){
    this._fill_color = color
    this.trigger("Change")
    return this
  },

  activateWithCooldown: function(avatar){
    if(this._ready)
    {
      this._ready = false
      this._Particles.size = 5


      if(this.activate(avatar))
      {
          Crafty.audio.play("chest",1,1)
          Crafty.audio.add({
              chest: ["assets/beep1.mp3"]
          })
      }

    }
  },

  reactivate: function(){
    var me = this
    setTimeout(function(){
        me._ready = true
        me._Particles.size = 18
    }, this.cooldown * 1000);
  },

  cooldown: 2,

  _ready: true
})

Crafty.c('ForkChest', {
  init: function(){
    this.requires("Chest")
  },

  activate: function(player){
    if(!game().selectedItems[0] || game().selectedItems[0].type != "boolean")
      return;

    var new_player = Crafty.e('PlayerCharacter').attr(
      {
        x: this.x, 
        y: this.y
      });

    game().switchContext(new_player._inventory_context)
    game().addItem(game().selectedItems[0].history.counter_argument, game().selectedItems[0].history.argument.inventory_group_name)
    game().switchContext(player._inventory_context)

    return true
  }
});

Crafty.c('BinOpChest', {
  init: function(){
    this.requires("Chest")
  },

  activate: function(player){
    if(game()._replayMode)
      return;

    if(!game().selectedItems[0])
      return


    if(this.first_number_group == undefined)
    {

      if(this.var_1_type == "Int")
      {
        if(game().selectedItems[0]._next || game().selectedItems[0].is_empty) //Ignore if the player has a list selected
          return
      } else if(this.var_1_type == "List") {
        if(!(game().selectedItems[0]._next || game().selectedItems[0].is_empty)) //Ignore if the player has a list selected
          return
      }

       this.first_number_group = game().selectedItems[0].inventory_group_name
       this.fillColor(this._fill_color.replace("0.5","0.9"))
       return
     }

      if(this.var_2_type == "Int")
      {
        if(game().selectedItems[0]._next || game().selectedItems[0].is_empty) //Ignore if the player has a list selected
          return
      } else if(this.var_2_type == "List") {
        if(!(game().selectedItems[0]._next || game().selectedItems[0].is_empty)) //Ignore if the player has a list selected
          return
      }

     var first_number_group = this.first_number_group
     var second_number_group = game().selectedItems[0].inventory_group_name


     var me = this

    game().createAndLog(function(game){
        var next_group = ""+ game.next_var_name++
        console.log("x"+next_group + " = " + first_number_group + " + " + second_number_group) 

        me.operation(next_group, first_number_group, second_number_group, game)

        me.first_number_group = undefined;
        me.second_number_group = undefined;
        me.fillColor(me._fill_color.replace("0.9","0.5"))
    })
    return true
  },

  first_number_group: undefined
});



Crafty.c('AddChest', {
  init: function(){
    this.requires("BinOpChest, spr_add_chest")

    this._Particles.maxParticles = 0
    this.fillColor("rgba(255,255,20,0.5)")
  },

  var_1_type: "Int",
  var_2_type: "Int",

  operation: function(assign_var, var_1, var_2, game){
    var first_number = parseInt(game.jsify(game.getByGroupName(var_1)))
    var second_number = parseInt(game.jsify(game.getByGroupName(var_2)))

    if(isNaN(first_number) || isNaN(second_number))
      answer = "?"
    else
      answer = first_number + second_number

    game.addItem(answer, assign_var) 
  }
});

Crafty.c('MultChest', {
  init: function(){
    this.requires("BinOpChest, spr_mult_chest")

    this._Particles.maxParticles = 0
    this.fillColor("rgba(200,255,100,0.5)")
  },

  var_1_type: "Int",
  var_2_type: "Int",

  operation: function(assign_var, var_1, var_2, game){
    var first_number = parseInt(game.jsify(game.getByGroupName(var_1)))
    var second_number = parseInt(game.jsify(game.getByGroupName(var_2)))

    if(isNaN(first_number) || isNaN(second_number))
      answer = "?"
    else
      answer = first_number * second_number

    game.addItem(answer, assign_var) 
  }
});


Crafty.c('MaxChest', {
  init: function(){
    this.requires("BinOpChest, spr_max_chest")

    this._Particles.maxParticles = 0
    this.fillColor("rgba(255,150,200,0.5)")
  },

  var_1_type: "Int",
  var_2_type: "Int",

  operation: function(assign_var, var_1, var_2, game){
    var first_number = parseInt(game.jsify(game.getByGroupName(var_1)))
    var second_number = parseInt(game.jsify(game.getByGroupName(var_2)))

    var max = function(x,y){
      if(x > y)
        return x
      return y
    }

    if(isNaN(first_number) || isNaN(second_number))
      answer = "?"
    else
      answer = max(first_number, second_number)

    game.addItem(answer, assign_var) 
  }
});


//1 concat 2 = [1,2]
Crafty.c('ConcatChest', {
  init: function(){
    this.requires("BinOpChest, spr_cat_chest")

    this._Particles.maxParticles = 0
    this.fillColor("rgba(100,255,100,0.5)")
  },

  var_1_type: "Int",
  var_2_type: "Int",

  operation: function(assign_var, var_1, var_2, game){
    var first_number = parseInt(game.jsify(game.getByGroupName(var_1)))
    var second_number = parseInt(game.jsify(game.getByGroupName(var_2)))

    game.addItem([first_number, second_number], assign_var) 
  }
});

//1 cons [2,3] = [1,2,3]
Crafty.c('ConsChest', {
  init: function(){
    this.requires("BinOpChest, spr_con_chest")

    this._Particles.maxParticles = 0
    this.fillColor("rgba(100,255,255,0.5)")
  },

  var_1_type: "Int",
  var_2_type: "List",

  operation: function(assign_var, var_1, var_2, game){
    var first_number = parseInt(game.jsify(game.getByGroupName(var_1)))
    var list = game.jsify(game.getByGroupName(var_2))

    list.unshift(first_number)

    game.addItem(list, assign_var) 
  }
});

//[2,3] cons 1 = [2,3,1]
Crafty.c('RConsChest', {
  init: function(){
    this.requires("BinOpChest, spr_rcon_chest")

    this._Particles.maxParticles = 0
    this.fillColor("rgba(100,50,255,0.5)")
  },

  var_1_type: "List",
  var_2_type: "Int",

  operation: function(assign_var, var_1, var_2, game){
    var list = game.jsify(game.getByGroupName(var_1))
    var second_number = parseInt(game.jsify(game.getByGroupName(var_2)))

    list.push(second_number)

    game.addItem(list, assign_var) 
  }
});

Crafty.c('IsListEmptyChest', {
  init: function(){
    this.requires("Chest, spr_emp_chest")

    this._Particles.maxParticles = 0
    this._Particles.startColour = [100, 255, 0, 1]
    this._Particles.startColourRandom = [48, 50, 45, 0]
    this._Particles.endColour = [100, 245, 0, 0]
    this._Particles.endColourRandom = [60, 60, 60, 0]

    this.fillColor("rgba(0,255,20,0.5)")
  },

  activate: function(){
    if(game()._replayMode)
      return

    if(!game().selectedItems[0])
      return

    var group = game().selectedItems[0].inventory_group_name

    game().createAndLog(function(game){

      var list = game.getByGroupName(group)

      if(list.length == 1 && list[0].is_empty)
      {
        var item = game.addItem(true, ""+game().next_var_name++)
        item.history = {
          predicate: "isEmpty",
          argument: list[0],
          counter_argument: [1,2,3]
        }
      } else {
        var item = game.addItem(false, ""+game().next_var_name++)
        item.history = {
          predicate: "isEmpty",
          argument: list,
          counter_argument: []
        }
     }
    });
    return true
  }
});

Crafty.c('HeadChest', {
  init: function(){
    this.requires("Chest, spr_pop_chest")

    this._Particles.maxParticles = 0
    this._Particles.startColour = [255, 0, 0, 1]
    this._Particles.startColourRandom = [48, 50, 45, 0]
    this._Particles.endColour = [245, 0, 0, 0]
    this._Particles.endColourRandom = [60, 60, 60, 0]

    this.fillColor("rgba(255,20,20,0.5)")
  },

  activate: function(){
    if(game()._replayMode)
      return

    if(game().selectedItems[0] && game().selectedItems[0].has("Linkable"))
    {
      var group = game().selectedItems[0].inventory_group_name

      game().createAndLog(function(game){
        game.getByGroupName(group)[0].unlinkNext()

        var next_group_name = game.next_var_name++
        console.log("x"+next_group_name+"="+game.jsify(game.getByGroupName(group)[0]))
        game.getByGroupName(group)[0].inventory_group_name = ""+next_group_name
        game.getByGroupName(group)[0].trigger("DoubleClick")
      })
      return true
    }

  }
});


Crafty.c('ConstantChest', {
  init: function(){
    this.requires("Chest, spr_inp_chest")

    this._Particles.maxParticles = 0
    this._Particles.startColour = [255, 0, 0, 1]
    this._Particles.startColourRandom = [48, 50, 45, 0]
    this._Particles.endColour = [245, 0, 0, 0]
    this._Particles.endColourRandom = [60, 60, 60, 0]

    this.fillColor("rgba(255,20,244,0.5)")

    //Use the global hack
    after_constant_entered = this.after_enter
  },

  activate: function(){
    if(game()._replayMode)
      return

    document.getElementById("input").style.zIndex = "1"
    document.getElementById("get_constant").style.display = "block"

    return true
  },

  after_enter: function(constant){
    document.getElementById("input").style.zIndex = "-1"
    document.getElementById("get_constant_input").value = ""
    document.getElementById("get_constant").style.display = "none"
    game().createAndLog(function(game){
      game.addItem(constant, "" + game.next_var_name++)
    });
  }
});

Crafty.c('RecursionChest', {
  init: function(){
    this.requires("Chest, spr_rec_chest")

    this._Particles.maxParticles = 0
    this._Particles.startColour = [255, 0, 0, 1]
    this._Particles.startColourRandom = [48, 50, 45, 0]
    this._Particles.endColour = [245, 0, 0, 0]
    this._Particles.endColourRandom = [60, 60, 60, 0]

    this.fillColor("rgba(0,0,0,0.5)")
  },

  activate: function(){
    if(game()._replayMode)
      return

    if(!game().selectedItems[0])
      return;

    var group = game().selectedItems[0].inventory_group_name
    var list = game().jsify(game().getByGroupName(group))

    //Should add an item of the type returned by main()
    var answer = undefined

    if(runtime().oracle())
      answer = runtime().oracle().sum(list);
    
    if(answer)
      game().addItem(answer, "" + game().next_var_name++);
    else
    {
      if(game().return_type == "Int")
          game().addItem("?", "" + game().next_var_name++);
      if(game().return_type == "List")
          game().addItem(["?"], "" + game().next_var_name++);
    }

    console.log("Added ? at " + (game().next_var_name - 1))


    //Record recursive call
    game().log(function(game){
      var to_pass = game.getByGroupName(group)  
      //The value in the appropriate variable must be the input
      // for another copy of this game.
      
      //Pass it up to the runtime to create the new instance
      // and start it.  And to pause this instance
      runtime().functionCall(game, game, game.jsify(to_pass))  
    });

    return true
  }
});



Crafty.c('ReturnChest', {
  init: function(){
    this.requires("Chest, spr_ret_chest")

    this._Particles.maxParticles = 0
    this._Particles.startColour = [255, 0, 0, 1]
    this._Particles.startColourRandom = [48, 50, 45, 0]
    this._Particles.endColour = [245, 0, 0, 0]
    this._Particles.endColourRandom = [60, 60, 60, 0]

    this.fillColor("rgba(255,255,255,0.5)")
  },

  activate: function(){
    if(game()._replayMode)
      return

    if(!game().selectedItems[0])
      return;

    //Record recursive call
    var group = game().selectedItems[0].inventory_group_name

    game().log(function(game){
      var to_pass = game.getByGroupName(group)  
      runtime().ret(game.jsify(to_pass))  
    });

    runtime().done(myId()) 

    return true
  }
});


Crafty.c('Hideable', {
  hide: function(){
    this.visible = false

    //Turn off gravity
    if(this.antigravity)
        this.antigravity()

    //Turn off user input
    if(this.disableControl)
        this.disableControl()

    //Turn off recording
    if(this.disableRecording)
        this.disableRecording()

    //Turn off dragging
    if(this.disableDrag)
        this.disableDrag()

    //Turn off linking
    if(this.hideLink)
        this.hideLink()

    //Turn off selection
    if(this.unselect)
    {
        this._was_selected = this.selected()
        this.unselect()
    }

    for(var i=0; i < this._children.length; i++)
    {
      var child = this._children[i]
      if(child.hide != null)
          child.hide()
    }
  },

  show: function(){
    this.visible = true

    //Turn on gravity
    if(this.gravity)
        this.gravity()

    //Turn on user input
    if(this.enableControl)
        this.enableControl()

    //Turn on recording
    if(this.enableRecording)
        this.enableRecording()

    //Turn on dragging
    if(this.enableDrag)
        this.enableDrag()

    //Turn on linking
    if(this.showLink)
        this.showLink()

    if(this.select && this._was_selected)
        this.select()

    for(var i=0; i < this._children.length; i++)
    {
      var child = this._children[i]
      if(child.show != null)
          child.show()
    }
  }

})


Crafty.c('Selectable', {
  init: function(){
    this.requires('Particles');

    this.options = {
        maxParticles: 10,
        size: 0,
        sizeRandom: 0,
        speed: 0,
        speedRandom: 0,
        lifeSpan: 10,
        lifeSpanRandom: 7,
        angle: 0,
        startColour: [255, 255, 0, 0.1],
        startColourRandom: [48, 50, 45, 0],
        endColour: [255, 100, 0, 0],
        endColourRandom: [60, 60, 60, 0],
        sharpness: 20,
        sharpnessRandom: 10,
        spread: 5,
        duration: -1,
        fastMode: false,
        jitter: 0,
        offsets: {x: -16, y: -16}
    } 

    this.particles(this.options)

  },

  select: function(){
    this._Particles.size = 50
    this._Particles.sizeRandom = 4
  },

  unselect: function() {
    this._Particles.size = 0
    this._Particles.sizeRandom = 0
  },

  toggle: function(){
    if(!this.selected())
      this.select();
    else
      this.unselect();
  },

  selected: function(){
    return this._Particles.size != 0
  }

});

Crafty.c('Item', {
  init: function(){
    var me = this

    this.requires('Block, Draggable, Linkable, Selectable, Mouse')
    //.bind("EnterFrame", function(){this.recordMove(me)})

  },

  setText: function(data){
    var text = Crafty.e('2D, Canvas, Text, Hideable')
    .attr({
       x: this._x,
       y: this._y - 2,
       w: Game.inventory_grid.tile.width - this.border_size*2,
       h: Game.inventory_grid.tile.height - this.border_size*2,
       z: 2
     })
     .textFont({ type: 'italic', family: 'Arial', size: '10px', weight: 'bold' })
     .textColor("#FFFFFF")
     .text(data)

    this.attach(text)
    return this
  }

})

Crafty.c('Line', {
  init: function(){
    this.requires("2D, Canvas")
    .bind("EnterFrame", this.drawLine)

    this.z = -100
  },
  from_x : function(x){
//    this.x = x
    this._from_x = x 
  },
  from_y : function(y){
//    this.y = y
    this._from_y = y
  },
  to_x : function(x){
//    this.w =  x - this.x
    this._to_x = x
  },
  to_y : function(y){
//    this.h =  y - this.y
    this._to_y = y
  },
  drawLine: function(){
    if(!this.visible) return;

    var ctx = Crafty.canvas.context;
       ctx.strokeStyle = "white";
       ctx.beginPath();
       ctx.lineWidth = 1;
       ctx.moveTo(this._from_x, this._from_y);
       ctx.lineTo(this._to_x, this._to_y);
       ctx.closePath(); 
       ctx.stroke();
  }
})

Crafty.c('Linkable', {
  link: function(other){
    this._next = other
    other._prev = this

    var me = this;
    this.line_to_next = Crafty.e("Line")
    this.bind("Move", function(){
      Crafty.DrawManager.drawAll()
      if(!this.visible || !me.line_to_next) return;
      me.line_to_next.from_x(me._x+8)
      me.line_to_next.from_y(me._y+8)
      me.line_to_next.to_x(other._x+8)
      me.line_to_next.to_y(other._y+8)
    });
    other.bind("Move", function(){
      Crafty.DrawManager.drawAll()
      if(!this.visible || !me.line_to_next) return;
      me.line_to_next.from_x(me._x+8)
      me.line_to_next.from_y(me._y+8)
      me.line_to_next.to_x(other._x+8)
      me.line_to_next.to_y(other._y+8)
    });
  },

  unlinkNext: function(){
    if(this._next)
        this._next._prev = undefined;

    this._next = undefined;

    if(this.line_to_next)
        this.line_to_next.visible = false

    this.trigger("Move")
  },

  hideLink: function(){
    if(this.line_to_next)
      this.line_to_next.visible = false
    this.trigger("Move")
  },

  showLink: function(){
    if(this.line_to_next)
        this.line_to_next.visible = true
  },

  _next: undefined
})

Crafty.c('Grid', {
  init: function() {
    this.attr({
      w: Game.map_grid.tile.width,
      h: Game.map_grid.tile.height
    })
  },
 
  at: function(x, y) {
    if (x === undefined && y === undefined) {
      return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
    } else {
      this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
      return this;
    }
  }
});

Crafty.c("Recordable", {
  init: function(){
    this._recordingEnabled = true

    game().recordables.push(this)
  },

  recordMove: function(obj){
    if(this._replayMode)
      return

    if(this._recordingEnabled)
    {
        var move = {type: "move", x:this._x,y:this._y, id: obj._recordingId, obj: function(game){return game.findByRecordingId(this.id)}}

        var last_move = this.lastMoveFor(move.id)



        if(last_move == undefined || last_move.x != move.x || last_move.y != move.y)
        {
          game()._recordedMoves.push(move)
        }
    }
  },

  lastMoveFor: function(id){
    if(game()._recordedMoves == undefined || game()._recordedMoves.length == 0)
        return undefined;

    for(var i = game()._recordedMoves.length - 1; i--; i > 0)
    {
      if(game()._recordedMoves[i].id == id)
          return game()._recordedMoves[i]
    }
  },

  disableRecording: function(){
    this._recordingEnabled = false
  },

});

Crafty.c('Actor', {
  init: function() {
    this.requires('2D, Canvas, Grid');
  },
});
 
Crafty.c('Border', {
  init: function() {
    this.requires('Actor, Color, Solid')
      .color('rgb(20, 185, 40)');
  },

  border: function(options){
    border = Crafty.e("Block")
      .attr({
        x: this._x - options.size,
        y: this._y - options.size,
        w: this._w + options.size*2,
        h: this._h + options.size*2,
        z: this._z - 1
      })
      .color(options.color)

    this.attach(border)
    this.border_size = options.size
    return this
  }
})
 
Crafty.c('Block', {
  init: function() {
    this.requires('Actor, Color, Solid, Border, Hideable')
      .color('rgb(20, 185, 40)')
  }
});

Crafty.c('PlayerCharacter', {
  init: function() {
    var me = this

    this.requires('Actor, Fourway, Color, Collision, Gravity, Recordable, Selectable, Hideable, Mouse')
      .fourway(4)
      .color('rgb(20, 75, 40)')
      .onHit('Solid', this.stopMovement)
      .stopOnSolids()
      .onHit('Village', this.visitVillage)
      .gravity("Solid")
      .gravityConst(.1)
      .onHit("Chest", this.triggerChest)
      .bind("Change", this.triggerChestExit)
      .bind("DoubleClick", this.selectPlayer)
      .bind("EnterFrame", function(){this.recordMove(me)})


     //If it's the first player, give them the default context
     if(game().contexts.length == 1)
       this.setContext(0) 

     //Otherwise, make a new context in the inventory
     else
       this.setContext(game().addContext())

     this.disableControls = true

     character = this;

     game().players.push(this)

  },

  setContext: function(c){
    this._inventory_context = c 
  },

  // Registers a stop-movement function to be called when
  //  this entity hits an entity with the "Solid" component
  stopOnSolids: function() {
    this.onHit('Solid', this.stopMovement);
 
    return this;
  },
 
  // Stops the movement
  stopMovement: function() {
    this._speed = 0;
    if (this._movement) {
      this.x -= this._movement.x;
      this.y -= this._movement.y;
    }
  },

  triggerChest: function(data){
    this._last_chest = data[0].obj
    this._last_chest.activateWithCooldown(this);
  },


  triggerChestExit: function(){
    //So we don't keep activating the chest over and over
    if(!this.hit("Chest") && this._last_chest)
    {
        this._last_chest.reactivate();
        this._last_chest = undefined
    }
  },

  _last_chest: undefined,

  unselectPlayer: function(){
      this.unselect()
      this.disableControls = true
      this._control_enabled = false
  },

  selectPlayer: function(){
      var players = game().players
      for(var i = 0; i < players.length; i++)
      {
        players[i].unselectPlayer()
      }

      this.select()
      this.disableControls = false
      this._control_enabled = true
      game().switchContext(this._inventory_context)
  },

  _control_enabled: false



});

