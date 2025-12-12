import Fonts from '../lib/Fonts.js';
import Images from '../lib/Images.js';
import Sounds from '../lib/Sounds.js';
import Timer from '../lib/Timer.js';
import Input from '../lib/Input.js';
import StateStack from '../lib/StateStack.js';
import OpponentFactory from './services/OpponentFactory.js';
import GameInstructionsFactory from './services/GameInstructionsFactory.js';

export const canvas = document.createElement('canvas');
export const context =
	canvas.getContext('2d') || new CanvasRenderingContext2D();

// Replace these values according to how big you want your canvas.
export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

const resizeCanvas = () => {
	const scaleX = window.innerWidth / CANVAS_WIDTH;
	const scaleY = window.innerHeight / CANVAS_HEIGHT;
	const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

	canvas.style.width = `${CANVAS_WIDTH * scale}px`;
	canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
};

// Listen for canvas resize events
window.addEventListener('resize', resizeCanvas);

resizeCanvas(); // Call once to scale initially

export const keys = {};
export const images = new Images(context);
export const fonts = new Fonts();
export const stateStack = new StateStack();
export const timer = new Timer();
export const input = new Input(canvas);
export const sounds = new Sounds();

export const opponentFactory = new OpponentFactory();
export const gameInstructionsFactory = new GameInstructionsFactory();

/**
 * matter.js is the physics engine to be used for rolling dice collision.
 * Matter is declared globally in index.html
 * 
 * @see https://brm.io/matter-js
 */
export const matter = Matter;
// Set up the engine and disable gravity (since we're using a top-down view).
export const engine = matter.Engine.create();
engine.gravity.scale = 0;

export const world = engine.world;

export const DEBUG = false;
