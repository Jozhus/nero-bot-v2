import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandSubcommandBuilder, SlashCommandBooleanOption, SlashCommandStringOption, SlashCommandNumberOption, AutocompleteInteraction, ApplicationCommandOptionChoiceData } from "discord.js";
import { logCommand } from "../helpers/logger.js";
import { ICommand } from "../models/ICommand.js";
import { txt2imgDefaults } from "../constants/commandDefaults.js";
import axios, { AxiosError, AxiosResponse } from "axios";
import { sampleMethods, sdAPI } from "../constants/stringConstants.js";
import { ISettings, ITxt2ImgPayload, ITxt2ImgResponse, SamplingMethods } from "../models/ITxt2Img.js";
import { hypernetworkFlatList, hypernetworkListSorted } from "../helpers/constructSDList.js";
import { flattenObject } from "../helpers/flattenObject.js";

const command: ICommand = {
    data: new SlashCommandBuilder()
        .setName("sd")
        .setDescription("stable diffusion")
        .addSubcommand((subcommand: SlashCommandSubcommandBuilder) => 
            subcommand
            .setName("txt2img")
            .setDescription("Nero will generate an image for you based on your prompt. Leave empty to use txt2img UI.")
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName("prompt")
                    .setDescription("Text prompt for AI to think about")
                    .setMaxLength(1024)
                    .setRequired(true)
            )
            .addStringOption((option: SlashCommandStringOption) => 
                option.setName("negative_prompt")
                    .setDescription(`Text prompt for AI to avoid thinking about.`)
                    .setMaxLength(1024)
                    .setRequired(false)
            ).addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName("steps")
                    .setDescription(`How many times to improve the generated image iteratively. (Default: ${txt2imgDefaults.steps})`)
                    .setMinValue(1)
                    .setMaxValue(64)
                    .setRequired(false)
            ).addNumberOption((option: SlashCommandNumberOption) => 
                option.setName("guidance_strength")
                    .setDescription(`Classifier Free Guidance Scale. (Default: ${txt2imgDefaults.cfg_scale})`)
                    .setMinValue(1)
                    .setMaxValue(30)
                    .setRequired(false)
            )
            .addIntegerOption((option: SlashCommandIntegerOption) => 
                option.setName("seed")
                    .setDescription(`A value that determines the output of random number generator. (Default: Random)`)
                    .setMinValue(1)
                    .setRequired(false)
            ).addStringOption((option: SlashCommandStringOption) => 
                option.setName("sample_method")
                    .setDescription(`Which algorithm to use to produce the image. (Default: ${txt2imgDefaults.sampler_index})`)
                    .addChoices(...(sampleMethods.map((method: string) => {return { name: method, value: method }})))
                    .setRequired(false)
            ).addBooleanOption((option: SlashCommandBooleanOption) => 
                option.setName("fix_faces")
                    .setDescription(`Restore low quality faces using GFPGAN neural network. (Default: ${txt2imgDefaults.restore_faces})`)
                    .setRequired(false)
            ).addStringOption((option: SlashCommandStringOption) => 
            option.setName("hypernetwork")
                .setDescription(`Which algorithm to use to produce the image.`)
                .setAutocomplete(true)
                .setRequired(false)
            ).addNumberOption((option: SlashCommandNumberOption) => 
            option.setName("hypernetwork_strength")
                .setDescription(`Strength of the hypernetwork. (Default: ${txt2imgDefaults.override_settings.sd_hypernetwork_strength})`)
                .setMinValue(0)
                .setMaxValue(1)
                .setRequired(false)
        )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const prompt: string = interaction.options.getString("prompt");
        const negative_prompt: string = interaction.options.getString("negative_prompt");
        const steps: number = interaction.options.getInteger("steps");
        const cfg_scale: number = interaction.options.getNumber("guidance_strength");
        const seed: number = interaction.options.getInteger("seed");
        const sampler_index: SamplingMethods = interaction.options.getString("sample_method") as SamplingMethods;
        const restore_faces: boolean = interaction.options.getBoolean("fix_faces");
        const sd_hypernetwork: string = interaction.options.getString("hypernetwork");
        const sd_hypernetwork_strength: number = interaction.options.getNumber("hypernetwork_strength");

        /* Construct options object with given parameters only if they exist */
        const options: ITxt2ImgPayload = {
            prompt,
            ...(negative_prompt) && { negative_prompt },
            ...(steps) && { steps },
            ...(cfg_scale) && { cfg_scale },
            ...(seed) && { seed },
            ...(sampler_index) && { sampler_index },
            ...(restore_faces) && { restore_faces },
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
            .setColor(0x6786ed)
            .setThumbnail("https://i.imgur.com/0ZuHGyJ.png")
            .setDescription("Hang on a sec, I'm working on it!")
            .addFields(Object.entries(flattenObject(options)).map(([name, value]: [string, string | number | ISettings]) => {
                return {
                    name,
                    value: `${value}`,
                    inline: (!["prompt", "negative_prompt", "seed", "sd_hypernetwork", "sd_hypernetwork_strength"].includes(name))
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
                    .setColor(0x77dd77)
                    .setDescription("Here ya go!")
                    .setThumbnail("https://i.imgur.com/Jr2xoJw.png")
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
                ...txt2imgDefaults,
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
    const data: ITxt2ImgPayload = { ...txt2imgDefaults, ...options };

    return axios({
        method: "POST",
        url: sdAPI + "/sdapi/v1/txt2img/",
        timeout: 120000,
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