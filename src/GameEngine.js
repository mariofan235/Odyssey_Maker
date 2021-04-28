import MergedInput from 'phaser3-merged-input';

import {Player} from './scripts/player.js';

import {Cap} from './scripts/cap.js'

export class GameEngine extends Phaser.Scene {

  constructor() {
    super("mainGame");
  }


  init(data){

    this.GAME_WIDTH = this.sys.game.canvas.width;
    this.GAME_HEIGHT = this.sys.game.canvas.height;

    const pixelHeight = Math.round(this.GAME_HEIGHT/32)*32;

    //!00 screen limit
    this.mapSections = {width: data.width, height: data.height}
    this.levelSize = {width: this.GAME_WIDTH*this.mapSections.width, height: pixelHeight*this.mapSections.height};

    this.numPlayers = data.numPlayers;
    this.moveset = data.availMoves;
    this.playerStartPos = {x: data.startX*32, y: data.startY*32};

    this.physics.world.TILE_BIAS = 48;

    this.playerTwoPad = data.pad;

    this.miniCams = [];
    this.camMode = 'normal';

    this.autoscroll = {

      speed: 0,
      active: false,
      direction: 'x'

    };

  }

  preload(){

    this.load.scenePlugin('mergedInput', MergedInput);

  }

  create() {

    //this.input.setDefaultCursor('url(assets/cursors/default_cursor.cur), pointer');
    //this.pointer = this.input.activePointer;

    this.ENTER_KEY = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.keyControls0();

    if(this.input.gamepad != null){

      this.input.gamepad.gamepads.forEach((g) => {
        this.mergedInput.setupGamepad(g);
      });

    }

    this.iconGroup = this.physics.add.group();

    this.playerOneControls = this.mergedInput.getPlayer(0);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.backgroundGroup = this.add.group();

    this.bgFrameRate = [1/12, 1/24, 1/12];

    this.setUpBackgrounds();

    this.createMap();

    this.playerGroup = this.physics.add.group();

    this.playerCaps = this.physics.add.group();

    this.playerItems = this.physics.add.group();

    this.blockGroup = this.physics.add.staticGroup();
    this.specialBlockGroup = this.physics.add.group();

    this.npcGroup = this.physics.add.group();

    this.effectsGroup = this.add.group();

    this.playerSensors = this.physics.add.group();

    //this.physics.add.collider(this.playerCaps, this.blockGroup);

    //this.physics.add.collider(this.playerGroup, this.blockGroup);

    this.physics.add.overlap(this.playerGroup, this.playerGroup, function (p1, p2) {

      // var stomp1 = !p1.body.onFloor() && p1.body.velocity.y > 0 && p1.body.touching.down && p2.body.touching.up;

      p1.playerSensing(p2);
      p2.playerSensing(p1);

    }, function (p1, p2) {

      return ( p1.specialMove != 'playerKickback' && p2.specialMove != 'playerKickback' );

    });

    this.physics.world.setBoundsCollision(true, true, false, false);

    this.events.on('switchCam', function () {

      if(this.camMode == 'normal'){

        var mainP = null;

        this.playerGroup.getChildren().forEach((p) => {

          if(!p.defeat && mainP == null){
            mainP = p;
          }

        });

        if(mainP != null){

          this.mainCam.pan(mainP.x, mainP.y, 1000, 'Linear', true, function (cam, progress) {

            if(progress == 1){
              this.mainCam.startFollow(mainP);
            }else{

              if(Math.abs(this.mainCam.midPoint.x - mainP.x) < 200 && Math.abs(this.mainCam.midPoint.y - mainP.y) < 200){

                this.mainCam.panEffect.reset();
                this.mainCam.startFollow(mainP);

              }

            }

          }, this);

        }

      }else if(this.camMode == 'split'){

        this.splitCamera(this.getNumAlivePlayers());

      }else{

        if(this.getNumAlivePlayers() == 0){

          this.autoscroll.active = false;

        }

      }


    }, this);

  }

  update(){

    if(this.playerOne == null && !this.cursors.shift.isDown){

      // this.moveCamera();

    }

     if(this.camMode == 'auto'){

       if(this.autoscroll.active){

         this.autoscrollMap();

       }else if(this.getNumAlivePlayers() > 0){

         if(this.autoscroll.direction == 'x'){

           this.mainCam.centerOnY(this.getFirstPlayer().y);

         }else{

           this.mainCam.centerOnX(this.getFirstPlayer().x);

         }

       }

     }

    if(this.timedKeyPress(this.ENTER_KEY, 0)){

      this.events.emit('resetLevel');

      if(this.playerOne != null){
        this.playerGroup.clear(true, true);
        this.playerSensors.clear(true, true);
        this.iconGroup.clear(true, true);
        this.effectsGroup.clear(true, true);
      }

      this.scene.pause('stageEditor');

      this.playerCaps.clear(true, true);

      this.initPlayer();
      this.mainCam.setDeadzone(0, 12);
      this.playerOne.cap.disableBody();

      //this.mainLayer.tileset[0].setImage(this.textures.get('terrain-1'));

    }

    this.backgroundAnim();

    // if(this.testZone != null){
    //
    //   this.testZone.body.setVelocity(this.playerOne.body.velocity.x, this.playerOne.body.velocity.y);
    //   this.testZone.x = this.playerOne.getRightCenter().x - 8;
    //   this.testZone.y = this.playerOne.getCenter().y;
    //
    // }

  }

  setUpBackgrounds(){

    this.backgroundGroup.clear(true, true);

    var bx_width = this.textures.get('backgroundX').get(0).width;
    var bx_height = this.textures.get('backgroundX').get(0).height;

    var by_width = this.textures.get('backgroundY').getSourceImage().width;
    var by_height = this.textures.get('backgroundY').getSourceImage().height;

    //this.mainCam = this.cameras.main.setBounds(0, 0, this.levelSize.width, this.levelSize.height);
    this.mainCam = this.cameras.main.setSize(this.GAME_WIDTH/2, this.GAME_HEIGHT);
    this.cameras.main.setBounds(0, 0, this.levelSize.width, this.levelSize.height);

    this.physics.world.setBounds(0, 0, this.levelSize.width, this.levelSize.height);

    //this.mainCam.setZoom(1.25);

    for(var x = 1; x <= Math.ceil(this.levelSize.width/bx_width); x++){

      this.backgroundX = this.add.tileSprite(bx_width*(x - 1), (this.GAME_HEIGHT - bx_height + (this.levelSize.height - this.GAME_HEIGHT) ), null, null, 'backgroundX', 0);
      this.backgroundX.setOrigin(0, 0);
      this.backgroundX.setDepth(-1);

      this.backgroundX.animLoop = 0;
      this.backgroundX.numFrames = this.textures.get('backgroundX').frameTotal - 1;

      this.backgroundGroup.add(this.backgroundX);

    }

    for(var y = 1; y <= Math.ceil(this.levelSize.width/by_width); y++){

      this.backgroundY = this.add.tileSprite(by_width*(y - 1), this.backgroundX.y, this.levelSize.width, by_height*this.mapSections.height - by_height, 'backgroundY');
      this.backgroundY.setOrigin(0, 1);
      this.backgroundY.setDepth(-1);

      this.backgroundY.animLoop = 0;
      this.backgroundY.numFrames = this.textures.get('backgroundY').frameTotal - 1;

      this.backgroundGroup.add(this.backgroundY);

    }

    // this.backgroundX = this.add.tileSprite(0, (this.GAME_HEIGHT - bx_height + (this.levelSize.height - this.GAME_HEIGHT) ), this.levelSize.width, null, 'backgroundX');
    // this.backgroundX.scrollFactorX = 0;
    // this.backgroundX.setOrigin(0, 0);
    //
    // this.backgroundY = this.add.tileSprite(0, this.backgroundX.y, this.levelSize.width, by_height*this.mapSections.height - by_height, 'backgroundY');
    // this.backgroundY.scrollFactorX = 0;
    // this.backgroundY.setOrigin(0, 1);

    if(this.camMode == 'normal'){

      this.initMainCam();

    }else if(this.camMode == 'split'){

      this.splitCamera(this.numPlayers);

    }else{

      this.activateAutoscroll(3);

    }


  }

  backgroundAnim(){

    this.backgroundGroup.getChildren().forEach((b) => {

      if(b.numFrames > 1){

        if(b.animLoop == (11/12)){
          b.animLoop = 0;
        }else{
          b.animLoop += this.bgFrameRate[2];
        }

        b.setFrame(Math.floor(b.animLoop % b.numFrames));

      }

    });


  }

  initMainCam(){

    this.removeCameras();

    this.mainCam.setSize(this.GAME_WIDTH, this.GAME_HEIGHT);
    this.mainCam.setBounds(0, 0, this.levelSize.width, this.levelSize.height);

  }

  activateAutoscroll(speed){

    this.initMainCam();

    this.mainCam.stopFollow();

    this.autoscroll.speed = speed;

    this.physics.world.on('worldbounds', function (body, up, down, left, right) {

      if(this.autoscroll.direction == 'x' && this.autoscroll.active){

        if(left && this.autoscroll.speed > 0){

          body.gameObject.x += (Math.abs(this.autoscroll.speed*4));

        }else if(right && this.autoscroll.speed < 0){

          body.gameObject.x -= (Math.abs(this.autoscroll.speed*4));

        }

      }

    }, this);

  }

  autoscrollMap(){

    if(this.autoscroll.direction == 'x'){

      this.physics.world.setBounds(this.mainCam.scrollX, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
      this.mainCam.scrollX += this.autoscroll.speed;

      if(this.getNumAlivePlayers() > 0){

        this.mainCam.centerOnY(this.getFirstPlayer().y);

      }

      if(this.autoscroll.speed > 0){

        if(this.mainCam.scrollX + this.GAME_WIDTH >= this.levelSize.width){
          this.mainCam.scrollX = this.levelSize.width - this.GAME_WIDTH;
          this.autoscroll.active = false;
        }

      }else{

        if(this.mainCam.scrollX <= 0){
          this.mainCam.scrollX = 0;
          this.autoscroll.active = false;
        }

      }

    }else{

      this.physics.world.setBounds(0, this.mainCam.scrollY, this.levelSize.width, this.GAME_HEIGHT);
      this.mainCam.scrollY += this.autoscroll.speed;

      this.mainCam.centerOnX(this.getFirstPlayer().x);

      if(this.autoscroll.speed > 0){

        if(this.mainCam.scrollY + this.GAME_HEIGHT >= this.levelSize.height){
          this.mainCam.scrollY = this.levelSize.height - this.GAME_HEIGHT;
          this.autoscroll.active = false;
        }

      }else{

        if(this.mainCam.scrollY <= 0){
          this.mainCam.scrollY = 0;
          this.autoscroll.active = false;
        }

      }

    }

  }

  splitCamera(num){

    this.removeCameras();

    if(num == 1){

      this.initMainCam();
      this.mainCam.startFollow(this.getFirstPlayer());

    }

    if(num == 2){

      this.mainCam.setSize(this.GAME_WIDTH/2, this.GAME_HEIGHT);
      this.mainCam.setBounds(0, 0, this.levelSize.width, this.levelSize.height);

      var c = this.cameras.add(this.GAME_WIDTH/2, 0, this.GAME_WIDTH/2, this.GAME_HEIGHT);
      c.setBounds(0, 0, this.levelSize.width, this.levelSize.height);

      this.miniCams.push(c);

    }

    if(num == 3){

      this.mainCam.setSize(this.GAME_WIDTH, this.GAME_HEIGHT/2);
      this.mainCam.setBounds(0, 0, this.levelSize.width, this.levelSize.height);

      var c_1 = this.cameras.add(0, this.GAME_HEIGHT/2, this.GAME_WIDTH/2, this.GAME_HEIGHT/2);
      c_1.setBounds(0, 0, this.levelSize.width, this.levelSize.height);

      var c_2 = this.cameras.add(this.GAME_WIDTH/2, this.GAME_HEIGHT/2, this.GAME_WIDTH/2, this.GAME_HEIGHT/2);
      c_2.setBounds(0, 0, this.levelSize.width, this.levelSize.height);

      this.miniCams.push(c_1, c_2);

    }

    if(num == 4){

      var posX = [this.GAME_WIDTH/2, 0, this.GAME_WIDTH/2];
      var posY = [0, this.GAME_HEIGHT/2, this.GAME_HEIGHT/2];

      this.mainCam.setSize(this.GAME_WIDTH/2, this.GAME_HEIGHT/2);
      this.mainCam.setBounds(0, 0, this.levelSize.width, this.levelSize.height);

      for(var i = 0; i < 3; i++){

        var c = this.cameras.add(posX[i], posY[i], this.GAME_WIDTH/2, this.GAME_HEIGHT/2);
        c.setBounds(0, 0, this.levelSize.width, this.levelSize.height);

        this.miniCams.push(c);

      }

    }

  }

  removeCameras(){

    this.miniCams.forEach((cam) => {

      this.cameras.remove(cam);

    });

    this.miniCams.length = 0;


  }

  // initTestZone(){
  //
  //   this.testZone = this.add.zone(this.playerOne.x, this.playerOne.y, 8, 8);
  //
  //   this.physics.world.enable(this.testZone);
  //   this.testZone.body.setAllowGravity(false);
  //
  // }

  setSpawnPoint(x, y){

    this.playerStartPos.x = x*32;

    this.playerStartPos.y = y*32;

  }

  initPlayer(){

    this.playerOne = new Player(this, this.playerStartPos.x, this.playerStartPos.y, 'Mario', '');

    this.playerOne.setControls(this.playerOneControls);

    this.playerGroup.add(this.playerOne);

    this.physics.add.collider(this.playerGroup, this.mainLayer);

    this.physics.add.collider(this.playerCaps, this.mainLayer);

    this.playerOne.body.setCollideWorldBounds();

    this.addPlayerIcon(this.playerOne, 0);

    if(this.camMode != 'auto'){

      this.mainCam.startFollow(this.playerOne);

    }else{

      this.mainCam.centerOn(this.playerOne.x, this.playerOne.y);
      this.autoscroll.active = true;

    }

    if(this.playerOne.wearingCap){

      this.playerOne.cap = new Cap(this, this.playerOne.x, this.playerOne.y, 'cap', this.playerOne);
    }

    if(this.numPlayers > 1){

      this.initMultiplayer();

    }

  }

  initMultiplayer(){

    for(var i = 1; i < this.numPlayers; i++){

      var c = this.mergedInput.addPlayer(i);

      this.playerControlsConfig(c);

      if(i == 1){

        this.keyControls1();

      }

      var p = new Player(this, this.playerStartPos.x + (32*i), this.playerStartPos.y, 'player_' + i, '_' + i);
      p.setControls(c);
      this.playerGroup.add(p);

      p.body.setCollideWorldBounds();

      p.cap = new Cap(this, p.x, p.y, 'cap_' + i, p);

      p.cap.disableBody(true, true);

      this.addPlayerIcon(p, i);

      if(this.camMode == 'split'){

        if(this.miniCams.length == 0){

          this.splitCamera(this.numPlayers);

        }

        var c = this.miniCams[i-1];

        c.startFollow(p);
        c.setDeadzone(0, 12);

      }

    }

  }

  getNumAlivePlayers(){

    var count = 0;

    this.playerGroup.getChildren().forEach((p) => {

      if(!p.defeat){
        count++;
      }

    });

    return count;

  }

  getFirstPlayer(){

    var player = null;

    this.playerGroup.getChildren().forEach((p) => {

      if(!p.defeat && player == null){
        player = p;
      }

    });

    return player;

  }

  addPlayerIcon(p, num){

    var a = this.iconGroup.create(p.x, p.getBottomCenter().y, 'player-icons', num);

    a.setScale(0.25);

    a.orgPlayer = p;

    a.setOrigin(1, 1);

    a.body.allowGravity = false;

    a.preUpdate = function (time, delta) {

      if(!this.orgPlayer.flipX){
        this.x = this.orgPlayer.x;
      }else{
        this.x = this.orgPlayer.x + 36;
      }

      a.y = this.orgPlayer.y + 32;
      a.setVelocity(this.orgPlayer.body.velocity.x, this.orgPlayer.body.velocity.y);

    }

  }

  setKeyboardControls(){

    this.playerOneControls = {
      left: this.cursors.left,
      right: this.cursors.right,
      up:this.cursors.up,
      down:this.cursors.down,
      actionKey:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      jumpKey: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      type: 'keyboard'
    };

  }

  playerControlsConfig(p){

    p.justDown = function(key){

      return(this.interaction.pressed == key);

    }

    p.lastDir = [];

    p.directionalPress = function(dir){

      return (this.lastDir.indexOf(dir) != -1);

    }

    //Action Key

    p.keyB = {
      active: false,
      pressed: false,
      duration: 0
    };

    p.keyA = {
      active: false,
      pressed: false,
      duration: 0
    };

    p.keyZ = {
      active: false,
      pressed: false,
      duration: 0
    };

  }

  keyControls0(){

    //Player One

    var p = this.mergedInput.addPlayer(0);

    this.mergedInput.defineKey(0, 'UP', 'UP')
    .defineKey(0, 'DOWN', 'DOWN')
    .defineKey(0, 'LEFT', 'LEFT')
    .defineKey(0, 'RIGHT', 'RIGHT')
    .defineKey(0, 'B3', 'Z')
    .defineKey(0, 'B1', 'X')
    .defineKey(0, 'B2', 'Z')
    .defineKey(0, 'B0', 'X')
    .defineKey(0, 'B5', 'C')

    this.playerControlsConfig(p);

  }

  keyControls1(){

    //Player Two

    var p = this.mergedInput.getPlayer(1);

    this.mergedInput.defineKey(1, 'UP', 'W')
    this.mergedInput.defineKey(1, 'DOWN', 'S')
    .defineKey(1, 'LEFT', 'A')
    .defineKey(1, 'RIGHT', 'D')
    .defineKey(1, 'B3', 'N')
    .defineKey(1, 'B1', 'M')
    .defineKey(1, 'B2', 'N')
    .defineKey(1, 'B0', 'M')

  }

  wallCollide(player, tile){

    //Credit to Emanuele Feronato for the wall slide script

    // if(player.specialMove == 'wallSlide'){
    //
    //   var blockedLeft = player.leftSensor.blocked && player.flipX && player.controls.direction.LEFT;
    //   var blockedRight = player.rightSensor.blocked && !player.flipX && player.controls.direction.RIGHT;
    //
    //   player.onWall = !player.body.onFloor() && (blockedLeft || blockedRight) && tile.canCollide;
    //
    //   player.wallSlide();
    //
    // }

  }

  bottomPit(obj){

    var botY = obj.y > this.levelSize.height + 40;

    if(this.camMode != 'auto'){

      return (botY);

    }else if(this.autoscroll.active){

      if(this.autoscroll.direction == 'x'){

        if(this.autoscroll.speed > 0){

          return (obj.x < this.mainCam.scrollX || botY);

        }else{

          return (obj.x > (this.mainCam.scrollX + this.GAME_WIDTH) || botY);
        }

      }else{

        if(this.autoscroll.speed > 0){

          return (obj.y < (this.mainCam.scrollY - 32) || obj.y > (this.mainCam.scrollY + this.GAME_HEIGHT + 32));

        }else{

          return (obj.y > (this.mainCam.scrollY + this.GAME_HEIGHT + 32));

        }

      }

    }else{

      if(this.autoscroll.direction == 'y'){

        return (obj.y > (this.mainCam.scrollY + this.GAME_HEIGHT + 32));

      }

    }

  }

  createMap(){

    this.levelMap = this.make.tilemap({

      tileWidth: 32,
      tileHeight: 32,
      width: Math.round(this.levelSize.width/32),
      height: Math.round(this.levelSize.height/32)

    });

    this.levelMap.addTilesetImage("terrain-0");
    // const tileset0 = this.levelMap.addTilesetImage("terrain-1");
    //
    // tileset0.firstgid = 4;

    this.mainLayer = this.levelMap.createBlankLayer('terrain', 'terrain-0');

    //Items Layer, NPC Layer, Gadget Layer, Effects Layer

  }

  hasTileAbove(x, y){

    var i = this.blockGroup.getChildren();

    var foundTile = false;

    i.forEach((tile) => {

      // if(Math.abs(tile.getCenter().x - x) <= 30 && Math.abs(tile.y - y) <= 17 && tile.y < y){
      //   foundTile = true;
      // }

      if(Math.abs(tile.getCenter().x - x) <= 30 && tile.body.hitTest(tile.x, y)){
        foundTile = true;
      }

    });

    return foundTile;

    // var i = this.mainLayer.getTilesWithinWorldXY(x, y, 8, 32);
    //
    // var foundTile = false;
    //
    // i.forEach((tile) => {
    //
    //   if(tile.index != -1 && tile.pixelY < y){
    //     foundTile = true;
    //   }
    //
    // });
    //
    // return foundTile;

  }

  moveCamera(x, y){

    if(this.cursors.left.isDown){

      this.mainCam.scrollX -= 5;

    }

    if(this.cursors.right.isDown){

      this.mainCam.scrollX += 5;

    }

    if(this.cursors.up.isDown){

      this.mainCam.scrollY -= 5;

    }

    if(this.cursors.down.isDown){

      this.mainCam.scrollY += 5;

    }

  }

  moveCameraPos(x, y){

    var dist = 45;

    if(x < dist){

      this.mainCam.scrollX -= 5;

    }

    if(x > this.GAME_WIDTH - dist){

      this.mainCam.scrollX += 5;

    }

    if(y < dist){

      this.mainCam.scrollY -= 5;

    }

    if(y > this.GAME_HEIGHT - dist){

      this.mainCam.scrollY += 5;

    }

  }

  cameraZoom(zoomIn, zoomOut){

    var zoomLimit = 0;

    if(this.mapSections.width == 1 || this.mapSections.height == 1){
      zoomLimit = 1;
    }else{

      if(this.mapSections.height <= 2){
        zoomLimit = 1;
      }else{
        zoomLimit = 0.6;
      }

    }

    if(zoomIn){

      if(this.mainCam.zoom <= 2){

        this.mainCam.zoom += 0.1;

      }

    }

    if(zoomOut){

      if(this.mainCam.zoom > zoomLimit){

        this.mainCam.zoom -= 0.1;

      }

    }

  }

  timedKeyPress(key, time){

    if(time == 0){
      return (Phaser.Input.Keyboard.JustDown(key));
    }else{
      return (key.isDown && key.getDuration() < time);
    }

  }

}
