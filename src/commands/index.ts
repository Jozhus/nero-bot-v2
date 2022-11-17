import { readdirSync } from "fs";
import { resolve } from "path";
import { rootDir } from "../index.js";
import { ICommand } from "../models/ICommand.js";

/* The following is a very stupid way to do a dynamic full directory export. */

/**
 * Get the paths of all *.js files, except for itself, in the current directory and dynamically imports the list of commands.
 */
const commandList: ICommand[] = await Promise.all(
    readdirSync(resolve(rootDir, "commands"))
        .filter((file: string) => file.endsWith(".js") && file !== "index.js")
        .map((path: string) => import(`./${path}`)
            .then((file: {command: ICommand}) => file.command)
    )
);

export default commandList;