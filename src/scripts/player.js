import 'phaser';

import {playerMovement, swimMovement, airMovement, altJump} from './player_movement.js';

import {DeathAnimation} from './effects.js';

export class Player extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, key, playerNo){

    super(scene, x, y, key);

    scene.add.existing(this);

    scene.physics.world.enableBody(this);

    this.body.allowGravity = true;

    this.body.onWorldBounds = true;

    this.startX = x;
    this.startY = y;

    this.body.setSize(45, 70);

    //this.body.setMaxVelocity(Number.MAX_VALUE, 800);

    this.initSensors(scene);

    this.controls = null;

    this.playerNo = playerNo;
    this.speedTimer = 0;
    this.wearingCap = true;
    this.throwSpeed = 0;
    this.throwDirection = 'x';
    this.speed = 8;
    this.specialMove = 'none';
    this.costume = '';
    this.running = false;
    this.rollTimer = 0;
    this.capJump = false;
    this.midairTwirl = false;
    this.captured = false;
    this.defeat = false;
    this.jumpTimer = 0;
    this.multiJumpTimer = 0;
    this.swimTimer = 0;
    this.longJumpDist = 0;
    this.backflipDist = 0;
    this.spinJumpActive = false;
    this.crouchCharge = 0;
    this.spinTwirlTimer = 0;
    this.poundResume = false;
    this.poundDelay = 0;
    this.kickbackDelay = 0;
    this.stomped = false;
    this.healthRecovery = false;
    this.swimControls = false;
    this.recoveryTimer = 0;
    this.jumpCounter = 0;
    this.throwDelay = 0;
    this.capHold = false;
    this.onWall = false;
    this.squishEffect = false;
    this.squishState = '';
    this.playerKickback_Timer = 0;
    this.momentumLock = false;
    this.momentumLock_Delay = 0;
    this.lockDirection = "";

    this.npcFloor = false;
    this.onFloor = false;


  }

  initSensors(scene){

    this.topSensor = scene.add.zone(this.getCenter().x, this.getTopCenter().y, 30, 8);
    this.bottomSensor = scene.add.zone(this.getCenter().x, this.getBottomCenter().y, 30, 10);

    this.leftSensor = scene.add.zone(this.getLeftCenter().x, this.getCenter().y, 5, 8);
    this.rightSensor = scene.add.zone(this.getRightCenter().x, this.getCenter().y, 5, 8);

    scene.physics.world.enable([this.topSensor, this.bottomSensor, this.leftSensor, this.rightSensor]);

    this.topSensor.body.setAllowGravity(false);
    this.bottomSensor.body.setAllowGravity(false);
    this.leftSensor.body.setAllowGravity(false);
    this.rightSensor.body.setAllowGravity(false);

  }

  setControls(controlScheme){

    this.controls = controlScheme;

  }

  updateButtons(){

    this.controls.keyB.active = (this.controls.buttons.B2 || this.controls.buttons.B3);
    this.controls.keyB.pressed = (this.controls.justDown('B2') || this.controls.justDown('B3'));

    if(this.controls.keyB.active){
      this.controls.keyB.duration++;
    }else{
      this.controls.keyB.duration = 0;
    }

    this.controls.keyA.active = (this.controls.buttons.B0 || this.controls.buttons.B1);
    this.controls.keyA.pressed = (this.controls.justDown('B0') || this.controls.justDown('B1'));

    if(this.controls.keyA.active){
      this.controls.keyA.duration++;
    }else{
      this.controls.keyA.duration = 0;
    }

    this.controls.keyZ.active = (this.controls.buttons.B4 || this.controls.buttons.B5 ||
    this.controls.buttons.B6 || this.controls.buttons.B7);

    this.controls.keyZ.pressed = (this.controls.justDown('B4') || this.controls.justDown('B5') ||
    this.controls.justDown('B6') || this.controls.justDown('B7'));

    if(this.controls.keyZ.active){
      this.controls.keyZ.duration++;
    }else{
      this.controls.keyZ.duration = 0;
    }

  }

  updateSensors(){

    this.topSensor.body.setVelocity(this.body.velocity.x, this.body.velocity.y);
    this.topSensor.setPosition(this.getCenter().x, this.getTopCenter().y);

    this.bottomSensor.body.setVelocity(this.body.velocity.x, this.body.velocity.y);
    this.bottomSensor.setPosition(this.getCenter().x, this.getBottomCenter().y + 4);

    this.leftSensor.body.setVelocity(this.body.velocity.x, this.body.velocity.y);
    this.leftSensor.setPosition(this.getLeftCenter().x + 15, this.getCenter().y);

    this.rightSensor.body.setVelocity(this.body.velocity.x, this.body.velocity.y);
    this.rightSensor.setPosition(this.getRightCenter().x - 15, this.getCenter().y);

    this.sensorCollision(this.leftSensor);
    this.sensorCollision(this.rightSensor);
    this.sensorCollision(this.topSensor);
    this.sensorCollision(this.bottomSensor);

  }

  sensorCollision(sensor){

    sensor.blocked = false;

    this.scene.physics.overlap(sensor, this.scene.mainLayer, function (s, tile) {

      sensor.blocked = true;

    }, function (s, tile) {
      return (tile.index != -1);
    }, this);

    this.scene.physics.overlap(sensor, this.scene.blockGroup, function (s, tile) {

      sensor.blocked = true;

    }, null, this);

  }

  playerSensing(p){

    if(!this.onFloor && this.body.velocity.y > 0){

      if(this.body.touching.down && p.body.touching.up){

        if(this.specialMove == 'none' || this.specialMove == 'wallSlide' || this.specialMove == 'dive' || this.specialMove == 'kickback' || this.specialMove == 'roll' || this.specialMove == 'spinTwirl' || this.specialMove == 'sideflip'){

          this.scene.physics.collide(this, p);

          if(this.specialMove != 'roll'){
            this.specialMove = 'none';
            this.body.allowGravity = true;
          }

          if(this.body.y < p.body.y){

            this.stomped = true;

          }

        }else{

          if(this.poundActive() && !p.poundActive()){

            var bounceX = true;

            // var i = null;
            //
            // if(p.anims.getName() != p.getCostume('duck')){
            //
            //   i = this.scene.mainLayer.getTilesWithinWorldXY(p.x, p.getTopCenter().y, 32, 64);
            //
            // }else{
            //
            //   i = this.scene.mainLayer.getTilesWithinWorldXY(p.x, p.getTopCenter().y, 32, 32);
            //
            // }
            //
            // i.forEach((tile) => {
            //
            //   if(tile.index != -1){
            //     bounceX = false;
            //   }
            //
            // });

            bounceX = true;

            if(bounceX){

              p.flipX = !(this.getCenter().x > p.getCenter().x);

              p.specialMove = 'playerKickback';
              p.playerKickback_Timer = 0;

              p.body.setVelocityY(-350);

            }

          }else{

            if(this.poundActive()){

              this.body.allowGravity = true;
              this.specialMove = 'none';

            }

            this.body.setVelocityY(-300);

          }

        }

        if(this.specialMove != 'playerKickback' && !this.squishEffect){

          p.initSquishAnim();
          this.scene.physics.collide(this, p);

        }

      }else if(this.specialMove == 'roll'){

        this.specialMove = 'kickback';

      }

    }else{

      if(this.specialMove != 'playerKickback' && p.specialMove != 'playerKickback'){

        if( (this.x < p.x && !p.leftSensor.blocked) || this.x > p.x && !p.leftSensor.blocked ){

          this.scene.physics.collide(this, p);

        }

      }

      var hitSide = (this.body.touching.right && p.body.touching.left && !this.flipX) || (this.body.touching.left && p.body.touching.right && this.flipX);

      if(hitSide){

        if(this.specialMove == 'dive' || this.specialMove == 'longJump' || this.specialMove == 'roll'){

          this.specialMove = 'kickback';

          if(p.specialMove = 'dive' || p.specialMove == 'longJump'){

            p.specialMove = 'kickback';

          }

        }

      }

    }

  }

  initSquishAnim(){

    this.squishState = 'out';
    this.squishEffect = true;

  }

  squishAnim(){

    if(this.squishEffect){


      if(this.body.blocked.left || this.body.blocked.right){

        this.body.setVelocityX(0);

      }

      if(this.squishState == 'out'){

        this.scaleX += 0.1;
        this.scaleY -= 0.05;

        if(this.scaleX >= 2){
          this.squishState = 'in';
        }

      }else{

        this.scaleX -= 0.1;
        this.scaleY += 0.05;

        if(this.scaleX <= 1){

          this.setScale(1);
          this.squishEffect = false;
          this.squishState = '';

        }

      }

    }

  }

  keyPress(key, btn){

    if(this.controls.type == 'keyboard'){

      return (key.isDown);

    }else{

      return (this.scene.gamepadPress(this.controls, btn));

    }

  }

  timedKeyPress(key, btn, time){

    if(this.controls.type == 'keyboard'){

      return (this.scene.timedKeyPress(key, time));

    }else{

      return (this.scene.gamepadPress(this.controls, btn));

    }

  }

  setMaxFallSpeed(v){

    if(this.body.velocity.y > v){

      this.body.setVelocityY(v);

    }

  }

  defeated(){

    if(!this.defeat){

      this.defeat = true;

      const a = new DeathAnimation(this.scene, this.x, this.y, this.texture.key, this.costume);

      this.cap.disableBody(true, true);
      this.disableBody(true, true);

      if(this.scene.numPlayers > 0){

        this.scene.events.emit('switchCam');

      }

    }

  }

  preUpdate(time, delta){

    //onFloor

    super.preUpdate(time, delta);

    this.onFloor = this.body.onFloor() || this.npcFloor;

    //this.swimControls = true;

    if(!this.swimControls){

      if(this.specialMove != "groundPound"){

        this.setMaxFallSpeed(1200);

      }

    }else{

      this.setMaxFallSpeed(300);

    }

    var tileAbove = false;

    if(this.body.height == 30 || this.specialMove == 'roll'){

      tileAbove = (this.scene.hasTileAbove(this.x, this.getTopCenter().y - 4)) || (this.topSensor.blocked);

    }else{

      tileAbove = this.scene.hasTileAbove(this.x, this.getCenter().y - 6);

    }

    this.updateButtons();

    this.updateSensors();

    this.squishAnim();

    if(this.scene.bottomPit(this)){

      this.defeated();

    }

    if(this.momentumLock){

      this.momentumLock_Delay--;

      if(this.momentumLock_Delay <= 0){

        this.momentumLock = false;
        this.lockDirection = "";

      }

    }

    var blockedLeft = this.leftSensor.blocked && this.flipX && this.controls.direction.LEFT;
    var blockedRight = this.rightSensor.blocked && !this.flipX && this.controls.direction.RIGHT;

    this.onWall = !this.onFloor && (blockedLeft || blockedRight);

    if(this.specialMove == 'wallSlide' && !(this.onWall == 1 || this.onWall == true) && this.body.velocity.y > 0){

      this.specialMove = 'none';
      this.body.allowGravity = true;

    }

    if(this.specialMove != 'sideflip'){
      this.rotation = 0;
    }

    this.setCostume();

    if(this.onFloor){
      this.capJump = false;
      this.midairTwirl = false;
      this.spinJumpActive = false;
    }

    if(this.specialMove == 'none'){

      this.body.allowGravity = true;
      this.kickbackDelay = 0;

      if(this.moveAvail('wallSlide')){
        this.wallDetection(this.controls.keyA.pressed);
      }

      if( (this.controls.direction.DOWN || tileAbove) && this.onFloor ){

        this.crouch(tileAbove);

      }else{

        if( this.capAvail() && (this.controls.keyB.pressed) ){
          this.throwCapInit();

        }else{

          if(!this.swimControls){

            playerMovement(this, this.controls, (this.onFloor || this.body.blocked.down || this.npcFloor) );

          }else{

            swimMovement(this, this.controls, false, (this.onFloor || this.body.blocked.down || this.npcFloor), false);

          }

        }

      }

      this.npcFloor = false;

    }else{

      this.jumpCounter = 0;
      this.crouchCharge = 0;

      const vaildMoves = this.specialMove == 'longJump' || this.specialMove == 'backflip' || this.specialMove == 'sideflip' || this.specialMove == 'vault' || this.specialMove == 'spinTwirl' || this.specialMove == 'spinPound';

      if( vaildMoves && this.capAvail() && this.controls.keyB.pressed ){

        this.rotation = 0;
        this.throwCapInit();

      }

      this.wallSlide();

      this.groundPound();

      this.dive();

      this.backflip();

      this.kickback();

      this.roll(tileAbove);

      this.longJump();

      this.sideflip();

      this.throwCap();

      this.capTwirl(tileAbove);

      this.spinTwirl();

    }

    this.adjustHitbox(this.specialMove);

    this.npcFloor = false;

    this.controls.lastDir = this.updateDPad(this.controls.direction);

}

  updateDPad(dir){

    var lastDir = [];

    if(dir.LEFT){
      lastDir.push('left');
    }
    if(dir.RIGHT){
      lastDir.push('right');
    }
    if(dir.UP){
      lastDir.push('up');
    }
    if(dir.DOWN){
      lastDir.push('down');
    }

    return lastDir;

  }

  capAvail(){

    return (this.cap != null && this.wearingCap);

  }

  wallDetection(jumpKey){

    if(this.body.velocity.y >= 0 && this.anims.getName() != this.getCostume('duck')){
      var spinJumping = this.anims.getName() == this.getCostume('spin');
      if ( (this.flipX || spinJumping) && this.controls.direction.LEFT && !jumpKey && (this.body.onWall() || this.leftSensor.blocked) && !this.onFloor && this.x >= 20 && !this.swimControls) {
        this.specialMove = "wallSlide";
        if(spinJumping){
          this.flipX = true;
        }
      }else if ( (!this.flipX || spinJumping) && this.controls.direction.RIGHT && !jumpKey && (this.body.onWall() || this.rightSensor.blocked) && !this.onFloor && this.x + 5 <= this.scene.mainCam._bounds.width - 15 && !this.swimControls) {
        this.specialMove = "wallSlide";
        if(spinJumping){
          this.flipX = false;
        }
      }
    }



}

  moveAvail(move){

    return (this.scene.moveset.indexOf(move) != -1);

  }

  setCostume(){

    if(this.wearingCap){
      this.costume = "_Hat" + this.playerNo;
    }else{
      this.costume = "" + this.playerNo;
    }

  }

  getCostume(key){

    return (key + this.costume);

  }

  updateCostume(key){

    if(this.anims.getName() != this.getCostume(key)){

      var frame = this.anims.currentFrame.index;

      this.anims.play(this.getCostume(key), false, frame - 1);

    }

  }

  adjustHitbox(move){

    if(move == "roll" || move == "groundPound"){
      this.body.setSize(30, 30);
    }else{
      if( (this.anims.getName() == ("duck" + this.playerNo) || this.anims.getName() == ("duck_Hat" + this.playerNo) ) && this.specialMove == "none"){
        this.body.setSize(30, 30);
      }else{
        this.body.setSize(30, 60);

      }
    }

  }

  throwCapInit(){

    var prevMove = this.specialMove;

    this.specialMove = 'throwCap';

    if(this.controls.direction.LEFT){
      this.flipX = true;
    }else if(this.controls.direction.RIGHT){
      this.flipX = false;
    }

    if(prevMove == 'spinTwirl' || prevMove == 'spinPound'){

      this.throwDirection = 'z';

    }else{

      if(this.controls.direction.UP){
        this.throwDirection = 'y_up';
      }else if(this.controls.direction.DOWN && !this.moveAvail('groundPound') && !this.onFloor){
        this.throwDirection = 'y_down';
      }else{
        this.throwDirection = 'x';

      }

    }

    if(this.throwDirection == 'x' || this.throwDirection == 'z'){

      if(Math.abs(this.body.velocity.x) > 5){
        //this.throwSpeed = Math.abs(this.body.velocity.x);
        this.throwSpeed = 150;
      }else{
        this.throwSpeed = 150;
      }

    }else{

      if(this.throwDirection == 'y_up'){
        this.throwSpeed = 600;
      }else{
        this.throwSpeed = -600;
      }

    }

    if( this.anims.getName() == ('spin_Hat' + this.playerNo) && this.throwDirection == 'x'){
      this.throwSpeed *= 1.5;
    }

    if(this.throwDirection == 'x' || this.throwDirection == 'z'){
      this.anims.play('throwAnim' + this.playerNo);
    }else{
      this.anims.play('throwUpwardAnim' + this.playerNo);
    }

    this.body.setVelocityX(0);

    if(this.onFloor){
      this.capJump = false;
    }else if(prevMove == 'sideflip' && this.throwDirection == 'y_down'){
      this.body.setVelocityY(-70);
    }else{
      this.body.setVelocityY(-300);
    }

    this.throwDelay = 0;

  }

  throwCap(){

    if(this.specialMove == 'throwCap'){

      var targetDelay = 0;

      if(this.throwDirection == 'x' || this.throwDirection == 'z'){
        targetDelay = 17;
      }else{
        targetDelay = 2;
      }

      this.throwDelay++;

      if(this.throwDelay == targetDelay){

        this.wearingCap = false;

        this.cap.launch(this.throwSpeed, this.throwDirection);

      }

      if(this.throwDelay > targetDelay + 2){

        this.throwDelay = 0;
        this.specialMove = 'none';

      }else{

        airMovement(this, this.controls);

        // if(this.controls.direction.LEFT){
        //   if(this.flipX){
        //     this.body.velocity.x -= 5;
        //   }else{
        //     this.body.velocity.x -= 10;
        //   }
        // }
        // else if(this.controls.direction.RIGHT){
        //   if(!this.flipX){
        //     this.body.velocity.x += 5;
        //   }else{
        //     this.body.velocity.x += 10;
        //   }
        // }

      }

    }

  }

  capTwirl(tileAbove){

    if(this.specialMove == 'capTwirl' || this.specialMove == 'vault'){

      if(this.body.velocity.y >= 0 || !this.anims.isPlaying){

        this.specialMove = 'none';

      }else{

        airMovement(this, this.controls);

        if(this.specialMove == 'vault'){

          this.updateCostume('tripleJump');

          if( !this.onFloor && !this.controls.directionalPress('down') && this.controls.direction.DOWN ){
            this.specialMove = "groundPound";
            this.anims.play("poundAnim" + this.costume, true);
          }

        }

      }

    }

  }

  crouch(tileAbove){

    var xSpeed = Math.abs(this.body.velocity.x * 0.2);

    this.anims.play(this.getCostume('duck'), true);
    if(Math.abs(this.body.velocity.x) < 5){
      this.body.setVelocityX(0);

      if(this.controls.direction.DOWN && this.onFloor){
        this.crouchCharge++;
      }else{
        this.crouchCharge = 0;
      }

    }else{
      this.crouchCharge = 0;
      if(this.body.velocity.x > 0){
        this.body.velocity.x -= 3.5;
      }else{
        this.body.velocity.x += 3.5;
      }
    }

    if(this.controls.keyA.pressed && !this.swimControls){

        if(this.crouchCharge >= 20 && !tileAbove && this.moveAvail('backflip')){
          this.specialMove = "backflip";
          this.anims.play( this.getCostume('backflip') );

          if(this.flipX && !this.rightSensor.blocked){
            this.body.setVelocityX(160);
          }else if(!this.flipX && !this.leftSensor.blocked){
            this.body.setVelocityX(-160);
          }

          this.body.setVelocityY(-700);

        }else{

          this.specialJump(-160 - xSpeed);

        }

    }
    if ( this.controls.keyB.pressed ){
      this.specialMove = "roll";
      this.anims.play(this.getCostume('rollAnim'));
    }else if( this.controls.keyZ.pressed && Math.abs(this.body.velocity.x) > 20 && this.specialMove == 'none' && !tileAbove){
      this.specialMove = "longJump";
      this.body.setVelocityY(-430);
      this.longJumpDist = Math.abs(this.body.velocity.x*0.25);
    }

  }

  specialJump(v){

    this.body.setVelocityY(v);
    this.jumpTimer = 1;

  }

  groundPound(){

    if(this.specialMove == 'groundPound'){

      this.updateCostume('poundAnim');

      if(this.anims.isPlaying){
        this.body.allowGravity = false;
        this.body.setVelocity(0, 0);

      }else{
        this.body.allowGravity = true;
        this.body.setVelocityY(1000);
      }

      if(this.onFloor){

        if(!this.poundResume){

          this.poundDelay++;

          if(this.poundDelay >= 2){

            this.body.setVelocityY(0);
            this.specialMove = 'none';

            this.poundImpact('groundPound');

          }

        }else{

          this.poundResume = false;
          this.poundDelay = 0;

        }

      }

      if(!this.onFloor && !this.swimControls){

        this.poundDelay = 0;

        if(this.controls.keyB.pressed && this.moveAvail('dive')){

          this.specialMove = "dive";
          this.body.setVelocityY(-400);

        }else if( !this.moveAvail('dive') && this.controls.justDown('UP') && this.body.velocity.y > 0){
          this.body.setVelocityY(this.body.velocity.y/2);
          this.specialMove = 'none';
        }

      }

    }

    if(this.specialMove == 'spinPound'){

      this.updateCostume('spin');

      if(!this.onFloor || this.poundResume){

        this.poundDelay = 0;

        if(!this.controls.direction.DOWN){

          this.specialMove = 'spinTwirl';
          this.body.setVelocityY(100);

        }else{
          this.body.setVelocityY(1100);
        }

        airMovement(this, this.controls);

      }else{

        this.poundDelay++;

        if(this.poundDelay >= 2){

          this.specialMove = 'none';
          this.body.setVelocityY(0);
          this.poundImpact('spinPound');

        }

      }

      this.poundResume = false;

    }

  }

  poundImpact(prevMove){

    var bPress = false;

    if(prevMove == 'groundPound'){
      bPress = this.controls.keyB.pressed;
    }else{
      bPress = (this.controls.keyB.active == 1 && this.controls.keyB.duration < 10);
    }

    if(this.controls.keyA.active && this.controls.keyA.duration < 5){

      this.specialJump(-260);

      if(prevMove == 'spinPound'){

        this.anims.play(this.getCostume('jump'));

      }

    }else if(bPress){

      if(this.flipX){
        this.body.setVelocityX(-800);
      }else{
        this.body.setVelocityX(800);
      }

      this.specialMove = "roll";
      this.anims.play(this.getCostume('rollAnim'));

    }

  }

  poundActive(){

    return (this.specialMove == 'groundPound' || this.specialMove == 'spinPound');

  }

  dive(){

    if(this.specialMove == "dive"){

      this.body.allowGravity = true;
      this.anims.play(this.getCostume('dive'));

      if(this.flipX){
        this.body.setVelocityX(-350);
      } else {
        this.body.setVelocityX(350);
      }

      if(this.onFloor){

        if(!this.controls.keyB.active){
          this.specialMove = 'none';
        }else{
          this.specialMove = "roll";
          this.anims.play(this.getCostume('rollAnim'));
        }

      }else if(this.swimControls){

        this.specialMove = "none";

      }else if(this.body.onWall() || this.kickbackDelay != 0){

        this.kickbackDelay++;

        if(this.kickbackDelay >= 2){

          this.specialMove = "kickback";

        }

      }

    }

  }

  backflip(){

    if(this.specialMove == "backflip"){

      this.updateCostume('backflip');

      airMovement(this, this.controls);

      if( !this.anims.isPlaying || this.onFloor || this.body.onCeiling() || this.swimControls){

        if(this.controls.direction.LEFT){
          this.flipX = true;
        }else if(this.controls.direction.RIGHT){
          this.flipX = false;
        }

        this.specialMove = "none";
      }else if( !this.controls.directionalPress('down') && this.controls.direction.DOWN ){
        this.specialMove = "groundPound";
        this.anims.play("poundAnim" + this.costume, true);
      }

    }

  }

  kickback(){

    if(this.specialMove == "kickback"){
      if(this.onFloor){
        this.specialMove = "none";
      }else{
        this.anims.play(this.getCostume('kickback'));

        var kickSpeed = 100;

        if(this.swimControls){
          kickSpeed = 60;
        }

        if(this.flipX){
          this.body.setVelocityX(kickSpeed);
        }else{
          this.body.setVelocityX(-kickSpeed);
        }

        if(this.swimControls && this.body.velocity.y > 0){
          this.body.setVelocityY(this.body.velocity.y * 0.8);
        }

      }
    }

    if(this.specialMove == "playerKickback"){

      if(this.playerKickback_Timer == 0 && this.onFloor && this.body.velocity.y > -1){
        this.body.setVelocityY(-350);
      }

      this.playerKickback_Timer++;

      if(this.onFloor && this.playerKickback_Timer >= 30){
        this.specialMove = "none";
      }else{
        this.anims.play(this.getCostume('kickback'));

        if(this.flipX && !this.rightSensor.blocked){
          this.body.setVelocityX(100);
        }else if(!this.flipX && !this.leftSensor.blocked){
          this.body.setVelocityX(-100);
        }

        if(this.swimControls && this.body.velocity.y > 0){
          this.body.setVelocityY(this.body.velocity.y * 0.8);
        }

      }
    }

  }

  roll(tileAbove){

    if (this.specialMove == "roll") {

      this.body.allowGravity = true;

      if(this.anims.isPlaying){

        this.updateCostume('rollAnim');

        altJump(this, this.controls);

        var playerRollAnim = this.scene.anims.get(this.anims.getName());

        if (Math.abs(this.body.velocity.x) != 800) {
          if (this.controls.keyB.pressed && this.onFloor) {
            this.rollTimer +=5;
          }
          this.rollTimer--;
          if(this.rollTimer > 10){
            this.rollTimer = 10;
          }
          if(this.rollTimer < 0){
            this.rollTimer = 0;
          }

          var rollSpeed = 300;

          if(this.swimControls){
            rollSpeed = 200;
          }

          if(this.flipX){
            this.body.setVelocityX(-rollSpeed + (this.rollTimer*-15));
          }else{
            this.body.setVelocityX(rollSpeed + (this.rollTimer*15));
          }

          // var newFrameRate = 8 + Math.round( ( Math.abs(this.body.velocity.x/37.5) ) );
          //
          // this.anims.setTimeScale(newFrameRate/12);

          if(this.body.onWall()){

            this.kickbackDelay++;

            if(this.kickbackDelay >= 2){

              this.kickbackDelay = 0;

              if (this.onFloor) {
                this.flipX = !this.flipX;
                this.body.setVelocityX(-this.body.velocity.x);
              }else if(!tileAbove){
                this.specialMove = "kickback";
              }

            }

          }else{
            this.kickbackDelay = 0;
          }
        }

         if(this.controls.keyA.pressed && this.moveAvail('longJump') && this.onFloor && !tileAbove && !this.swimControls){
           this.specialMove = "longJump";
           this.body.setVelocityY(-400);
           this.longJumpDist = Math.abs(this.body.velocity.x*0.35);
         }else if(this.stomped){

           this.stomped = false;

           if(this.controls.keyA.active){
             this.specialJump(-Math.abs(this.body.velocity.x)*0.8);
           }else{
             this.specialJump( - 45 - Math.abs(this.body.velocity.x));
           }

         }else if(this.controls.keyZ.pressed && !this.onFloor){

           // this.body.setVelocityX(this.body.velocity.x/2);
           // this.specialMove = "none";
           // this.rollTimer = 0;

         }

      } else {
        if( ( ((this.controls.keyB.pressed) || this.rollTimer > 5) && this.onFloor) || !this.onFloor){
          this.anims.play(this.getCostume('rollAnim'));
        }else{
          if(this.onFloor){
            if(tileAbove){
              this.anims.play(this.getCostume('duck'));
            }else{
              this.anims.play(this.getCostume('idle'));
            }
            this.specialMove = "none";
            this.rollTimer = 0;
          }
        }
      }
    }

  }

  longJump(){

    if(this.specialMove == "longJump"){
      this.jumpCounter = 0;
      this.anims.play(this.getCostume('longJump'));

      if(this.kickbackDelay == 0){

        if(this.flipX){
          this.body.setVelocityX(-360 -this.longJumpDist);

          if(this.controls.direction.RIGHT && !this.body.blocked.right){
            this.longJumpDist -=15;
          }

        }else{
          this.body.setVelocityX(360 + this.longJumpDist);

          if(this.controls.direction.LEFT && !this.body.blocked.left){
            this.longJumpDist -=15;
          }
        }

      }

      if((this.onFloor && this.body.velocity.y > -1) || this.swimControls){
        this.specialMove = "none";
      }

      var hitWall = (!this.flipX && (this.body.blocked.right || this.rightSensor.blocked)) || (this.flipX && (this.body.blocked.left || this.leftSensor.blocked));

      if(hitWall || this.kickbackDelay != 0){

        this.body.setVelocityX(0);

        this.kickbackDelay++;

        if(this.kickbackDelay >= 2){

          this.specialMove = "kickback";
          this.kickbackDelay = 0;

        }

      }else{

        this.kickbackDelay = 0;

      }
    }

  }

  wallJump(vX, flipX){

    this.body.setVelocityX(vX*1.5);

    if( this.controls.keyZ.pressed ){
      this.anims.play(this.getCostume('spin'), true);
      this.body.setVelocityY(-410);
      this.spinJumpActive = true;
    }else{
      this.body.setVelocityY(-450);
    }

    this.onWall = false;
    this.flipX = flipX;

    this.body.allowGravity = true;
    this.specialMove = "none";
    this.momentumLock = true;
    this.momentumLock_Delay = 12;

    if(this.flipX){
      this.lockDirection = "left";
    }else{
      this.lockDirection = "right";
    }

  }

  wallSlide(){

    if(this.specialMove == "wallSlide"){

      this.body.allowGravity = false;

      this.anims.play(this.getCostume('wallSlide'));

      if(!this.onWall || this.stomped){

        this.specialMove = 'none';
        this.body.allowGravity = true;

      }else{

        if(this.flipX){

          //this.body.setVelocityX(-20);

          if(this.controls.keyA.pressed || this.controls.keyZ.pressed){

            this.wallJump(250, false);

          }else if(this.onWall){

            this.body.setVelocityY(150);

          }else{
            this.specialMove = 'none';
            this.body.allowGravity = true;
          }

        }else{

          //this.body.setVelocityX(20);

          if(this.controls.keyA.pressed || this.controls.keyZ.pressed){

            this.wallJump(-250, true);

          }else if(this.onWall){

            this.body.setVelocityY(150);

          }else{
            this.specialMove = 'none';
            this.body.allowGravity = true;
          }

        }

      }


    }

  }

  sideflip(){

    if(this.specialMove == "sideflip"){

      var disableFlip = this.body.onCeiling() || (this.body.onWall() && this.body.velocity.y > 0) || this.onFloor;

      this.anims.play(this.getCostume('doubleJump2'));

      if(this.flipX){
        this.body.setVelocityX(-200);
        this.rotation -= (Math.PI/32);

        if(this.rotation > 0 && this.rotation < Math.PI/4 || disableFlip){
          this.specialMove = "none";
          this.rotation = 0;
          this.jumpTimer = 0;

          if(disableFlip){
            this.body.setVelocityX(0);
          }

        }

      }else{
        this.body.setVelocityX(200);
        this.rotation += (Math.PI/32);

        if(this.rotation < 0 && this.rotation > Math.PI/-4 || disableFlip){
          this.specialMove = "none";
          this.rotation = 0;
          this.jumpTimer = 0;

          if(disableFlip){
            this.body.setVelocityX(0);
          }

        }

      }

      if( !this.controls.directionalPress('down') && this.controls.direction.DOWN ){
        this.specialMove = "groundPound";
        this.rotation = 0;
        this.jumpTimer = 0;
        this.anims.play("poundAnim" + this.costume, true);
      }

    }

  }

  spinTwirl(){

    if(this.specialMove == 'spinTwirl'){

      this.updateCostume('spin');

      this.spinTwirlTimer++;

      if(this.onFloor){

        if(this.spinTwirlTimer >= 50){

          this.specialMove = 'none';

        }else if(this.controls.keyA.pressed){

          this.body.setVelocityY(-715);
          this.spinTwirlTimer = 24;

        }

      }else{

        if(!this.controls.directionalPress('down') && this.controls.direction.DOWN){

          this.specialMove = 'spinPound';

        }else if(this.moveAvail('wallSlide')){

          this.wallDetection(this.controls.keyA.pressed);

        }else if(this.stomped){



        }

      }

      airMovement(this, this.controls);

    }

  }

}
