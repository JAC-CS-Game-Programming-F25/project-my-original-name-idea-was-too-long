import State from "../../lib/State.js";
import ImageName from "../enums/ImageName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, images, stateStack } from "../globals.js";
import OpponentSelectionState from "./OpponentSelectionState.js";

export default class TitleScreenState extends State {
	constructor() {
		super();

		this.backdrop = images.get(ImageName.Backdrop);
	}

	enter() {
		stateStack.push(new OpponentSelectionState()) // for now go straight to the Opponent selection.
	}

	// ToDo, make the actual everything here.

	render() {
		context.save();
		context.imageSmoothingEnabled = false;
		this.backdrop.render(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		context.restore();
	}
}
