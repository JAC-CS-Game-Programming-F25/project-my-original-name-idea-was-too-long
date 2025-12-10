import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";
import UIElement from "./UIElement.js";

export default class UIArrow extends UIElement {
    static SPRITE_MEASUREMENTS_LEFT = { x: 123, y: 118, width: 46, height: 91 };
    static SPRITE_MEASUREMENTS_RIGHT = { x: 297, y: 118, width: 46, height: 91 };
    static SPRITE_MEASUREMENTS_UP = { x: 73, y: 259, width: 91, height: 46 };
    static SPRITE_MEASUREMENTS_DOWN = { x: 188, y: 257, width: 91, height: 46 };

    /**
     * A directional arrow UI element.
     * 
     * @param {number} x the x coordinate of the element on the canvas
     * @param {number} y the y coordinate of the element on the canvas
     * @param {string} direction uses the Direction enum
     */
    constructor(x, y, direction) {
        super(x, y);

        // Create the sprite according to the direction specified.
        let spriteMeasurements;
        switch (direction) {
            case Direction.Left:
                spriteMeasurements = UIArrow.SPRITE_MEASUREMENTS_LEFT;
                break;
            case Direction.Right:
                spriteMeasurements = UIArrow.SPRITE_MEASUREMENTS_RIGHT;
                break;
            case Direction.Up:
                spriteMeasurements = UIArrow.SPRITE_MEASUREMENTS_UP;
                break;
            case Direction.Down:
                spriteMeasurements = UIArrow.SPRITE_MEASUREMENTS_DOWN;
                break;
            default:
                console.log("You screwed up defining the direction for your arrow UI element");
                break;
        }
        this.dimensions = new Vector(spriteMeasurements.width, spriteMeasurements.height);
        this.sprite = new Sprite(
            images.get(ImageName.UIControls),
            spriteMeasurements.x,
            spriteMeasurements.y,
            spriteMeasurements.width,
            spriteMeasurements.height
        );
    }

    render(scale = { x: 1, y: 1 }) {
        this.sprite.render(this.position.x, this.position.y, scale);
    }
}