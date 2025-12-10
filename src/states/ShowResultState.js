import Easing from "../../lib/Easing.js";
import State from "../../lib/State.js";
import Timer from "../../lib/Timer.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, stateStack } from "../globals";
import UIElement from "../user-interface/UIElement.js";
import UITextBox from "../user-interface/UITextBox.js";

export default class ShowResultState extends State {
    static PANEL_HEIGHT = 200;
    static PANEL_WIDTH = 600;
    static TEXT_PADDING = 20;

    // Timing for the sweep across animation.
    static PAN_DURATION = 0.5;
    static HOLD_DURATION = 0.75;

    /**
     * Slides a UI elements with a specified text across the screen. The text remains on screen momentarily before
     * sliding back off, with the State popping itself back off of the State Stack.
     * 
     * @param {string} text The result to display on screen.
     */
    constructor(text) {
        super();

        this.background = new UIElement(
            CANVAS_WIDTH,
            CANVAS_HEIGHT / 2 - ShowResultState.PANEL_HEIGHT / 2,
            ShowResultState.PANEL_WIDTH,
            ShowResultState.PANEL_HEIGHT
        );

        this.textBox = new UITextBox(
            text,
            this.background.position.x + ShowResultState.TEXT_PADDING,
            this.background.position.y + ShowResultState.TEXT_PADDING,
            this.background.dimensions.x - ShowResultState.TEXT_PADDING * 2,
            this.background.dimensions.y - ShowResultState.TEXT_PADDING * 2,
            {
                fontFamily: 'manufacturedConsent',
                fontColour: 'black',
                fontSize: 60
            }
        );

        this.timer = new Timer();
    }

    enter() {
        this.timer.tween(
            this.background.position,
            { x: CANVAS_WIDTH / 2 - this.background.dimensions.x / 2 },
            ShowResultState.PAN_DURATION,
            Easing.easeOutQuad,
            () => {
                this.setHoldTimer();
            }
        );
    }

    setHoldTimer() {
        this.timer.addTask(
            () => { },
            ShowResultState.HOLD_DURATION,
            ShowResultState.HOLD_DURATION,
            () => {
                this.setEaseOut();
            }
        );
    }

    setEaseOut() {
        this.timer.tween(
            this.background.position,
            { x: -(this.background.dimensions.x) },
            ShowResultState.PAN_DURATION,
            Easing.easeOutQuad,
            () => {
                stateStack.pop();
            }
        );
    }

    update(dt) {
        // Update the text box so that it stays aligned relative to the background.
        this.textBox.position.x = this.background.position.x + ShowResultState.TEXT_PADDING;

        this.timer.update(dt);
    }

    render() {
        context.save();
        context.fillStyle = 'white';
        context.fillRect(
            this.background.position.x,
            this.background.position.y,
            this.background.dimensions.x,
            this.background.dimensions.y
        );
        context.restore();

        this.textBox.render();
    }
}