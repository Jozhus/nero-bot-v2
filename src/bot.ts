import { Client, Events, GatewayIntentBits } from "discord.js";

const client: Client<boolean> = new Client({ intents: [ GatewayIntentBits.Guilds ] });

client.once(Events.ClientReady, (c: Client<true>) => {
    console.log(`Logged in as ${c.user.tag}!`);
});

client.login(process.env.TOKEN);