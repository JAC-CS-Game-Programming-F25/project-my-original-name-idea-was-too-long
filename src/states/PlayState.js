import State from "../../lib/State.js";
import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";
import DiceGameFactory from "../services/DiceGameFactory.js";
import { CANVAS_WIDTH, engine, matter, timer, world } from "../globals.js";
import Board from "../objects/Board.js";
import Easing from "../../lib/Easing.js";

const { Composite, Engine } = matter;

export default class PlayState extends State {
	/**
	 * The state in which the player and their opponent face off in a game of dice.
	 * The precise game is determined by the game value of the opponent.
	 * The user can pres ESC between rounds to return to Opponent Selection,
	 * or 'H' to see the instructions for the specific dice game they are playing.
	 * At the start of each round, they will have the chance to wager.
	 * 
	 * @param {Character} player 
	 * @param {Opponent} opponent 
	 */
	constructor(player, opponent) {
		super();

		this.player = player;
		this.opponent = opponent;
		this.board = new Board(CANVAS_WIDTH, 0); // The board starts off screen and tweens in.
		this.game = DiceGameFactory.create(this.player, this.opponent);

		this.isWagerToBeMade = true; // We'll see if I need this
		this.isStartupTransition = true;
	}

	enter() {
		// Tween the board onto the screen.
		timer.tween(
			this.board.position,
			{ x: this.board.finalX },
			0.75,
			Easing.linear,
			() => { this.isStartupTransition = false }
		);
	}

	exit() {
		// Remove all Matter bodies from the world before exiting this state.
		Composite.allBodies(world).forEach((body) =>
			Composite.remove(world, body)
		);
	}

	update(dt) {
		// Update the matter.js physics engine.
		Engine.update(engine);

		this.game.update(dt);

		// Do other stuff.
	}

	render() {
		this.board.render();

		this.game.render();

		// Might render the shared ui here (or in game?)
	}
}
