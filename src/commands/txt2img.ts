import { APIEmbedField, AttachmentBuilder, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { logCommand } from "../helpers/logger.js";
import { ICommand } from "../models/ICommand.js";
import { txt2imgDefaults } from "../constants/commandDefaults.js";
import axios, { AxiosError, AxiosResponse } from "axios";
import { sample_methods, sdAPI } from "../constants/stringConstants.js";
import { ITxt2ImgPayload, ITxt2ImgResponse, SamplingMethods } from "../models/ITxt2Img.js";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("txt2img")
        .setDescription("Nero will generate an image for you based on your prompt.")
        .addStringOption(option => 
            option.setName("prompt")
                .setDescription("Text prompt for AI to think about")
                .setMaxLength(1024)
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName("negative_prompt")
                .setDescription(`Text prompt for AI to avoid thinking about.`)
                .setMaxLength(1024)
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
        ).addStringOption(option => 
            option.setName("sample_method")
                .setDescription(`Which algorithm to use to produce the image. (Default: ${txt2imgDefaults.sampler_index})`)
                .addChoices(...(sample_methods.map((method: string) => {return { name: method, value: method }})))
        ).addBooleanOption(option => 
            option.setName("fix_faces")
                .setDescription(`Restore low quality faces using GFPGAN neural network. (Default: ${txt2imgDefaults.restore_faces})`)
                .setRequired(false)
        ),
    async execute(interaction: CommandInteraction) {
        const prompt: string = interaction.options.get("prompt").value as string;
        const negative_prompt: string = interaction.options.get("negative_prompt")?.value as string;
        const steps: number = interaction.options.get("steps")?.value as number;
        const cfg_scale: number = interaction.options.get("guidance_strength")?.value as number;
        const seed: number = interaction.options.get("seed")?.value as number;
        const sampler_index: SamplingMethods = interaction.options.get("sample_method")?.value as SamplingMethods;
        const restore_faces: boolean = interaction.options.get("fix_faces")?.value as boolean;

        const options: ITxt2ImgPayload = {
            ...txt2imgDefaults,
            prompt,
            ...(negative_prompt) && { negative_prompt },
            ...(steps) && { steps },
            ...(cfg_scale) && { cfg_scale },
            ...(seed) && { seed },
            ...(sampler_index) && { sampler_index },
            ...(restore_faces) && { restore_faces },
        }

        // TODO: Maybe make this a template for other commands to use
        const responseEmbed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({ name: "txt2img", iconURL: "https://i.imgur.com/HEj61LF.png" })
            .setTitle("Nero-bot")
            .setColor(0x71368a)
            .setThumbnail("https://i.imgur.com/0ZuHGyJ.png")
            .setDescription("Hang on a sec, I'm working on it!")
            .addFields(
                { name: "Prompt", value: options.prompt },
                { name: "Negative Prompt", value: options.negative_prompt },
                { name: "Sampling Method", value: options.sampler_index, inline: true },
                { name: "CFG", value: `${options.cfg_scale}`, inline: true },
                { name: "Restore Faces", value: `${options.restore_faces}`, inline: true },
                { name: "Seed", value: `${(options.seed === -1) ? "..." : options.seed}`, inline: true },
            );

        await interaction.reply({ embeds: [ responseEmbed ] });

        const imgInfo: ITxt2ImgResponse = await txt2img(options);
        const output: AttachmentBuilder = new AttachmentBuilder(Buffer.from(imgInfo.images[0], "base64"), { name: "output.png" });

        await interaction.editReply({
            embeds: [
                responseEmbed
                    .setDescription("Here ya go!")
                    .setThumbnail("https://i.imgur.com/Jr2xoJw.png")
                    .setImage("attachment://output.png")
                    // This is pretty tedious, but it finds and replaces the seed value.
                    .spliceFields(responseEmbed.data.fields.map((field: APIEmbedField) => field.name).indexOf("Seed"), 1,
                        { name: "Seed", value: `${JSON.parse(imgInfo.info).seed}` }
                    )
                    // TODO: Add timestamps. Maybe total generation time.
            ],
            files: [ output ]
        });


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

async function txt2img(options: ITxt2ImgPayload): Promise<ITxt2ImgResponse> {
    return axios({
        method: "POST",
        url: sdAPI,
        timeout: 120000,
        data: options
    })
    .then((response: AxiosResponse<ITxt2ImgResponse>) => {
        return response.data;
    })
    .catch((err: AxiosError) => {
        // TODO: Use logger
        throw err;
    });
}

export { command, txt2img };