/**
 * Game Name
 * Dedos de Toledo
 *
 * Authors
 * Adam Laurin
 * 
 * Brief description
 * Dedos de Toledo is a game which recreates several medieval dice games from the 13th century
 * Book of Games by Alfonso X of Castile. Challenge your fellow tavern-goers to one of several
 * games of chance and try to rack up all of their cash! Or lose everything yourself...
 * The game is played entirely with the keyboard. WASD or arrow keys are used to navigate, Enter
 * is used for selections, escape is used to leave a game between rounds, and H will
 * bring up the rules of a particular dice game.
 * 
 * Asset sources
 * 
 * images:
 * controls-stone.png by p0ss https://opengameart.org/content/user-interface-element-pack-panels-buttons-sliders-tables-icons
 * treasure_icons.png by Bonsaiheldin https://opengameart.org/content/shiny-treasure-icons-16x16
 * 
 * sound:
 * gold_sack.wav by Amarikah https://opengameart.org/content/sack-of-gold
 * hjm-coin_clicker_2.wav by Varkalandar https://opengameart.org/content/coin-sounds-0
 * dice_05.wav by dermotte https://freesound.org/people/dermotte/sounds/220745/
 * chair-stool-wooden-dragged-08.wav by BWOBoyle https://freesound.org/people/DWOBoyle/sounds/146998/
 * bar-pub-tavern_1.wav by o_ciz https://freesound.org/people/o_ciz/sounds/475505/
 * Chieftains Celebration by Aetheric https://freetouse.com/music/aetheric/chieftains-celebration
 * scene-change-music-sad.mp3 by dominictreis https://freesound.org/people/dominictreis/sounds/362281/
 * 
 * fonts: 
 * Manufacturing Consent, https://fonts.google.com/specimen/Manufacturing+Consent
 * Roboto, https://fonts.google.com/specimen/Roboto
 */

import Game from '../lib/Game.js';
import {
	canvas,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	fonts,
	images,
	timer,
	sounds,
	stateStack,
	opponentFactory,
	gameInstructionsFactory,
} from './globals.js';
import TitleScreenState from './states/TitleScreenState.js';

// Set the dimensions of the play area.
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.setAttribute('tabindex', '1'); // Allows the canvas to receive user input.

// Now that the canvas element has been prepared, we can add it to the DOM.
document.body.appendChild(canvas);

// Fetch the asset definitions from config.json.
const {
	images: imageDefinitions,
	fonts: fontDefinitions,
	sounds: soundDefinitions,
} = await fetch('./config/config.json').then((response) => response.json());
const opponentDefinitions = await fetch('./config/opponents.json').then((response) => response.json());
const gameInstructions = await fetch('./config/gameInstructions.json').then((response) => response.json());

// Load all the assets from their definitions.
images.load(imageDefinitions);
fonts.load(fontDefinitions);
sounds.load(soundDefinitions);
opponentFactory.load(opponentDefinitions);
gameInstructionsFactory.load(gameInstructions);

// Set up the state stack.
stateStack.push(new TitleScreenState());

const game = new Game(
	stateStack,
	context,
	timer,
	canvas.width,
	canvas.height
);

game.start();

// Focus the canvas so that the player doesn't have to click on it.
canvas.focus();
