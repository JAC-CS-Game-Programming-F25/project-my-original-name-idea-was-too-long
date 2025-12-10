import Input from "../../lib/Input.js";
import { getRandomPositiveNumber } from "../../lib/Random.js";
import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";
import Direction from "../enums/Direction.js";
import GamePhase from "../enums/GamePhase.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, input, matter, stateStack } from "../globals.js";
import WagerState from "../states/WagerState.js";
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
        this.playerMark = 0; // Will prob remove these and have them in individual games instead. Not all dice games "need" to have this.
        this.opponentMark = 0; // Plus makes more sense to compare and render these in the particular games since they have their own logic.
        // The most recent roll result.
        this.rolledValue = 0;

        this.dice = [new Die(), new Die(), new Die()];
        this.isRolling = false;

        this.wagerAmount = 0;
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
                // Bring up wager state to get player's wager, and then proceed to the battle phase.
                stateStack.push(new WagerState(this.player.money, this.opponent.money, (wager) => {
                    this.wagerAmount = wager;
                }));
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
                // Roll right away if it's opponent's turn, or when Enter is pressed if it's the player's turn.
                if (!this.isPlayerTurn ||
                    (this.isPlayerTurn && input.isKeyPressed(Input.KEYS.ENTER))
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
                    // Go back to Opponent selection, (check there if any opponents still have money, if not: Victory State)
                }
                break;
        }


        // Misc testing stuff to remove.
        // if (input.isKeyPressed(Input.KEYS.ENTER)) {
        //     this.rollDice();
        // } else if (input.isKeyPressed(Input.KEYS.BACKSLASH)) {
        //     this.rollBattle();
        // }
    }

    /**
     * Reset starting values at the end of a match.
     */
    reset() {
        // To be implemented by the particular games.
    }

    /**
     * Check the result of the roll and proceed according to the rules of the game.
     */
    checkRoll() {
        // To be implemented by the particular games.
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
        let playerRoll = this.dice[0].value;

        // Roll for opponent.
        this.dice[1].onRoll(Direction.Down, { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 - Board.HEIGHT / 4 });
        let opponentRoll = this.dice[1].value;

        // Move the third die offscreen so it doesn't get in the way.
        matter.Body.setPosition(this.dice[2].body, {
            x: CANVAS_WIDTH - Die.WIDTH * 2,
            y: 0
        });

        // If there's a tie, fudge it so that the player wins the battle ;)
        if (playerRoll === opponentRoll) {
            if (playerRoll === Die.MAX_VALUE) {
                opponentRoll--;
                this.dice[1].value--;
            } else {
                playerRoll++;
                this.dice[0].value++;
            }
        }

        this.isRolling = true;
        this.isPlayerTurn = playerRoll > opponentRoll;
    }

    /**
     * Exchange money based on the wager and who won, then determine if the loser is still able to play.
     * If so, go back to the wager phase, otherwise go to the post-game phase.
     */
    dealOutWinnings() {
        const winner = this.didPlayerWin ? this.player : this.opponent;
        const loser = this.didPlayerWin ? this.opponent : this.player;

        loser.loseMoney(this.wagerAmount);
        winner.winMoney(this.wagerAmount);

        if (loser.isBroke()) {
            this.gamePhase = GamePhase.PostGame;
        } else {
            this.gamePhase = GamePhase.Wager;
            this.reset();
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

        // Temp display phase
        context.fillText(`${this.gamePhase}`, CANVAS_WIDTH - 200, CANVAS_HEIGHT - 200)
    }
}