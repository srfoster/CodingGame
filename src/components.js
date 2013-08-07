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

    this.requires('Block, Draggable, Linkable, Recordable, Selectable, Mouse')
    .bind("EnterFrame", function(){this.recordMove(me)})
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
    var line = Crafty.e("Line")
    this.line_to_next = line
    this.bind("Move", function(){
      Crafty.DrawManager.drawAll()
      if(!this.visible) return;
      line.from_x(me._x+8)
      line.from_y(me._y+8)
      line.to_x(other._x+8)
      line.to_y(other._y+8)
    });
    other.bind("Move", function(){
      Crafty.DrawManager.drawAll()
      if(!this.visible) return;
      line.from_x(me._x+8)
      line.from_y(me._y+8)
      line.to_x(other._x+8)
      line.to_y(other._y+8)
    });
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
  },

  _recordedMoves: [], //Crafty is weird.  This array ends up shared by all Recordables

  recordMove: function(obj){
    if(this._recordingEnabled)
        this._recordedMoves.push({x:this._x,y:this._y, obj: obj})
  },

  disableRecording: function(){
    this._recordingEnabled = false
  },

  replayMoves: function(){

    this._replay(this._recordedMoves)
  },

  _replay: function(moves){
    if(moves.length == 0)
        return;


    for(var i = 0; i < moves.length; i++)
    {
        (function(i, moves){
            setTimeout(function(){
                var move = moves[i]

                //Turn off gravity
                if(move.obj.antigravity)
                    move.obj.antigravity()

                //Turn off user input
                if(move.obj.disableControl)
                    move.obj.disableControl()

                //Turn off recording
                move.obj.disableRecording()

                move.obj.x = move.x
                move.obj.y = move.y
            }, i*10);
        })(i,moves)

    }



  }
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
    return this
  }
})
 
Crafty.c('Block', {
  init: function() {
    this.requires('Actor, Color, Solid, Border, Recordable, Hideable')
      .color('rgb(20, 185, 40)')
  }
});

Crafty.c('PlayerCharacter', {
  init: function() {
    var me = this

    this.requires('Actor, Fourway, Color, Collision, Gravity, Recordable, Selectable, Hideable')
      .fourway(4)
      .color('rgb(20, 75, 40)')
      .onHit('Solid', this.stopMovement)
      .stopOnSolids()
      .onHit('Village', this.visitVillage)
      .gravity("Solid")
      .gravityConst(.1)
      .bind("EnterFrame", function(){this.recordMove(me)});

     character = this;

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
  }


});

