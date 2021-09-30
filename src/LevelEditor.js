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

    //Stores the graphics for block tiles
    this.tileGraphics = [];

    this.tileID = [
        ['Terrain', '? Block', 'Brick Block', 'Used Block',
        'Hard Block', 'Invisible Block', 'Note Block', 'Spike Block', 'Cloud Block',
        'Donut Block', 'Ice Block', 'Rotate Block', 'Message Block'],
        ['Coin', 'Heart', 'Life-Up Heart', '1-Up', 'Red Coin', 'Blue Coin', 'Regional Coin'],
      ];

    this.tileGroups = ['terrain', 'items', 'npcs', 'gadgets', 'warps/goals', 'effects'];

    this.input.setDefaultCursor('url(assets/cursors/default_cursor.cur), pointer');
    this.pointer = this.input.activePointer;

    //Credit to Griffpatch for the auto tiling codes
    this.tileArrangement = [
      ['0110 0100', '0111 0101 0010', '0011 0001', '1110', '1111 0000 1010', '1011', '1100', '1101 1000', '1001',
      '11101111', '11111011', '10111111', '11111110']
    ];

    // ['0110 0100', '0111 0101', '0011 0001', '1110', '1111 0000', '1011', '1100', '1101', '1001']

  }

  create(){

    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    this.PLUS_KEY = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS);
    this.MINUS_KEY = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS);

    this.itemKeyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    this.itemKeyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);

    this.spawnPoint = this.engine.add.image(this.engine.playerStartPos.x, this.engine.playerStartPos.y, 'Mario');

    this.engine.events.on('activateGame', this.showSpawnPoint, this);

    this.engine.events.on('activateEditor', function () {

      this.spawnPoint.setVisible(true);

    }, this);

  }

  showSpawnPoint(){

    this.spawnPoint.setVisible(false);

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

        this.createTerrain(x, y);

      }

    }

  }

  createTerrain(x, y){

    var tile = null;

    if(this.tileNo != 0){

      tile = this.engine.mainLayer.putTileAt(30, x, y);

      const block = createTerrain(this.engine, x, y, this.tileNo, 0, this.tileID[0][this.tileNo]);

      tile.block = block;

      block.parentTile = tile;

      this.tileGraphics.push(block);

      tile.setCollisionCallback(function (a) {

        if(this.tilemap.scene.playerGroup.contains(a)){

          //this.block.playerSideCollide(a);

        }

        if(this.tilemap.scene.playerCaps.contains(a)){

          this.block.capSideCollide(a);
          this.block.capBelowCollide(a);

        }

      }, tile);

    }else{

      tile = this.engine.mainLayer.putTileAt(this.alt_TileNo, x, y);

      this.autoTileConfig(this.engine.levelMap);

    }

    tile.setCollision(true, true, true, true);

    //const block = createTerrain(this.engine, x, y, 1, 0, '? Block');

     //const tile = this.engine.mainLayer.putTileAt(this.alt_TileNo, x, y);
    //



     //this.autoTileConfig(this.engine.levelMap);


  }



  autoTileConfig(map){

    var tile;

    for(var a = 0; a < map.width; a++){

      for(var b = 0; b < map.height; b++){

        tile = this.engine.mainLayer.getTileAt(a, b);

        if(tile != null && tile.index < 30){

          this.autoTile_setBuild(a, b, tile);

        }

      }

    }

  }

  autoTile_setBuild(x, y, t){

    this.buildString = '';

    var newTile = 0;

    this.autoTile_findTile(x, y - 1);
    this.autoTile_findTile(x + 1, y);
    this.autoTile_findTile(x, y + 1);
    this.autoTile_findTile(x - 1, y);

    for(var i = 0; i < this.tileArrangement[0].length; i++){

      if(this.tileArrangement[0][i].includes(this.buildString)){

        newTile = i;
        i = this.tileArrangement[0].length;

      }

    }

    t.index = newTile;

    if(t.index == 4 && this.buildString == '1111'){

      this.autoTile_Corner(x, y, t);

    }


  }

  autoTile_Corner(x, y, t){

    this.buildString = '';

    this.autoTile_findTile(x, y - 1);
    this.autoTile_findTile(x + 1, y - 1);
    this.autoTile_findTile(x + 1, y);
    this.autoTile_findTile(x + 1, y + 1);
    this.autoTile_findTile(x, y + 1);
    this.autoTile_findTile(x - 1, y + 1);
    this.autoTile_findTile(x - 1, y);
    this.autoTile_findTile(x - 1, y - 1);

    if(this.tileArrangement[0].indexOf(this.buildString) != -1){

      t.index = this.tileArrangement[0].indexOf(this.buildString);

    }

  }

  autoTile_findTile(x, y){

    //If null is return, it means it has reached the edge of the tilemap/world

    const findTile = this.engine.levelMap.getTileAt(x, y, true);

    if(findTile == null || findTile.index != -1){
      this.buildString += '1';
    }else{

      this.buildString += '0';

    }

    // if(this.engine.levelMap.hasTileAt(x, y)){
    //   this.buildString += '1';
    // }else{
    //
    //   this.buildString += '0';
    //
    // }

  }

  eraseTile(){

    const worldPoint = this.pointer.positionToCamera(this.engine.mainCam);

    var x = Math.round( ( worldPoint.x - 8)/32 );
    var y = Math.round( ( worldPoint.y - 8)/32 );

    this.engine.levelMap.removeTileAt(x, y, false, true, 0);

    this.deleteTileGraphic(x, y);

    this.autoTileConfig(this.engine.levelMap);

  }

  deleteTileGraphic(x, y){

    this.tileGraphics.forEach((obj, i) => {



      if(obj.tileX == x && obj.tileY == y){

        obj.destroy();
        this.tileGraphics.splice(i, 1);

        console.log(obj);

        console.log(this.tileGraphics);

        return;
      }

    });


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
