import State from "../../lib/State.js";
import { stateStack } from "../globals.js";
import OpponentSelectionState from "./OpponentSelectionState.js";

export default class TitleScreenState extends State {
	constructor() {
		super();
	}

	enter() {
		stateStack.push(new OpponentSelectionState()) // for now go straight to the Opponent selection.
	}

	// ToDo, make the actual everything here.
}
