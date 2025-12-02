import GameObject from "./GameObject.js";
import StateMachine from "../../lib/StateMachine.js";
import DieStateName from "../enums/DieStateName.js";
import DieRollingState from "../states/dice/DieRollingState.js";
import DieIdleState from "../states/dice/DieIdleState.js";
import { getRandomPositiveInteger } from "../../lib/Random.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, matter, world } from "../globals.js";

const { Composite } = matter;

export default class Die extends GameObject {
    static MIN_VALUE = 0;
    static MAX_VALUE = 6;

    static WIDTH = 30;
    static HEIGHT = Die.WIDTH;

    static MIN_ROLLING_VELOCITY = 0; // to change to a value that feels good.

    /**
     * A singular 6 sided die which can be rolled as part of a dice game.
     */
    constructor() {
        this.value = 1;

        // Whether the die is being prevented from rolling.
        this.isHeld = false;

        // Create the body in the matter.js physics world.
        this.body = matter.Bodies.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Die.WIDTH, Die.HEIGHT, {
            // Options?
        });
        Composite.add(world, this.body);
        // The offset for rendering the sprite in relation to the position value of the matter body.
        this.renderOffset = { x: Die.WIDTH / 2, y: Die.HEIGHT / 2 };

        // Set up dice states.
        this.stateMachine = new StateMachine();
        this.stateMachine.add(DieStateName.Rolling, new DieRollingState(this));
        this.stateMachine.add(DieStateName.Idle, new DieIdleState(this));
        this.stateMachine.change(DieStateName.Idle);

        this.sprites = {

        } // To set up. If I have both idle and rolling sprites here I can render in Die class
        // using the animation set by the state
        this.currentAnimation = this.stateMachine.currentState.animation[this.value];
        this.currentFrame = 1;
    }

    onRoll() {
        if (this.isHeld) return;

        this.value = getRandomPositiveInteger(Die.MIN_VALUE, Die.MAX_VALUE);
        this.stateMachine.change(DieStateName.Rolling); // Might add some enter params to rolling state
    }

    isRolling() {
        return this.stateMachine.currentState instanceof DieRollingState;
    }

    update(dt) {
        this.stateMachine.update(dt)

        // If a rolling die gets below a certain velocity, have it become idle.
        if (this.isRolling() && this.body.velocity <= Die.MIN_ROLLING_VELOCITY) {
            this.stateMachine.change(DieStateName.Idle);
        }
    }

    render() {
        context.save();
        context.translate(this.body.position.x, this.body.position.y);
        context.rotate(this.body.angle);
        this.sprites[this.currentFrame].render(this.renderOffset.x, this.renderOffset.y /* might scale up */);
        context.restore();
    }
}