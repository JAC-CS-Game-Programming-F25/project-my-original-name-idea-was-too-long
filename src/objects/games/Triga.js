import Character from "../../entities/Character.js";
import Opponent from "../../entities/Opponent.js";
import DiceGame from "../DiceGame.js";

export default class Triga extends DiceGame {
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

    }
}