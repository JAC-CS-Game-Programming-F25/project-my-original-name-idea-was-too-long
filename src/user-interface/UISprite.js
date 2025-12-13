import Sprite from "../../lib/Sprite.js";
import { context } from "../globals.js";
import UIElement from "./UIElement.js";

export default class UISprite extends UIElement {
    /**
     * This element is essentially a wrapper for Sprites which give them their own
     * canvas positions and a fixed scale.
     * 
     * @param {Sprite} sprite A pre-made sprite which will be wrapped as a UI element.
     * @param {number} x The Sprite's X position on the canvas.
     * @param {number} y The Sprite's Y position on the canvas.
     * @param {object} scale 
     */
    constructor(sprite, x, y, scale = { x: 1, y: 1 }) {
        super(x, y, sprite.width * scale.x, sprite.height * scale.y);

        this.sprite = sprite;
        this.scale = scale;
    }

    render(x = this.position.x, y = this.position.y, scale = this.scale) {
        context.imageSmoothingEnabled = false;
        this.sprite.render(x, y, scale);
        context.imageSmoothingEnabled = true;
    }
}