import Character from "../../entities/Character.js";
import Opponent from "../../entities/Opponent.js";
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

    }
}