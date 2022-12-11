import { AutocompleteInteraction, CommandInteraction, ModalSubmitInteraction, SelectMenuInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

/**
 * Interface for all slash commands to implement.
 */
interface ICommand {
    /**
     * Always* going to be a SlashCommandBuilder and all its related methods.
     */
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    /**
     * Execution logic of the slash command.
     * 
     * @param interaction Interaction that triggered this slash command.
     * 
     * Holy shit I hate discord.js's typescript documentation. Do you know how long it took me to find this?
     * For future reference, CommandInteraction is the base interface. Use either ChatInputCommandInteraction or ContextMenuCommandInteraction.
     */
    execute(interaction: CommandInteraction | ModalSubmitInteraction | SelectMenuInteraction): Promise<void>;
    /**
     * Extended functionality for slash command execution that handles the logic for slash command parameter text auto-completions.
     * 
     * @param interaction Interaction that triggered this slash command.
     */
    autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
};

interface ICommandParameterDefaults {
    readonly [parameter: string]: any; // Gross any.
}

/**
 * Min / max constraints for slash command parameters.
 */
interface ICommandParameterConstraints {
    readonly [parameter: string]: number;
};

export { ICommand, ICommandParameterDefaults, ICommandParameterConstraints };