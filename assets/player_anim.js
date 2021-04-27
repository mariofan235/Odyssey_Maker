function playerAnim(scene, key, num){

  var string = "";

  for(var i = 1; i <=2; i++){
    scene.anims.create({
      key: 'idle' + string + num,
      frames: [ { key: key, frame: "Main" + string + "/Main_00" } ],
      frameRate: 20
    }); //Idle

    scene.anims.create({
      key: 'fall' + string + num,
      frames: [ { key: key, frame: "Main" + string + "/Main_09" } ],
      frameRate: 20
    }); //Falling Anim

    scene.anims.create({
      key: 'lookUp' + string + num,
      frames: [ { key: key, frame: "Main" + string + "/Main_11" } ],
      frameRate: 20
    }); //Look Up

    scene.anims.create({
      key: "walk" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        prefix: "Main" + string + "/Main_",
        start:1,
        end:3,
        zeroPad:2
      }),
      frameRate: 10,
      repeat: -1
      //-1 is for an inifite loop
    }); //Walk

    scene.anims.create({
      key: "run" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        prefix: "Main" + string + "/Main_",
        start:5,
        end:7,
        zeroPad:2
      }),
      frameRate: 20,
      repeat: -1
      //-1 is for an inifite loop
    }); //Run

    scene.anims.create({
      key: "jump" + string + num,
      frames: [ { key: key, frame: "Main" + string + "/Main_04" } ],
      frameRate: 20
    }); //Jump

    scene.anims.create({
      key: "runJump" + string + num,
      frames: [ { key: key, frame: "Main" + string + "/Main_08" } ],
      frameRate: 20
    }); //Jump

    scene.anims.create({
      key: "duck" + string + num,
      frames: [ { key: key, frame: "Main" + string + "/Main_10" } ],
      frameRate: 20
    }); // Duck

    scene.anims.create({
      key: "wallSlide" + string + num,
      frames: [ { key: key, frame: "Main" + string + "/Main_13" } ],
      frameRate: 20
    }); //Wall Slide

    scene.anims.create({
      key: "dive" + string + num,
      frames: [ { key: key, frame: "Main" + string + "/Main_14" } ],
      frameRate: 20
    }); //Dive

    scene.anims.create({
      key: 'kickback' + string + num,
      frames: [ { key: key, frame: "Main" + string + "/Main_16" } ],
      frameRate: 20
    }); //Falling Anim

    scene.anims.create({
      key: 'victory' + string + num,
      frames: [ { key: key, frame: "Main" + string + "/Main_17" } ],
      frameRate: 20
    }); //Victory

    scene.anims.create({
      key: "rollAnim" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        start: 0,
        end: 5,
        zeroPad: 1,
        prefix: "GroundPound" + string + "/Pound_"
      }),
      frameRate: 10,
      repeat: 0
    }); //Roll

    scene.anims.create({
      key: "longJump" + string + num,
      frames: [ { key: key, frame: "Main" + string + "/Main_15" } ],
      frameRate: 20
    }); //Long Jump

    scene.anims.create({
      key: "poundAnim" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        start: 0,
        end: 6,
        zeroPad: 1,
        prefix: "GroundPound" + string + "/Pound_"
      }),
      frameRate: 20,
      repeat: 0
    }); //Ground Pound

    scene.anims.create({
      key: "brake" + string + num,
      frames: [ { key: key, frame: "Main" + string + "/Main_12"} ],
      frameRate: 20
    });

    scene.anims.create({
      key: "doubleJump1" + string + num,
      frames: [ {key: key, frame: "MultiJump" + string + "/Jump_00"} ],
      frameRate: 20
    }); //Double Jump 1

    scene.anims.create({
      key: "doubleJump2" + string + num,
      frames: [ {key: key, frame: "MultiJump" + string + "/Jump_01"} ],
      frameRate: 20
    }); //Double Jump 2

    scene.anims.create({
      key: "tripleJump" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        prefix: "MultiJump" + string + "/Jump_",
        start:2,
        end:9,
        zeroPad:2
      }),
      frameRate: 12,
      repeat: 0
    }); //Triple Jump

    scene.anims.create({
      key: "backflip" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        prefix: "MultiJump" + string + "/Jump_",
        start:9,
        end:2,
        zeroPad:2
      }),
      frameRate: 12,
      repeat: 0
    }); //Backflip

    scene.anims.create({
      key: "climbIdle" + string + num,
      frames: [ {key: key, frame: "Climb" + string + "/Climb_0"} ],
      frameRate: 20
    }); //Climb Idle

    scene.anims.create({
      key: "climbAnim" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        prefix: "Climb" + string + "/Climb_",
        start:1,
        end:2,
        zeroPad:0
      }),
      frameRate: 20,
      repeat: 0
    }); //Climb Anim

    scene.anims.create({
      key: "carryIdle" + string + num,
      frames: [ {key: key, frame: "Carrying" + string + "/Carry_0"} ],
      frameRate: 20
    }); //Carry Idle

    scene.anims.create({
      key: "carryUp" + string + num,
      frames: [ {key: key, frame: "Carrying" + string + "/Carry_1"} ],
      frameRate: 20
    }); //Carry Look Up

    scene.anims.create({
      key: "carryDuck" + string + num,
      frames: [ {key: key, frame: "Carrying" + string + "/Carry_2"} ],
      frameRate: 20
    }); //Carry Ducking

    scene.anims.create({
      key: "carryWalk" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        prefix: "Carrying" + string + "/Carry_",
        start:3,
        end:5,
        zeroPad:0
      }),
      frameRate: 20,
      repeat: -1
      //-1 is for an inifite loop
    }); //Carry Walk

    scene.anims.create({
      key: "carryJump" + string + num,
      frames: [ {key: key, frame: "Carrying" + string + "/Carry_6"} ],
      frameRate: 20
    }); //Carry Jump

    scene.anims.create({
      key: "carryFall" + string + num,
      frames: [ {key: key, frame: "Carrying" + string + "/Carry_7"} ],
      frameRate: 20
    }); //Carry Falling

    scene.anims.create({
      key: "kick" + string + num,
      frames: [ {key: key, frame: "Carrying" + string + "/Carry_8"} ],
      frameRate: 20
    }); //Kick Anim

    scene.anims.create({
      key: "swimFall" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        prefix: "Swim" + string + "/Swim_",
        start:0,
        end:1,
        zeroPad:0
      }),
      frameRate: 5,
      repeat: -1
      //-1 is for an inifite loop
    }); //Swim Idle

    scene.anims.create({
      key: "swimStroke" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        prefix: "Swim" + string + "/Swim_",
        start:2,
        end:5,
        zeroPad:0
      }),
      frameRate: 10,
      repeat: 0
      //-1 is for an inifite loop
    }); //Swim Stroke

    scene.anims.create({
      key: "twirl" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        prefix: "Twirl" + string + "/Twirl_",
        start:0,
        end:7,
        zeroPad:0
      }),
      frameRate: 20,
      repeat: 0
      //-1 is for an inifite loop
    }); //Air Twirl

    scene.anims.create({
      key: "spinPound" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        prefix: "Twirl" + string + "/Twirl_",
        start:0,
        end:7,
        zeroPad:0
      }),
      frameRate: 25,
      repeat: -1
    }); //Spin Ground Pound

    scene.anims.create({
      key: "spin" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        prefix: "Twirl" + string + "/Twirl_",
        start:0,
        end:7,
        zeroPad:0
      }),
      frameRate: 20,
      repeat: -1
      //-1 is for an inifite loop
    }); //Spin Jump

    scene.anims.create({
      key: "deathAnim" + string + num,
      frames: scene.anims.generateFrameNames(key, {
        start: 0,
        end: 6,
        zeroPad: 1,
        prefix: "DeathAnimation" + string + "/Anim_"
      }),
      frameRate: 10,
      repeat: 0
    });

    string = "_Hat";
  }

  scene.anims.create({
    key: "throwAnim" + num,
    frames: scene.anims.generateFrameNames(key, {
      start: 0,
      end: 2,
      zeroPad: 1,
      prefix: "CapThrow/Throw_",
    }),
    frameRate: 10,
    repeat: 0
  });

  scene.anims.create({
    key: "throwUpwardAnim" + num,
    frames: [ {key: key, frame: "Carrying" + "/Carry_8"} ],
    frameRate: 20,
    repeat: 0
  }); //Kick Anim

}
