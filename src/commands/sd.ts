import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, AutocompleteInteraction, ApplicationCommandOptionChoiceData, SlashCommandBooleanOption, SlashCommandIntegerOption, SlashCommandNumberOption, SlashCommandStringOption, SlashCommandAttachmentOption, Attachment } from "discord.js";
import { logCommand } from "../helpers/logger.js";
import { ICommand } from "../models/ICommand.js";
import { sdParameterDefaults, sdCustomizations, sdParameterConstraints } from "../constants/commandConstants.js";
import axios, { AxiosError, AxiosResponse } from "axios";
import { resize_modes, sampleMethods, sdAPI } from "../constants/stringConstants.js";
import { ISDSettings, ITxt2ImgPayload, ISDResponse, SamplingMethods, IImg2ImgPayload } from "../models/ISD.js";
import { hypernetworkFlatList, hypernetworkListSorted, modelList } from "../helpers/constructSDList.js";
import { flattenObject } from "../helpers/flattenObject.js";
import { IModelItem } from "../models/IModelItem.js";
import { imgUrl2Base64 } from "../helpers/imgUrl2Base64.js";
import { round2NearestFactor } from "../helpers/round2NearestFactor.js";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("sd")
        .setDescription("Nero will generate an image for you based on your prompt. Attach an image to modify that image.")
        .addStringOption((option: SlashCommandStringOption) => 
            option.setName("prompt")
                .setDescription("Text prompt for AI to think about.")
                .setMaxLength(sdParameterConstraints.maxPrompt)
                .setRequired(false)
        ).addAttachmentOption((option: SlashCommandAttachmentOption) => 
            option.setName("img2img")
                .setDescription("Upload an image to enable img2img mode. Dimensions is preserved and scaled if not provided.")
                .setRequired(false)
        )
        .addStringOption((option: SlashCommandStringOption) => 
            option.setName("negative_prompt")
                .setDescription(`Text prompt for AI to avoid thinking about.`)
                .setMaxLength(sdParameterConstraints.maxNegative_prompt)
                .setRequired(false)
        ).addIntegerOption((option: SlashCommandIntegerOption) => 
            option.setName("steps")
                .setDescription(`How many times to improve the generated image iteratively. (Default: ${sdParameterDefaults.steps})`)
                .setMinValue(sdParameterConstraints.minSteps)
                .setMaxValue(sdParameterConstraints.maxSteps)
                .setRequired(false)
        ).addNumberOption((option: SlashCommandNumberOption) => 
            option.setName("guidance_strength")
                .setDescription(`Classifier Free Guidance Scale. (Default: ${sdParameterDefaults.cfg_scale})`)
                .setMinValue(sdParameterConstraints.minCfg_scale)
                .setMaxValue(sdParameterConstraints.maxCfg_scale)
                .setRequired(false)
        ).addIntegerOption((option: SlashCommandIntegerOption) => 
            option.setName("width")
                .setDescription(`Width of the generated image. Must be divisible by 64 or it will round up. (Default: ${sdParameterDefaults.width})`)
                .setMinValue(sdParameterConstraints.minWidth)
                .setMaxValue(sdParameterConstraints.maxWidth)
                .setRequired(false)
        ).addIntegerOption((option: SlashCommandIntegerOption) => 
            option.setName("height")
                .setDescription(`Height of the generated image. Must be divisible by 64 or it will round up. (Default: ${sdParameterDefaults.height})`)
                .setMinValue(sdParameterConstraints.minHeight)
                .setMaxValue(sdParameterConstraints.maxHeight)
                .setRequired(false)
        )
        .addStringOption((option: SlashCommandStringOption) => 
            option.setName("sample_method")
                .setDescription(`Which algorithm to use to produce the image. (Default: ${sdParameterDefaults.sampler_index})`)
                .addChoices(...(sampleMethods.map((method: string) => {return { name: method, value: method }})))
                .setRequired(false)
        ).addBooleanOption((option: SlashCommandBooleanOption) => 
            option.setName("restore_faces")
                .setDescription(`Restore low quality faces using GFPGAN neural network. (Default: ${sdParameterDefaults.restore_faces})`)
                .setRequired(false)
        ).addNumberOption((option: SlashCommandNumberOption) => 
            option.setName("denoising_strength")
                .setDescription(`Determines how little respect the algorithm should have for image's content. (Default: ${sdParameterDefaults.denoising_strength})`)
                .setMinValue(sdParameterConstraints.minDenoising_strength)
                .setMaxValue(sdParameterConstraints.maxDenoising_strength)
                .setRequired(false)
        ).addIntegerOption((option: SlashCommandIntegerOption) => 
            option.setName("seed")
                .setDescription(`A value that determines the output of random number generator. (Default: Random)`)
                .setMinValue(sdParameterConstraints.minSeed)
                .setRequired(false)
        ).addStringOption((option: SlashCommandStringOption) => 
            option.setName("model")
                .setDescription(`Which training model to use. (Default: ${sdParameterDefaults.override_settings.sd_model_checkpoint})`)
                .addChoices(...modelList.map((model: IModelItem) => { return { name: model.title, value: model.title } })) // Might want to turn this into an autocomplete in the future.
                .setRequired(false)
        ).addStringOption((option: SlashCommandStringOption) => 
            option.setName("hypernetwork")
                .setDescription(`Which algorithm to use to produce the image.`)
                .setAutocomplete(true)
                .setRequired(false)
        ).addNumberOption((option: SlashCommandNumberOption) => 
            option.setName("hypernetwork_strength")
                .setDescription(`Strength of the hypernetwork. (Default: ${sdParameterDefaults.override_settings.sd_hypernetwork_strength})`)
                .setMinValue(sdParameterConstraints.minHypernetwork_strength)
                .setMaxValue(sdParameterConstraints.maxHypernetwork_strength)
                .setRequired(false)
        ).addBooleanOption((option: SlashCommandBooleanOption) => 
            option.setName("highres_fix")
                .setDescription(`[txt2img] Create image at smaller resolution and upscales to improve the details. (Default: ${sdParameterDefaults.enable_hr})`)
                .setRequired(false)
        ).addIntegerOption((option: SlashCommandIntegerOption) => 
            option.setName("firstpass_width")
                .setDescription(`[txt2img] Width of the first pass image when highres fix is enabled. (Default: ${sdParameterDefaults.firstphase_width})`)
                .setMinValue(sdParameterConstraints.minFirstphase_width)
                .setMaxValue(sdParameterConstraints.maxFirstphase_width)
                .setRequired(false)
        ).addIntegerOption((option: SlashCommandIntegerOption) => 
            option.setName("firstpass_height")
                .setDescription(`[txt2img] A value that determines the output of random number generator. (Default: ${sdParameterDefaults.firstphase_height})`)
                .setMinValue(sdParameterConstraints.minFirstphase_height)
                .setMaxValue(sdParameterConstraints.maxFirstphase_height)
                .setRequired(false)
        ).addIntegerOption((option: SlashCommandIntegerOption) => 
            option.setName("resize_mode")
                .setDescription(`[img2img] Resize modes (Default: ${resize_modes[sdParameterDefaults.resize_mode]})`)
                .addChoices(...resize_modes.map((mode: string, index: number) => { return { name: mode, value: index } }))
                .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const attachment: Attachment = interaction.options.getAttachment("img2img");
        const command: string = (attachment?.contentType.includes("image")) ? "img2img" : "txt2img";
        const prompt: string = interaction.options.getString("prompt");
        const negative_prompt: string = interaction.options.getString("negative_prompt");
        const steps: number = interaction.options.getInteger("steps");
        const cfg_scale: number = interaction.options.getNumber("guidance_strength");
        let width: number = interaction.options.getInteger("width");
        let height: number = interaction.options.getInteger("height");
        const sampler_index: SamplingMethods = interaction.options.getString("sample_method") as SamplingMethods;
        const restore_faces: boolean = interaction.options.getBoolean("fix_faces");
        const denoising_strength: number = interaction.options.getNumber("denoising_strength");
        const seed: number = interaction.options.getInteger("seed");
        const sd_model_checkpoint: string = interaction.options.getString("model");
        const sd_hypernetwork: string = interaction.options.getString("hypernetwork");
        const sd_hypernetwork_strength: number = interaction.options.getNumber("hypernetwork_strength");
        
        let options: ITxt2ImgPayload | IImg2ImgPayload = {};

        switch (command) {
            case "txt2img":
                const enable_hr: boolean = interaction.options.getBoolean("highres_fix");
                let firstphase_width: number = interaction.options.getInteger("firstpass_width");
                let firstphase_height: number = interaction.options.getInteger("firstpass_height");

                /* Round up to the nearest divisible of dimensionFactor. */
                firstphase_width = round2NearestFactor(firstphase_height, sdParameterConstraints.dimensionFactor);
                firstphase_height = round2NearestFactor(firstphase_height, sdParameterConstraints.dimensionFactor);

                options = {
                    ...options,
                    ...(enable_hr) && { enable_hr },
                    ...(firstphase_width) && { firstphase_width },
                    ...(firstphase_height) && { firstphase_height }
                }
                break;
            case "img2img":
                if (!attachment) {
                    break;
                }

                const init_images: string[] = [ await imgUrl2Base64(attachment.url) ];
                const resize_mode: number = interaction.options.getInteger("resize_mode");

                /* Maintain resolution by calculating missing values. */

                const resRatio: number =  Math.max(attachment.width, attachment.height) / Math.min(attachment.width, attachment.height);

                /* If no dimensions are given, start with default width size. */
                if (!width && !height) {
                    width = sdParameterDefaults.width;
                }

                /* Calculations with resRatio depends on which dimension is larger. */
                if (width) {
                    if (!height) {
                        height = (attachment.width > attachment.height) ? width / resRatio : width * resRatio;
                    }
                } else {
                    if (height) {
                        width = (attachment.width > attachment.height) ? height * resRatio : height / resRatio;
                    }
                }

                /* Scale image down to constraint values if either surpass the constraint maxes. */
                if (width > sdParameterConstraints.maxWidth || height > sdParameterConstraints.maxHeight) {
                    const scale: number = Math.max(sdParameterConstraints.maxWidth, sdParameterConstraints.maxHeight) / Math.max(width, height);

                    width *= scale;
                    height *= scale;
                }

                options = {
                    ...options,
                    ...(init_images) && { init_images },
                    ...(resize_mode) && { resize_mode }
                };
                break;
        }

        /* Round up to the nearest divisible of dimensionFactor. */
        width = Math.ceil(width / sdParameterConstraints.dimensionFactor) * sdParameterConstraints.dimensionFactor;
        height = Math.ceil(height / sdParameterConstraints.dimensionFactor) * sdParameterConstraints.dimensionFactor;

        /* Construct options object with given parameters only if they exist. */
        options = {
            prompt,
            ...options,
            ...(negative_prompt) && { negative_prompt },
            ...(steps) && { steps },
            ...(cfg_scale) && { cfg_scale },
            ...(width) && { width },
            ...(height) && { height },
            ...(sampler_index) && { sampler_index },
            ...(restore_faces) && { restore_faces },
            ...(denoising_strength) && { denoising_strength },
            ...(seed) && { seed },
            override_settings: {
                ...(sd_model_checkpoint) && { sd_model_checkpoint },
                ...(sd_hypernetwork) && { sd_hypernetwork },
                ...(sd_hypernetwork_strength) && { sd_hypernetwork_strength }
            }
        }

        // TODO: Maybe make a template for other commands to use
        /* Placeholder embed to reply with while waiting on response from stable-diffusion-webui's API. */
        const responseEmbed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({ name: command, iconURL: "https://i.imgur.com/HEj61LF.png" })
            .setTitle("Nero-bot")
            .setColor(sdCustomizations.unfinishedEmbedColor)
            .setThumbnail(sdCustomizations.unfinishedEmbedThumbnail)
            .setDescription(sdCustomizations.unfinishedEmbedDescription)
            .setImage((command === "img2img") ? attachment.url : null)
            .addFields(Object.entries(flattenObject(options)).filter(([name, value]: [string, string | number | ISDSettings]) => !sdCustomizations.embedParametersIgnore.includes(name)).map(([name, value]: [string, string | number | ISDSettings]) => {
                return {
                    name,
                    value: `${value}`,
                    inline: (!sdCustomizations.embedParametersNoInline.includes(name))
                };
            }))
            .setFooter((options.seed) ? { text: `Seed: ${options.seed}` } : null);

        await interaction.reply({ embeds: [ responseEmbed ] });

        /* Get generated image and convert it from base64 to an image buffer. */
        const now: number = performance.now();
        
        const imgInfo: ISDResponse = await generateImage(command, options); // TODO: Error handle.

        const then: number = performance.now();
        const timeTaken: number = (then - now) / 1000;
        const timeString: string = `${`${Math.floor(timeTaken / 60)}`.padStart(2, '0')}:${`${(timeTaken % 60).toFixed(2)}`.padStart(5, '0')}`;
        const output: AttachmentBuilder = new AttachmentBuilder(Buffer.from(imgInfo.images[0], "base64"), { name: "output.png" });

        /* Update the previous embed with the generated image (and seed if a random seed was used). */
        await interaction.editReply({
            embeds: [
                responseEmbed
                    .setColor(sdCustomizations.finishedEmbedColor)
                    .setDescription(sdCustomizations.finishedEmbedDescription)
                    .setThumbnail(sdCustomizations.finishedEmbedThumbnail)
                    .addFields((command === "img2img") ? [ { 
                        name: "init_images",
                        value: `[${attachment.name}](${attachment.url})`
                     } ] : [])
                    .setImage("attachment://output.png")
                    .setFooter({ text: `Seed: ${JSON.parse(imgInfo.info).seed}\t\tTime taken: ${timeString}` })
            ],
            files: [ output ]
        });

        logCommand({
            source: command,
            interaction,
            parameters: {
                ...sdParameterDefaults,
                ...Object.entries(flattenObject(options)).filter(([name, value]: [string, string | number | ISDSettings]) => !sdCustomizations.embedParametersIgnore.includes(name))
            },
            result: `Success. Time taken: ${timeString}`
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
 * Makes a POST request to stable-diffusion-webui's API with generator options in the body to generate an image.
 * 
 * Requests will time out after 2 mins of no response.
 * 
 * @param options An object containing image generation parameters.
 * @returns An object containing generated images encoded in base64, updated parameters and extra information.
 */
function generateImage(method: string, options: ITxt2ImgPayload | IImg2ImgPayload): Promise<ISDResponse> {
    if (!["txt2img", "img2img"].includes(method)) {
        throw new Error("Invalid image generation method!");
    }

    const data: ITxt2ImgPayload | IImg2ImgPayload = { ...sdParameterDefaults, ...options };

    return axios({
        method: "POST",
        url: sdAPI + "/sdapi/v1/" + method,
        timeout: sdCustomizations.requestTimeout,
        data
    })
    .then((response: AxiosResponse<ISDResponse>) => {
        return response.data;
    })
    .catch((err: AxiosError) => {
        // TODO: Use logger
        throw err;
    });
}

export { command, generateImage as txt2img };