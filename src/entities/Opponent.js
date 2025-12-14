import Character from "./Character.js";
import Sprite from "../../lib/Sprite.js";
import { getRandomPositiveInteger } from "../../lib/Random.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";

export default class Opponent extends Character {
    static OPPONENT_PORTRAITS_HEIGHT = 359;
    static OPPONENT_PORTRAITS_WIDTH = 307;

    /**
     * An opponent who the player can challenge to a game of dice. Each opponent has their own money
     * and a particular game which they want to play. An opponent will keep playing until they have
     * no more money.
     * @param {object} opponentDefinition a JSON object containing fields for initializing the opponent.
     * @param {string} game the name of the game the opponent wishes to play.
     * @param {number} startingMoney the amount of money the opponent will start with.
     */
    constructor(opponentDefinition, game, startingMoney) {
        super(startingMoney);

        this.game = game;
        // The lines the opponent may occasionally speak to the player.
        this.greetings = opponentDefinition.greetings;

        this.name = opponentDefinition.name;
        this.fullName = opponentDefinition.fullName ?? opponentDefinition.name;
        this.portrait = new Sprite(
            images.get(ImageName.OpponentPortraits),
            opponentDefinition.portraitDefinition.x,
            opponentDefinition.portraitDefinition.y,
            Opponent.OPPONENT_PORTRAITS_WIDTH,
            Opponent.OPPONENT_PORTRAITS_HEIGHT
        );

        // Whether the opponent is waiting for a timer to run out before they act.
        this.isWaiting = false;
    }

    /**
     * @returns {string} a random greeting from the opponent's set of possible greetings.
     */
    getRandomGreeting() {
        if (this.greetings.length === 0) return;

        return this.greetings[getRandomPositiveInteger(0, this.greetings.length)]
    }
}