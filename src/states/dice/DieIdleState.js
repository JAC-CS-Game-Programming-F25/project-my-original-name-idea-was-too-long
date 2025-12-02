import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import Die from "../../objects/Die.js";
import { matter, world } from "../../globals.js";
import { getRandomPositiveNumber } from "../../../lib/Random.js";

const { Composite } = matter;

export default class DieIdleState extends State {
    /**
     * In this state, the die is unmoving and simply showing it's rolled face. It can be moved
     * slightly by impacts, but its face won't change unless it is re-rolled.
     * 
     * @param {Die} die 
     */
    constructor(die) {
        this.die = die;

        this.animations = {
            [1]: new Animation(/* To fill when I have my sprites */),
            [2]: new Animation(/* To fill when I have my sprites */),
            [3]: new Animation(/* To fill when I have my sprites */),
            [4]: new Animation(/* To fill when I have my sprites */),
            [5]: new Animation(/* To fill when I have my sprites */),
            [6]: new Animation(/* To fill when I have my sprites */)
        }
    }

    enter() {
        this.die.currentAnimation = this.animations[this.die.value];
        this.die.currentFrame = this.die.value;
        this.setBody();
    }

    setBody() {
        const oldBody = this.die.body;
        this.die.body = matter.Bodies.rectangle(
            oldBody.position.x,
            oldBody.position.y,
            Die.WIDTH,
            Die.HEIGHT,
            {
                angle: getRandomPositiveNumber(0, 6.283) // angles are in radians
                // More options? Density? Gotta play around with it.
                // High density would make it not move much when hit, might have a friction value too.
            }
        );
        Composite.remove(world, oldBody);
        Composite.add(world, this.die.body);

        this.die.renderOffset = { x: Die.WIDTH / 2, y: Die.HEIGHT / 2 };
    }
}