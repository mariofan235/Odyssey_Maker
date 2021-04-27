import 'phaser';

class DeathAnimation extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y, key, costume){

    super(scene, x, y, key);

    scene.add.existing(this);

    scene.physics.world.enableBody(this);

    this.body.allowGravity = false;

    this.anims.setCurrentFrame(scene.anims.get('deathAnim' + costume).getFrameAt(0));

    this.delay = 20;

    this.costume = costume;

  }

  preUpdate(time, delta){

    super.preUpdate(time, delta);

    if(this.delay == 0){

      this.body.allowGravity = true;
      this.body.setVelocityY(-800);
      this.anims.play('deathAnim' + this.costume);

    }

    this.delay--;

    if(this.y > this.scene.levelSize.height + 40 && this.body.velocity.y > 0){
      this.destroy(true, true);
    }

  }

}

class BrickBust extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y, key, brickNo){

    super(scene, x, y, key);

    scene.add.existing(this);

    scene.physics.world.enableBody(this);

    scene.effectsGroup.add(this);

    this.brickNo = brickNo;

    this.setFrame(brickNo - 1);

    this.body.gravity.y = 500;

    if(this.brickNo == 1 || this.brickNo == 3){

      this.body.setVelocityX(-120);

    }else{

      this.body.setVelocityX(120);

    }

    if(this.brickNo == 1 || this.brickNo == 2){

      this.body.setVelocityY(-450);

    }else{

      this.body.setVelocityY(-200);

    }

  }

  preUpdate(time, delta){

    if(this.y > this.scene.levelSize.height + 40){
      this.destroy(true, true);
    }

  }

}

export {DeathAnimation, BrickBust};
