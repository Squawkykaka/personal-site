let canvas = await Canvas(window.innerWidth, window.innerHeight);

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}


// Resize when the window changes size
window.addEventListener("resize", resizeCanvas);

//  modifiable variables
let scoreGoal = 5;
let lives = 3;
let gravity = 20;

// dont change these
let bear, floor;
let score = 0;
let timeHoldingSpace = 0;
let gameState = 0;
//  p5.js functions

/**
 * This function loads all the images i need for the game.
 * @returns The images loaded
*/

function loadFromPath(name: string) {
	let pathInfoElement = document.getElementById("pathInfo");

	let imagePath = pathInfoElement.getAttribute(name)

	return loadImage(imagePath)
}

async function loadImages() {
    let berryImage  = loadFromPath("berryImage");
    let bearImage   = loadFromPath("bearImage");
    let bunnyImage  = loadFromPath("bunnyImage");
    let backgroundImage = loadFromPath("backgroundImage");
    await loadAll();
    return [berryImage, bearImage, bunnyImage, backgroundImage];
}

export let [berryImage, bearImage, bunnyImage, backgroundImage] = await loadImages();
import { spawnBear, spawnBerry, spawnButton, spawnFloor, spawnPlayer } from "./spawnFunctions";
// let player = spawnPlayer(50, 50);


// function setup() {
frameRate(60);

world.gravity.y = gravity;

export let buttonGroup = new Group();
export let berryGroup = new Group();

// Fix things hitting buttons, cant make buttons
// have no colliders as otherwise they cant be clicked
buttonGroup.overlaps(allSprites);

setupMainMenu();
// }
q5.draw = gameManager;
// Im going to temporarily remove this
// to fix issues with players cheating
// This code is now included in the changeGameState function TODO

// function windowResized() {
// 	resizeCanvas(windowWidth, windowHeight);
// }

// utility functions
function gameManager() {
	// This function runs the correct draw loop function
	// depending on what the gameState variable is
	switch (gameState) {
		case 0:
			mainMenuScreen();
			break;
		case 1:
			instructionsScreen();
			break;
		case 2:
			gameScreen();
			break;
		case 3:
			winScreen();
			break;
		case 4:
			loseScreen();
			break;
	}
}
/**
 * This fuction is the function used to switch game states,
 * you pass in a setup function which in the setup function
 * changes the gamestate variable and runs the setup for the scene
 * @param {Function} setupFunction Pass in the setup fucntion to create buttons, etc
 */
function changeGameState(setupFunction) {
	world.gravity.y = 10;
	lives = 3;

	textAlign(LEFT);
	textSize(20);
	allSprites.remove();
	setupFunction();

	resizeCanvas()
	// resizeCanvas(windowWidth, windowHeight);
}
function playerMovement() {
	/* make the player charge up a jumptimer 
	value then when its released touching the 
	floor add it to the velocity */
	let maxTimeHoldingSpace = 15; // max time to hold space

	if (kb.pressing("space")) {
		if (timeHoldingSpace >= maxTimeHoldingSpace) {
			timeHoldingSpace = maxTimeHoldingSpace;
		}
		// the rate of charge
		timeHoldingSpace += 0.5;
		text(timeHoldingSpace.toString(), 400, 400);
	}
	if (kb.released("space")) {
		if (player.colliding(floor)) {
			// the actual amount added to the velocity, this is multiplyed by deltaTime
			// so that any framerate has the same effect. TODO make this actually use deltaTime.
			let jumpStrength = -timeHoldingSpace;
			player.vel.y = jumpStrength; /* * (1 / deltaTime); */
		}

		timeHoldingSpace = 0;
	}
}

// Scene manager scripts
function mainMenuScreen() {
	background(219);
	// Do main menu shtuff
}
function instructionsScreen() {
	background(120);
	spawnBerry(random(windowWidth), -20, 0);

	text(
		"Hold space to charge jump, \nif you get hit by a bear you get hurt\n and you have 3 lives only, so avoid bears\nCollect berries to increase your score. \nYou have 15 seconds to collect as many berries as you can",
		windowWidth / 2,
		windowHeight / 2
	);
}
function gameScreen() {
	background(backgroundImage);
	// background(220);

	// Spawn bears and berries at random intervals TODO: makw the berrys clump less
	if (random(1, 500) <= 3) {
		spawnBear();
	}
	if (random(1, 500) <= 3) {
		spawnBerry(windowWidth, random(windowHeight), -10);
	}

	playerMovement();

	// If the player is out of bounds, remove the player and
	//  spawn them at the center of the screen, if they have no lives, end the game.
	// TODO: make this function cleaner.
	if (player.x <= -10 || player.x >= windowWidth + 10) {
		if (lives <= 1) {
			changeGameState(setupLoseScreen);
		} else {
			lives -= 1;
			player.remove();
			spawnPlayer(windowWidth / 2, windowHeight / 2);
		}
	}

	if (score >= scoreGoal) {
		changeGameState(setupWinScreen);
	}

	// Render the score and lives text at a different textsize
	push();
	textSize(20);
	text(`Score: ${score}/${scoreGoal}\nLives: ${lives}`, 200, 45);
	pop();
}
function winScreen() {
	background(0, 255, 0);

	push();
	textSize(75);
	text(`YOU WON`, windowWidth / 2, windowHeight / 2 - 100);
	pop();

	push();
	textSize(25);
	text(`Score: ${score}`, windowWidth / 2, windowHeight / 2 - 50);
	pop();
}
function loseScreen() {
	background(255, 0, 0);

	push();
	textSize(75);
	text(`YOU DIED`, windowWidth / 2, windowHeight / 2 - 100);
	pop();

	push();
	textSize(25);
	text(`Score: ${score}`, windowWidth / 2, windowHeight / 2 - 50);
	pop();
}

// Scene setup scripts
function setupLoseScreen() {
	textAlign(CENTER);

	gameState = 4;
	spawnButton(
		"Restart Game",
		windowWidth / 2,
		windowHeight / 2 + 100,
		(button) => {
			score = 0;
			changeGameState(setupGameScreen);
		}
	);
}
function setupMainMenu() {
	gameState = 0;
	console.log("pre instructions");
	spawnButton(
		"Instructions",
		windowWidth / 2 - 250,
		windowHeight / 2,
		(button) => {
			console.log("instuctions");
			changeGameState(setupInstructionsScreen);
		}
	);
	console.log("pre play game");
	spawnButton(
		"Play Game",
		windowWidth / 2 + 250,
		windowHeight / 2,
		(button) => {
			console.log("playgame");
			changeGameState(setupGameScreen);
		}
	);
}
function setupInstructionsScreen() {
	gameState = 1;
	textAlign(CENTER);

	spawnButton("Go Home", 100, 50, () => {
		console.log("hi");
		changeGameState(setupMainMenu);
	});

	spawnFloor();

	// Spawns bears along the screen.
	for (let i = 0; i < windowWidth / 40; i++) {
		bear = new Sprite(40 * i, 50, 20, 20);
		bear.image = bearImage;
		bear.image.scale = 0.4;
	}
}
function setupGameScreen() {
	gameState = 2;
	spawnPlayer(windowWidth / 2, windowHeight / 2);

	spawnButton("Go Home", 100, 50, () => {
		console.log("hi");
		changeGameState(setupMainMenu);
	});

	spawnButton(
		"Instructions\n(Will reset game)",
		windowWidth - 150,
		50,
		(button) => {
			console.log("instuctions");
			changeGameState(setupInstructionsScreen);
		}
	);

	spawnFloor();
}
function setupWinScreen() {
	textAlign(CENTER);

	gameState = 3;
	console.log("pre play game");
	spawnButton(
		"Restart Game",
		windowWidth / 2,
		windowHeight / 2 + 100,
		(button) => {
			score = 0;
			changeGameState(setupGameScreen);
		}
	);
}