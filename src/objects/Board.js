import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import ImageName from "../enums/ImageName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, DEBUG, images, matter, world } from "../globals.js";
import GameObject from "./GameObject.js";

const { Composite } = matter;

export default class Board extends GameObject {
    static WIDTH = 1000;
    static HEIGHT = 1000;
    static EDGE_THICKNESS = 80;

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
        super();

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

        // Set up the edges of the board as static matter.js bodies.
        // These are set to the board's final post-tween position.
        this.edges = [
            // Left
            matter.Bodies.rectangle(
                this.finalX + Board.EDGE_THICKNESS / 2,
                this.position.y + this.dimensions.y / 2,
                Board.EDGE_THICKNESS,
                this.dimensions.y,
                { isStatic: true }
            ),
            // Top
            matter.Bodies.rectangle(
                this.finalX + this.dimensions.x / 2,
                this.position.y + Board.EDGE_THICKNESS / 2,
                this.dimensions.x,
                Board.EDGE_THICKNESS,
                { isStatic: true }
            ),
            // Right
            matter.Bodies.rectangle(
                this.finalX + this.dimensions.x - Board.EDGE_THICKNESS / 2,
                this.position.y + this.dimensions.y / 2,
                Board.EDGE_THICKNESS,
                this.dimensions.y,
                { isStatic: true }
            ),
            // Bottom
            matter.Bodies.rectangle(
                this.finalX + this.dimensions.x / 2,
                this.position.y + this.dimensions.y - Board.EDGE_THICKNESS / 2,
                this.dimensions.x,
                Board.EDGE_THICKNESS,
                { isStatic: true }
            )
        ];
        this.edges.forEach((edge) => { Composite.add(world, edge) });
    }

    render() {
        this.surface.render(this.position.x, this.position.y, this.renderScale);

        // Debug, show edge bodies.
        if (DEBUG) {
            this.edges.forEach((edge) => {
                context.save();
                context.strokeStyle = "red"
                context.beginPath();
                context.rect(edge.bounds.min.x, edge.bounds.min.y, edge.bounds.max.x - edge.bounds.min.x, edge.bounds.max.y - edge.bounds.min.y)
                context.stroke();
                context.closePath();
                context.restore();
            });
        }
    }
}