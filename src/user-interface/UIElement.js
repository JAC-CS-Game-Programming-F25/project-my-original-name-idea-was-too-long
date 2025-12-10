import Vector from "../../lib/Vector.js";

export default class UIElement {
    /**
     * The base UI element which all other interface elements should extend.
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    constructor(x, y, width, height) {
        this.position = new Vector(x, y);
        this.dimensions = new Vector(width, height);

        this.alpha = 1;
    }

    render(scale = { x: 1, y: 1 }) { }
}