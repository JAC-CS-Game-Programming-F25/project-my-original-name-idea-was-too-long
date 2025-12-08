import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";
import Die from "./Die.js";

export default class DiceGame {

    /**
     * An abstract dice game, to be used as the parent of all dice games.
     * 
     * @param {Character} player 
     * @param {Opponent} opponent 
     */
    constructor(player, opponent) {
        this.player = player;
        this.opponent = opponent;

        // The saved results of the player and opponent's dice rolls.
        this.playerMark = 0;
        this.opponentMark = 0;
        // The most recent roll result.
        this.rolledValue = 0;

        this.dice = [new Die(), new Die(), new Die()];
        this.isRolling = false;

        this.wagerAmount = 0;
        this.isPlayerTurn = true;
    }

    update(dt) {
        // Might be able to do some generic stuff here
    }

    checkVictory() {
        // Not sure I'll be able to do anything here, might be only implemented in children.
    }

    /**
     * Roll all the game dice and add up their values into rolledValue.
     */
    rollDice() {
        this.rolledValue = 0; // might replace this by a returned value?s
        this.dice.forEach((die) => {
            die.onRoll();
            this.rolledValue += die.value;
        });
        this.isRolling = true;

        // do something with the rolled value depending on the game.
    }

    /**
     * Roll two dice to determine who goes first. The value isPlayerTurn is updated
     * according to the result of the battle.
     */
    rollBattle() {
        // Roll for player.
        this.dice[0].onRoll();
        this.playerMark = this.dice[0].value;

        // Roll for opponent.
        this.dice[1].onRoll();
        this.opponentMark = this.dice[1].value;

        // If there's a tie, fudge it so that the player wins the battle ;)
        if (this.playerMark === this.opponentMark) {
            if (this.playerMark === Die.MAX_VALUE) {
                this.opponentMark--;
                this.dice[1].value--;
            } else {
                this.playerMark++;
                this.dice[0].value++;
            }
        }

        this.isRolling = true;
        this.isPlayerTurn = this.playerMark > this.opponentMark;
    }

    render() {
        // Might be able to do the bulk of the render in here, with dice and popping ui elements.
    }
}