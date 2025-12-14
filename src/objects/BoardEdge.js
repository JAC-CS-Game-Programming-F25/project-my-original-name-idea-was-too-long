import { matter } from "../globals.js";
import GameObject from "./GameObject.js";

export default class BoardEdge extends GameObject {
    static THICKNESS = 80;

    /**
     * The solid edge of the game board. These edges are solid and have matter.js
     * bodies for the purpose of collision with the game dice.
     * 
     * @param {number} x The x coordinate of the top left corner of the edge
     * @param {number} y The y coordinate of the top left corner of the edge
     * @param {number} width The width of the edge
     * @param {number} height The height of the edge
     */
    constructor(x, y, width, height) {
        super(matter.Bodies.rectangle(
            x + width / 2,
            y + height / 2,
            width,
            height,
            { isStatic: true }
        ));
    }
}