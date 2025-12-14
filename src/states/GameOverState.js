import Easing from "../../lib/Easing.js";
import Input from "../../lib/Input.js";
import State from "../../lib/State.js";
import SoundName from "../enums/SoundName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, input, sounds, stateStack, timer } from "../globals.js";
import TitleScreenState from "./TitleScreenState.js";

export default class GameOverState extends State {
	/**
	 * This is the state that appears when the player looses all of their money.
	 * Once the transition is done, they can press enter to return to the Title Screen.
	 */
	constructor() {
		super();

		// The visual that will gradually dim the screen when a game over is reached.
		this.dimmer = 0;
		this.dimmerFinalAlpha = 0.8;
		this.fadeDuration = 5;
		this.returnMessageFadeDuration = 2;

		// The alpha value of the message which will gradually fade into view.
		this.gameOverMessageAlpha = 0;
		this.returnMessageAlpha = 0;

		this.gameOverMessage = "You've Lost Everything...";
		this.returnMessage = "Press ENTER to return to the Title Screen";
	}

	enter() {
		sounds.play(SoundName.GameOverMusic);
		sounds.stop(SoundName.Music);

		// Dim the screen.
		timer.tween(
			this,
			{ dimmer: this.dimmerFinalAlpha },
			this.fadeDuration,
			Easing.linear
		);
		// Fade in the Game Over message.
		timer.tween(
			this,
			{ gameOverMessageAlpha: 1 },
			this.fadeDuration,
			Easing.linear,
			() => {
				// Then fade in the return to title screen message.
				timer.tween(
					this,
					{ returnMessageAlpha: 1 },
					this.returnMessageFadeDuration,
					Easing.easeOutQuad
				);
			}
		);
	}

	update(dt) {
		// Once the Game Over message is visible, let the player go back to the title screen by hitting ENTER.
		if (this.gameOverMessageAlpha === 1 && input.isKeyPressed(Input.KEYS.ENTER)) {
			stateStack.clear();
			stateStack.push(new TitleScreenState());
		}
	}

	render() {
		context.save();
		// Render the dimmer.
		context.fillStyle = 'black';
		context.globalAlpha = this.dimmer;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Render the Game Over Message.
		context.fillStyle = 'white';
		context.font = '120px manufacturingConsent';
		context.textAlign = 'center';
		context.globalAlpha = this.gameOverMessageAlpha;
		context.fillText(this.gameOverMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

		// Render the return instructions.
		context.globalAlpha = this.returnMessageAlpha;
		context.font = '40px roboto';
		context.fillText(this.returnMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 120);

		context.restore();
	}
}
