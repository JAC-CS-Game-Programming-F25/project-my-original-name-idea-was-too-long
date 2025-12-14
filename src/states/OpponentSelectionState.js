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
import UISprite from "../user-interface/UISprite.js";
import HelpState from "./HelpState.js";
import PlayState from "./PlayState.js";
import VictoryState from "./VictoryState.js";

export default class OpponentSelectionState extends State {
    static BACKGROUND_WIDTH = 321;
    static BACKGROUND_HEIGHT = 207;

    static COIN_SPRITE_VALUES = { x: 49, y: 32, width: 15, height: 16, scale: { x: 3, y: 3 } };

    /**
     * In this state, the player can cycle through possible opponents 
     * and select which one they want to challenge.
     * Each opponent has a game they wish to play and a certain amount of money.
     * Once the opponent is out of money, they can no longer play. When all of
     * the opponents are broke, the player wins.
     */
    constructor() {
        super();

        this.player = new Character();
        opponentFactory.reset();
        this.opponents = opponentFactory.get();

        // Set the index of the opponent who will appear on the screen.
        this.selectedOpponent = 0;

        // Whether the opponent selection carrousel is transitioning between opponents.
        this.isTransitioning = false;
        // Whether the UI is fading in or out due to a transition between States.
        this.isFading = true;

        // The rendering offset for when transitioning between opponents.
        this.transitionOffset = 0;
        this.transitionDuration = 0.5;
        // The possible starting positions for the offset so that the opponent starts offscreen and swooshes in.
        this.rightTransitionOffsetStart = CANVAS_WIDTH / 2 + Opponent.OPPONENT_PORTRAITS_WIDTH;
        this.leftTransitionOffsetStart = -(CANVAS_WIDTH / 2) - Opponent.OPPONENT_PORTRAITS_WIDTH;

        // Define the ui elements.
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
        this.coinPouchSprite = new UISprite(
            new Sprite(
                images.get(ImageName.Money),
                OpponentSelectionState.COIN_SPRITE_VALUES.x,
                OpponentSelectionState.COIN_SPRITE_VALUES.y,
                OpponentSelectionState.COIN_SPRITE_VALUES.width,
                OpponentSelectionState.COIN_SPRITE_VALUES.height
            ),
            0, 0,
            OpponentSelectionState.COIN_SPRITE_VALUES.scale
        );
        // Define the background image.
        const backgroundScaleFactor = 5;
        this.background = new UISprite(
            new Sprite(
                images.get(ImageName.Parchment),
                0, 0,
                OpponentSelectionState.BACKGROUND_WIDTH,
                OpponentSelectionState.BACKGROUND_HEIGHT
            ),
            CANVAS_WIDTH / 2 - OpponentSelectionState.BACKGROUND_WIDTH * backgroundScaleFactor / 2,
            CANVAS_HEIGHT / 2 - OpponentSelectionState.BACKGROUND_HEIGHT * backgroundScaleFactor / 2,
            { x: backgroundScaleFactor, y: backgroundScaleFactor }
        )
        // The alpha value for when rendering the UI.
        this.alpha = { a: 0, fadeDuration: 1 };

        this.timer = new Timer();
    }

    /**
     * @param {boolean} isNewGame If true, start a new game from scratch. If false, load data from local storage.
     */
    enter(isNewGame) {
        if (!isNewGame) {
            this.loadData();
        } else {
            this.saveData();
            localStorage.removeItem("game");
        }

        // Fade in the UI.
        this.timer.tween(
            this.alpha,
            { a: 1 },
            this.alpha.fadeDuration,
            Easing.linear,
            () => { this.isFading = false; }
        );
    }

    reEnter() {
        this.checkVictory();
        this.saveData();

        // Bring back the UI on re-entry.
        this.timer.tween(
            this.alpha,
            { a: 1 },
            this.alpha.fadeDuration,
            Easing.linear,
            () => { this.isFading = false; }
        );
    }

    update(dt) {
        if (!this.isTransitioning && !this.isFading) {
            if (input.isKeyPressed(Input.KEYS.A) || input.isKeyPressed(Input.KEYS.ARROW_LEFT)) {
                this.switchOpponent(-1);
            } else if (input.isKeyPressed(Input.KEYS.D) || input.isKeyPressed(Input.KEYS.ARROW_RIGHT)) {
                this.switchOpponent(1);
            } else if (input.isKeyPressed(Input.KEYS.ENTER)) {
                this.fadeToPlayState();
            } else if (input.isKeyPressed(Input.KEYS.H)) {
                // Bring up the instructions for the selected opponent's game.
                stateStack.push(new HelpState(this.opponents[this.selectedOpponent].game));
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
        if (this.opponents[this.selectedOpponent].isBroke()) {
            // play a little "error" sound.
            return;
        }

        // Fade out the UI before pushing the next state.
        this.isFading = true;
        this.timer.tween(
            this.alpha,
            { a: 0 },
            this.alpha.fadeDuration,
            Easing.linear,
            () => {
                this.saveData();
                stateStack.push(new PlayState(
                    this.player,
                    this.opponents[this.selectedOpponent]
                ));
            }
        );
    }

    checkVictory() {
        for (const opponent of this.opponents) {
            if (!opponent.isBroke()) return;
        }
        // If all of the opponents are broke, the player wins.
        stateStack.push(new VictoryState());
    }

    saveData() {
        localStorage.setItem("opponents", JSON.stringify(this.opponents));
        localStorage.setItem("selectedOpponent", JSON.stringify(this.selectedOpponent));
        localStorage.setItem("player", JSON.stringify(this.player));
    }

    loadData() {
        // Load the Player.
        const player = JSON.parse(localStorage.getItem("player"));
        if (player) {
            this.player = new Character(player.money);
        }

        // Load the Opponents.
        const opponents = JSON.parse(localStorage.getItem("opponents"));
        if (opponents) {
            opponentFactory.loadFromSaveData(opponents);
            this.opponents = opponentFactory.get();
        }
        const selectedOpponent = JSON.parse(localStorage.getItem("selectedOpponent"));
        if (selectedOpponent) {
            this.selectedOpponent = selectedOpponent;
        }

        // If a game was in progress, load additional data and enter the Play State.
        const game = JSON.parse(localStorage.getItem("game") ?? "null");
        if (game) {
            this.player.money = game.player.money;
            this.opponents[this.selectedOpponent].money = game.opponent.money;

            const playState = new PlayState(this.player, this.opponents[this.selectedOpponent]);
            playState.game.loadData(game);
            stateStack.push(playState);
        }
    }

    //#region Render methods

    render() {
        context.save();
        context.globalAlpha = this.alpha.a;
        this.background.render();
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
        context.fillStyle = 'black';
        context.fillText(currentOpponent.fullName, CANVAS_WIDTH / 2 + this.transitionOffset, CANVAS_HEIGHT / 2 + 60);
        context.font = '40px manufacturingConsent';
        if (!currentOpponent.isBroke()) {
            context.fillText(`Game: ${currentOpponent.game}`, CANVAS_WIDTH / 2 + this.transitionOffset, CANVAS_HEIGHT / 2 + 110);
            context.fillText(`Money: ${currentOpponent.money}`, CANVAS_WIDTH / 2 + this.transitionOffset, CANVAS_HEIGHT / 2 + 160);
        } else {
            context.fillText("Broke!", CANVAS_WIDTH / 2 + this.transitionOffset, CANVAS_HEIGHT / 2 + 110);
        }

        // If there is a transition happening between selected opponents, the "current" opponent will be the one
        // coming in from off screen and the previous opponent needs to tween off in the opposite direction.
        if (this.isTransitioning) {
            // We can determine the relative positioning of the previous opponent by whether the offset is positive (previous opponent is thus on the
            // left) or negative (previous opponent is on the right).
            const previousOpponent = this.transitionOffset > 0 ? this.opponents[this.selectedOpponent - 1] : this.opponents[this.selectedOpponent + 1];
            // Get the additional offset for the previous opponent to be rendered relative to the current opponent.
            const distanceFromCurrentOpponent = this.transitionOffset > 0 ? this.rightTransitionOffsetStart : this.leftTransitionOffsetStart;

            previousOpponent?.portrait.render(
                CANVAS_WIDTH / 2 - Opponent.OPPONENT_PORTRAITS_WIDTH / 2 + this.transitionOffset - distanceFromCurrentOpponent,
                CANVAS_HEIGHT / 2 - Opponent.OPPONENT_PORTRAITS_HEIGHT
            );
            context.font = '60px manufacturingConsent';
            context.fillText(
                previousOpponent?.fullName,
                CANVAS_WIDTH / 2 + this.transitionOffset - distanceFromCurrentOpponent,
                CANVAS_HEIGHT / 2 + 60
            );
            context.font = '40px manufacturingConsent';
            if (!previousOpponent?.isBroke()) {
                context.fillText(
                    `Game: ${previousOpponent?.game}`,
                    CANVAS_WIDTH / 2 + this.transitionOffset - distanceFromCurrentOpponent,
                    CANVAS_HEIGHT / 2 + 110);
                context.fillText(
                    `Money: ${previousOpponent?.money}`,
                    CANVAS_WIDTH / 2 + this.transitionOffset - distanceFromCurrentOpponent,
                    CANVAS_HEIGHT / 2 + 160
                );
            } else {
                context.fillText(
                    "Broke!",
                    CANVAS_WIDTH / 2 + this.transitionOffset - distanceFromCurrentOpponent,
                    CANVAS_HEIGHT / 2 + 110
                );
            }
        }
    }

    renderUI() {
        context.fillStyle = 'white';
        context.font = '45px manufacturingConsent';
        context.textAlign = 'left';
        context.fillText(`Your Money:`, 30, 60);
        context.textAlign = 'right';
        context.fillText(`${this.player.money}`, 195, 110);
        this.coinPouchSprite.render(50, 70);

        context.fillStyle = 'black';
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
            context.fillText("Press ENTER to Challenge", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 215);

            context.font = '45px roboto';
            context.fillText(
                `Press 'H' to See the Rules of ${this.opponents[this.selectedOpponent].game}`,
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT - 140
            );
        }
    }

    //#endregion
}