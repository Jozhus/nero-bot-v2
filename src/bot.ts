import { CacheType, Client, Collection, CommandInteraction, Events, GatewayIntentBits, Interaction } from "discord.js";
import commandList from "./commands/index.js";
import { loginToken } from "./constants/stringConstants.js";
import { ICommand } from "./models/ICommand.js";
import { deployCommands } from "./helpers/deploySlashCommands.js";

const client: Client<boolean> = new Client({ intents: [ GatewayIntentBits.Guilds ] });
const commands: Collection<string, ICommand> = new Collection<string, ICommand>();

/* Load commands */
commandList.forEach((command: ICommand) => {
    commands.set(command.data.name, command);
});

/* Handle slash commands */
client.on(Events.InteractionCreate, async (interaction: Interaction<CacheType>) => {
    if (!interaction.isChatInputCommand()) return;

    const command: ICommand = commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
    }
})

/* Login */
client.once(Events.ClientReady, (c: Client<true>) => {
    console.log(`Logged in as ${c.user.tag}!`);

    deployCommands();
});

client.login(loginToken);