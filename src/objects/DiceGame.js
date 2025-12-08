import Input from "../../lib/Input.js";
import { getRandomNumber, getRandomPositiveNumber } from "../../lib/Random.js";
import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";
import Direction from "../enums/Direction.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, input, matter } from "../globals.js";
import Board from "./Board.js";
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
        // Update the dice and determine whether they have finished rolling.
        this.isRolling = false;
        this.dice.forEach((die) => {
            die.update(dt);
            if (die.isRolling()) this.isRolling = true;
        });

        // Might be able to do some generic stuff here
        //if (this.isPlayerTurn) {
        if (input.isKeyPressed(Input.KEYS.ENTER)) {
            this.rollDice();
        } else if (input.isKeyPressed(Input.KEYS.BACKSLASH)) {
            this.rollBattle();
        } else if (input.isKeyPressed(Input.KEYS.H)) {
            // BRING UP HELP SCREEN
        }
        //}
    }

    checkVictory() {
        // Not sure I'll be able to do anything here, might be only implemented in children.
    }

    /**
     * Roll all the game dice and add up their values into rolledValue.
     */
    rollDice() {
        // Roll from the right as the player, from the left as the opponent.
        const positionX = this.isPlayerTurn ? CANVAS_WIDTH / 2 + Board.WIDTH / 4 : CANVAS_WIDTH / 2 - Board.WIDTH / 4;
        const direction = this.isPlayerTurn ? Direction.Left : Direction.Right;

        this.rolledValue = 0; // might replace this by a returned value?s
        this.dice.forEach((die) => {
            const positionY = getRandomPositiveNumber(
                CANVAS_HEIGHT / 2 - Board.HEIGHT / 8,
                CANVAS_HEIGHT / 2 + Board.HEIGHT / 8
            );
            die.onRoll(direction, { x: positionX, y: positionY });
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
        this.dice[0].onRoll(Direction.Up, { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 + Board.HEIGHT / 4 });
        this.playerMark = this.dice[0].value;

        // Roll for opponent.
        this.dice[1].onRoll(Direction.Down, { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 - Board.HEIGHT / 4 });
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
        this.dice.forEach((die) => {
            die.render();
        });

        if (!this.isRolling) {
            // Display the latest roll total.
            const displayDiceScale = 2;
            const displayDiceY = 100
            this.dice[0].sprites[this.dice[0].value - 1].render(
                CANVAS_WIDTH / 2 - Die.SPRITE_WIDTH * displayDiceScale * 2,
                displayDiceY,
                { x: displayDiceScale, y: displayDiceScale }
            );
            this.dice[1].sprites[this.dice[1].value - 1].render(
                CANVAS_WIDTH / 2 - Die.SPRITE_WIDTH * displayDiceScale / 2,
                displayDiceY,
                { x: displayDiceScale, y: displayDiceScale }
            );
            this.dice[2].sprites[this.dice[2].value - 1].render(
                CANVAS_WIDTH / 2 + Die.SPRITE_WIDTH * displayDiceScale,
                displayDiceY,
                { x: displayDiceScale, y: displayDiceScale }
            );
            context.save();
            context.font = '60px manufacturingConsent';
            context.fillStyle = 'white';
            context.fillText(
                `= ${this.rolledValue}`,
                CANVAS_WIDTH / 2 + Die.SPRITE_WIDTH * displayDiceScale * 2 + 20,
                displayDiceY + 50
            );
            context.restore();
        }
    }
}