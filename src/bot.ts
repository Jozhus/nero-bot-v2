import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import commandList from "./commands/index.js";
import { ICommand } from "./models/ICommand";

const loginToken: string = process.env.TOKEN;
const client: Client<boolean> = new Client({ intents: [ GatewayIntentBits.Guilds ] });
const commands: Collection<string, ICommand> = new Collection<string, ICommand>();

/* Load commands */
commandList.forEach((command: ICommand) => {
    commands.set(command.data.name, command);
});

/* Login */
client.once(Events.ClientReady, (c: Client<true>) => {
    console.log(`Logged in as ${c.user.tag}!`);
});

client.login(loginToken);