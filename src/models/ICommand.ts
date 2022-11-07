import { CommandInteraction, SlashCommandBuilder } from "discord.js";

interface ICommand {
    data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute(interaction: CommandInteraction): Promise<void>;
};

export { ICommand };