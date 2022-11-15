import { AutocompleteInteraction, ChatInputCommandInteraction, CommandInteraction, ModalSubmitInteraction, SelectMenuInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

interface ICommand {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    /*
        Holy shit I hate discord.js's typescript documentation. Do you know how long it took me to find this?
        For future reference, CommandInteraction is the base interface. Use either ChatInputCommandInteraction or ContextMenuCommandInteraction.
    */
    execute(interaction: CommandInteraction | ModalSubmitInteraction | SelectMenuInteraction): Promise<void>;
    autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
};

export { ICommand };