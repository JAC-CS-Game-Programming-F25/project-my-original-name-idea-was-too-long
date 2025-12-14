export default class StateStack {
	constructor() {
		this.states = [];
	}

	update(dt) {
		this.top().update(dt);
	}

	render(context) {
		this.states.forEach((state) => state.render(context));
	}

	push(state) {
		this.states.push(state);
		this.top().enter();
	}

	pop() {
		this.top().exit();
		const poppedState = this.states.splice(this.states.length - 1, 1)[0];
		this.top()?.reEnter();
		return poppedState;
	}

	top() {
		if (this.states.length > 0) return this.states[this.states.length - 1];
		return null;
	}

	clear() {
		this.states = [];
	}
}
