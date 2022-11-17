import { AutocompleteInteraction, CacheType, Client, Collection, CommandInteraction, Events, GatewayIntentBits, Interaction, ModalSubmitInteraction } from "discord.js";
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
    try {
        if (interaction.isChatInputCommand()) {
            await commands.get(interaction.commandName).execute(interaction);
        } else if (interaction.isModalSubmit()) {
            // I dislike the idea of all modal popup logic being handled outside their respective command files. 
            await commands.get(interaction.customId?.split('-')[0]).execute(interaction);
        } else if (interaction.isAutocomplete()) {
            await commands.get(interaction.commandName).autocomplete(interaction);
        }
    } catch (err) {
        // TODO: Use logger.
        console.error(err);
    }
});

/* Login */
client.once(Events.ClientReady, async (c: Client<true>) => {
    console.log(`Logged in as ${c.user.tag}!`);

    await deployCommands();
});

client.login(loginToken);