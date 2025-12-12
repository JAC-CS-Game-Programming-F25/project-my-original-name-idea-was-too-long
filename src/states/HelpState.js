import Easing from "../../lib/Easing.js";
import Input from "../../lib/Input.js";
import State from "../../lib/State.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, gameInstructionsFactory, input, stateStack, timer } from "../globals.js";
import UIElement from "../user-interface/UIElement.js";
import UITextBox from "../user-interface/UITextBox.js";

export default class HelpState extends State {
    static TRANSITION_DURATION = 0.75;
    static TEXT_PADDING = 50;

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
        this.background = new UIElement(CANVAS_WIDTH, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        this.background.alpha = 1;

        this.text = new UITextBox(
            gameInstructionsFactory.get(game),
            this.background.x + HelpState.TEXT_PADDING,
            HelpState.TEXT_PADDING,
            this.background.dimensions.x - HelpState.TEXT_PADDING * 2,
            this.background.dimensions.y - HelpState.TEXT_PADDING * 2,
            {
                fontFamily: "roboto",
                fontSize: 30,
                textAlignment: "left",
                lineSpacing: 10
            }
        );
    }

    enter() {
        timer.tween(
            this.background.position,
            { x: CANVAS_WIDTH - this.background.dimensions.x },
            HelpState.TRANSITION_DURATION,
            Easing.linear,
            () => { this.isTransitioning = false; }
        );
        // make the transition noise.
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
    }

    render() {
        context.save();
        context.globalAlpha = this.background.alpha;
        context.fillStyle = 'white';
        context.fillRect(
            this.background.position.x,
            this.background.position.y,
            this.background.dimensions.x,
            this.background.dimensions.y
        );
        context.restore();

        this.text.render();
    }
}