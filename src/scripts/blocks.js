import 'phaser';

import {BrickBust} from './effects.js';

function createTerrain(scene, tileX, tileY, tileNum, factorA, blockName){

  if(tileNum == 0){



  }

  if(tileNum >= 1 && tileNum <= 2){

    b = new ItemBlock(scene, tileX, tileY, 'block-' + (tileNum - 1), factorA, blockName);

  }

  if(tileNum == 7){

    b = new CloudBlock(scene, tileX, tileY, 'block-7', blockName);

  }

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

    scene.physics.add.collider(this, scene.playerGroup);

    scene.physics.add.collider(this, scene.playerCaps, this.capSideCollide, null, this);

    this.tileX = tileX;
    this.tileY = tileY;

    this.startY = this.y;

    this.spawnContents = contents;
    this.npcStatus = 'none';
    this.hitDir = 'none';

    this.setName(bName);
    //this.canCollide = true;

    // this.setDepth(-0.5);

    if(blockID == 'block-0'){

      this.anims.play('block-0_anim');

    }

  }

  capSideCollide(npc, cap){

    if(!cap.capReturn && this.npcStatus == 'none'){

      if(cap.launchDirection == 'x' && cap.body.onWall()){

        this.initHitAnim('bumpUp', 'up');

      }

    }

  }

  capBelowCollide(cap){

    if(!cap.capReturn && cap.launchDirection == 'y_up' && cap.y > this.y){

      if( Math.abs(cap.getCenter().x - this.getCenter().x) <=32 && cap.getTopCenter().y - this.getBottomCenter().y <= 2){

        this.initHitAnim('bumpUp', 'up');

      }

    }

  }

  playerCollide(p){

    //Hit Below
    if(this.getCenter().y < p.getCenter().y && p.body.onCeiling() && this.touchSensor(p, 'down')){

      this.initHitAnim('bumpUp', 'up');

    }else

    //Hit Above
    if(this.getCenter().y > p.getCenter().y - 8 && this.touchSensor(p, 'up') && p.poundActive()){

      this.initHitAnim('bumpDown', 'down');
      p.poundResume = true;

    }else

    //Hit Side
    if(p.specialMove == 'dive' || p.specialMove == 'longJump' || p.specialMove == 'roll'){

      if( ( (!p.onFloor && p.specialMove != 'roll') || p.specialMove == 'roll') && this.touchSensor(p, 'side') ){

        p.kickbackDelay = 2;

        this.initHitAnim('bumpUp', 'up');

      }


    }

  }

  touchSensor(p, dir){

    var hitSensor = false;

    if(dir == 'down'){

      this.scene.physics.overlap(this, p.topSensor, function () {
        hitSensor = (p.topSensor.blocked);
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

    var b = null;

    for(var i = 1; i <= 4; i++){

      b = new BrickBust(this.scene, this.getCenter().x, this.getCenter().y, 'effect-0', i);

    }

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

    super.preUpdate(time, delta);

    if(this.npcStatus == 'none'){

      this.scene.playerGroup.getChildren().forEach((p) => {

        this.playerCollide(p);

      });

      this.scene.playerCaps.getChildren().forEach((c) => {

        this.capBelowCollide(c);

      });

    }else if(this.npcStatus != 'hit'){

      this.hitBlockAnim();
      this.destroy(true, true);

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
