import State from "../../lib/State.js";
import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";
import DiceGameFactory from "../services/DiceGameFactory.js";
import { CANVAS_WIDTH, context, engine, input, matter, sounds, stateStack, timer, world } from "../globals.js";
import Board from "../objects/Board.js";
import Easing from "../../lib/Easing.js";
import Input from "../../lib/Input.js";
import GamePhase from "../enums/GamePhase.js";
import HelpState from "./HelpState.js";
import SoundName from "../enums/SoundName.js";

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
		sounds.play(SoundName.Table);
	}

	exit() {
		// Remove all Matter bodies from the world before exiting this state.
		Composite.allBodies(world).forEach((body) =>
			Composite.remove(world, body)
		);
	}

	update(dt) {
		if (this.isStartupTransition) return;

		// Update the matter.js physics engine.
		Engine.update(engine);

		this.game.update(dt);

		if (input.isKeyPressed(Input.KEYS.H)) {
			// Bring up the help screen.
			stateStack.push(new HelpState(this.opponent.game));
		}
	}

	render() {
		this.board.render();

		if (!this.isStartupTransition) {
			this.game.render();

			// Render opponent portrait.
			const opponentPortraitScale = 1;
			this.opponent.portrait.render(
				this.board.position.x - Opponent.OPPONENT_PORTRAITS_WIDTH * opponentPortraitScale + 20,
				10,
				{ x: opponentPortraitScale, y: opponentPortraitScale }
			);
			// Render Opponent and player money.
			context.save();
			context.fillStyle = 'black';
			context.font = '40px manufacturingConsent';
			context.fillText(`${this.opponent.money}`,
				this.board.position.x - Opponent.OPPONENT_PORTRAITS_WIDTH / 2 * opponentPortraitScale,
				Opponent.OPPONENT_PORTRAITS_HEIGHT * opponentPortraitScale + 50
			);
			context.fillText("Your Money:",
				this.board.position.x + this.board.dimensions.x + 30,
				this.board.position.y + 50
			);
			context.fillText(`${this.player.money}`,
				this.board.position.x + this.board.dimensions.x + 30,
				this.board.position.y + 100
			);
			// Render current wager amount.
			context.fillText("Current Wager:",
				this.board.position.x + this.board.dimensions.x + 60,
				this.board.position.y + this.board.dimensions.y / 2 - 40
			);
			context.fillText(`${this.game.wagerAmount}`,
				this.board.position.x + this.board.dimensions.x + 60,
				this.board.position.y + this.board.dimensions.y / 2
			);
			context.restore();
		}
		// Might render the shared ui here (or in game?)
	}
}
