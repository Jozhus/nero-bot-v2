import { ICommandParameterConstraints, ICommandParameterDefaults } from "../models/ICommand";
import { IRollOptions } from "../models/IRollOptions";
import { ISDCustomizations } from "../models/ISD";

const rollParameterDefaults: IRollOptions = {
    amount: 1,
    sides: 100
};

const rollParameterConstraints: ICommandParameterConstraints = {
    /* Parameters */
    minAmount: 1,
    maxDice: 50,
    minSides: 1
};

const sdParameterDefaults: ICommandParameterDefaults = {
    prompt: "",
    steps: 32,
    cfg_scale: 7,
    width: 512,
    height: 512,
    negative_prompt: "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts,signature, watermark, username, blurry, artist name",
    sampler_index: "Euler",
    restore_faces: false,
    enable_hr: false,
    firstphase_width: 0,
    firstphase_height: 0,
    denoising_strength: 0.7,
    seed: -1,
    resize_mode: 1,
    override_settings: {
        sd_model_checkpoint: "Anything-V3.0-pruned-fp32.ckpt [1a7df6b8]",
        sd_hypernetwork: "None",
        sd_hypernetwork_strength: 1
    }
};

const sdParameterConstraints: ICommandParameterConstraints = {
    maxPrompt: 1024, // Discord limitation
    maxNegative_prompt: 1024, // Discord limitation
    minSteps: 1,
    maxSteps: 150,
    minCfg_scale: 1,
    maxCfg_scale: 30,
    dimensionFactor: 8, // Makes sure image dimensions are divisible by dimensionFactor
    minWidth: 64,
    maxWidth: 1024,
    minHeight: 64,
    maxHeight: 1024,
    minFirstphase_width: 0,
    maxFirstphase_width: 1024,
    minFirstphase_height: 0,
    maxFirstphase_height: 1024,
    minDenoising_strength: 0,
    maxDenoising_strength: 1,
    minSeed: -1, // -1 = Random seed
    minHypernetwork_strength: 0,
    maxHypernetwork_strength: 1
};

const sdCustomizations: ISDCustomizations = {
    unfinishedEmbedColor: 0x6786ed,
    unfinishedEmbedThumbnail: "https://i.imgur.com/0ZuHGyJ.png",
    unfinishedEmbedDescription: "Hang on a sec, I'm working on it!",
    finishedEmbedColor: 0x77dd77,
    finishedEmbedThumbnail: "https://i.imgur.com/Jr2xoJw.png",
    finishedEmbedDescription: "Here ya go!",
    embedParametersIgnore: ["init_images"],
    embedParametersNoInline: ["prompt", "negative_prompt", "seed", "sd_hypernetwork", "sd_hypernetwork_strength"],
    requestTimeout: 120000
};

export { rollParameterDefaults, rollParameterConstraints, sdParameterDefaults, sdParameterConstraints, sdCustomizations };
