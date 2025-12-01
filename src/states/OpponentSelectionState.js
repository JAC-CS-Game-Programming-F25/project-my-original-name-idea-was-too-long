import Input from "../../lib/Input.js";
import State from "../../lib/State.js";
import Timer from "../../lib/Timer.js";
import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, input, opponentFactory } from "../globals.js";

export default class OpponentSelectionState extends State {
    /**
     * In this state, the player can cycle through possible opponents 
     * and select which one they want to challenge.
     */
    constructor() {
        super();

        this.player = new Character();
        this.opponents = opponentFactory.get();

        // Set the index of the opponent who will appear on the screen.
        this.selectedOpponent = 0;

        // Whether the opponent selection carrousel is transitioning between opponents.
        this.isTransitioning = false;
        // The rendering offset for when transitioning between opponents.
        this.transitionOffset = 0;
        // The possible starting positions for the offset so that the opponent starts offscreen and swooshes in.
        this.leftTransitionOffsetStart = CANVAS_WIDTH + Opponent.OPPONENT_PORTRAITS_WIDTH;
        this.rightTransitionOffsetStart = -(Opponent.OPPONENT_PORTRAITS_WIDTH * 2);

        this.timer = new Timer();
    }

    update(dt) {
        if (!this.isTransitioning) {
            if (input.isKeyPressed(Input.KEYS.A) || input.isKeyPressed(Input.KEYS.ARROW_LEFT)) {
                this.switchOpponent(-1);
            } else if (input.isKeyPressed(Input.KEYS.D) || input.isKeyPressed(Input.KEYS.ARROW_RIGHT)) {
                this.switchOpponent(1);
            } else if (input.isKeyPressed(Input.KEYS.ENTER)) {
                // GO TO PLAY STATE AND START MATCH
            } else if (input.isKeyPressed(Input.KEYS.H)) {
                // BRING UP HELP SCREEN
            }
        }

        this.timer.update(dt);
    }

    /**
     * Switch between opponents in the opponents array and tween the screen accordingly.
     * @param {number} direction a negative number switches left, positive switches right. Zero has no effect.
     */
    switchOpponent(direction) {
        if (direction < 0 && this.selectedOpponent > 0) {
            this.selectedOpponent--;
        } else if (direction > 0 && this.selectedOpponent < this.opponents.length - 1) {
            this.selectedOpponent++;
        } else {
            return;
        }

        // ###################### DO THE TWEEN BASED ON THE DIRECTION ##########################
        // Don't forget to set this.isTransitioning to true and then back to false in the callback.
    }


    //#region Render methods

    render() {
        // A WHOLE LOT OF SH-- TO DO HERE
        context.save();
        this.renderOpponent();
        this.renderUI();
        context.restore();
    }

    renderOpponent() {
        const currentOpponent = this.opponents[this.selectedOpponent];

        currentOpponent.portrait.render(
            CANVAS_WIDTH / 2 - Opponent.OPPONENT_PORTRAITS_WIDTH / 2 + this.transitionOffset,
            CANVAS_HEIGHT / 2 - Opponent.OPPONENT_PORTRAITS_HEIGHT
        );
        context.textAlign = 'center';
        context.font = '60px manufacturingConsent';
        context.fillText(currentOpponent.name, CANVAS_WIDTH / 2 + this.transitionOffset, CANVAS_HEIGHT / 2 + 60);
        context.font = '40px manufacturingConsent';
        context.fillText(`Game: ${currentOpponent.game}`, CANVAS_WIDTH / 2 + this.transitionOffset, CANVAS_HEIGHT / 2 + 110);
        context.fillText(`Money: ${currentOpponent.money}`, CANVAS_WIDTH / 2 + this.transitionOffset, CANVAS_HEIGHT / 2 + 160);

        // If there is a transition happening between selected opponents, the "current" opponent will be the one
        // coming in from off screen and the previous opponent needs to tween off in the opposite direction.
        if (this.isTransitioning) {
            // We can determine the relative positioning of the previous opponent by whether the offset is positive (previous opponent is thus on the
            // left) or negative (previous opponent is on the right).
            const previousOpponent = this.transitionOffset > 0 ? this.opponents[this.selectedOpponent - 1] : this.opponents[this.selectedOpponent - 1];
            // Get the additional offset for the previous opponent to be rendered relative to the current opponent.
            const distanceFromCurrentOpponent = this.transitionOffset > 0 ? this.rightTransitionOffsetStart : this.leftTransitionOffsetStart;

            previousOpponent.portrait.render(
                CANVAS_WIDTH / 2 - Opponent.OPPONENT_PORTRAITS_WIDTH / 2 + this.transitionOffset - distanceFromCurrentOpponent,
                CANVAS_HEIGHT / 2 - Opponent.OPPONENT_PORTRAITS_HEIGHT
            );
            context.font = '60px manufacturingConsent';
            context.fillText(
                currentOpponent.name,
                CANVAS_WIDTH / 2 + this.transitionOffset - distanceFromCurrentOpponent,
                CANVAS_HEIGHT / 2 + 60
            );
            context.font = '40px manufacturingConsent';
            context.fillText(
                `Game: ${currentOpponent.game}`,
                CANVAS_WIDTH / 2 + this.transitionOffset - distanceFromCurrentOpponent,
                CANVAS_HEIGHT / 2 + 110);
            context.fillText(
                `Money: ${currentOpponent.money}`,
                CANVAS_WIDTH / 2 + this.transitionOffset - distanceFromCurrentOpponent,
                CANVAS_HEIGHT / 2 + 160
            );
        }
    }

    renderUI() {
        context.font = '30px roboto';
        context.textAlign = 'left';
        context.fillText(`Your Money:`, 30, 60);
        context.textAlign = 'right';
        context.fillText(`${this.player.money}`, 195, 100);

        if (!this.isTransitioning) {
            context.font = '60px roboto';
            context.textAlign = 'center';
            context.fillText("Press ENTER to Challenge", CANVAS_WIDTH / 2, 110);

            context.font = '45px roboto';
            context.fillText(
                `Press 'H' to See the Rules of ${this.opponents[this.selectedOpponent].game}`,
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT - 100
            );
        }
    }

    //#endregion
}