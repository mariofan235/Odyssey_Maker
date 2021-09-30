import 'phaser';

export class Cap extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, key, orgPlayer){

    super(scene, x, y, key);

    scene.add.existing(this);

    scene.physics.world.enableBody(this);

    scene.playerCaps.add(this);

    this.disableBody(true, true);

    this.orgPlayer = orgPlayer;

    this.body.allowGravity = false;

    this.numPress = 0;
    this.destroyCap = false;
    this.capLaunch = false;
    this.launchDirection = '';
    this.timePause = false;
    this.capReturn = false;
    this.capDelay = 0;
    this.capHold = false;
    this.returnTimer = 0;
    this.timerList = [];

    //For Twirl Spin Move
    this.twirlSpeed = 0;
    this.numSpins = 0;
    this.spinState = '';
    this.prevPos = 0;
    this.twirlDist = 0;
    this.depthState = '';
    this.samePlane = true;
    this.planeTimer = 0;

    scene.physics.add.collider(this, this.scene.playerCaps, null, function(){
      return (!this.capReturn);
    }, this);

    scene.physics.add.overlap(this.scene.playerGroup, this, this.capPause, function(){
      return (this.capHold && !this.capReturn);
    }, this);

    scene.physics.add.collider(this.scene.playerGroup, this, function (c, p) {

      if(this.launchDirection == 'y_up'){

        if(p.y < this.y){

          p.stomped = true;

        }

      }else{

        if(this.x < p.x){
          p.body.setVelocityX(200);
        }else{
          p.body.setVelocityX(-200);
        }

      }

      this.capReturn = true;
    }, function(c, p){
      return (!this.capHold && !this.capReturn && this.depth == 0 && p != this.orgPlayer);
    }, this);

    scene.physics.add.overlap(this.orgPlayer, this, this.touchPlayer, function(){
      return (this.capReturn);
    }, this);

  }

  preUpdate(time, delta){

    super.preUpdate(time, delta);

    //Credit to Mario Odyssey Speedrun Wiki

    var keyDown = (this.orgPlayer.controls.buttons.B3 || this.orgPlayer.controls.buttons.B2);

    if(this.capLaunch){

      this.scene.physics.world.overlap(this, this.scene.blockGroup, function(cap, tile){
        this.body.setVelocity(0, 0);
        this.capReturn = true;
      }, function(cap, tile){
        return (!this.capReturn && !this.capHold && tile.canCollide);
      }, this);

      if(this.launchDirection == 'x'){

        if(this.flipX){

          this.body.velocity.x += 15;

          if(this.body.velocity.x > 0){

              this.body.setVelocityX(0);

              if(!this.capHold){

                this.capHoldTimer(keyDown);

              }else{

                this.capTimer(keyDown);

              }

          }

        }else{

          this.body.velocity.x -= 15;

          if(this.body.velocity.x < 0){

              this.body.setVelocityX(0);

              if(!this.capHold){

                this.capHoldTimer(keyDown);

              }else{

                this.capTimer(keyDown);

              }

          }

        }

      }else if(this.launchDirection == 'y_up'){

        this.body.velocity.y += 15;

        if(this.body.velocity.y > 0){

            this.body.setVelocityY(0);

            if(!this.capHold){

              this.capHoldTimer(keyDown);

            }else{

              this.capTimer(keyDown);

            }

        }

      }else if(this.launchDirection == 'y_down'){

        this.body.velocity.y -= 15;

        if(this.body.velocity.y < 0){

            this.body.setVelocityY(0);

            if(!this.capHold){

              this.capHoldTimer(keyDown);

            }else{

              this.capTimer(keyDown);

            }

        }

      }else{

        this.superTwirl();
        this.planeTimerConfig();

      }

    }

    if(this.capReturn){

      if(this.returnTimer < 1){

        this.returnToPlayer(this.orgPlayer, 10);

      }else{
        this.returnTimer--;
      }

    }

  }

  launch(speed, dir){

    this.flipX = this.orgPlayer.flipX;
    this.setScale(1);

    if(dir == 'x' || dir == 'z'){
      this.anims.play('capSpin' + this.orgPlayer.playerNo);
    }else{
      this.anims.play('capSpin-Y' + this.orgPlayer.playerNo);
    }

    this.enableBody(true, this.orgPlayer.x, this.orgPlayer.y + 5, true, true);

    this.capLaunch = true;

    this.initLaunchSpeed(speed, dir);

  }

  initLaunchSpeed(speed, dir){

    if(dir == 'x'){

      if(this.flipX){
        this.x -= 15;
        this.body.setVelocityX(-350 - (speed*0.7) );
      }else{
        this.x += 15;
        this.body.setVelocityX(350 + (speed*0.7) );
      }

    }else if(dir == 'z'){

      if(this.flipX){
        this.x -= 15;
        this.twirlSpeed = -650;
        this.body.setVelocityX(this.twirlSpeed);
      }else{
        this.x += 15;
        this.twirlSpeed = 650;
        this.body.setVelocityX(this.twirlSpeed);
      }

      this.twirlSpeed = Math.abs(this.twirlSpeed);
      this.numSpins = 1;
      this.initSuperTwirl();
      this.spinState = 'in';

    }else{

      if(this.flipX){
        this.x -= 15;
      }else{
        this.x += 15;
      }

      this.body.setVelocityY(-speed);

    }

    this.launchDirection = dir;

  }

  initSuperTwirl(){

    if(this.flipX){

      this.twirlDist = Math.abs(this.getCenter().x - this.orgPlayer.getCenter().x);

      this.prevPos = this.orgPlayer.getCenter().x;

      this.body.setVelocityX(this.twirlSpeed*-1);

      //this.depthState = 'front';
      this.depthState = 'back';

    }else{

      this.twirlDist = Math.abs(this.getCenter().x - this.orgPlayer.getCenter().x);

      this.prevPos = this.orgPlayer.getCenter().x;

      this.body.setVelocityX(this.twirlSpeed*-1);

      //this.depthState = 'front';
      this.depthState = 'back';

    }

  }

  superTwirl(){

    var totalDist = this.twirlDist*(1 + ((this.numSpins - 1)*2.5));

    var totalSpeed = this.twirlSpeed*( 1 + ((this.numSpins - 1)/8) );

    var scaleInc = 0.02;

    if(this.spinState == 'init'){

      // if(this.flipX){
      //
      //   this.body.velocity.x += 20;
      //
      //   if(this.body.velocity.x > 0){
      //
      //     this.spinState = 'in';
      //
      //     this.twirlDist = Math.abs(this.getCenter().x - this.orgPlayer.getCenter().x);
      //
      //     this.prevPos = this.orgPlayer.getCenter().x;
      //
      //     this.body.setVelocityX(this.twirlSpeed*-1);
      //
      //     //this.depthState = 'front';
      //     this.depthState = 'back';
      //
      //   }
      //
      // }else{
      //
      //   this.body.velocity.x -= 20;
      //
      //   if(this.body.velocity.x < 0){
      //
      //     this.spinState = 'in';
      //
      //     this.twirlDist = Math.abs(this.getCenter().x - this.orgPlayer.getCenter().x);
      //
      //     this.prevPos = this.orgPlayer.getCenter().x;
      //
      //     this.body.setVelocityX(this.twirlSpeed*-1);
      //
      //     //this.depthState = 'front';
      //     this.depthState = 'back';
      //
      //   }
      //
      // }

    }else if(this.spinState == 'in'){

      if(!this.flipX){

        if(this.getCenter().x <= this.prevPos - totalDist ){

          this.x = this.prevPos - totalDist;

          this.spinState = 'out';

          this.samePlane = true;
          this.planeTimer = 0;

        }else{

          this.body.setVelocityX(totalSpeed*-1);



        }

      }else{

        if(this.getCenter().x >= this.prevPos + totalDist ){

          this.x = this.prevPos + totalDist;

          this.spinState = 'out';

          this.samePlane = true;
          this.planeTimer = 0;

        }else{

          this.body.setVelocityX(totalSpeed);



        }

      }

    }else if(this.spinState == 'out'){

      if(!this.flipX){

        if(this.getCenter().x >= this.prevPos + totalDist){

          this.x = this.prevPos + totalDist;

          this.spinState = 'in';

          this.samePlane = true;
          this.planeTimer = 0;

          this.numSpins++;

        }else{

          this.body.setVelocityX(totalSpeed);



        }

      }else{

        if(this.getCenter().x <= this.prevPos - totalDist){

          this.x = this.prevPos - totalDist;

          this.spinState = 'in';

          this.samePlane = true;
          this.planeTimer = 0;

          this.numSpins++;

        }else{

          this.body.setVelocityX(this.twirlSpeed*-1);

        }

      }

    }

    if(this.spinState == 'in'){

      if(this.depthState == 'front'){

        this.scale += scaleInc;

        if(!this.samePlane){
          this.setDepth(1);
        }else{
          this.setDepth(0);
        }

        if(this.scale >= 1.8){
          this.depthState = 'back';
        }

      }else{

        this.scale -= scaleInc;

        if(!this.samePlane){
          this.setDepth(-1);
        }else{
          this.setDepth(0);
        }

        if(this.scale <= 0.2){
          this.depthState = 'front';
        }

      }

    }else{

      this.setScale(1);

      if(!this.samePlane){
        this.setDepth(1);
      }else{
        this.setDepth(0);
      }


      this.depthState = 'back';

    }

    if(this.numSpins >= 5 || this.capReturn || this.body.onWall()){

      this.setScale(1);
      this.setDepth(0);
      this.body.setVelocity(0, 0);
      this.capTimer(false);
      //Depth: 0

    }

  }

  planeTimerConfig(){

    if(this.samePlane){

      this.planeTimer++;

      if(this.planeTimer >= 5){

        this.samePlane = false;

      }

    }

  }

  capPause(cap, player){

    var capJumped = player.capJump;

    if(!player.capJump && player.jumpTimer == 0 && player.specialMove != 'throwCap' && !player.swimControls){

      if(player.y  - 10 < this.y || player.onFloor){

        player.capJump = true;

        if(!player.onFloor){

          player.body.setVelocityY(-500);

        }else{

          player.body.setVelocityY(-700);

          if(player.specialMove != 'roll' && !this.scene.hasTileAbove(player.x, player.getTopCenter().y)){

            player.anims.play(player.getCostume('tripleJump'), true);

            if( (player.flipX && player.leftSensor.blocked) || (!player.flipX && player.rightSensor.blocked) ){
              player.body.setVelocityX(0);
            }

            player.specialMove = 'vault';

          }

        }

      }else{

        player.capJump = true;
        player.body.setVelocityY(-300);

      }

    }

    if((player.specialMove == "dive" && !capJumped) || player.specialMove == "wallSlide"){
      player.specialMove = "none";
      player.body.allowGravity = true;
    }

    this.numPress = 300;

  }

  capTimer(keyDown){

    if(keyDown){
      this.numPress++;
    }else{
      this.numPress = 300;
    }

    if(this.numPress >= 300){

      this.capReturn = true;
      this.capHold = false;
      this.returnTimer = 5;
      this.capLaunch = false;

    }

  }

  capHoldTimer(keyDown){

    if(keyDown && !this.capReturn){
      this.capHold = true;
      this.numPress = 0;
    }else{
      this.capReturn = true;
      this.returnTimer = 5;
      this.capLaunch = false;
    }

  }

  returnToPlayer(player, speed){

      //Resets Anim
      if(this.anims.getName() != ('capSpin' + this.orgPlayer.playerNo) ){
        this.anims.play('capSpin' + this.orgPlayer.playerNo);
      }

      if(player.x - 25 > this.x){
        this.x += speed;
      }
      if(player.x + 25 < this.x){
        this.x -= speed;
      }

      if(player.y - 10 < this.y){
        this.y -= speed;
      }
      if(player.y + 10 > this.y){
        this.y +=speed;
      }

  }

  touchPlayer(player){

    this.body.setVelocity(0, 0);
    this.disableBody(true, true);
    player.wearingCap = true;
    this.capReturn = false;

    if(player.controls.keyA.active && player.controls.keyA.duration <= 10 && (player.specialMove == 'none') && !player.midairTwirl){

      if(player.onFloor){

        player.body.setVelocityY(-670);

      }else{

        player.body.setVelocityY(-500);

      }

      player.specialMove = 'capTwirl';

      player.anims.play(player.getCostume('twirl'), true);

      player.midairTwirl = true;

    }

  }

}
