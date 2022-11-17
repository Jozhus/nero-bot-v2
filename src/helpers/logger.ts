import { ICommandLog } from "../models/ILog.js";
import { flattenObject } from "./flattenObject.js";

// TODO: Hook this up to log to database
// TODO: Add different types of logging (warning, error, info, etc.)

/**
 * Logs slash command event information.
 * 
 * @param command Object containing the slash command info.
 */
function logCommand(command: ICommandLog): void {
    // Placeholder for now.
    console.log(`[${command.source}] in ${command.interaction.guild.name}#${command.interaction.channel.name} by ${command.interaction.user.username}\nParameters:\n${Object.entries(flattenObject(command.parameters)).map(([parameter, value]: [string, number | string | boolean | number[] | string[] | boolean[]]) => `\n\t${parameter}: ${value}`)}\nResult:\n\t${command.result}\n`);
}

export { logCommand };