import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { logCommand } from "../helpers/logger.js";
import { ICommand } from "../models/ICommand.js";

const defaultAmount: number = 1;
const defaultSides: number = 100;
const maxDice: number = 50;

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("roll")
        .setDescription("Nero will roll n m-sided dice for you. (1 to n)")
        .addIntegerOption(option => 
            option.setName("amount")
                .setDescription(`Amount of dice to roll. (Default: ${defaultAmount}) (Max: ${maxDice})`)
                .setMinValue(1)
                .setMaxValue(maxDice)
                .setRequired(false)
        )
        .addIntegerOption(option => 
            option.setName("sides")
                .setDescription(`Amount of sides on each die. (Default: ${defaultSides})`)
                .setMinValue(1)
                .setRequired(false)
        ),
    async execute(interaction: CommandInteraction) {
        const amount: number = (interaction.options.get("amount")?.value as number) || defaultAmount;
        const sides: number = (interaction.options.get("sides")?.value as number) || defaultSides;
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
        results.push(Math.floor(Math.random() * (sides || 100) + 1));
    }

    return results;
}

export { command };