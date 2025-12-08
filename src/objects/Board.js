import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import ImageName from "../enums/ImageName.js";
import { images, matter, world } from "../globals.js";
import GameObject from "./GameObject.js";

const { Composition } = matter;

export default class Board extends GameObject {
    static WIDTH = 1000;
    static HEIGHT = 1000;
    static EDGE_THICKNESS = 30;

    /**
     * A board that serves as the surface for a dice game. The board's edges
     * are matter.js bodies and will prevent dice from falling off.
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} width 
     * @param {*} height 
     */
    constructor(x, y, width = Board.WIDTH, height = Board.HEIGHT) {
        this.position = new Vector(x, y);
        this.dimensions = new Vector(width, height);

        this.surface = new Sprite(
            images.get(ImageName.Board),
            0,
            0,
            300,
            300
        );

        // Set up the edges of the board as static matter.js bodies.
        this.edges = [
            // Left
            matter.Bodies.rectangle(
                this.position.x + Board.EDGE_THICKNESS / 2,
                this.position.y + this.dimensions.y / 2,
                Board.EDGE_THICKNESS,
                this.dimensions.y,
                { isStatic: true }
            ),
            // Top
            matter.Bodies.rectangle(
                this.position.x + this.dimensions.x / 2,
                this.position.y + Board.EDGE_THICKNESS / 2,
                this.dimensions.x,
                Board.EDGE_THICKNESS,
                { isStatic: true }
            ),
            // Right
            matter.Bodies.rectangle(
                this.position.x + this.dimensions.x - Board.EDGE_THICKNESS / 2,
                this.position.y + this.dimensions.y / 2,
                Board.EDGE_THICKNESS,
                this.dimensions.y,
                { isStatic: true }
            ),
            // Bottom
            matter.Bodies.rectangle(
                this.position.x + this.dimensions.x / 2,
                this.position.y + this.dimensions.y - Board.EDGE_THICKNESS / 2,
                this.dimensions.x,
                Board.EDGE_THICKNESS,
                { isStatic: true }
            )
        ];
        this.edges.forEach((edge) => { Composition.add(world, edge) });
    }

    render() {
        this.surface.render(this.position.x, this.position.y /* possibly scale */);
    }
}