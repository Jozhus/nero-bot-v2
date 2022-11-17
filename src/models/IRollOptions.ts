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
};

export { IRollOptions };