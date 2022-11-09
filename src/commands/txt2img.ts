import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { logCommand } from "../helpers/logger.js";
import { ICommand } from "../models/ICommand.js";
import { txt2imgDefaults } from "../constants/commandDefaults.js";
import axios, { AxiosError, AxiosResponse } from "axios";
import { sdAPI } from "../constants/stringConstants.js";
import { ITxt2ImgPayload } from "../models/ITxt2ImgPayload.js";

// TODO: Add sampling model selection

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("txt2img")
        .setDescription("Nero will generate an image for you based on your prompt.")
        .addStringOption(option => 
            option.setName("prompt")
                .setDescription("Text prompt for AI to think about")
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName("negative_prompt")
                .setDescription(`Text prompt for AI to avoid thinking about.`)
                .setRequired(false)
        ).addIntegerOption(option => 
            option.setName("steps")
                .setDescription(`How many times to improve the generated image iteratively. (Default: ${txt2imgDefaults.steps})`)
                .setMinValue(1)
                .setMaxValue(64)
                .setRequired(false)
        ).addNumberOption(option => 
            option.setName("guidance_strength")
                .setDescription(`Classifier Free Guidance Scale. (Default: ${txt2imgDefaults.cfg_scale})`)
                .setMinValue(1)
                .setMaxValue(30)
                .setRequired(false)
        )
        .addIntegerOption(option => 
            option.setName("seed")
                .setDescription(`A value that determines the output of random number generator. (Default: Random)`)
                .setMinValue(1)
                .setRequired(false)
        ),
    async execute(interaction: CommandInteraction) {
        const prompt: string = interaction.options.get("prompt").value as string;
        const negative_prompt: string = interaction.options.get("negative_prompt")?.value as string;
        const steps: number = interaction.options.get("steps")?.value as number;
        const cfg_scale: number = interaction.options.get("guidance_strength")?.value as number;
        const seed: number = interaction.options.get("seed")?.value as number;

        const options: ITxt2ImgPayload = {
            prompt,
            ...(negative_prompt) && { negative_prompt },
            ...(steps) && { steps },
            ...(cfg_scale) && { cfg_scale },
            ...(seed) && { seed }
        }

        await interaction.reply("Hang on a sec, I'm working on it!");
        const buff: Buffer = await txt2img(options);

        console.log(buff.length);
        await interaction.editReply("Here ya go:");
        await interaction.editReply({ files: [ buff ], options: { content: "" } });

        logCommand({
            source: "txt2img",
            interaction,
            parameters: {
                ...txt2imgDefaults,
                ...options
            },
            result: "Success"
        });
    }
}

async function txt2img(options: ITxt2ImgPayload): Promise<Buffer> {
    const data: ITxt2ImgPayload = {...txt2imgDefaults, ...options};

    return axios({
        method: "POST",
        url: sdAPI,
        timeout: 120000,
        data
    })
    .then((response: AxiosResponse) => {
        return Buffer.from(response.data.images[0], "base64");
    })
    .catch((err: AxiosError) => {
        // TODO: Use logger
        throw err;
    });
}

export { command, txt2img };