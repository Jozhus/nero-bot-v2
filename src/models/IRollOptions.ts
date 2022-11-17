/**
 * Interface for the settings of the roll slash command.
 */
interface IRollOptions {
    /**
     * Amount of dice to roll.
     */
    amount?: number;
    /**
     * Amount of sides on each die.
     */
    sides?: number;
    /**
     * Max number of dice to allow users to roll.
     */
    maxDice?: number;
};

export { IRollOptions };