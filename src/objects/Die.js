import GameObject from "./GameObject.js";
import StateMachine from "../../lib/StateMachine.js";
import DieStateName from "../enums/DieStateName.js";
import DieRollingState from "../states/dice/DieRollingState.js";
import DieIdleState from "../states/dice/DieIdleState.js";
import { getRandomNegativeNumber, getRandomNumber, getRandomPositiveInteger, getRandomPositiveNumber } from "../../lib/Random.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, DEBUG, images, matter, world } from "../globals.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import Direction from "../enums/Direction.js";
import Vector from "../../lib/Vector.js";

export default class Die extends GameObject {
    static MIN_VALUE = 1;
    static MAX_VALUE = 6;

    static SPRITE_WIDTH = 32;
    static SPRITE_HEIGHT = Die.SPRITE_WIDTH;
    static WIDTH = 48;
    static HEIGHT = Die.WIDTH;

    static MIN_ROLLING_VELOCITY = 1.0;

    /**
     * A singular 6 sided die which can be rolled as part of a dice game.
     */
    constructor() {
        super(matter.Bodies.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Die.WIDTH, Die.HEIGHT));

        this.value = 1;

        // Whether the die is being prevented from rolling.
        this.isHeld = false;

        // The offset for rendering the sprite in relation to the position value of the matter body.
        this.renderOffset = { x: Die.WIDTH / 2, y: Die.HEIGHT / 2 };

        // Set up dice states.
        this.stateMachine = new StateMachine();
        this.stateMachine.add(DieStateName.Rolling, new DieRollingState(this));
        this.stateMachine.add(DieStateName.Idle, new DieIdleState(this));
        this.stateMachine.change(DieStateName.Idle);

        // Set up dice sprites.
        this.sprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Dice),
            Die.SPRITE_WIDTH,
            Die.SPRITE_HEIGHT
        );

        this.currentAnimation = this.stateMachine.currentState.animations[this.value - 1];
        this.currentFrame = 0;
    }

    /**
     * Roll the die, as long as it is not being held.
     * 
     * @param {string} direction The direction in which the die shall be cast. Use the Direction enum.
     * @param {Vector} startingPosition The position from which the die shall be cast. Defaults to the center of the screen.
     */
    onRoll(direction, startingPosition = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }) {
        if (this.isHeld) return;

        this.value = getRandomPositiveInteger(Die.MIN_VALUE, Die.MAX_VALUE);
        this.stateMachine.change(DieStateName.Rolling);

        // Start the matter body's motion in the game engine.
        // Set the body's position.
        matter.Body.setPosition(this.body, {
            x: startingPosition.x,
            y: startingPosition.y
        });

        // Apply force based on the direction the die is rolling.

        // The maximum force to be applied on the axis perpendicular to the direction in which the die is being cast.
        const lateralForceMax = 0.02;
        // The maximum force to be applied for the direction in which the die is being cast.
        const directionalForceMax = 0.1;
        // The minimum force to be applied for the direction in which the die is being cast.
        const directionalForceMin = 0.05;
        switch (direction) {
            case Direction.Up:
                matter.Body.applyForce(this.body, this.body.position, {
                    x: getRandomNumber(0, lateralForceMax),
                    y: getRandomNegativeNumber(directionalForceMin, directionalForceMax)
                });
                break;
            case Direction.Down:
                matter.Body.applyForce(this.body, this.body.position, {
                    x: getRandomNumber(0, lateralForceMax),
                    y: getRandomPositiveNumber(directionalForceMin, directionalForceMax)
                });
                break;
            case Direction.Left:
                matter.Body.applyForce(this.body, this.body.position, {
                    x: getRandomNegativeNumber(directionalForceMin, directionalForceMax),
                    y: getRandomNumber(0, lateralForceMax)
                });
                break;
            case Direction.Right:
                matter.Body.applyForce(this.body, this.body.position, {
                    x: getRandomPositiveNumber(directionalForceMin, directionalForceMax),
                    y: getRandomNumber(0, lateralForceMax)
                });
                break;
            default:
                matter.Body.applyForce(this.body, this.body.position, {
                    x: getRandomNumber(0, directionalForceMax),
                    y: getRandomNumber(0, directionalForceMax)
                });
                break;
        }
    }

    isRolling() {
        return this.stateMachine.currentState instanceof DieRollingState;
    }

    update(dt) {
        this.stateMachine.update(dt)

        // If a rolling die gets below a certain velocity, have it become idle.
        if (
            this.isRolling() &&
            this.body.velocity.x <= Die.MIN_ROLLING_VELOCITY && this.body.velocity.x >= -(Die.MIN_ROLLING_VELOCITY) &&
            this.body.velocity.y <= Die.MIN_ROLLING_VELOCITY && this.body.velocity.y >= -(Die.MIN_ROLLING_VELOCITY)
        ) {
            this.stateMachine.change(DieStateName.Idle);
        }
    }

    render() {
        context.save();
        context.translate(this.body.position.x, this.body.position.y);
        context.rotate(this.body.angle);
        this.sprites[this.currentFrame].render(this.renderOffset.x, this.renderOffset.y, {
            // Scale the sprite up upon render.
            x: this.getRenderScale(),
            y: this.getRenderScale()
        });

        if (DEBUG) {
            context.beginPath();
            context.arc(0, 0, Die.WIDTH / 2, 0, 2 * Math.PI);
            context.closePath();
            context.lineWidth = 2;
            context.strokeStyle = 'red';
            context.stroke();
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(Die.WIDTH / 2, 0)
            context.closePath();
            context.stroke();
        }

        context.restore();
    }

    /**
     * @returns the scale at which to render the die's sprite. Rolling sprites get scaled slightly more than idle.
     */
    getRenderScale() {
        if (this.isRolling()) {
            return Die.HEIGHT / (Die.SPRITE_HEIGHT / 1.1)
        } else {
            return Die.HEIGHT / Die.SPRITE_HEIGHT
        }
    }
}