import { CommandInteraction } from "discord.js";

interface ILog {
    source: string;
};

interface ICommandLog extends ILog {
    interaction: CommandInteraction;
    parameters: {
        [parameter: string]: number | string | boolean | number[] | string[] | boolean[];
    };
    result: string;
};

interface IErrorLog extends ILog {
    error: Error;
}

export { ICommandLog, IErrorLog };