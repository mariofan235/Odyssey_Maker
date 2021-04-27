import {Player} from './player.js';

function playerMovement(player, controls, onFloor){

  var jumpCost = 1;
  var brakeDist = 8;
  var slippery = false;
  var spinJump = false;
  if(slippery){
    brakeDist = 0.01;
  }
  //Jump Script by Joan Ginard Mateo
  if(controls.direction.LEFT){

    if(!player.leftSensor.blocked  && player.lockDirection != 'right'){

      if(player.flipX){
          if(!slippery){
            player.body.velocity.x -=player.speed;
          }else{
            player.body.velocity.x -=(player.speed * 0.25);
          }
      }else{

        if(onFloor){
          player.body.velocity.x -= brakeDist;
        }else{
          player.body.velocity.x -=player.speed;
          player.flipX = !player.flipX;
        }

        player.jumpCounter = 0;
        player.jumpTimer = 0;
        player.speedTimer = 0;
      }

    }else if(!player.flipX && !onFloor && !player.momentumLock){

      player.flipX = !player.flipX;

    }
  }
  else if(controls.direction.RIGHT){

    if(!player.rightSensor.blocked && player.lockDirection != 'left'){

      if(!player.flipX){
        player.body.velocity.x +=player.speed;
      }else{
        if(onFloor){
          player.body.velocity.x += brakeDist;
        }else{
          player.body.velocity.x +=player.speed;
          player.flipX = !player.flipX;
        }
        player.jumpCounter = 0;
        player.jumpTimer = 0;
        player.speedTimer = 0;
      }

    }else if(player.flipX && !onFloor && !player.momentumLock){

      player.flipX = !player.flipX;

    }

  }else if(onFloor){
    player.jumpCounter = 0;
    player.jumpTimer = 0;
    if(player.body.velocity.x > 0){
      player.body.velocity.x -= player.speed;
      if(player.body.velocity.x < 0){
        player.body.setVelocityX(0);
      }
    }
    if(player.body.velocity.x < 0){
      player.body.velocity.x += player.speed;
      if(player.body.velocity.x > 0){
        player.body.setVelocityX(0);
      }
    }
  }

  if(!player.running){
    if(Math.abs(player.body.velocity.x) > 260){
      player.running = true;
    }
  }else if(Math.abs(player.body.velocity.x) < 20 || !onFloor){
    player.running = false;
  }else if(player.speedTimer <= 50){
    player.speedTimer++;
  }

  if(Math.abs(player.body.velocity.x) < 20 && onFloor){
    player.speedTimer = 0;
  }

  if(player.speedTimer > 50){
    player.speed = 20;
    if(player.body.velocity.x < -350){
      player.body.setVelocityX(-350);
    }
    if(player.body.velocity.x > 350){
      player.body.setVelocityX(350);
    }
  }else{
    player.speed = 15;
    if(player.body.velocity.x < -280){
      player.body.setVelocityX(-280);
    }
    if(player.body.velocity.x > 280){
      player.body.setVelocityX(280);
    }
  }

  if (player.jumpCounter > 1) {
    if(onFloor && !controls.keyA.active && player.multiJumpTimer == 0){
      player.jumpCounter = 0;
    }
  }

  //Phaser.Input.Keyboard.JustDown
  //controls.keyA.active && (onFloor && controls.keyA.pressed)

  var spinTwirlActive = controls.keyZ.pressed && onFloor && player.anims.getName() == 'lookUp' + player.costume;

  if( ( ( controls.keyA.pressed || (controls.keyZ.pressed && !spinTwirlActive)) && onFloor ) || player.stomped ){
    if(player.stomped){
      player.stomped = false;
    }
    var xSpeed = Math.abs(player.body.velocity.x * 0.2);
    if(Math.abs(player.body.velocity.x) >= 173 && player.speed == 20 && !controls.keyZ.pressed && controls.keyA.pressed){
      player.jumpCounter++;
      player.jumpTimer = 1;
      player.multiJumpTimer = 1;

      if(player.jumpCounter == 1){
        player.body.setVelocityY(-160 - xSpeed);
      }
      //600, 675, 750
      if(player.jumpCounter == 2){
        player.body.setVelocityY(-180 - xSpeed);
        //player.anims.play("doubleJump2" + player.costume, true);
      }
      if(player.jumpCounter == 3){
        player.body.setVelocityY(-300 - xSpeed);
        player.multiJumpTimer = 0;
        //player.jumpCounter = 0;
        //player.anims.play("tripleJump" + player.costume, true);
      }
    }else{
      player.jumpTimer = 1;

      if(controls.keyZ.pressed){

        player.body.setVelocityY(-120 - (xSpeed*0.2));
        player.anims.play("spin" + player.costume, true);

        player.jumpCounter = 0;
        player.multiJumpTimer = 0;

        spinJump = true;
        player.spinJumpActive = true;

      }else{
        player.jumpCounter = 1;
        player.body.setVelocityY(-160 - xSpeed);
      }

    }
  }

  if(onFloor && player.jumpCounter >=1 && player.body.velocity.y == 0 && player.multiJumpTimer == 0){
    player.jumpCounter = 0;
  }

  if(player.multiJumpTimer > 0){

    if(onFloor){

      player.multiJumpTimer++;

      if(player.multiJumpTimer >= 10){
        player.multiJumpTimer = 0;
      }

    }else{

      player.multiJumpTimer = 1;

    }

  }

  if(!onFloor){
    if((controls.keyA.active || controls.keyZ.active) && player.jumpTimer != 0 && player.body.velocity.y < 0){
      if(player.jumpTimer > 15 || Math.round(player.body.velocity.y) == 0){
        player.jumpTimer = 0;
      }else{
        player.jumpTimer++;
        player.body.velocity.y -= 220/player.jumpTimer;
      }
    }else{
      player.jumpTimer = 0;
    }
  }

  var spinAnim = (player.anims.getName() == ("spin" + player.costume) && player.spinJumpActive) || player.anims.getName() == ("twirl" + player.costume);

  if(!player.body.onFloor() && !player.npcFloor){

    if( player.anims.getName() != ("duck" + player.costume) && !spinAnim){

      if(player.body.velocity.y > 0){

        player.anims.play("fall" + player.costume, true);

      }else{
        if(player.jumpCounter < 2){
          if(player.speed == 20 && !slippery){
            player.anims.play("runJump" + player.costume, true);
          }else if(!spinAnim && player.anims.getName() != player.getCostume('tripleJump') && player.anims.getName() != ('throwUpwardAnim' + player.playerNo) ){
            player.anims.play("jump" + player.costume, true);
          }
        }else if(player.jumpCounter == 2){
          if(player.anims.getName() != ("doubleJump1" + player.costume) && player.anims.getName() != ("doubleJump2" + player.costume)){
            player.anims.play("doubleJump" + Phaser.Math.RND.integerInRange(1, 2) + player.costume, true);
          }
        }else{
          player.anims.play("tripleJump" + player.costume, true);
        }
      }

      // console.log(this.interaction.direction.TIMESTAMP/100);
      // console.log();

      if(!controls.directionalPress('down') && controls.direction.DOWN && player.moveAvail('groundPound')){
        player.specialMove = "groundPound";
        player.anims.play("poundAnim" + player.costume, true);
      }
    }
  }else if( (controls.direction.LEFT || controls.direction.RIGHT) && !spinJump){
    if(controls.direction.LEFT){
      player.flipX = true;
      if(player.running && player.body.velocity.x > 0){
        player.anims.play("brake" + player.costume);

        if(player.running && controls.keyA.pressed && player.moveAvail('sideflip')){
          player.specialMove = "sideflip";
          player.body.setVelocityY(-700);
        }

      }else if(player.speed == 20){
        player.anims.play("run" + player.costume, true);
      }else{
        player.anims.play("walk" + player.costume, true);
      }
    }else if(controls.direction.RIGHT){
      player.flipX = false;
      if(player.running && player.body.velocity.x < 0){
        player.anims.play("brake" + player.costume);

        if(player.running && controls.keyA.pressed && player.moveAvail('sideflip')){
          player.specialMove = "sideflip";
          player.body.setVelocityY(-700);
        }

      }else if(player.speed == 20){
        player.anims.play("run" + player.costume, true);
      }else{
        player.anims.play("walk" + player.costume, true);
      }
    }
  }else if(!spinJump){
      if(Math.abs(player.body.velocity.x) < 5){
        if(player.body.velocity.x == 0 && controls.direction.UP){
          player.anims.play("lookUp" + player.costume, true);

          if(controls.keyZ.pressed){
            player.anims.play("spin" + player.costume, true);
            player.specialMove = 'spinTwirl';
            player.spinTwirlTimer = 0;
            //player.jumpTimer = 1;
            //player.body.setVelocityY(-165);
          }

        }else{
          player.anims.play("idle" + player.costume, true);
        }
      }else{
        if(!slippery){
          player.anims.play("walk" + player.costume, true);
        }else{
          player.anims.play("idle" + player.costume, true);
        }
      }
  }
}

function slipperyGround(x, y, scene){
  return false;
}

function swimMovement(player, controls, throwCap, onFloor, tileAbove){
  player.jumpCounter = 0;
  player.running = false;
  console.log(Math.floor(player.body.velocity.y));
  player.body.setGravityY(-1000);
  if(player.body.velocity.y > 0){
    //player.body.setVelocityY(player.body.velocity.y * 0.8);
  }
  if(controls.direction.LEFT){
    if(player.flipX){
      player.body.velocity.x -=player.speed * 0.4;
    }else{
      player.body.velocity.x -= 8 * 0.75;
    }
  }
  else if(controls.direction.RIGHT){
    if(!player.flipX){
      player.body.velocity.x +=player.speed * 0.4;
    }else{
      player.body.velocity.x += 8 * 0.75;
    }
  }else{

    if(!onFloor){

      if(player.body.velocity.x > 0){
        player.body.velocity.x -= player.speed * 0.4;
        if(player.body.velocity.x < 0){
          player.body.setVelocityX(0);
        }
      }
      if(player.body.velocity.x < 0){
        player.body.velocity.x += player.speed * 0.4;
        if(player.body.velocity.x > 0){
          player.body.setVelocityX(0);
        }
      }

    }else{

      player.body.setVelocityX(0);
      player.swimTimer = 0;

    }

  }

  if(player.body.velocity.x < -250){
    player.body.setVelocityX(-250);
  }
  if(player.body.velocity.x > 250){
    player.body.setVelocityX(250);
  }

  if(controls.keyA.pressed){
      player.body.setVelocityY(-10);
      player.swimTimer = 1;
      if (player.anims.getName() != ("swimStroke" + player.costume)) {
        player.anims.play("swimStroke" + player.costume);
      }
  }

  if(!onFloor){
    if(controls.keyA.active && player.swimTimer != 0 && player.body.velocity.y < 0){
      if(player.swimTimer > 15 || player.body.velocity.y == 0){
        player.swimTimer = 0;
      }else{
        player.swimTimer++;
        player.body.velocity.y -= 150/player.swimTimer;
      }
    }else{
      player.swimTimer = 0;
    }
  }


  if(controls.direction.LEFT){
    player.flipX = true;
  }else if(controls.direction.RIGHT){
    player.flipX = false;
  }

  if(!player.body.onFloor()){
    if( !(player.anims.getName() == ("swimStroke" + player.costume) && player.anims.isPlaying) ){
        player.anims.play("swimFall" + player.costume, true);
    }

    if(!controls.directionalPress('down') && controls.direction.DOWN){
      player.specialMove = "groundPound";
      player.anims.play("poundAnim" + player.costume, true);
    }
  }else if(controls.direction.LEFT || controls.direction.RIGHT){
    if(controls.direction.LEFT){
      if(player.running && player.body.velocity.x > 0){
        player.anims.play("brake" + player.costume);
      }else{
        player.anims.play("walk" + player.costume, true);
      }
    }else if(controls.direction.RIGHT){
      if(player.running && player.body.velocity.x < 0){
        player.anims.play("brake" + player.costume);
      }else{
        player.anims.play("walk" + player.costume, true);
      }
    }
  }else{
      if(Math.abs(player.body.velocity.x) < 5){

        if(controls.direction.UP){
          player.anims.play("lookUp" + player.costume, true);
        }else{
          player.anims.play("idle" + player.costume, true);
        }
      }else{
        player.anims.play("walk" + player.costume, true);
      }
  }
}

function airMovement(player, controls){
    if(controls.direction.LEFT && !player.leftSensor.blocked){
      if(player.flipX){
        player.body.velocity.x -=player.speed*0.15;
      }else{
        player.body.velocity.x -= player.speed*0.16;
      }
    }
    else if(controls.direction.RIGHT && !player.rightSensor.blocked){
      if(!player.flipX){
        player.body.velocity.x +=player.speed*0.15;
      }else{
        player.body.velocity.x += player.speed*0.16;
      }
  }
}

function maxFallSpeed(obj){
  if(obj.body.velocity.y > 1000){
    obj.body.setVelocityY(1000);
  }
}

function bottomPit(obj){
  var scene = obj.scene;
  return (obj.y > scene.levelSize.height + scene.scale.height + 25);
}

function altJump(player, controls) {

  if(!player.onFloor){
    if((controls.keyA.active || controls.keyZ.active) && player.jumpTimer != 0 && player.body.velocity.y < 0){
      if(player.jumpTimer > 15 || player.body.velocity.y == 0){
        player.jumpTimer = 0;
      }else{
        player.jumpTimer++;
        player.body.velocity.y -= 220/player.jumpTimer;
      }
    }else{
      player.jumpTimer = 0;
    }
  }

}

export {playerMovement, swimMovement, airMovement, altJump};
