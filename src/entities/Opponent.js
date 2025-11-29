import Character from "./Character.js";
import Sprite from "../../lib/Sprite.js";
import { getRandomPositiveInteger } from "../../lib/Random.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";

export default class Opponent extends Character {
    static OPPONENT_PORTRAITS_HEIGHT = 100;
    static OPPONENT_PORTRAITS_WIDTH = 100;

    /**
     * An opponent who the player can challenge to a game of dice. Each opponent has their own money
     * and a particular game which they want to play. An opponent will keep playing until they have
     * no more money.
     * @param {object} opponentDefinition a JSON object containing fields for initializing the opponent.
     */
    constructor(opponentDefinition) {
        const startingMoney = opponentDefinition.startingMoney ?? Character.PLAYER_STARTING_MONEY;
        super(startingMoney);

        // The name of the game the opponent wishes to play.
        this.game = opponentDefinition.game;
        // The lines the opponent may occasionally speak to the player.
        this.greetings = opponentDefinition.greetings;

        this.name = opponentDefinition.name;
        this.portrait = new Sprite(
            images.get(ImageName.OpponentPortraits), // Note, this doesn't exist yet!!!!
            opponentDefinition.portraitDefinition.x,
            opponentDefinition.portraitDefinition.y,
            Opponent.OPPONENT_PORTRAITS_WIDTH,
            Opponent.OPPONENT_PORTRAITS_HEIGHT
        );
    }

    /**
     * @returns {string} a random greeting from the opponent's set of possible greetings.
     */
    getRandomGreeting() {
        if (this.greetings.length === 0) return;

        return this.greetings[getRandomPositiveInteger(0, this.greetings.length)]
    }
}