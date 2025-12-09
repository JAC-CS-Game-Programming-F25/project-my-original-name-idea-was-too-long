import Input from "../../lib/Input.js";
import { getRandomPositiveNumber } from "../../lib/Random.js";
import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";
import Direction from "../enums/Direction.js";
import GamePhase from "../enums/GamePhase.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, input, stateStack } from "../globals.js";
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

        // The wager object to be passed to the Wager State, so that the value set persists across states.
        this.wagerObject = { wager: 0 }; // if passing a setter works in JS, I might do that instead.
        this.isPlayerTurn = true;
        this.didPlayerWin = true;

        // The specific phase of the current game.
        this.gamePhase = GamePhase.Wager;
    }

    update(dt) {
        if (this.isRolling) {
            // Update the dice and determine whether they have finished rolling.
            this.isRolling = false;
            this.dice.forEach((die) => {
                die.update(dt);
                if (die.isRolling()) this.isRolling = true;
            });
            if (this.isRolling) return;
        }

        // Determine what can be done based on which phase of the game you are in.
        switch (this.gamePhase) {
            case GamePhase.Wager:
                // Bring up wager state, pass it the wager object.
                this.gamePhase = GamePhase.Battle
                break;
            case GamePhase.Battle:
                this.rollBattle()
                this.gamePhase = GamePhase.BattleRolling;
                break;
            case GamePhase.BattleRolling:
                // Pop up the UI element showing who won the battle.

                this.gamePhase = GamePhase.ToRoll;
                break;
            case GamePhase.ToRoll:
                // Roll right away if it's opponent's turn, or when Space is pressed if it's the player's turn.
                if (!this.isPlayerTurn ||
                    (this.isPlayerTurn && input.isKeyPressed(Input.KEYS.SPACE))
                ) {
                    this.rollDice();
                    this.gamePhase = GamePhase.Rolling;
                }
                break;
            case GamePhase.Rolling:
                // What to do with the roll will depend on the specific game being played.
                this.checkRoll();
                break;
            case GamePhase.Result:
                // Pop up result UI element based on who won.
                this.dealOutWinnings();
                break;
            case GamePhase.PostGame:
                if (this.player.isBroke()) {
                    // If the player has run out of money, they lose!
                    stateStack.push(GameStateName.GameOver);
                } else {

                }
                break;
        }



        // Misc testing stuff to remove.
        if (input.isKeyPressed(Input.KEYS.ENTER)) {
            this.rollDice();
        } else if (input.isKeyPressed(Input.KEYS.BACKSLASH)) {
            this.rollBattle();
        }
    }

    checkRoll() {
        // Not sure I'll be able to do anything here, might be only implemented in children.
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

    /**
     * Exchange money based on the wager and who won, then determine if the loser is still able to play.
     * If so, go back to the wager phase, otherwise go to the post-game phase.
     */
    dealOutWinnings() {
        const wager = this.wagerObject.wager;
        const winner = this.didPlayerWin ? this.player : this.opponent;
        const loser = this.didPlayerWin ? this.opponent : this.player;

        loser.loseMoney(wager);
        winner.winMoney(wager);

        if (loser.isBroke()) {
            this.gamePhase = GamePhase.PostGame;
        } else {
            this.gamePhase = GamePhase.Wager;
        }
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