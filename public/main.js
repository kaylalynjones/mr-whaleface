var game = new Phaser.Game(550, 685, Phaser.AUTO, 'gameboard');

//  The Google WebFont Loader will look for this object, so create it before loading the script.
WebFontConfig = {

    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    active: function() { game.time.events.add(Phaser.Timer.SECOND, createText, this); },

    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
      families: ['Slackey']
    }

};
var start = {
  preload: function(){
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    game.load.image('bkgrd', 'assets/bkgrd.png');
    //game.load.image('character', 'assets/whale-lrg.png');
    game.load.spritesheet('whale', 'assets/whale-sprite.png', 193, 100);
    game.load.image('shell', 'assets/shell.png');
    game.load.image('start', 'assets/start.png');
  },
  create: function(){
    this.background = this.game.add.sprite(0, 0, 'bkgrd');
    this.character = this.game.add.sprite(120, 100, 'whale');
    //this.character = this.game.add.sprite(120, 100, 'character');
    this.character.animations.add('swim', [1,2,3], 5, true);
    game.physics.arcade.enable(this.character);
    this.character.body.velocity.x = 0;
    this.character.body.velocity.y = 0;
    this.start = this.game.add.button(175, 275, 'start', startGame);
    this.character.scale.x = 1.5;
    this.character.scale.y = 1.5;
    this.shell = this.game.add.sprite(130, 400, 'shell');
    this.title = game.add.text(50, 30, 'Mr. Whaleface', {font: '52px Slackey', fill: '#eee'});
  },
  update: function(){
    this.character.animations.play('swim');
  }
};

function startGame(){
  game.state.start('main');
}
//*****************************************************************
var mainState = {
  preload: function(){
    game.stage.backgroundColor = '#71c5cf';
    game.load.image('bkgrd', 'assets/bkgrd.png');
    game.load.spritesheet('whale', 'assets/whale-sprite.png', 193, 100);
    game.load.image('rock','assets/rock.png');
    game.load.image('anchor', 'assets/anchor.png');
    game.load.audio('splat', 'assets/jab.mp3');
    game.load.audio('jump', 'assets/water-drop.mp3');
  },
  create: function(){
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.background = this.game.add.sprite(0, 0, 'bkgrd');

    this.rocks = game.add.group();
    this.rocks.enableBody = true;
    this.rocks.createMultiple(20, 'rock');
    this.rocks.forEach(function(rock){
      rock.body.width = 20;
    });
    this.timer = game.time.events.loop(2500, this.addObstacle, this);

    this.anchors = game.add.group();
    this.anchors.enableBody = true;
    this.anchors.createMultiple(20, 'anchor');
    this.anchors.forEach(function(anchor){
      anchor.body.width = 1;
      anchor.anchor.setTo(0.5, 1);

    });

    this.whale = this.game.add.sprite(100, 245, 'whale');
    this.whale.animations.add('swim', [1,2,3], 5, true);
    game.physics.arcade.enable(this.whale);
    this.whale.body.gravity.y = 1000;
    this.whale.scale.x = 0.5;
    this.whale.scale.y = 0.5;
    var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.jump, this);
    this.whale.anchor.setTo(-0.2, 0.5);
    this.whale.body.height = 5;

    this.score = -1;
    this.labelScore = game.add.text(40, 20, '0', {font: '30px Arial', fill: '#ffffff'});
    this.splatSound = game.add.audio('splat');
    this.jumpSound= game.add.audio('jump');

  },
  update: function(){
    if(this.whale.inWorld === false){
      this.splatSound.play();
      this.whale.alive = false;
      game.state.start('start');

    }
    game.physics.arcade.overlap(this.whale, this.rocks, this.hitObstacle, null, this);
    game.physics.arcade.overlap(this.whale, this.anchors, this.hitObstacle, null, this);

    if(this.whale.angle < 5)
      this.whale.angle += 1;
    this.whale.animations.play('swim');
  },
  jump: function(){
    if(this.whale.alive === false)
      return;
    this.whale.body.velocity.y = -350;
    game.add.tween(this.whale).to({angle: -2}, 150).start();
    this.jumpSound.play();
  },
  restartGame: function(){
    game.state.start('main');
  },
  addRock: function(x,y){
    var rock = this.rocks.getFirstDead();
    rock.reset(x,y);
    rock.body.velocity.x = -200;
    rock.checkWorldBounds = true;
    rock.outOfBoundsKill = true;
  },
  addAnchor: function(x,y){
    var anchor = this.anchors.getFirstDead();
    anchor.reset(x,y);
    anchor.body.velocity.x = -200;
    anchor.checkWorldBounds = true;
    anchor.outOfBoundsKill = true;
  },
  addObstacle: function(){
    var height = Math.floor(Math.random()*100) + 400;
    this.addRock(500, height);
    this.score += 1;
    this.labelScore.text = this.score;

    this.addAnchor(500, height - 125);
  },
  hitObstacle: function(){
    if(this.whale.alive === false)
      return;
    this.splatSound.play();
    this.whale.alive = false;
    game.time.events.remove(this.timer);
    game.state.start('gameover');
    this.rocks.forEachAlive(function(r){
      r.body.velocity.x = 0;
    }, this);

    this.anchors.forEachAlive(function(a){
      a.body.velocity.x = 0;
    }, this);
  }/*,
  render: function(){

    this.anchors.forEach(function(anchor){
      game.debug.body(anchor);
    });
    this.rocks.forEach(function(rock){
      game.debug.body(rock);
    });

    game.debug.body(this.whale);
  }*/
};

var gameOver = {
  preload: function(){
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    game.load.image('bkgrd', 'assets/bkgrd.png');
    game.load.spritesheet('whale', 'assets/whale-sprite.png', 193, 100);
    game.load.image('shell', 'assets/shell.png');
    game.load.image('again', 'assets/again.png');
  },
  create: function(){
    this.background = this.game.add.sprite(0, 0, 'bkgrd');
    this.character = this.game.add.sprite(120, 100, 'whale');
    //this.character = this.game.add.sprite(120, 100, 'character');
    this.character.animations.add('swim', [1,2,3], 5, true);
    game.physics.arcade.enable(this.character);
    this.character.body.velocity.x = 0;
    this.character.body.velocity.y = 0;
    this.start = this.game.add.button(175, 275, 'again', startScreen);
    this.character.scale.x = 1.5;
    this.character.scale.y = 1.5;
    this.shell = this.game.add.sprite(130, 400, 'shell');
    this.title = game.add.text(50, 30, 'Game Over!', {font: '60px Slackey', fill: '#eee'});
    this.final = game.add.text(140, 375, 'Your Score:', {font: '30px Slackey', fill: '#eee'});
    //this.score = game.add.text(375, 370, '0', {font: '40px Slackey', fill: '#eee'});
  },
  update: function(){
    this.character.animations.play('swim');
  }
};

function startScreen(){
  game.state.start('start');
}

game.state.add('start', start);
game.state.add('main', mainState);
game.state.add('gameover', gameOver);
game.state.start('start');
