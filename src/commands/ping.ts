import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../models/ICommand";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("pings"),
    async execute(interaction: CommandInteraction) {
        await interaction.reply("pong");
    }
}

export { command };