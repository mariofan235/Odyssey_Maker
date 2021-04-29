import {createTerrain} from './scripts/blocks.js';

export class LevelEditor extends Phaser.Scene {

  constructor() {
    super("stageEditor");
  }

  init(){

    this.engine = this.scene.get("mainGame");

    this.tileNo = 0;

    this.alt_TileNo = 0;

    this.spawnItem = 'terrain';

    this.pointerMode = 'place';

    //Types: Edit, Test, Search, Settings, etc.
    this.menuMode = 'edit';

    //Contains the 10 most recently used items
    this.recentItems = [];

    //Tiles that were destroyed during testing; TILE objects only
    this.respawnItems = [];

    this.tileID = [
        ['Terrain', '? Block', 'Brick Block', 'Used Block',
        'Hard Block', 'Invisible Block', 'Note Block', 'Spike Block', 'Cloud Block',
        'Donut Block', 'Ice Block', 'Rotate Block', 'Message Block'],
        ['Coin', 'Heart', 'Life-Up Heart', '1-Up', 'Red Coin', 'Blue Coin', 'Regional Coin'],
      ];

    this.tileGroups = ['terrain', 'items', 'npcs', 'gadgets', 'warps/goals', 'effects'];

    this.input.setDefaultCursor('url(assets/cursors/default_cursor.cur), pointer');
    this.pointer = this.input.activePointer;

  }

  create(){

    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    this.PLUS_KEY = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS);
    this.MINUS_KEY = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS);

    this.itemKeyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    this.itemKeyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);

    this.spawnPoint = this.engine.add.image(this.engine.playerStartPos.x, this.engine.playerStartPos.y, 'Mario');

    this.engine.events.on('resetLevel', function () {

      if(this.engine.gameMode == 'player'){

        this.spawnPoint.setVisible(false);

      }else{

        this.spawnPoint.setVisible(true);

      }

    }, this);

  }

  update(){

    this.engine.moveCamera();

    this.spawnPoint.setPosition(this.engine.playerStartPos.x, this.engine.playerStartPos.y);

    if(this.engine.timedKeyPress(this.keyP, 0)){

      const worldPoint = this.pointer.positionToCamera(this.engine.mainCam);

      var x = Math.round( ( worldPoint.x)/32 );
      var y = Math.round( ( worldPoint.y)/32 );

      this.engine.setSpawnPoint(x, y);

    }

    if(this.engine.timedKeyPress(this.itemKeyUp, 0)){

      if(this.alt_TileNo == 2){

        this.alt_TileNo = 0;

      }else{

        this.alt_TileNo++;

      }

    }else if(this.engine.timedKeyPress(this.itemKeyDown, 0)){

      if(this.alt_TileNo == 0){

        this.alt_TileNo = 2;

      }else{

        this.alt_TileNo--;

      }

    }

    if(this.pointer.isDown){

      if(this.pointerMode == 'place'){
        this.placeTile();
      }else if(this.pointerMode == 'erase'){
        this.eraseTile();
      }else{
        this.moveTile();
      }

    }

    if(this.engine.timedKeyPress(this.keyE, 0)){

      if(this.pointerMode == 'place'){
        this.pointerMode = 'erase';
      }else{
        this.pointerMode = 'place';
      }


    }

    // if(!this.engine.cursors.shift.isDown){
    //
    //   if(this.pointerMode == 'place'){
    //
    //     this.engine.moveCameraPos(this.pointer.x, this.pointer.y);
    //
    //   }
    //
    // }else{
    //
    //   this.engine.cameraZoom(this.PLUS_KEY.isDown, this.MINUS_KEY.isDown);
    //
    // }

  }

  placeTile(){

    const worldPoint = this.pointer.positionToCamera(this.engine.mainCam);

    var x = Math.round( ( worldPoint.x - 8)/32 );
    var y = Math.round( ( worldPoint.y - 8)/32 );

    const withinBounds = (x >= 0 && x < this.engine.levelMap.width) && (y >= 0 && y < this.engine.levelMap.height);

    if(!this.engine.levelMap.hasTileAt(x, y, 0) && withinBounds){

      if(this.spawnItem == 'terrain'){

        const tile = this.engine.mainLayer.putTileAt(this.alt_TileNo, x, y);

        tile.setCollision(true, true, true, true);

      }

    }

  }

  eraseTile(){

    const worldPoint = this.pointer.positionToCamera(this.engine.mainCam);

    var x = Math.round( ( worldPoint.x - 8)/32 );
    var y = Math.round( ( worldPoint.y - 8)/32 );

    this.engine.levelMap.removeTileAt(x, y, true, true, 0);

  }

  getEnityAt(x, y, group){

    var tile = null;

    group.getChildren().forEach((obj) => {

      if(obj.tileX == x && obj.tileY == y){

        if(tile == null){
          tile = obj;
        }

      }

    });

    return tile;

  }

  hasEnityAt(x, y, group){

    var foundTile = false;

    group.getChildren().forEach((obj) => {

      if(obj.tileX == x && obj.tileY == y){

        foundTile = true;

      }

    });

    return foundTile;

  }


}
