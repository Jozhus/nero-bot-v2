import { readdirSync } from "fs";
import { ICommand } from "../models/ICommand.js";
import { fileURLToPath } from 'url';
import { dirname } from "path";

/* The following is a very stupid way to do a dynamic full directory export. */

// __dirname is not defined globally for reasons, so here is a hacky workaround.
const __dirname: string = dirname(fileURLToPath(import.meta.url));

// Get the paths of all the files, except for itself, in the current directory.
const commandPaths: string[] = readdirSync(__dirname).filter((file: string) => file.endsWith(".js") && file !== "index.js");

// Dynamically import the list of commands.
const commandList: ICommand[] = await Promise.all(
    commandPaths.map((path: string) => 
        import(`./${path}`)
            .then((file: {command: ICommand}) => file.command)
    )
);

export default commandList;