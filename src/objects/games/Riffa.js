import Character from "../../entities/Character.js";
import Opponent from "../../entities/Opponent.js";
import GamePhase from "../../enums/GamePhase.js";
import SoundName from "../../enums/SoundName.js";
import { CANVAS_HEIGHT, context, sounds, stateStack } from "../../globals.js";
import ShowResultState from "../../states/ShowResultState.js";
import DiceGame from "../DiceGame.js";

export default class Riffa extends DiceGame {
    /**
     * A game of Riffa, where each player rolls three dice until they
     * get a specific pattern, then the player with the highest value
     * wins.
     * 
     * @param {Character} player 
     * @param {Opponent} opponent 
     */
    constructor(player, opponent) {
        super(player, opponent);

        // The total points rolled by each player. Whoever has the highest total wins.
        this.playerTotal = 0;
        this.opponentTotal = 0;

        this.finalRoll = false;
    }

    reset() {
        super.reset();
        this.playerTotal = 0;
        this.opponentTotal = 0;
    }

    checkRoll() {
        // On the roller's final roll for the match, set their score.
        if (this.finalRoll) {
            this.isPlayerTurn ? this.playerTotal = this.rolledValue : this.opponentTotal = this.rolledValue;
            this.finalRoll = false;
            this.enableDiceTotalDisplay = true;
            this.releaseDiceHolds();

            // Once both players have a score, check the winner.
            if (this.playerTotal !== 0 && this.opponentTotal !== 0) {
                if (this.playerTotal === this.opponentTotal) {
                    // On a tie, reset the scores and play again!
                    stateStack.push(new ShowResultState(`Tie!\n${this.playerTotal} to ${this.opponentTotal}`));
                    this.reset();
                } else {
                    this.didPlayerWin = this.playerTotal > this.opponentTotal;
                    this.gamePhase = GamePhase.Result;
                    if (this.didPlayerWin) {
                        stateStack.push(new ShowResultState(`You Win!\n${this.playerTotal} to ${this.opponentTotal}`));
                        sounds.play(SoundName.GoldSack);
                        return;
                    } else {
                        stateStack.push(new ShowResultState(`${this.opponent.name} Wins!\n${this.opponentTotal} to ${this.playerTotal}`));
                        sounds.play(SoundName.GoldSack);
                        return;
                    }
                }
            }
            // If there's no winner yet, swap players.
            this.isPlayerTurn = !this.isPlayerTurn;
        }
        // If it's not the roller's final roll for the match, check if they've rolled doubles.
        else {
            this.checkDoubles();
            this.enableDiceTotalDisplay = false;
        }

        this.gamePhase = GamePhase.ToRoll;
    }

    /**
     * Checks for any pairs amongst the rolled dice. If any are found, those two dice
     * are held and finalRoll is set to true.
     */
    checkDoubles() {
        // For each die except the last one, go over all remaining dice and check if any match it.
        for (let i = 0; i < this.dice.length - 1; i++) {
            for (let j = i + 1; j < this.dice.length; j++) {
                if (this.dice[i].value === this.dice[j].value) {
                    this.dice[i].isHeld = true;
                    this.dice[j].isHeld = true;
                    this.finalRoll = true;
                    return;
                }
            }
        }
    }

    /**
     * Sets all dice to be rolled.
     */
    releaseDiceHolds() {
        this.dice.forEach((die) => { die.isHeld = false });
    }

    loadData(gameData) {
        super.loadData(gameData);

        this.playerTotal = gameData.playerTotal;
        this.opponentTotal = gameData.playerTotal;
        this.finalRoll = gameData.finalRoll;
    }

    render() {
        super.render();

        // Render the current scores.
        context.save();
        const textX = 40;
        const textY = CANVAS_HEIGHT - CANVAS_HEIGHT / 3;
        context.fillStyle = 'white';
        context.textAlign = 'left';
        context.font = '50px manufacturingConsent';
        context.fillText(`Your Score:`, textX, textY);
        context.fillText(`${this.playerTotal}`, textX, textY + 50);
        context.fillText(`Opponent's Score:`, textX, textY + 120);
        context.fillText(`${this.opponentTotal}`, textX, textY + 170);
        context.restore();
    }
}