import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { logCommand } from "../helpers/logger.js";
import { ICommand } from "../models/ICommand.js";
import { rollDefaults } from "../constants/commandDefaults.js";
import { IRollOptions } from "../models/IRollOptions.js";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("roll")
        .setDescription("Nero will roll n m-sided dice for you. (1 to n)")
        .addIntegerOption(option => 
            option.setName("amount")
                .setDescription(`Amount of dice to roll. (Default: ${rollDefaults.amount}) (Max: ${rollDefaults.maxDice})`)
                .setMinValue(1)
                .setMaxValue(rollDefaults.maxDice)
                .setRequired(false)
        )
        .addIntegerOption(option => 
            option.setName("sides")
                .setDescription(`Amount of sides on each die. (Default: ${rollDefaults.sides})`)
                .setMinValue(1)
                .setRequired(false)
        ),
    async execute(interaction: CommandInteraction) {
        const amount: number = interaction.options.get("amount")?.value as number;
        const sides: number = interaction.options.get("sides")?.value as number;

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

function roll(options: IRollOptions): number[] {
    const results: number[] = [];
    const rollOptions: IRollOptions = { ...rollDefaults, ...options };

    for (; rollOptions.amount > 0; rollOptions.amount--) {
        results.push(Math.floor(Math.random() * (rollOptions.sides) + 1));
    }

    return results;
}

export { command, roll };