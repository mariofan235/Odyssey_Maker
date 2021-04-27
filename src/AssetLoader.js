export class AssetLoader extends Phaser.Scene {

  constructor() {
    super("loadGame");
  }

  preload(){

    // const costumeList = [1, 6, 5, 4];
    const costumeList = [0, 0, 0, 0];

    // this.load.image('backgroundX', 'assets/graphics/backgrounds/Background1_X.png');
    // this.load.image('backgroundY', 'assets/graphics/backgrounds/Background1_Y.png');

    this.load.spritesheet('backgroundX', 'assets/graphics/backgrounds/Background0_X.png', {
      frameWidth: 1024,
      frameHeight: 1024
    });
    this.load.spritesheet('backgroundY', 'assets/graphics/backgrounds/Background0_Y.png', {
      frameWidth: 1024,
      frameHeight: 1024
    });

    this.load.spritesheet('player-icons', 'assets/ui/player_icons.png', {
      frameWidth: 133,
      frameHeight: 82
    });

    this.load.bitmapFont('font-0', 'assets/ui/text/mario-maker.png', 'assets/ui/text/mario-maker.fnt');
    this.load.bitmapFont('font-1', 'assets/ui/text/modern-mario.png', 'assets/ui/text/modern-mario.fnt');
    this.load.bitmapFont('font-2', 'assets/ui/text/retro-style.png', 'assets/ui/text/retro-style.fnt');
    this.load.bitmapFont('font-3', 'assets/ui/text/nes-font.png', 'assets/ui/text/nes-font.fnt');
    this.load.bitmapFont('font-4', 'assets/ui/text/mario-odyssey.png', 'assets/ui/text/mario-odyssey.fnt');

    //Terrain

    for(var i = 0; i <= 2; i++){

      this.load.image('terrain-' + i, 'assets/graphics/terrain/terrain_' + i + '.png');

    }

    //Blocks

    for(var b = 0; b <= 11; b++){

      this.load.spritesheet("block-" + b, "assets/graphics/blocks/block_" + b + ".png", {
        frameWidth: 32,
        frameHeight: 32
      });

    }

    this.load.spritesheet("block-1.1", "assets/graphics/blocks/block_1.1.png", {
      frameWidth: 32,
      frameHeight: 32
    });

    this.load.spritesheet("effect-0", "assets/graphics/effects/effect_0.png", {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.atlas("Mario", "assets/graphics/player/costumes/Costume_" + costumeList[0] + ".png", "assets/graphics/player/main.json");

    this.load.script('player_js', 'assets/player_anim.js');

    this.load.spritesheet("cap", "assets/graphics/player/caps/Cappy-X_" + costumeList[0] + ".png", {
      frameWidth: 22,
      frameHeight: 12
    });

    this.load.spritesheet("cap-Y", "assets/graphics/player/caps/Cappy-Y_" + costumeList[0] + ".png", {
      frameWidth: 30,
      frameHeight: 30
    });

    this.loadCostumes(costumeList);


  }

  create(){

    var levelConfig = {
      width: 2,
      height: 2,
      numPlayers: 1,
      startX: 5,
      startY: 2,
      availMoves: ['spinJump', 'wallSlide', 'roll', 'backflip', 'groundPound', 'dive', 'longJump', 'spinJump', 'sideflip', 'spinTwirl', 'spinPound']
    };

    // this.anims.create({
    //   key: 'bx_anim',
    //   frames: this.anims.generateFrameNumbers("backgroundX", {
		// 		start: 0,
		// 		end: 3
		// 	}),
    //   frameRate: 12,
    //   repeat: -1
    // });

    this.createBlockAnim();

    this.anims.create({
			key: "capSpin",
			frames: this.anims.generateFrameNumbers("cap", {
				start: 2,
				end: 5
			}),
			frameRate: 20,
			repeat: -1
		});

    this.anims.create({
			key: "capSpin-Y",
			frames: this.anims.generateFrameNumbers("cap-Y", {
				start: 0,
				end: 3
			}),
			frameRate: 20,
			repeat: -1
		});

    this.createCapAnim();

    playerAnim(this, 'Mario', '');

    for(var i = 1; i < levelConfig.numPlayers; i++){

      playerAnim(this, 'player_' + i, '_' + i);

    }

    if(this.input.gamepad != null){

      this.input.gamepad.once('down', function (pad, button, index) {

          this.scene.launch('mainGame', levelConfig);
          this.scene.launch('stageEditor', levelConfig);

      }, this);

    }else{
      this.scene.launch('mainGame', levelConfig);
      this.scene.launch('stageEditor', levelConfig);
    }

  }

  loadCostumes(list){

    for(var i = 1; i < 4; i++){

      this.load.atlas("player_" + i, "assets/graphics/player/costumes/Costume_" + list[i] + ".png", "assets/graphics/player/main.json");

      this.load.spritesheet("cap_" + i, "assets/graphics/player/caps/Cappy-X_" + list[i] + ".png", {
        frameWidth: 22,
        frameHeight: 12
      });

      this.load.spritesheet("cap-Y_" + i, "assets/graphics/player/caps/Cappy-Y_" + list[i] + ".png", {
        frameWidth: 30,
        frameHeight: 30
      });

    }

  }

  createCapAnim(){

    for(var i = 1; i < 4; i++){

      this.anims.create({
  			key: "capSpin_" + i,
  			frames: this.anims.generateFrameNumbers("cap_" + i, {
  				start: 2,
  				end: 5
  			}),
  			frameRate: 20,
  			repeat: -1
  		});

      this.anims.create({
  			key: "capSpin-Y_" + i,
  			frames: this.anims.generateFrameNumbers("cap-Y_" + i, {
  				start: 0,
  				end: 3
  			}),
  			frameRate: 20,
  			repeat: -1
  		});

    }

  }

  createBlockAnim(){

    this.anims.create({
	    key: 'block-0_anim',
			frames: this.anims.generateFrameNumbers("block-0", {
				start: 3,
				end: 0
			}),
			frameRate: 6,
			repeat: -1,
			repeatDelay: 500
    });

    this.anims.create({
	    key: 'Block_Hit',
			frames: this.anims.generateFrameNumbers("block-2", {
				start: 0,
				end: 0
			}),
    });

    this.anims.create({
	    key: 'block-6_Anim',
			frames: this.anims.generateFrameNumbers("block-6", {
				start: 1,
				end: 0
			}),
			frameRate: 6,
			repeat: -1,
			repeatDelay: 500
    });

    this.anims.create({
			key: "block-11_idle",
			frames: [ {key: "block-11", frame: 0} ],
			frameRate: 20
		});

    this.anims.create({
	    key: 'block-10_anim',
			frames: this.anims.generateFrameNumbers("block-10", {
				start: 1,
				end: 3
			}),
			frameRate: 6,
			repeat: -1
    });

  }

}
