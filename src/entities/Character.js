export default class Character {
    static PLAYER_STARTING_MONEY = 200;
    /**
     * Represents an individual dice player with their own money
     * which can be won or lost.
     * @param {number} startingMoney
     */
    constructor(startingMoney = Character.PLAYER_STARTING_MONEY) {
        this.money = startingMoney;

    }

    /**
     * @returns true if the character has no more money. False if they still have any.
     */
    isBroke() {
        return this.money <= 0;
    }

    /**
     * Add money to the character's purse.
     * @param {number} amount 
     */
    winMoney(amount) {
        this.money += amount
    }

    /**
     * Remove money from the character's purse.
     * @param {number} amount 
     */
    loseMoney(amount) {
        this.money -= amount
    }
}