import Easing from "../../lib/Easing.js";
import Sprite from "../../lib/Sprite.js";
import State from "../../lib/State.js";
import Timer from "../../lib/Timer.js";
import ImageName from "../enums/ImageName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, images, stateStack } from "../globals.js";
import UISprite from "../user-interface/UISprite.js";
import UITextBox from "../user-interface/UITextBox.js";

export default class ShowResultState extends State {
    static PANEL_SPRITE_VALUES = { x: 0, y: 0, width: 270, height: 112, scale: { x: 2, y: 2 } }
    static TEXT_PADDING = 20;
    static FONT_SIZE = 60;

    // Timing for the sweep across animation.
    static PAN_DURATION = 0.75;
    static HOLD_DURATION = 1;

    /**
     * Slides a UI element with a specified text across the screen. The text remains on screen momentarily before
     * sliding back off, with the State popping itself back off of the State Stack.
     * 
     * @param {string} text The result to display on screen.
     * @param {object} options Options for determining the scale of the UI panel, the font size, and the length of time that the animation holds.
     */
    constructor(text, options = {}) {
        super();

        const scale = options.scale ?? ShowResultState.PANEL_SPRITE_VALUES.scale;
        const fontSize = options.fontSize ?? ShowResultState.FONT_SIZE;
        this.holdDuration = options.holdDuration ?? ShowResultState.HOLD_DURATION;

        this.background = new UISprite(
            new Sprite(
                images.get(ImageName.StonePanel2),
                ShowResultState.PANEL_SPRITE_VALUES.x,
                ShowResultState.PANEL_SPRITE_VALUES.y,
                ShowResultState.PANEL_SPRITE_VALUES.width,
                ShowResultState.PANEL_SPRITE_VALUES.height,
            ),
            CANVAS_WIDTH,
            CANVAS_HEIGHT / 2 - ShowResultState.PANEL_SPRITE_VALUES.height * scale.y / 2,
            scale
        );

        this.textBox = new UITextBox(
            text,
            this.background.position.x + ShowResultState.TEXT_PADDING,
            this.background.position.y + ShowResultState.TEXT_PADDING * 2,
            this.background.dimensions.x - ShowResultState.TEXT_PADDING * 2,
            this.background.dimensions.y - ShowResultState.TEXT_PADDING * 2,
            {
                fontFamily: 'serif',
                fontColour: 'white',
                fontSize: fontSize,
                textAlignment: 'center',
                textShadow: true
            }
        );

        this.timer = new Timer();
    }

    enter() {
        // Tween the result panel onto the screen.
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

    /**
     * Set the timer for how long the result panel will wait on the screen before tweening off.
     */
    setHoldTimer() {
        this.timer.addTask(
            () => { },
            this.holdDuration,
            this.holdDuration,
            () => {
                this.setEaseOut();
            }
        );
    }

    /**
     * Set the tween for the panel to leave the screen, and then pop this state off of the state stack.
     */
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
        this.background.render();

        this.textBox.render();
    }
}