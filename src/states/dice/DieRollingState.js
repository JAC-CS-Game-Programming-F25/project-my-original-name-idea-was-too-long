import Animation from "../../../lib/Animation.js";
import { getRandomPositiveNumber } from "../../../lib/Random.js";
import State from "../../../lib/State.js";
import { matter, world } from "../../globals.js";
import Die from "../../objects/Die.js";

const { Composite } = matter

export default class DieRollingState extends State {
    static ANIMATION_INTERVAL = 0.07;

    /**
     * In this state, a die is rolling and moving around, affected by collisions with other objects.
     * The die will leave this state once it's velocity has gone below a certain threshold.
     * 
     * @param {Die} die 
     */
    constructor(die) {
        super();

        this.die = die;

        this.animations = new Animation([6, 7, 8, 9, 10, 11, 12, 13], DieRollingState.ANIMATION_INTERVAL);
    }

    enter() {
        // Set animation.
        this.setBody();
        this.die.currentAnimation = this.animations;

        // Give push here or above?
    }

    update(dt) {
        this.animations.update(dt);
        this.die.currentFrame = this.animations.getCurrentFrame();
    }

    setBody() {
        const oldBody = this.die.body;
        this.die.body = matter.Bodies.circle(
            oldBody.position.x,
            oldBody.position.y,
            Die.WIDTH / 2,
            {
                angle: getRandomPositiveNumber(0, 6.283), // angles are in radians
                restitution: 1
            }
        );
        Composite.remove(world, oldBody);
        Composite.add(world, this.die.body);

        this.die.renderOffset = { x: -Die.WIDTH / 2, y: -Die.HEIGHT / 2 };
    }
}