import Sprite from "../../lib/Sprite.js";
import { context } from "../globals.js";
import UIElement from "./UIElement.js";

export default class UIBackground extends UIElement {
    /**
     * A UI element which serves as a background. This element is essentially a wrapper for
     * Sprites which give them their own canvas positions and a fixed scale.
     * 
     * @param {Sprite} sprite A pre-made sprite which will serve as the background image.
     * @param {number} x The Background's X position on the canvas.
     * @param {number} y The Background's Y position on the canvas.
     * @param {object} scale 
     */
    constructor(sprite, x, y, scale = { x: 1, y: 1 }) {
        super(x, y, sprite.width * scale.x, sprite.height * scale.y);

        this.sprite = sprite;
        this.scale = scale;
    }

    render() {
        context.imageSmoothingEnabled = false;
        this.sprite.render(this.position.x, this.position.y, this.scale);
        context.imageSmoothingEnabled = true;
    }
}