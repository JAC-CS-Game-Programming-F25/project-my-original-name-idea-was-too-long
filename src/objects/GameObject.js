import { matter, world } from "../globals.js";

export default class GameObject {
    /**
     * A basic object which exists in the physical world.
     * Game objects have a matter.js body with physics and collision.
     * 
     * @param {object} body The object's matter.js body.
     */
    constructor(body) {
        this.body = body;

        matter.Composite.add(world, this.body);
    }

    update(dt) { }

    render() { }
}