import Easing from "../../lib/Easing.js";
import Input from "../../lib/Input.js";
import Sprite from "../../lib/Sprite.js";
import State from "../../lib/State.js";
import Character from "../entities/Character.js";
import Opponent from "../entities/Opponent.js";
import Direction from "../enums/Direction.js";
import ImageName from "../enums/ImageName.js";
import SoundName from "../enums/SoundName.js";
import { context, images, input, sounds, stateStack, timer } from "../globals.js";
import UIArrow from "../user-interface/UIArrow.js";
import UISprite from "../user-interface/UISprite.js";
import HelpState from "./HelpState.js";

export default class WagerState extends State {
    static BACKGROUND_SPRITE_VALUES = { x: 130, y: 0, width: 140, height: 270, scale: { x: 4, y: 4 } }
    static TRANSITION_DURATION = 0.75;

    static lastWager = 1;
    /**
     * In this state, the player chooses how much money they wish to bet in the upcoming round.
     * This is the only time when the player is allowed to back out of a game and return to
     * the Opponent Selection State, in order to prevent cheating if they think they're about
     * to lose.
     * 
     * @param {Character} player
     * @param {Opponent} opponent  
     * @param {(wager: number) => void} setWager
     */
    constructor(player, opponent, setWager) {
        super();


        this.playerMoney = player.money;
        this.opponentMoney = opponent.money;
        this.game = opponent.game;

        // Set the maximum possible wager so that no one can lose more money than they have.
        this.maxWager = Math.min(this.playerMoney, this.opponentMoney);
        this.minWager = 1;
        // Set the current wager to the value of the most recently made wager, or to the max wager if it's too high.
        this.currentWager = Math.min(WagerState.lastWager, this.maxWager);

        // The setter function for the wager amount in the PlayState's game. 
        this.setWager = setWager;

        this.isTransitioning = true;

        // Define the UI elements.
        this.background = new UISprite(
            new Sprite(
                images.get(ImageName.StonePanel),
                WagerState.BACKGROUND_SPRITE_VALUES.x,
                WagerState.BACKGROUND_SPRITE_VALUES.y,
                WagerState.BACKGROUND_SPRITE_VALUES.width,
                WagerState.BACKGROUND_SPRITE_VALUES.height
            ),
            -(WagerState.BACKGROUND_SPRITE_VALUES.width) * WagerState.BACKGROUND_SPRITE_VALUES.scale.x,
            0,
            WagerState.BACKGROUND_SPRITE_VALUES.scale
        );

        const arrowPadding = 110;
        this.upArrow = new UIArrow(
            this.background.position.x + this.background.dimensions.x / 2 - UIArrow.SPRITE_MEASUREMENTS_UP.width / 2,
            this.background.dimensions.y / 2 - arrowPadding,
            Direction.Up
        );
        this.downArrow = new UIArrow(
            this.background.position.x + this.background.dimensions.x / 2 - UIArrow.SPRITE_MEASUREMENTS_DOWN.width / 2,
            this.background.dimensions.y / 2 + arrowPadding,
            Direction.Down
        );
    }

    enter() {
        // Slide in the UI.
        timer.tween(
            this.background.position,
            { x: 0 },
            WagerState.TRANSITION_DURATION,
            Easing.linear,
            () => { this.isTransitioning = false }
        );
        sounds.play(SoundName.Stone);
    }

    update(dt) {
        if (this.isTransitioning) {
            // Keep the UI arrows in position relative to the background as the UI slides in.
            this.upArrow.position.x = this.background.position.x + this.background.dimensions.x / 2 - this.upArrow.dimensions.x / 2;
            this.downArrow.position.x = this.background.position.x + this.background.dimensions.x / 2 - this.downArrow.dimensions.x / 2;
            return;
        }

        if (input.isKeyPressed(Input.KEYS.W) || input.isKeyPressed(Input.KEYS.ARROW_UP)) {
            // Increment wager.
            this.updateWager(1);
        } else if (input.isKeyPressed(Input.KEYS.S) || input.isKeyPressed(Input.KEYS.ARROW_DOWN)) {
            // Decrement wager.
            this.updateWager(-1);
        } else if (input.isKeyPressed(Input.KEYS.ENTER)) {
            // Accept wager.
            this.acceptWager();
        } else if (input.isKeyPressed(Input.KEYS.H)) {
            // Bring up Game instructions.
            stateStack.push(new HelpState(this.game));
        } else if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
            // Return to Opponent Selection.
            stateStack.pop();
            stateStack.pop(); // Will probably replace this with a "transition out" function in PlayState.
        }
    }

    /**
     * Update the current wager by the specified amount. If the change would bring the wager above or
     * below the minimum or maximum allowed wagers, no change will occur.
     * @param {number} amount 
     */
    updateWager(amount) {
        if (this.currentWager + amount > this.maxWager || this.currentWager + amount < this.minWager) {
            // Maybe do a little sound indicating that you can't go further.
            return;
        }

        this.currentWager += amount;
        sounds.play(SoundName.Coin);
    }

    acceptWager() {
        this.setWager(this.currentWager);
        WagerState.lastWager = this.currentWager;
        // Go back to PlayState.
        stateStack.pop();
    }

    render() {
        this.background.render();
        this.renderUI();
    }

    renderUI() {
        const textPaddingX = 50;

        context.save();
        context.shadowColor = 'black';
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 1;
        context.shadowBlur = 4;
        context.font = '60px manufacturingConsent';
        context.textAlign = 'center';
        context.fillStyle = 'white';
        context.fillText("Make Your Wager",
            this.background.position.x + this.background.dimensions.x / 2,
            this.background.position.y + 250
        );
        context.font = '30px roboto';
        context.fillText("(Press ENTER to submit)",
            this.background.position.x + this.background.dimensions.x / 2,
            this.background.position.y + 300
        );

        context.textAlign = 'center';
        context.font = '100px manufacturingConsent';
        context.fillText(`${this.currentWager}`,
            this.background.position.x + this.background.dimensions.x / 2,
            this.background.position.y + this.background.dimensions.y / 2 + 50
        );

        this.upArrow.render();
        this.downArrow.render();
        context.font = '35px manufacturingConsent';
        context.fillStyle = 'white';
        context.fillText('W',
            this.upArrow.position.x + this.upArrow.dimensions.x / 2,
            this.upArrow.position.y + this.upArrow.dimensions.y - 5
        );
        context.fillText('S',
            this.downArrow.position.x + this.downArrow.dimensions.x / 2,
            this.downArrow.position.y + this.downArrow.dimensions.y - 17
        );

        context.fillStyle = 'white';
        context.font = '50px manufacturingConsent';
        context.textAlign = 'left';
        context.fillText(`Your Money:`,
            this.background.position.x + textPaddingX,
            this.background.position.y + this.background.dimensions.y - 250
        );
        context.fillText(`${this.playerMoney}`,
            this.background.position.x + textPaddingX,
            this.background.position.y + this.background.dimensions.y - 200
        );
        context.fillText(`Opponent's Money:`,
            this.background.position.x + textPaddingX,
            this.background.position.y + this.background.dimensions.y - 150
        );
        context.fillText(`${this.opponentMoney}`,
            this.background.position.x + textPaddingX,
            this.background.position.y + this.background.dimensions.y - 100
        );
        context.restore();
    }
}