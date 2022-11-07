import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { logCommand } from "../helpers/logger.js";
import { ICommand } from "../models/ICommand.js";
import { rollDefaults } from "../constants/commandDefaults.js";

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
        const amount: number = (interaction.options.get("amount")?.value as number) || rollDefaults.amount;
        const sides: number = (interaction.options.get("sides")?.value as number) || rollDefaults.sides;
        const result: number[] = roll(amount, sides);

        await interaction.reply(result.join(", "));

        logCommand({
            source: "roll",
            interaction,
            parameters: {
                amount,
                sides
            },
            result: result.join(", ")
        });
    }
}

function roll(amount: number, sides: number): number[] {
    const results: number[] = [];

    for (; amount > 0; amount--) {
        results.push(Math.floor(Math.random() * (sides || rollDefaults.sides) + 1));
    }

    return results;
}

export { command, roll };