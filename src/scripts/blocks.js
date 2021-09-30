import 'phaser';

import {BrickBust} from './effects.js';

function createTerrain(scene, tileX, tileY, tileNum, factorA, blockName){

  var b = null;

  if(tileNum >= 1 && tileNum <= 2){

    b = new ItemBlock(scene, tileX, tileY, 'block-' + (tileNum - 1), factorA, blockName);

  }

  if(tileNum == 7){

    b = new CloudBlock(scene, tileX, tileY, 'block-7', blockName);

  }

  return b;

}

class TerrainBlock extends Phaser.GameObjects.Sprite {

  constructor(scene, tileX, tileY, blockNo){

    super(scene, tileX*32+16, tileY*32+16, 'terrain-0');

    scene.physics.add.collider(this, scene.playerGroup);
    scene.physics.add.collider(this, scene.playerCaps);

    this.tileX = tileX;
    this.tileY = tileY;

    this.setName('terrain');

    scene.add.existing(this);

    if(blockNo > this.texture.frameTotal - 1){

      this.setFrame(0);

    }else{

      this.setFrame(blockNo);

    }

  }

}

class ItemBlock extends Phaser.GameObjects.Sprite {

  constructor(scene, tileX, tileY, blockID, contents, bName){

    super(scene, tileX*32+16, tileY*32+16, blockID);

    scene.add.existing(this);

    // scene.physics.add.collider(this, scene.playerGroup);
    //
    // scene.physics.add.collider(this, scene.playerCaps, this.capSideCollide, null, this);

    this.tileX = tileX;
    this.tileY = tileY;

    this.startY = this.y;

    this.spawnContents = contents;
    this.npcStatus = 'none';
    this.hitDir = 'none';

    this.blockID = blockID;

    this.setName(bName);
    //this.canCollide = true;

    // this.setDepth(-0.5);

    this.scene.events.on('resetLevel', function () {

      if(!this.active){return;}

      this.anims.stop();

      if(this.npcStatus == 'hit'){

        this.parentTile.setCollision(true, true, true, true);
        this.setVisible(true);

      }

      this.npcStatus = 'none';


    }, this);

    this.scene.events.on('activateGame', function () {

      if(!this.active){return;}

      if(this.blockID =='block-0'){
        this.anims.play('block-0_anim');
      }
    }, this);

    this.scene.events.on('activateEditor', function () {
      if(!this.active){return;}

      this.setTexture(this.blockID, 0);

    }, this);

    this.scene.events.on('blockHit', function (obj) {
      if(!this.active){return;}
      this.playerCollide(obj);

    }, this);

    this.scene.events.on('sideBlockHit', function (obj) {
      if(!this.active){return;}
      this.playerSideCollide(obj);

    }, this);

  }

  capSideCollide(cap){

    if(!cap.capReturn && this.npcStatus == 'none'){

      var capTileY = this.scene.mainLayer.worldToTileY(cap.y);
      var blockTileY = this.scene.mainLayer.worldToTileY(this.y)

      if(cap.launchDirection == 'x' && capTileY == blockTileY){

        this.initHitAnim('bumpUp', 'up');

      }

    }

  }

  capBelowCollide(cap){

    if(!cap.capReturn){

      if(cap.launchDirection == 'y_up' && cap.y > this.y){

        if( Math.abs(cap.getCenter().x - this.getCenter().x) <=32 && cap.getTopCenter().y - this.getBottomCenter().y <= 2){

          this.initHitAnim('bumpUp', 'up');

        }

      }

      if(cap.launchDirection == 'y_down' && cap.y < this.y){

        if( Math.abs(cap.getCenter().x - this.getCenter().x) <=32 && this.getTopCenter().y - cap.getBottomCenter().y <= 2){

          this.initHitAnim('bumpDown', 'down');

        }

      }

    }



  }

  playerSideCollide(p){

    if(this.npcStatus != 'none'){
      return;
    }

    const pTileY = this.scene.mainLayer.worldToTileY(p.getCenter().y);

    //Hit Side

    if(p.specialMove == 'roll'){

      if(pTileY == this.tileY){

        //p.kickbackDelay = 2;

        this.initHitAnim('bumpUp', 'up');

      }

    }else{

      var pTileX = 0;

      if(p.x < this.x){

        pTileX = this.scene.mainLayer.worldToTileX(p.getCenter().x) + 1;

      }else{

        pTileX = this.scene.mainLayer.worldToTileX(p.getCenter().x) - 1;

      }



      // const inRangeX = Math.abs(p.getCenter().x - this.getCenter().x) > 22 && Math.abs(p.getCenter().x - this.getCenter().x) < 32;
      //
      // const inRangeY = Math.abs(p.getCenter().y - this.getCenter().y) < 42;
      //



      if(!p.body.onFloor() && pTileX == this.tileX && (Math.abs(pTileY - this.tileY) <= 1) ){

        p.kickbackDelay = 2;

        this.initHitAnim('bumpUp', 'up');

      }

    }

  }

  playerCollide(p){

    if(this.npcStatus != 'none'){
      return;
    }

    //console.log(this.touchSensor(p, 'down'));

    var inRangeX = Math.abs(p.topSensor.getCenter().x - this.getCenter().x) < 30;
    var inRangeY = Math.abs(p.topSensor.getCenter().y - this.getCenter().y) < 28;

    var botInRangeY = Math.abs(p.getBottomCenter().y - this.getTopCenter().y) < 22;

    //console.log(Math.abs(p.bottomSensor.getCenter().y - this.getTopCenter().y));

    //Hit Below
    if(this.getCenter().y < p.topSensor.getCenter().y && inRangeX && inRangeY){

      this.initHitAnim('bumpUp', 'up');

    }else

    //Hit Above
    if(this.getCenter().y > p.getCenter().y - 8 && p.poundActive() && inRangeX && botInRangeY){

      this.initHitAnim('bumpDown', 'down');
      p.poundResume = true;

    }

  }

  touchSensor(p, dir){

    var hitSensor = false;

    if(dir == 'down'){

      this.scene.physics.overlap(this, p.topSensor, function () {
        hitSensor = (p.topSensor.blocked);
        //hitSensor =
      });

    }

    if(dir == 'up'){

      this.scene.physics.overlap(this, p.bottomSensor, function () {
        hitSensor = (p.bottomSensor.blocked);
      });

    }

    if(dir == 'side'){

      this.scene.physics.overlap(this, p.leftSensor, function (npc) {
        hitSensor = (p.leftSensor.blocked && p.flipX);
      });

      this.scene.physics.overlap(this, p.rightSensor, function (npc) {
        hitSensor = (p.rightSensor.blocked && !p.flipX);
      });

    }


    return hitSensor;


  }

  initHitAnim(state, dir){

    this.npcStatus = state;
    this.hitDir = dir;

    if(this.blockID != 'block-1'){
      return;
    }

    var b = null;

    for(var i = 1; i <= 4; i++){

      b = new BrickBust(this.scene, this.getCenter().x, this.getCenter().y, 'effect-0', i);

    }

    // this.parentTile.setCollision(false, false, false, false);
    // this.setVisible(false);

  }

  hitBlockAnim(){

    if(this.hitDir == 'up'){

      if(this.npcStatus == 'bumpUp'){

        this.y -=3;
        this.scale += 0.05;

        if(this.startY - this.y > 18){

          this.npcStatus = 'bumpDown';

        }

      }else{

        this.y +=3;
        this.scale -= 0.05;

        if(this.startY - this.y < 3){

          this.npcStatus = 'hit';
          this.y = this.startY;
          this.setScale(1);
          //this.parentTile.setCollision(false, false, false, false);

        }

      }

    }else{

      if(this.npcStatus == 'bumpDown'){

        this.y +=3;
        this.scale += 0.05;

        if(this.y - this.startY > 18){

          this.npcStatus = 'bumpUp';

        }

      }else{

        this.y -=3;
        this.scale -= 0.05;

        if(this.y - this.startY < 3){

          this.npcStatus = 'hit';
          this.y = this.startY;
          this.setScale(1);

        }

      }

    }

  }

  preUpdate(time, delta){

    if(this.active == false){return;}

    super.preUpdate(time, delta);

    if(this.npcStatus == 'none'){

      this.scene.playerGroup.getChildren().forEach((p) => {

        //this.playerCollide(p);

      });

      this.scene.playerCaps.getChildren().forEach((c) => {

        //this.capBelowCollide(c);

      });

    }else if(this.npcStatus != 'hit'){

      this.hitBlockAnim();

      if(this.blockID == 'block-1'){

      this.setVisible(false);
      this.parentTile.setCollision(false, false, false, false);

      }

    }else{

      this.anims.play('Block_Hit');

    }

  }

}

class HardBlock extends Phaser.GameObjects.Sprite {

  constructor(scene, tileX, tileY, blockID, bName){

    super(scene, tileX*32+16, tileY*32+16, blockID);

    scene.physics.add.collider(this, scene.playerGroup);
    scene.physics.add.collider(this, scene.playerCaps);

    this.tileX = tileX;
    this.tileY = tileY;

    this.setName(bName);

    scene.add.existing(this);

  }

}

class CloudBlock extends Phaser.GameObjects.Sprite {

  constructor(scene, tileX, tileY, blockID, bName){

    super(scene, tileX*32+16, tileY*32+16, blockID);

    scene.add.existing(this);

    scene.specialBlockGroup.add(this);

    this.body.allowGravity = false;
    this.body.immovable = true;

    this.body.checkCollision.left = false;
    this.body.checkCollision.right = false;
    this.body.checkCollision.down = false;

    scene.physics.add.collider(this, scene.playerGroup, function (npc, p) {

      if(p.body.touching.down){
        p.npcFloor = true;
      }

    });

  }

}

export {createTerrain};
