import { CommandInteraction } from "discord.js";

/**
 * Base interface of all logging schemas.
 */
interface ILog {
    /**
     * The source command / interaction / function / file that is logging.
     */
    source: string;
};

/**
 * The schema for all logs related to command execution.
 */
interface ICommandLog extends ILog {
    /**
     * Interaction that triggered this slash command.
     * 
     * Whole interaction is given to parse out more information directly from it.
     */
    interaction: CommandInteraction;
    /**
     * Any and all parameters used with the command.
     */
    parameters: {
        [parameter: string]: number | string | boolean | number[] | string[] | boolean[] | Object;
    };
    /**
     * The result of executing the command
     */
    result: string; // TODO: Make this into an object with success / fail messages and content.
};

/**
 * Schema to log errors of all types.
 */
interface IErrorLog extends ILog {
    /**
     * The error object that resulted when the error occurred.
     */
    error: Error;
}

export { ICommandLog, IErrorLog };