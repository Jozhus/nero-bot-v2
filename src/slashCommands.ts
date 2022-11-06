import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import commandList from "./commands/index.js";
import { clientId, loginToken } from "./constants/stringConstants.js";
import { ICommand } from "./models/ICommand.js";

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = commandList.map((command: ICommand) => command.data.toJSON());
const rest: REST = new REST().setToken(loginToken);

async function deployCommands(): Promise<void> {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        await rest.put(
            Routes.applicationCommands(clientId), {
                body: commands
            }
        );

        console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
    } catch (err) {
        console.error(err);
    }
}

export { deployCommands };