import 'phaser';

export class Test extends Phaser.GameObjects.Sprite {

  constructor(scene, x, y, key){

    super(scene, x, y, key);

    scene.add.existing(this);

    scene.physics.world.enableBody(this);

  }

}
