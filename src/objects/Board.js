import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import ImageName from "../enums/ImageName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, DEBUG, images, matter, world } from "../globals.js";
import BoardEdge from "./BoardEdge.js";

const { Composite } = matter;

export default class Board {
    static WIDTH = 1000;
    static HEIGHT = 1000;

    static SPRITE_DIMENSIONS = { width: 300, height: 300 };

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
        this.renderScale = {
            x: width / Board.SPRITE_DIMENSIONS.width,
            y: height / Board.SPRITE_DIMENSIONS.height
        };
        // Adjust y position so the board is centered vertically
        this.position.y = CANVAS_HEIGHT / 2 - this.dimensions.y / 2;

        // Set the final x position where the board will rest once it has completed its entry tween.
        this.finalX = CANVAS_WIDTH / 2 - this.dimensions.x / 2;

        this.surface = new Sprite(
            images.get(ImageName.Board),
            0,
            0,
            Board.SPRITE_DIMENSIONS.width,
            Board.SPRITE_DIMENSIONS.height
        );

        // Set up the edges of the board.
        // These are set to the board's final post-tween position.
        this.edges = [
            // Left
            new BoardEdge(
                this.finalX,
                this.position.y,
                BoardEdge.THICKNESS,
                this.dimensions.y
            ),
            // Top
            new BoardEdge(
                this.finalX,
                this.position.y,
                this.dimensions.x,
                BoardEdge.THICKNESS
            ),
            // Right
            new BoardEdge(
                this.finalX + this.dimensions.x - BoardEdge.THICKNESS,
                this.position.y,
                BoardEdge.THICKNESS,
                this.dimensions.y
            ),
            // Bottom
            new BoardEdge(
                this.finalX,
                this.position.y + this.dimensions.y - BoardEdge.THICKNESS,
                this.dimensions.x,
                BoardEdge.THICKNESS
            )
        ];
    }

    render() {
        context.imageSmoothingEnabled = false;
        this.surface.render(this.position.x, this.position.y, this.renderScale);
        context.imageSmoothingEnabled = true;
    }
}