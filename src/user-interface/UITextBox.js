import { context } from "../globals.js";
import UIElement from "./UIElement.js";

export default class UITextBox extends UIElement {
    static FONT_SIZE = 60;
    static FONT_FAMILY = 'roboto';
    static COLOUR = 'black';
    static TEXT_ALIGNMENT = 'left';

    /**
     * A block of text with specified dimensions. The text will wrap around if it is too long
     * to fit on a single line.
     * This class is heavily based on code created by Vikram Singh, modified to fit the specific needs of this game.
     * 
     * @param {string} text 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {object} options Font size/colour/family, and text alignment.
     */
    constructor(text, x, y, width, height, options = {}) {
        super(x, y, width, height);

        this.fontSize = options.fontSize ?? UITextBox.FONT_SIZE;
        this.fontColour = options.fontColour ?? UITextBox.COLOUR;
        this.fontFamily = options.fontFamily ?? UITextBox.FONT_FAMILY;
        this.textAlignment = options.textAlignment ?? UITextBox.TEXT_ALIGNMENT;

        this.lines = this.getLines(text, width);
    }

    /**
     * Split a string of text into lines that are no wider than the width of the textbox.
     * 
     * @param {string} text The original text to be split.
     * @param {number} maxWidth The width in pixels at which to split up the text.
     * @returns {string[]} An array of the newly split up lines.
     */
    getLines(text, maxWidth) {
        const wordsByLine = text.split('\n'); // Split by new line if manually specified in text.
        const lines = [];

        wordsByLine.forEach((line) => {
            const words = line.replace(/\t+/g, '').split(' '); // Remove any tab characters.

            let currentLine = words[0];

            context.font = `${this.fontSize}px ${this.fontFamily}`;

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const width = context.measureText(
                    currentLine + ' ' + word
                ).width;

                if (width < maxWidth) {
                    currentLine += ' ' + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }

            lines.push(currentLine);
        });
        return lines;
    }

    render() {
        context.save();
        context.textBaseline = 'top';
        context.font = `${this.fontSize}px ${this.fontFamily}`;
        context.fillStyle = this.fontColour;
        context.textAlign = this.textAlignment;

        // If the text alignment is something other than left, adjust the offset so the text renders in the right spot.
        let offset = 0;
        if (this.textAlignment === 'center') {
            offset = this.dimensions.x / 2
        } else if (this.textAlignment === 'right') {
            offset = this.dimensions.x
        }

        this.lines.forEach((line, index) => {
            context.fillText(
                line,
                this.position.x + offset,
                this.position.y + index * this.fontSize
            );
        });
        context.restore();
    }
}