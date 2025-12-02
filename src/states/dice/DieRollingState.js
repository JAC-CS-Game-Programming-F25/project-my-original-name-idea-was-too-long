import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Die from "../../objects/Die.js";

export default class DieRollingState extends State {
    /**
     * In this state, a die is rolling and moving around, affected by collisions with other objects.
     * The die will leave this state once it's velocity has gone below a certain threshold.
     * 
     * @param {Die} die 
     */
    constructor(die) {
        this.die = die;

        this.animation = new Animation(/* To set a bunch of shit here so it animates across the roll forever */);
    }

    enter() {
        // Set animation.
        this.setBody();

        // Give push here or above?
    }

    update(dt) {
        this.animation.update(dt);
        this.die.currentFrame = this.animation.getCurrentFrame();
    }

    setBody() {
        const oldBody = this.die.body;
        this.die.body = matter.Bodies.circle(
            oldBody.position.x,
            oldBody.position.y,
            Die.WIDTH / 2,
            {
                angle: getRandomPositiveNumber(0, 6.283) // angles are in radians
                // More options? Density? Gotta play around with it.
            }
        );
        Composite.remove(world, oldBody);
        Composite.add(world, this.die.body);

        this.die.renderOffset = { x: Die.WIDTH / 2, y: Die.HEIGHT / 2 };
    }
}