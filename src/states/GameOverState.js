import State from "../../lib/State.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context } from "../globals.js";

export default class GameOverState extends State {
	constructor() {
		super();
	}

	render() {
		context.save();
		context.fillStyle = 'red';
		context.font = '150px manufacturingConsent';
		context.textAlign = 'center';
		context.fillText("Womp Womp!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		context.restore();
	}
}
