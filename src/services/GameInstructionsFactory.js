export default class GameInstructionsFactory {
    constructor() {
        this.instructions = {}
    }

    load(instructions) {
        GameInstructionsFactory.instructions = instructions;
    }

    /**
     * @param {string} game The name of the game whose instructions are to be retrieved. Use the DiceGameName enum.
     * @returns The instructions for how to play the particular game.
     */
    get(game) {
        return GameInstructionsFactory.instructions[game];
    }
}