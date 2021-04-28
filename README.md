# 2D Mario Odyssey Engine

A proof of concept 2D demake of the 2017 Nintendo Switch game Super Mario Odyssey.

I created it using Phaser 3 and its tilemap engine. I was initially considering on switching physics engines due to several roadblocks, but I figured I should get some feedback first before making a decision.

## Editor Controls

* Arrow Keys to Move Camera
* Click to place/erase tiles
* Press E to switch from Place/Erase Mode
* Press T to alternate tiles
* Press P to place Player Spawn Point from the mouse pointer
* Press Enter to switch to spawn player
* Refresh the webpage to restart the editor

## Basic Player Controls

* Left/Right to run (accelerates automatically)
* X to Jump
* Z to throw Cappy
* Down to Crouch
* Up to look upward
* C to Spin Jump

## Advanced Moves

### Basic

* Roll - Crouch + Z
* Ground Pound - Down in Midair
* Dive - Ground Pound + Z
* Backflip - Press Down for a few seconds, then jump
* Sideflip - Jump while braking
* Wall Slide - Press in direction of wall while in midair
* Twirl - Hold Up + C while on ground

### Jump Combos

* Double Jump - Jump two times consecutively at max speed
* Triple Jump - Jump three times consecutively at max speed
* Pound Jump - Jump immediately after ground pound impact
* Wall Jump - Jump/Spin Jump after sliding down a wall
* Long Jump - Crouch + X while moving
* Roll Jump - Jump during a roll
* Twirl Jump - Jump while twirling
* Drill Spin - Down after activating a twirl jump

## Cap Moves

* Upward Throw - Up + Throw Cap
* Super Throw - Spin Jump + Throw Cap
* Spin Throw - Twirl + Throw Cap
* Cap Hold - Hold Z
* Cap Jump/Vault - Run into Cappy or Jump on Cappy
* Catch Jump - Jump after cap returns
* Dive Jump - Throw Cap + Dive
