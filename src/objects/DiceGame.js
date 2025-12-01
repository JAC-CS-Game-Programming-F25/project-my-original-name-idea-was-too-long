import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";

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

        this.dice = [
            // Set up three dice
        ]

        this.wagerAmount = 0;
        this.isPlayerTurn = true;
    }

    update(dt) {
        // Might be able to do some generic stuff here
    }

    checkVictory() {
        // Not sure I'll be able to do anything here, might be only implemented in children.
    }

    rollDice() {
        // To Do
    }

    rollBattle() {
        // To Do
    }

    render() {
        // Might be able to do the bulk of the render in here, with dice and popping ui elements.
    }
}