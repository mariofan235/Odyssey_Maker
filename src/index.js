import 'phaser';

import { GameEngine } from './GameEngine.js';

import { AssetLoader } from './AssetLoader.js';

import { LevelEditor } from './LevelEditor.js';

const gameConfig = {
  backgroundColor: "#0",
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    width: 960,
    height: 540,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: {y:1350},
      debug: false
    }
  },
  input:{
    gamepad: false
  },
  scene: [AssetLoader, GameEngine, LevelEditor]
  //scene: AssetLoader
};

var game = new Phaser.Game(gameConfig);
