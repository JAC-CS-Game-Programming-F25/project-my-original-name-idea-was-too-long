import Easing from "../../lib/Easing.js";
import Input from "../../lib/Input.js";
import Sprite from "../../lib/Sprite.js";
import State from "../../lib/State.js";
import Timer from "../../lib/Timer.js";
import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";
import Direction from "../enums/Direction.js";
import ImageName from "../enums/ImageName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, images, input, opponentFactory, stateStack } from "../globals.js";
import UIArrow from "../user-interface/UIArrow.js";
import PlayState from "./PlayState.js";

export default class OpponentSelectionState extends State {
    static BACKGROUND_WIDTH = 321;
    static BACKGROUND_HEIGHT = 207;

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
        this.transitionDuration = 0.5;
        // The possible starting positions for the offset so that the opponent starts offscreen and swooshes in.
        this.rightTransitionOffsetStart = CANVAS_WIDTH / 2 + Opponent.OPPONENT_PORTRAITS_WIDTH;
        this.leftTransitionOffsetStart = -(CANVAS_WIDTH / 2) - Opponent.OPPONENT_PORTRAITS_WIDTH;

        // Define the arrow ui elements.
        const arrowPadding = 240;
        this.leftArrow = new UIArrow(
            arrowPadding,
            CANVAS_HEIGHT / 2 - UIArrow.SPRITE_MEASUREMENTS_LEFT.height / 2,
            Direction.Left
        );
        this.rightArrow = new UIArrow(
            CANVAS_WIDTH - arrowPadding - UIArrow.SPRITE_MEASUREMENTS_RIGHT.width,
            CANVAS_HEIGHT / 2 - UIArrow.SPRITE_MEASUREMENTS_RIGHT.height / 2,
            Direction.Right
        );
        // Define the background image.
        this.background = new Sprite(
            images.get(ImageName.Parchment),
            0, 0,
            OpponentSelectionState.BACKGROUND_WIDTH,
            OpponentSelectionState.BACKGROUND_HEIGHT
        );
        // The alpha value for when rendering the UI.
        this.alpha = { a: 1, fadeDuration: 1 };

        this.timer = new Timer();
    }

    update(dt) {
        if (!this.isTransitioning) {
            if (input.isKeyPressed(Input.KEYS.A) || input.isKeyPressed(Input.KEYS.ARROW_LEFT)) {
                this.switchOpponent(-1);
            } else if (input.isKeyPressed(Input.KEYS.D) || input.isKeyPressed(Input.KEYS.ARROW_RIGHT)) {
                this.switchOpponent(1);
            } else if (input.isKeyPressed(Input.KEYS.ENTER)) {
                this.fadeToPlayState();
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

        // Set the transition and tween the offset so the opponents cycle like a carrousel.
        this.isTransitioning = true;
        this.transitionOffset = direction > 0 ? this.rightTransitionOffsetStart : this.leftTransitionOffsetStart;
        this.timer.tween(
            this,
            { transitionOffset: 0 },
            this.transitionDuration,
            Easing.easeOutQuad,
            () => {
                this.isTransitioning = false;
            }
        )
    }

    /**
     * Fade the UI before pushing the PlayState onto the State Stack.
     * Once the PlayState is popped, the UI will fade back in.
     */
    fadeToPlayState() {
        // Fade out the UI before pushing the next state.
        this.timer.tween(
            this.alpha,
            { a: 0 },
            this.alpha.fadeDuration,
            Easing.linear,
            () => {
                stateStack.push(new PlayState(
                    this.player,
                    this.opponents[this.selectedOpponent]
                ));
                // Once the PlayState is popped from the stack, the Opponent Selection UI should fade back in.
                this.timer.tween(
                    this.alpha,
                    { a: 1 },
                    this.alpha.fadeDuration,
                    Easing.linear
                    // Might want another variable for locking the player from doing stuff until done.
                );
            }
        );
    }

    //#region Render methods

    render() {
        context.save();
        context.globalAlpha = this.alpha.a;
        this.renderBackground();
        this.renderOpponent();
        this.renderUI();
        context.restore();
    }

    renderBackground() {
        const scaleFactor = 5;
        this.background.render(
            CANVAS_WIDTH / 2 - OpponentSelectionState.BACKGROUND_WIDTH * scaleFactor / 2,
            CANVAS_HEIGHT / 2 - OpponentSelectionState.BACKGROUND_HEIGHT * scaleFactor / 2,
            { x: scaleFactor, y: scaleFactor }
        );
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
            const previousOpponent = this.transitionOffset > 0 ? this.opponents[this.selectedOpponent - 1] : this.opponents[this.selectedOpponent + 1];
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

        context.font = '60px manufacturingConsent';
        const letterOffset = { x: 47, y: 65 };
        this.leftArrow.render();
        context.textAlign = 'left';
        context.fillText(
            "A",
            this.leftArrow.position.x + letterOffset.x,
            this.leftArrow.position.y + letterOffset.y
        );
        this.rightArrow.render();
        context.textAlign = 'right';
        context.fillText(
            "D",
            this.rightArrow.position.x + this.rightArrow.dimensions.x - letterOffset.x,
            this.rightArrow.position.y + letterOffset.y
        );

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