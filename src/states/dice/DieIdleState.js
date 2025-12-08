import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import Die from "../../objects/Die.js";
import { images, matter, world } from "../../globals.js";
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
        super();

        this.die = die;

        this.animations = [
            new Animation([0], 1),
            new Animation([1], 1),
            new Animation([2], 1),
            new Animation([3], 1),
            new Animation([4], 1),
            new Animation([5], 1)
        ]
    }

    enter() {
        this.die.currentAnimation = this.animations[this.die.value - 1];
        this.die.currentFrame = this.die.value - 1;
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
                angle: getRandomPositiveNumber(0, 6.283), // angles are in radians
                frictionAir: 0.05
            }
        );
        Composite.remove(world, oldBody);
        Composite.add(world, this.die.body);

        this.die.renderOffset = { x: -Die.WIDTH / 2, y: -Die.HEIGHT / 2 };
    }
}