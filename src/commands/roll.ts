import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../models/ICommand";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("roll")
        .setDescription("roll a number"),
    async execute(interaction: CommandInteraction) {
        await interaction.reply("yeah i'll work on this gimmie a sec");
    }
}

export { command };