import State from "../../lib/State.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context } from "../globals.js";

export default class VictoryState extends State {
	constructor() {
		super();
	}

	render() {
		context.save();
		context.fillStyle = 'red';
		context.font = '150px manufacturingConsent';
		context.textAlign = 'center';
		context.fillText("Congratulations, you've won!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		context.restore();
	}
}
