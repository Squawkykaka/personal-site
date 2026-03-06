import { bearImage, berryImage, bunnyImage } from "./script";

export let buttonGroup = new Group();
export let berryGroup = new Group();
/**
 * Spawns a button at specified coords with a specified function
 * The coords get updated every frame
 * @param {String} text The text the button displays
 * @param {int} x The x position of the button
 * @param {int} y The y position of the button
 * @param {Function} func The function ran when the button is pressed
 */
export function spawnButton(text, x, y, func) {
	let button = new Sprite(x, y, textWidth(text) + 100, 50, "k");
	button.text = text;
	button.textSize = 20;
	button.color = "#688c1f";


	button.update = () => {
		button.pos.x = x;
		button.pos.y = y;
		if (button.mouse.presses()) func(button);
	};

	buttonGroup.add(button);

	return button;
}

// Spawning functions
/**
 * A function that spawns a berry at the specified coordinates with specified motion
 * @param {int} x The x position of the berry
 * @param {int} y The y position of the berry
 * @param {float} xVel The velocity to add to the berry each frame
 */
export function spawnBerry(x, y, xVel) {
	let berry = new Sprite(x, y, 20, 20);
	berry.life = 60 * 5;
	berry.vel.x = xVel;
	berry.image = berryImage;
	berry.image.scale = 0.2;

	berry.update = () => {
		berry.vel.x = xVel;
	};

	berryGroup.add(berry);

	return berry;
}

/**
 * Spawns a bear, TODO make this more configurable
 */
export function spawnBear() {
	let bear = new Sprite(windowWidth + 100, windowHeight - 200, 120);
	bear.image = bearImage;
	bear.image.scale = 0.4;
	bear.vel.x = -10;

	bear.life = 60 * 10;

	bear.update = () => {
		bear.vel.x = -10;
		if (bear.x <= -200) {
			bear.remove();
		}
	};

	return bear;
}

/**
 * Spawns a player at the specified coordinates
 * @param {int} x The x position of the player
 * @param {int} y The y position of the player
 */
export function spawnPlayer(x, y) {
	let player = new Sprite(x, y, 80, 90);
	player.bounciness = 0;
	player.img = bunnyImage;
	player.img.scale = 0.4;
	player.rotationLock = true;
	player.img.offset = { x: 0, y: -50 };

	player.overlaps(berryGroup, (player, berry) => {
		berry.remove();
		score += 1;
	});

	return player
}
/**
 * Creates the floor
 */
export function spawnFloor() {
	// set the positions to zero as the get updated every frame
	let floor = new Sprite(0, 0, 1, 1, "K");
	floor.update = () => {
		floor.width = windowWidth * 2;
		floor.y = windowHeight - 20;
		floor.x = windowWidth / 2;
	};

	floor.bounciness = 0;

	return floor;
}