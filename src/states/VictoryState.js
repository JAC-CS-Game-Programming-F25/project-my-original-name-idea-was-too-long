import Easing from "../../lib/Easing.js";
import Input from "../../lib/Input.js";
import State from "../../lib/State.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, input, stateStack, timer } from "../globals.js";
import TitleScreenState from "./TitleScreenState.js";

export default class VictoryState extends State {
	constructor() {
		super();

		this.fadeDuration = 3;
		this.returnMessageFadeDuration = 2;

		// The alpha value of the message which will gradually fade into view.
		this.victoryMessageAlpha = 0;
		this.returnMessageAlpha = 0;

		this.victoryMessage = "You've Beaten Everyone!";
		this.subMessage = "Now they're all in debt...";
		this.returnMessage = "Press ENTER to return to the Title Screen";
	}

	enter() {
		// Fade in the Victory message.
		timer.tween(
			this,
			{ victoryMessageAlpha: 1 },
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
		// Once the Victory message is visible, let the player go back to the title screen by hitting ENTER.
		if (this.victoryMessageAlpha === 1 && input.isKeyPressed(Input.KEYS.ENTER)) {
			stateStack.clear();
			stateStack.push(new TitleScreenState());
		}
	}

	render() {
		context.save();
		// Render the Victory Message.
		context.fillStyle = 'white';
		context.font = '120px manufacturingConsent';
		context.textAlign = 'center';
		context.globalAlpha = this.victoryMessageAlpha;
		context.fillText(this.victoryMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
		context.font = '90px manufacturingConsent';
		context.fillText(this.subMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);

		// Render the return instructions.
		context.globalAlpha = this.returnMessageAlpha;
		context.font = '40px roboto';
		context.fillText(this.returnMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 120);

		context.restore();
	}
}
