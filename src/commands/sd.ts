import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandSubcommandBuilder, SlashCommandBooleanOption, SlashCommandStringOption, SlashCommandNumberOption, AutocompleteInteraction, ApplicationCommandOptionChoiceData } from "discord.js";
import { logCommand } from "../helpers/logger.js";
import { ICommand } from "../models/ICommand.js";
import { txt2imgParameterDefaults, txt2imgParameterConstraints, sdCustomizations } from "../constants/commandConstants.js";
import axios, { AxiosError, AxiosResponse } from "axios";
import { sampleMethods, sdAPI } from "../constants/stringConstants.js";
import { ISDSettings, ITxt2ImgPayload, ITxt2ImgResponse, SamplingMethods } from "../models/ISD.js";
import { hypernetworkFlatList, hypernetworkListSorted } from "../helpers/constructSDList.js";
import { flattenObject } from "../helpers/flattenObject.js";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("sd")
        .setDescription("stable diffusion")
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) => 
            subcommand
            .setName("txt2img")
            .setDescription("Nero will generate an image for you based on your prompt")
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName("prompt")
                    .setDescription("Text prompt for AI to think about.")
                    .setMaxLength(txt2imgParameterConstraints.maxPrompt)
                    .setRequired(true)
            )
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName("negative_prompt")
                    .setDescription(`Text prompt for AI to avoid thinking about.`)
                    .setMaxLength(txt2imgParameterConstraints.maxNegative_prompt)
                    .setRequired(false)
            ).addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName("steps")
                    .setDescription(`How many times to improve the generated image iteratively. (Default: ${txt2imgParameterDefaults.steps})`)
                    .setMinValue(txt2imgParameterConstraints.minSteps)
                    .setMaxValue(txt2imgParameterConstraints.maxSteps)
                    .setRequired(false)
            ).addNumberOption((option: SlashCommandNumberOption) => 
                option.setName("guidance_strength")
                    .setDescription(`Classifier Free Guidance Scale. (Default: ${txt2imgParameterDefaults.cfg_scale})`)
                    .setMinValue(txt2imgParameterConstraints.minCfg_scale)
                    .setMaxValue(txt2imgParameterConstraints.maxCfg_scale)
                    .setRequired(false)
            ).addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName("width")
                    .setDescription(`Width of the generated image. Must be divisible by 64 or it will round up. (Default: ${txt2imgParameterDefaults.width})`)
                    .setMinValue(txt2imgParameterConstraints.minWidth)
                    .setMaxValue(txt2imgParameterConstraints.maxWidth)
                    .setRequired(false)
            ).addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName("height")
                    .setDescription(`Height of the generated image. Must be divisible by 64 or it will round up. (Default: ${txt2imgParameterDefaults.height})`)
                    .setMinValue(txt2imgParameterConstraints.minHeight)
                    .setMaxValue(txt2imgParameterConstraints.maxHeight)
                    .setRequired(false)
            )
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName("sample_method")
                    .setDescription(`Which algorithm to use to produce the image. (Default: ${txt2imgParameterDefaults.sampler_index})`)
                    .addChoices(...(sampleMethods.map((method: string) => {return { name: method, value: method }})))
                    .setRequired(false)
            ).addBooleanOption((option: SlashCommandBooleanOption) => 
                option.setName("restore_faces")
                    .setDescription(`Restore low quality faces using GFPGAN neural network. (Default: ${txt2imgParameterDefaults.restore_faces})`)
                    .setRequired(false)
            ).addBooleanOption((option: SlashCommandBooleanOption) => 
                option.setName("highres_fix")
                    .setDescription(`Create an image at smaller resolution, upscale, and improve the details in it (Default: ${txt2imgParameterDefaults.enable_hr})`)
                    .setRequired(false)
            ).addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName("firstpass_width")
                    .setDescription(`Width of the first pass image when highres fix is enabled. (Default: ${txt2imgParameterDefaults.firstphase_width})`)
                    .setMinValue(txt2imgParameterConstraints.minFirstphase_width)
                    .setMaxValue(txt2imgParameterConstraints.maxFirstphase_width)
                    .setRequired(false)
            ).addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName("firstpass_height")
                    .setDescription(`A value that determines the output of random number generator. (Default: ${txt2imgParameterDefaults.firstphase_height})`)
                    .setMinValue(txt2imgParameterConstraints.minFirstphase_height)
                    .setMaxValue(txt2imgParameterConstraints.maxFirstphase_height)
                    .setRequired(false)
            ).addNumberOption((option: SlashCommandNumberOption) => 
                option.setName("denoising_strength")
                    .setDescription(`Determines how little respect the algorithm should have for image's content. (Default: ${txt2imgParameterDefaults.denoising_strength})`)
                    .setMinValue(txt2imgParameterConstraints.minDenoising_strength)
                    .setMaxValue(txt2imgParameterConstraints.maxDenoising_strength)
                    .setRequired(false)
            ).addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName("seed")
                    .setDescription(`A value that determines the output of random number generator. (Default: Random)`)
                    .setMinValue(txt2imgParameterConstraints.minSeed)
                    .setRequired(false)
            ).addStringOption((option: SlashCommandStringOption) => 
            option.setName("hypernetwork")
                .setDescription(`Which algorithm to use to produce the image.`)
                .setAutocomplete(true)
                .setRequired(false)
            ).addNumberOption((option: SlashCommandNumberOption) => 
            option.setName("hypernetwork_strength")
                .setDescription(`Strength of the hypernetwork. (Default: ${txt2imgParameterDefaults.override_settings.sd_hypernetwork_strength})`)
                .setMinValue(txt2imgParameterConstraints.minHypernetwork_strength)
                .setMaxValue(txt2imgParameterConstraints.maxHypernetwork_strength)
                .setRequired(false)
        )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const prompt: string = interaction.options.getString("prompt");
        const negative_prompt: string = interaction.options.getString("negative_prompt");
        const steps: number = interaction.options.getInteger("steps");
        const cfg_scale: number = interaction.options.getNumber("guidance_strength");
        let width: number = interaction.options.getInteger("width");
        let height: number = interaction.options.getInteger("height");
        const sampler_index: SamplingMethods = interaction.options.getString("sample_method") as SamplingMethods;
        const restore_faces: boolean = interaction.options.getBoolean("fix_faces");
        const enable_hr: boolean = interaction.options.getBoolean("highres_fix");
        let firstphase_width: number = interaction.options.getInteger("firstpass_width");
        let firstphase_height: number = interaction.options.getInteger("firstpass_height");
        const denoising_strength: number = interaction.options.getNumber("denoising_strength");
        const seed: number = interaction.options.getInteger("seed");
        const sd_hypernetwork: string = interaction.options.getString("hypernetwork");
        const sd_hypernetwork_strength: number = interaction.options.getNumber("hypernetwork_strength");

        /* Round up to the nearest divisible of 64. */
        width = Math.ceil(width / 64) * 64;
        height = Math.ceil(height / 64) * 64;
        firstphase_width = Math.ceil(firstphase_width / 64) * 64;
        firstphase_height = Math.ceil(firstphase_height / 64) * 64;

        /* Construct options object with given parameters only if they exist. */
        const options: ITxt2ImgPayload = {
            prompt,
            ...(negative_prompt) && { negative_prompt },
            ...(steps) && { steps },
            ...(cfg_scale) && { cfg_scale },
            ...(width) && { width },
            ...(height) && { height },
            ...(sampler_index) && { sampler_index },
            ...(restore_faces) && { restore_faces },
            ...(enable_hr) && { enable_hr },
            ...(firstphase_width) && { firstphase_width },
            ...(firstphase_height) && { firstphase_height },
            ...(denoising_strength) && { denoising_strength },
            ...(seed) && { seed },
            override_settings: {
                ...(sd_hypernetwork) && { sd_hypernetwork },
                ...(sd_hypernetwork_strength) && { sd_hypernetwork_strength }
            }
        }

        // TODO: Maybe make a template for other commands to use
        /* Placeholder embed to reply with while waiting on response from stable-diffusion-webui's API. */
        const responseEmbed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({ name: "txt2img", iconURL: "https://i.imgur.com/HEj61LF.png" })
            .setTitle("Nero-bot")
            .setColor(sdCustomizations.unfinishedEmbedColor)
            .setThumbnail(sdCustomizations.unfinishedEmbedThumbnail)
            .setDescription(sdCustomizations.unfinishedEmbedDescription)
            .addFields(Object.entries(flattenObject(options)).map(([name, value]: [string, string | number | ISDSettings]) => {
                return {
                    name,
                    value: `${value}`,
                    inline: (!sdCustomizations.embedParametersNoInline.includes(name))
                };
            }))
            .setFooter((options.seed) ? { text: `Seed: ${options.seed}` } : null);

        await interaction.reply({ embeds: [ responseEmbed ] });

        /* Get generated image and convert it from base64 to an image buffer. */
        const imgInfo: ITxt2ImgResponse = await txt2img(options);
        const output: AttachmentBuilder = new AttachmentBuilder(Buffer.from(imgInfo.images[0], "base64"), { name: "output.png" });

        /* Update the previous embed with the generated image (and seed if a random seed was used). */
        await interaction.editReply({
            embeds: [
                responseEmbed
                    .setColor(sdCustomizations.finishedEmbedColor)
                    .setDescription(sdCustomizations.finishedEmbedDescription)
                    .setThumbnail(sdCustomizations.finishedEmbedThumbnail)
                    .setImage("attachment://output.png")
                    .setFooter({ text: `Seed: ${JSON.parse(imgInfo.info).seed}` })
                    // TODO: Add timestamps. Maybe total generation time.
            ],
            files: [ output ]
        });


        logCommand({
            source: "txt2img",
            interaction,
            parameters: {
                ...txt2imgParameterDefaults,
                ...options
            },
            result: "Success"
        });
    },
    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        // User's current input to the parameter field.
        const input: string = interaction.options.getFocused();
        // Message item to show in the list when the search results in more than 25 items (Discord's limit). This object takes up a space.
        const overflowMessage: ApplicationCommandOptionChoiceData = {
            name: "Refine your search to view more.",
            value: "-1"
        };

        /* If no search input, show a list of categories, otherwise show the search result. */
        if (!input.length) {
            const response: ApplicationCommandOptionChoiceData[] = [
                // Header item to show at the top of the list.
                { name: "Type to search by the following categories:", value: "-1" },
                // List of categories that the hypernetwork is sorted by.
                ...Object.keys(hypernetworkListSorted).map((hypernetwork: string) => { return { name: hypernetwork, value: hypernetwork} }).slice(0, (Object.keys(hypernetworkListSorted).length > 24) ? 23 : 24),
            ];

            // Including the header item, display the overflow message on the list if the total number of categories exceeds 25.
            if (Object.keys(hypernetworkListSorted).length > 23) {
                response.push(overflowMessage);
            }

            await interaction.respond(response);
        } else {
            // Filter the list of hypernetworks by the search term.
            const filtered: string[] = hypernetworkFlatList.filter((hypernetwork: string) => hypernetwork.includes(input));
            const response: ApplicationCommandOptionChoiceData[] = [
                // Hypernetwork names remove the attached category.
                ...filtered.map((hypernetwork: string) => { return { name: hypernetwork, value: hypernetwork.split(' - ').splice(-1)[0] } }).slice(0, (filtered.length > 25) ? 24 : 25),
            ];

            // Display the overflow message on the list if the total number of categories exceeds 25.
            if (filtered.length > 24) {
                response.push(overflowMessage);
            }

            await interaction.respond(response);
        }

    }
}

/**
 * Makes a POST request to stable-diffusion-webui's txt2img API with generator options in the body to generate an image.
 * 
 * Requests will time out after 2 mins of no response.
 * 
 * @param options An object containing image generation parameters.
 * @returns An object containing generated images encoded in base64, updated parameters and extra information.
 */
async function txt2img(options: ITxt2ImgPayload): Promise<ITxt2ImgResponse> {
    const data: ITxt2ImgPayload = { ...txt2imgParameterDefaults, ...options };

    return axios({
        method: "POST",
        url: sdAPI + "/sdapi/v1/txt2img/",
        timeout: sdCustomizations.requestTimeout,
        data
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