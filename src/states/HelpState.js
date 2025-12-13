import Easing from "../../lib/Easing.js";
import Input from "../../lib/Input.js";
import Sprite from "../../lib/Sprite.js";
import State from "../../lib/State.js";
import ImageName from "../enums/ImageName.js";
import SoundName from "../enums/SoundName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, gameInstructionsFactory, images, input, sounds, stateStack, timer } from "../globals.js";
import UISprite from "../user-interface/UISprite.js";
import UITextBox from "../user-interface/UITextBox.js";

export default class HelpState extends State {
    static TRANSITION_DURATION = 0.75;
    static TEXT_PADDING = 50;
    static BACKGROUND_SPRITE_DIMENSIONS = { x: 270, y: 270 }
    static BACKGROUND_SCALE = 4;

    /**
     * This state brings up a panel which shows the instructions on how to play a
     * particular dice game. The player can press H or Enter in order to close
     * the Help panel and return to their game.
     * 
     * @param {string} game The name of the game being selected. Use DiceGameName enum
     */
    constructor(game) {
        super();

        this.isTransitioning = true;

        // Define the UI elements.
        this.background = new UISprite(
            new Sprite(
                images.get(ImageName.StonePanel),
                0, 0,
                HelpState.BACKGROUND_SPRITE_DIMENSIONS.x,
                HelpState.BACKGROUND_SPRITE_DIMENSIONS.y
            ),
            CANVAS_WIDTH,
            0,
            { x: HelpState.BACKGROUND_SCALE, y: HelpState.BACKGROUND_SCALE }
        );

        this.text = new UITextBox(
            gameInstructionsFactory.get(game),
            this.background.position.x + HelpState.TEXT_PADDING,
            HelpState.TEXT_PADDING,
            CANVAS_WIDTH / 2 - HelpState.TEXT_PADDING * 2,
            CANVAS_HEIGHT - HelpState.TEXT_PADDING * 2,
            {
                fontFamily: "roboto",
                fontSize: 30,
                textAlignment: "left",
                lineSpacing: 10,
                fontColour: "white",
                textShadow: true
            }
        );
    }

    enter() {
        timer.tween(
            this.background.position,
            { x: CANVAS_WIDTH / 2 },
            HelpState.TRANSITION_DURATION,
            Easing.linear,
            () => { this.isTransitioning = false; }
        );
        sounds.play(SoundName.Stone);
    }

    update(dt) {
        if (this.isTransitioning) {
            // Keep the text in position relative to the background as the UI slides in and out.
            this.text.position.x = this.background.position.x + HelpState.TEXT_PADDING;
            return;
        }

        if (input.isKeyPressed(Input.KEYS.H) || input.isKeyPressed(Input.KEYS.ENTER)) {
            // Leave the Help State
            this.slideOut();
        }
    }

    slideOut() {
        this.isTransitioning = true;
        timer.tween(
            this.background.position,
            { x: CANVAS_WIDTH },
            HelpState.TRANSITION_DURATION,
            Easing.linear,
            () => { stateStack.pop(); }
        );
        // make the transition noise.
        sounds.play(SoundName.Stone);
    }

    render() {
        this.background.render();

        this.text.render();
    }
}