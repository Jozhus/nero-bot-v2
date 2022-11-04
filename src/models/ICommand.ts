import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface ICommand {
    data: SlashCommandBuilder;
    execute(interaction: CommandInteraction): Promise<void>;
};