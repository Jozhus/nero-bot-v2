import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandIntegerOption } from "discord.js";
import { logCommand } from "../helpers/logger.js";
import { ICommand } from "../models/ICommand.js";
import { rollDefaults } from "../constants/commandDefaults.js";
import { IRollOptions } from "../models/IRollOptions.js";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("roll")
        .setDescription("Nero will roll n m-sided dice for you. (1 to n)")
        .addIntegerOption((option: SlashCommandIntegerOption) => 
            option.setName("amount")
                .setDescription(`Amount of dice to roll. (Default: ${rollDefaults.amount}) (Max: ${rollDefaults.maxDice})`)
                .setMinValue(1)
                .setMaxValue(rollDefaults.maxDice)
                .setRequired(false)
        )
        .addIntegerOption((option: SlashCommandIntegerOption) => 
            option.setName("sides")
                .setDescription(`Amount of sides on each die. (Default: ${rollDefaults.sides})`)
                .setMinValue(1)
                .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const amount: number = interaction.options.getInteger("amount");
        const sides: number = interaction.options.getInteger("sides");

        /* Construct options object with given parameters only if they exist */
        const options: IRollOptions = {
            ...(amount) && { amount },
            ...(sides) && { sides }
        };

        const result: number[] = roll(options);

        await interaction.reply(result.join(", "));

        logCommand({
            source: "roll",
            interaction,
            parameters: {
                ...rollDefaults,
                ...options
            },
            result: result.join(", ")
        });
    }
}

/**
 * Generates a list of random numbers constricted by the given roll options.
 * 
 * @param options An object to control how to constrict the random number generation.
 * @returns The resulting list of random, constricted numbers.
 */
function roll(options: IRollOptions): number[] {
    const results: number[] = [];
    const rollOptions: IRollOptions = { ...rollDefaults, ...options };

    for (; rollOptions.amount > 0; rollOptions.amount--) {
        results.push(Math.floor(Math.random() * (rollOptions.sides) + 1));
    }

    return results;
}

export { command, roll };