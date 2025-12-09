import Input from "../../lib/Input.js";
import State from "../../lib/State.js";
import { input, stateStack } from "../globals.js";

export default class WagerState extends State {
    static lastWager = 1;
    /**
     * In this state, the player chooses how much money they wish to bet in the upcoming round.
     * This is the only time when the player is allowed to back out of a game and return to
     * the Opponent Selection State, in order to prevent cheating if they think they're about
     * to lose.
     * 
     * @param {(wager: number) => void} setWager
     */
    constructor(playerMoney, opponentMoney, setWager) {
        super();

        // Set the maximum possible wager so that no one can lose more money than they have.
        this.maxWager = Math.min(playerMoney, opponentMoney);
        this.minWager = 1;
        // Set the current wager to the value of the most recently made wager, or to the max wager if it's too high.
        this.currentWager = Math.min(WagerState.lastWager, this.maxWager);

        // The setter function for the wager amount in the PlayState's game. 
        this.setWager = setWager;

        this.isTransitioning = true;
    }

    enter() {
        // start transition.
    }

    update(dt) {
        if (input.isKeyPressed(Input.KEYS.W) || input.isKeyPressed(Input.KEYS.ARROW_UP)) {
            this.updateWager(1);
        } else if (input.isKeyPressed(Input.KEYS.S) || input.isKeyPressed(Input.KEYS.ARROW_DOWN)) {
            this.updateWager(-1);
        } else if (input.isKeyPressed(Input.KEYS.ENTER)) {
            this.acceptWager();
        } else if (input.isKeyPressed(Input.KEYS.H)) {
            // BRING UP HELP SCREEN
        } else if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
            // RETURN TO OPPONENT SELECTION
        }
    }

    /**
     * Update the current wager by the specified amount. If the change would bring the wager above or
     * below the minimum or maximum allowed wagers, no change will occur.
     * @param {number} amount 
     */
    updateWager(amount) {
        if (this.currentWager + amount > this.maxWager || this.currentWager + amount < this.minWager) {
            // Maybe do a little sound indicating that you can't go further.
            return;
        }

        this.currentWager += amount;
        // Make a little gold shuffling noise.
    }

    acceptWager() {
        this.setWager(this.currentWager);
        // Go back to PlayState.
        stateStack.pop();
    }

    render(dt) {

    }
}