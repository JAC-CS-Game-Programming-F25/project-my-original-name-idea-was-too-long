import Character from "../../entities/Character.js";
import Opponent from "../../entities/Opponent.js";
import GamePhase from "../../enums/GamePhase.js";
import { CANVAS_HEIGHT, context, stateStack } from "../../globals.js";
import ShowResultState from "../../states/ShowResultState.js";
import DiceGame from "../DiceGame.js";

export default class Triga extends DiceGame {
    static TRIGA_VALUES = [3, 4, 5, 6, 15, 16, 17, 18];

    /**
     * A game of Triga, a dice game where each player tries to roll
     * specified values with three dice while avoiding rolling
     * their opponent's mark.
     * 
     * @param {Character} player 
     * @param {Opponent} opponent 
     */
    constructor(player, opponent) {
        super(player, opponent);

        // The values belonging to each player. Whoever's mark is rerolled wins.
        this.playerMark = 0;
        this.opponentMark = 0;
    }

    reset() {
        super.reset();
        this.playerMark = 0;
        this.opponentMark = 0;
    }

    checkRoll() {
        // If a triga is rolled on the first round, the person who rolled it wins.
        if (this.isFirstRound() && (Triga.TRIGA_VALUES.includes(this.rolledValue) || this.isThreeOfAKind())) {
            this.didPlayerWin = this.isPlayerTurn;
            this.gamePhase = GamePhase.Result;
            stateStack.push(new ShowResultState(
                `Triga!\n${this.didPlayerWin ? "You Win" : `${this.opponent.name} Wins`}`,
                { holdDuration: DiceGame.RESULT_STATE_HOLD_DURATION }
            ));
            return;
        }

        // If someone's mark was re-rolled, they win.
        if (this.rolledValue === this.playerMark) {
            this.didPlayerWin = true;
            this.gamePhase = GamePhase.Result;
            stateStack.push(new ShowResultState(
                `You Win!\n${this.isPlayerTurn ? "You" : `${this.opponent.name}`} rolled ${this.isPlayerTurn ? "your own" : "your"} mark`,
                {
                    fontSize: DiceGame.RESULT_STATE_FONT_SIZE,
                    holdDuration: DiceGame.RESULT_STATE_HOLD_DURATION
                }
            ));
            return;
        }
        if (this.rolledValue === this.opponentMark) {
            this.didPlayerWin = false;
            this.gamePhase = GamePhase.Result;
            stateStack.push(new ShowResultState(
                `${this.opponent.name} Wins!\n${this.isPlayerTurn ? "You" : "They"} rolled ${this.isPlayerTurn ? "their" : "their own"} mark`,
                {
                    fontSize: DiceGame.RESULT_STATE_FONT_SIZE,
                    holdDuration: DiceGame.RESULT_STATE_HOLD_DURATION
                }
            ));
            return;
        }

        // If it's the first round and the roller doesn't have a mark yet, assign it to them.
        if (this.isFirstRound()) {
            this.isPlayerTurn ? this.playerMark = this.rolledValue : this.opponentMark = this.rolledValue;
        }

        // If no one has won yet, switch players and continue rolling.
        this.isPlayerTurn = !this.isPlayerTurn;
        this.gamePhase = GamePhase.ToRoll;
    }

    /**
     * @returns True if either player has not yet set their mark, false otherwise.
     */
    isFirstRound() {
        return this.playerMark === 0 || this.opponentMark === 0;
    }

    /**
     * @returns True if all three dice have the same value, false otherwise.
     */
    isThreeOfAKind() {
        return this.dice[0].value === this.dice[1].value && this.dice[0].value === this.dice[2].value;
    }

    render() {
        super.render();

        // Render the current marks.
        context.save();
        const textX = 40;
        const textY = CANVAS_HEIGHT - CANVAS_HEIGHT / 3;
        context.fillStyle = 'black';
        context.textAlign = 'left';
        context.font = '50px manufacturingConsent';
        context.fillText(`Your Mark:`, textX, textY);
        context.fillText(`${this.playerMark}`, textX, textY + 50);
        context.fillText(`Opponent's Mark:`, textX, textY + 120);
        context.fillText(`${this.opponentMark}`, textX, textY + 170);
        context.restore();
    }
}