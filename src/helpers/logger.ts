import { ICommandLog } from "../models/ILog.js";

// TODO: Hook this up to log to database
// TODO: Add different types of logging (warning, error, info, etc.)

function logCommand(command: ICommandLog): void {
    console.log(`[${command.source}] in ${command.interaction.guild.name}#${command.interaction.channel.name} by ${command.interaction.user.username}\nParameters:\n${Object.entries(command.parameters).map(([parameter, value]: [string, number | string | boolean | number[] | string[] | boolean[]]) => `\n\t${parameter}: ${value}`)}\nResult:\n\t${command.result}\n`);
}

export { logCommand };