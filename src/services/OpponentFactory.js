import { getRandomPositiveInteger } from "../../lib/Random.js";
import Opponent from "../entities/Opponent.js";
import DiceGameName from "../enums/DiceGameName.js"

export default class OpponentFactory {
    constructor() {
        this.opponents = [];

        this.minStartingMoney = 100;
        this.maxStartingMoney = 500;

        // Get an array of the game names so that they can be indexed for later.
        this.possibleGames = Object.values(DiceGameName);
    }

    /**
     * Load the opponent definitions into the factory.
     * @param {object} opponentDefinitions 
     */
    load(opponentDefinitions) {
        // Create all the opponents, setting their values.
        opponentDefinitions.opponents.forEach((opponent, i) => {
            // Once we have at least one opponent who is playing each game, we can randomize the rest.
            const gameIndex = i >= this.possibleGames.length ? getRandomPositiveInteger(0, this.possibleGames.length - 1) : i

            this.opponents.push(
                new Opponent(
                    opponent,
                    this.possibleGames[gameIndex],
                    getRandomPositiveInteger(this.minStartingMoney, this.maxStartingMoney)
                )
            );
        });
    }

    /**
     * Load opponent data from a saved game.
     * @param {object} saveData The opponents data retrieved from local storage.
     */
    loadFromSaveData(saveData) {
        this.opponents = [];
        saveData.forEach((opponentData) => {
            this.opponents.push(
                new Opponent(
                    {
                        name: opponentData.name,
                        fullName: opponentData.fullName,
                        greetings: opponentData.greetings,
                        portraitDefinition: { x: opponentData.portrait.x, y: opponentData.portrait.y }
                    },
                    opponentData.game,
                    opponentData.money
                )
            );
        });
    }

    /**
     * @returns {Opponent[]} an array of all the opponents.
     */
    get() {
        return this.opponents;
    }

    /**
     * Resets the money of all opponents for a new game.
     */
    reset() {
        this.opponents.forEach((opponent) => {
            opponent.money = getRandomPositiveInteger(this.minStartingMoney, this.maxStartingMoney)
        });
    }
}