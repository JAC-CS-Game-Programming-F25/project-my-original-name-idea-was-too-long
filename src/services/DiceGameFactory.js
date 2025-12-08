import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";
import DiceGameName from "../enums/DiceGameName.js";    
import Riffa from "../objects/games/Riffa.js";
import Triga from "../objects/games/Triga.js";
import Panquist from "../objects/games/Panquist.js";

export default class DiceGameFactory {
    /**
     * Creates a Dice Game.
     * The precise kind of dice game is determined by the opponent's game value.
     * 
     * @param {Character} player 
     * @param {Opponent} opponent 
     */
    static create(player, opponent) {
        switch (opponent.game) {
            case DiceGameName.Riffa:
                return new Riffa(player, opponent);
            case DiceGameName.Triga:
                return new Triga(player, opponent);
            case DiceGameName.Panquist:
                return new Panquist(player, opponent);
        }
    }
}