import Input from "../../lib/Input.js";
import { getRandomPositiveNumber } from "../../lib/Random.js";
import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";
import DieStateName from "../enums/DieStateName.js";
import Direction from "../enums/Direction.js";
import GamePhase from "../enums/GamePhase.js";
import SoundName from "../enums/SoundName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, context, input, matter, sounds, stateStack, timer, world } from "../globals.js";
import GameOverState from "../states/GameOverState.js";
import PlayState from "../states/PlayState.js";
import ShowResultState from "../states/ShowResultState.js";
import WagerState from "../states/WagerState.js";
import Board from "./Board.js";
import Die from "./Die.js";

const { Composite } = matter;

export default class DiceGame {
    // Values for setting the Show Result State after someone wins the match.
    static RESULT_STATE_FONT_SIZE = 50;
    static RESULT_STATE_HOLD_DURATION = 1.5;

    // The time that the opponent will delay before they roll their dice,
    // giving the player the chance to see their roll.
    static OPPONENT_DELAY_BEFORE_ROLL = 1;

    /**
     * An abstract dice game, to be used as the parent of all dice games.
     * 
     * @param {Character} player 
     * @param {Opponent} opponent 
     */
    constructor(player, opponent) {
        this.player = player;
        this.opponent = opponent;

        // The most recent roll result.
        this.rolledValue = 0;

        this.dice = [new Die(), new Die(), new Die()];
        this.isRolling = false;

        this.wagerAmount = 0;
        this.isPlayerTurn = true;
        this.didPlayerWin = true;
        this.isFirstRoll = true;

        // The specific phase of the current game.
        this.gamePhase = GamePhase.Wager;

        // To enable or disable the dice total display at the end of each roll.
        this.enableDiceTotalDisplay = true;
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
                this.saveData();
                // Bring up wager state to get player's wager, and then proceed to the battle phase.
                stateStack.push(new WagerState(this.player, this.opponent, (wager) => {
                    this.wagerAmount = wager;
                }));
                this.gamePhase = GamePhase.Battle
                break;

            case GamePhase.Battle:
                // Roll the battle to determine who goes first.
                this.rollBattle()
                this.gamePhase = GamePhase.BattleRolling;
                break;

            case GamePhase.BattleRolling:
                this.saveData();
                // Bring up the result UI showing who won the battle.
                stateStack.push(new ShowResultState(`${this.isPlayerTurn ? "You Go First" : "Opponent Goes First"}`));
                this.gamePhase = GamePhase.ToRoll;
                break;

            case GamePhase.ToRoll:
                // If it's the player's turn, roll only once Enter is pressed.
                if (this.isPlayerTurn && input.isKeyPressed(Input.KEYS.ENTER)) {
                    this.rollDice();
                    this.gamePhase = GamePhase.Rolling;
                }
                // If it's the opponent's turn, roll right away if it's the first roll, or after a delay on subsequent rolls.
                else if (!this.isPlayerTurn) {
                    if (this.isFirstRoll) {
                        this.rollDice();
                        this.gamePhase = GamePhase.Rolling;
                    } else if (!this.opponent.isWaiting) {
                        this.opponent.isWaiting = true;
                        timer.addTask(() => { },
                            DiceGame.OPPONENT_DELAY_BEFORE_ROLL,
                            DiceGame.OPPONENT_DELAY_BEFORE_ROLL,
                            () => {
                                this.rollDice();
                                this.gamePhase = GamePhase.Rolling;
                                this.opponent.isWaiting = false;
                            }
                        );
                    }
                }
                break;

            case GamePhase.Rolling:
                this.isFirstRoll = false;
                this.saveData();
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
                    stateStack.push(new GameOverState());
                } else {
                    // If the opponent is broke, go back to Opponent Selection.
                    stateStack.pop();
                }
                break;
        }
    }

    /**
     * Reset starting values at the end of a match.
     */
    reset() {
        this.isFirstRoll = true;
    }

    /**
     * Check the result of the roll and proceed according to the rules of the game.
     */
    checkRoll() {
        // To be implemented by the particular games.
    }

    /**
     * Roll all the game dice and add up their values into rolledValue.
     */
    rollDice() {
        sounds.play(SoundName.Dice);

        // Roll from the right as the player, from the left as the opponent.
        const positionX = this.isPlayerTurn ? CANVAS_WIDTH / 2 + Board.WIDTH / 4 : CANVAS_WIDTH / 2 - Board.WIDTH / 4;
        const direction = this.isPlayerTurn ? Direction.Left : Direction.Right;

        this.rolledValue = 0;
        this.dice.forEach((die) => {
            const positionY = getRandomPositiveNumber(
                CANVAS_HEIGHT / 2 - Board.HEIGHT / 8,
                CANVAS_HEIGHT / 2 + Board.HEIGHT / 8
            );
            die.onRoll(direction, { x: positionX, y: positionY });
            this.rolledValue += die.value;
        });
        this.isRolling = true;
    }

    /**
     * Roll two dice to determine who goes first. The value isPlayerTurn is updated
     * according to the result of the battle.
     */
    rollBattle() {
        sounds.play(SoundName.Dice);

        // Roll for player.
        this.dice[0].onRoll(Direction.Up, { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 + Board.HEIGHT / 4 });
        let playerRoll = this.dice[0].value;

        // Roll for opponent.
        this.dice[1].onRoll(Direction.Down, { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 - Board.HEIGHT / 4 });
        let opponentRoll = this.dice[1].value;

        // Move the third die offscreen so it doesn't get in the way.
        matter.Body.setPosition(this.dice[2].body, {
            x: CANVAS_WIDTH + Die.WIDTH * 5,
            y: -10
        });
        this.dice[2].body.velocity = { x: 0, y: 0 };

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

    saveData() {
        localStorage.setItem("game", JSON.stringify(this, (key, value) => {
            // You can't stringify matter bodies due to circular reference, so the dice need to only save important, raw properties.
            if (key === "dice") {
                return value.map((die) => {
                    return { value: die.value, position: die.body.position }
                });
            }
            return value;
        }));
    }

    loadData(gameData) {
        this.gamePhase = gameData.gamePhase;
        this.rolledValue = gameData.rolledValue;
        this.wagerAmount = gameData.wagerAmount;
        this.isPlayerTurn = gameData.isPlayerTurn;
        this.isFirstRoll = gameData.isFirstRoll;
        this.enableDiceTotalDisplay = gameData.enableDiceTotalDisplay;

        // Update the properties of the dice.
        this.dice.forEach((die, index) => {
            die.value = gameData.dice[index].value;
            die.stateMachine.change(DieStateName.Idle);
            matter.Body.setPosition(
                die.body,
                gameData.dice[index].position
            );
        });
    }

    render() {
        this.dice.forEach((die) => {
            die.render();
        });

        if (this.enableDiceTotalDisplay && !this.isRolling && !this.isFirstRoll) {
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

        if (this.isPlayerTurn && this.gamePhase === GamePhase.ToRoll && stateStack.top() instanceof PlayState) {
            context.save();
            context.font = '50px roboto';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.shadowColor = 'black';
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 1;
            context.shadowBlur = 4;
            context.fillText(
                "Press ENTER to Roll",
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT - 150
            );
            context.restore();
        }
    }
}