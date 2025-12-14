import Easing from "../../lib/Easing.js";
import Input from "../../lib/Input.js";
import Sprite from "../../lib/Sprite.js";
import State from "../../lib/State.js";
import ImageName from "../enums/ImageName.js";
import SoundName from "../enums/SoundName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, images, input, sounds, stateStack, timer } from "../globals.js";
import UISprite from "../user-interface/UISprite.js";
import UITextBox from "../user-interface/UITextBox.js";
import OpponentSelectionState from "./OpponentSelectionState.js";

export default class TitleScreenState extends State {
	static MENU_VALUES = {
		x: CANVAS_WIDTH / 2 - 200,
		y: CANVAS_HEIGHT - 300,
		width: 400,
		height: 60,
		options: { fontFamily: 'roboto', fontSize: 60, fontColour: 'white', textAlignment: 'center' }
	};
	static POINTER_SPRITE_VALUES = { x: 151, y: 284, width: 126, height: 67 };

	constructor() {
		super();

		this.backdrop = images.get(ImageName.Backdrop);

		// Variables tied to the transitions of the UI in and out of view.
		this.titleAlpha = 0;
		this.menuAlpha = 0;
		this.fadeInDuration = 2;
		this.fadeOutDuration = 1;

		// Build the menu options from which the player can select.
		const spacer = 20;
		this.menu = [
			new UITextBox("New Game",
				TitleScreenState.MENU_VALUES.x,
				TitleScreenState.MENU_VALUES.y,
				TitleScreenState.MENU_VALUES.width,
				TitleScreenState.MENU_VALUES.height,
				TitleScreenState.MENU_VALUES.options
			),
			new UITextBox("Load Game",
				TitleScreenState.MENU_VALUES.x,
				TitleScreenState.MENU_VALUES.y + TitleScreenState.MENU_VALUES.height + spacer,
				TitleScreenState.MENU_VALUES.width,
				TitleScreenState.MENU_VALUES.height,
				TitleScreenState.MENU_VALUES.options
			)
		];

		// Which menu option is currently selected.
		this.selectedOption = 0;
		// The UI pointer which indicates which options is selected.
		this.pointer = new UISprite(
			new Sprite(
				images.get(ImageName.Hand),
				TitleScreenState.POINTER_SPRITE_VALUES.x,
				TitleScreenState.POINTER_SPRITE_VALUES.y,
				TitleScreenState.POINTER_SPRITE_VALUES.width,
				TitleScreenState.POINTER_SPRITE_VALUES.height
			),
			this.menu[0].position.x + this.menu[0].dimensions.x,
			this.menu[0].position.y - 5
		);

		this.isTransitioning = true;
	}

	enter() {
		sounds.stopAll();
		sounds.play(SoundName.Ambiance);
		sounds.play(SoundName.Music);

		// Start title fade in.
		timer.tween(
			this,
			{ titleAlpha: 1 },
			this.fadeInDuration,
			Easing.linear,
			() => {
				// Then fade in menu selection options.
				timer.tween(
					this,
					{ menuAlpha: 1 },
					this.fadeInDuration,
					Easing.easeOutQuad
				);
				this.isTransitioning = false;
			}
		);
	}

	update(dt) {
		if (this.isTransitioning) {
			return;
		}

		// If Enter is pressed, proceed with the selected option.
		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			switch (this.selectedOption) {
				case 0:
					// Start a new game.
					this.fadeToOpponentSelection(true);
					break;
				case 1:
					// Load existing game.
					this.fadeToOpponentSelection(false);
					break;
				default:
					break;
			}
		}
		// If up/down arrows or W/S are pressed, cycle through the menu options.
		else if (input.isKeyPressed(Input.KEYS.W) || input.isKeyPressed(Input.KEYS.ARROW_UP)) {
			if (this.selectedOption > 0) {
				this.selectedOption--;
			}
			sounds.play(SoundName.Coin);
		} else if (input.isKeyPressed(Input.KEYS.S) || input.isKeyPressed(Input.KEYS.ARROW_DOWN)) {
			if (this.selectedOption < this.menu.length - 1) {
				this.selectedOption++;
			}
			sounds.play(SoundName.Coin);
		}
		// Update the pointer's position to always be pointing at the selected menu option.
		this.pointer.position.y = this.menu[this.selectedOption].position.y - 5;
	}

	/**
	 * Fade out the UI before transitioning to the next state.
	 * @param {boolean} isNewGame If true, start a new game from scratch. If false, load data from local storage.
	 */
	fadeToOpponentSelection(isNewGame) {
		this.isTransitioning = true;
		timer.tween(
			this,
			{ titleAlpha: 0, menuAlpha: 0 },
			this.fadeOutDuration,
			Easing.linear,
			() => {
				stateStack.push(new OpponentSelectionState(), isNewGame);
			}
		);
	}

	render() {
		context.save();

		context.imageSmoothingEnabled = false;
		this.backdrop.render(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Render Title.
		context.globalAlpha = this.titleAlpha;
		context.fillStyle = 'white';
		context.shadowColor = 'black';
		context.shadowOffsetX = 3;
		context.shadowOffsetY = 3;
		context.shadowBlur = 5;
		context.font = '160px manufacturingConsent';
		context.textAlign = 'center'
		context.fillText("Dedos de", CANVAS_WIDTH / 2 - 200, CANVAS_HEIGHT / 2 - 200);
		context.font = '300px manufacturingConsent';
		context.fillText("Toledo", CANVAS_WIDTH / 2 + 30, CANVAS_HEIGHT / 2 + 60);

		// Render Menu Options.
		context.shadowColor = 'transparent';
		context.globalAlpha = this.menuAlpha;
		this.menu.forEach((option) => { option.render() });
		// Render the selection indicator.
		this.pointer.render();

		context.restore();
	}
}
