import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface ICommand {
    data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute(interaction: CommandInteraction): Promise<void>;
};