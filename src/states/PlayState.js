import State from "../../lib/State.js";
import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";
import DiceGameFactory from "../services/DiceGameFactory.js";
import { CANVAS_WIDTH, context, DEBUG, engine, images, input, matter, sounds, stateStack, timer, world } from "../globals.js";
import Board from "../objects/Board.js";
import Easing from "../../lib/Easing.js";
import Input from "../../lib/Input.js";
import HelpState from "./HelpState.js";
import SoundName from "../enums/SoundName.js";
import Sprite from "../../lib/Sprite.js";
import UISprite from "../user-interface/UISprite.js";
import ImageName from "../enums/ImageName.js";

const { Composite, Engine } = matter;

export default class PlayState extends State {
	static COIN_SPRITE_VALUES = { x: 49, y: 32, width: 15, height: 16, scale: { x: 3, y: 3 } }

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

		// Remove any Matter bodies lingering due to a previous atypical game exit.
		Composite.allBodies(world).forEach((body) => {
			Composite.remove(world, body);
		});

		this.player = player;
		this.opponent = opponent;
		this.board = new Board(CANVAS_WIDTH, 0); // The board starts off screen and tweens in.
		this.game = DiceGameFactory.create(this.player, this.opponent);

		this.coinPouchSprite = new UISprite(
			new Sprite(
				images.get(ImageName.Money),
				PlayState.COIN_SPRITE_VALUES.x,
				PlayState.COIN_SPRITE_VALUES.y,
				PlayState.COIN_SPRITE_VALUES.width,
				PlayState.COIN_SPRITE_VALUES.height
			),
			0, 0,
			PlayState.COIN_SPRITE_VALUES.scale
		);

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
		Composite.allBodies(world).forEach((body) => {
			Composite.remove(world, body);
		});
		localStorage.removeItem("game");
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

		if (this.isStartupTransition) {
			return;
		}

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
		context.fillStyle = 'white';
		context.font = '40px manufacturingConsent';
		this.coinPouchSprite.render(
			this.board.position.x - Opponent.OPPONENT_PORTRAITS_WIDTH / 2 * opponentPortraitScale - this.coinPouchSprite.dimensions.x - 10,
			Opponent.OPPONENT_PORTRAITS_HEIGHT * opponentPortraitScale + 20
		);
		context.fillText(`${this.opponent.money}`,
			this.board.position.x - Opponent.OPPONENT_PORTRAITS_WIDTH / 2 * opponentPortraitScale,
			Opponent.OPPONENT_PORTRAITS_HEIGHT * opponentPortraitScale + 60
		);
		context.fillText("Your Money:",
			this.board.position.x + this.board.dimensions.x + 30,
			this.board.position.y + 50
		);
		this.coinPouchSprite.render(
			this.board.position.x + this.board.dimensions.x + 50,
			this.board.position.y + 60
		);
		context.fillText(`${this.player.money}`,
			this.board.position.x + this.board.dimensions.x + this.coinPouchSprite.dimensions.x + 60,
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

		// Debugging mode, render a rectangle around each body in the world.
		if (DEBUG) {
			Composite.allBodies(world).forEach((body) => {
				context.save();
				context.strokeStyle = "red"
				context.beginPath();
				context.rect(body.bounds.min.x, body.bounds.min.y, body.bounds.max.x - body.bounds.min.x, body.bounds.max.y - body.bounds.min.y);
				context.stroke();
				context.closePath();
				context.restore();
			});
		}
	}
}
