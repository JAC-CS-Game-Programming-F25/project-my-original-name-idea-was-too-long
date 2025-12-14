import Character from "../../entities/Character.js";
import Opponent from "../../entities/Opponent.js";
import GamePhase from "../../enums/GamePhase.js";
import PanquistStakesByRoll from "./PanquistStakesByRoll.js";
import { CANVAS_HEIGHT, context, sounds, stateStack } from "../../globals.js";
import DiceGame from "../DiceGame.js";
import ShowResultState from "../../states/ShowResultState.js";
import SoundName from "../../enums/SoundName.js";

export default class Panquist extends DiceGame {
    static VALID_MARKS = [7, 8, 9, 10, 11, 12, 13, 14];

    static RESULT_STATE_FONT_SIZE = 40;
    static RESULT_STATE_HOLD_DURATION = 3;

    /**
     * A game of Panquist, a dice game where each player tries to roll
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

        // The percentage of the wager won, based on the dice combination which rolled the mark.
        this.percentageWon = 1;
    }

    reset() {
        super.reset();
        this.playerMark = 0;
        this.opponentMark = 0;
    }

    checkRoll() {
        // If it's the first round and the value rolled is not a valid mark, the roller gets to roll again.
        if (this.isFirstRound() && !Panquist.VALID_MARKS.includes(this.rolledValue)) {
            this.gamePhase = GamePhase.ToRoll;
            return;
        }

        // If someone's mark was re-rolled, they win.
        if (this.rolledValue === this.playerMark) {
            this.didPlayerWin = true;
            this.gamePhase = GamePhase.Result;
            this.setPercentageWon();
            stateStack.push(new ShowResultState(
                `You Won ${this.getVictoryType()}!\n${this.isPlayerTurn ? "You" : `${this.opponent.name}`} rolled ${this.isPlayerTurn ? "your own" : "your"} mark with\n${this.dice[0].value} + ${this.dice[1].value} + ${this.dice[2].value}`,
                {
                    fontSize: Panquist.RESULT_STATE_FONT_SIZE,
                    holdDuration: Panquist.RESULT_STATE_HOLD_DURATION
                }
            ));
            sounds.play(SoundName.GoldSack);
            return;
        }
        if (this.rolledValue === this.opponentMark) {
            this.didPlayerWin = false;
            this.gamePhase = GamePhase.Result;
            this.setPercentageWon();
            stateStack.push(new ShowResultState(
                `${this.opponent.name} Won ${this.getVictoryType()}!\n${this.isPlayerTurn ? "You" : "They"} rolled ${this.isPlayerTurn ? "their" : "their own"} mark with\n${this.dice[0].value} + ${this.dice[1].value} + ${this.dice[2].value}`,
                {
                    fontSize: Panquist.RESULT_STATE_FONT_SIZE,
                    holdDuration: Panquist.RESULT_STATE_HOLD_DURATION
                }
            ));
            sounds.play(SoundName.GoldSack);
            return;
        }

        // If the roller doesn't have a mark yet, assign it to them.
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
     * Determines the proportion of the wager won based on the specific combination of the dice faces which
     * were rolled to reach the winner's mark. Sets the percentageWon parameter to the resulting value.
     */
    setPercentageWon() {
        // Get the sorted values of the rolled dice (descending).
        const values = this.dice.map((die) => die.value).sort((a, b) => b - a);
        // Use the sorted values to get the percentage won according to the Panquist stakes by roll dictionary.
        this.percentageWon = PanquistStakesByRoll[this.rolledValue][`${values[0]},${values[1]},${values[2]}`];
    }

    /**
     * @returns The type of victory, based on the percentage of the wager won.
     */
    getVictoryType() {
        switch (this.percentageWon) {
            case 0.25: return "Quarter Panquist";
            case 0.5: return "Half Panquist";
            case 0.75: return "Three Quaters Panquist";
            case 1: return "Panquist";
        }
    }

    dealOutWinnings() {
        // Since Panquist deals with winnings slightly differently, we need to adjust the value
        // being dealt out by temporarily changing the wager amount before the exchange.
        const fullWager = this.wagerAmount;
        this.wagerAmount = Math.ceil(this.wagerAmount * this.percentageWon);

        super.dealOutWinnings();

        this.wagerAmount = fullWager;
    }

    loadData(gameData) {
        super.loadData(gameData);

        this.playerMark = gameData.playerMark;
        this.opponentMark = gameData.opponentMark;
    }

    render() {
        super.render();

        // Render the current marks.
        context.save();
        const textX = 40;
        const textY = CANVAS_HEIGHT - CANVAS_HEIGHT / 3;
        context.fillStyle = 'white';
        context.textAlign = 'left';
        context.font = '50px manufacturingConsent';
        context.fillText(`Your Mark:`, textX, textY);
        context.fillText(`${this.playerMark}`, textX, textY + 50);
        context.fillText(`Opponent's Mark:`, textX, textY + 120);
        context.fillText(`${this.opponentMark}`, textX, textY + 170);
        context.restore();
    }
}