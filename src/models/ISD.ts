import { sampleMethods } from "../constants/stringConstants";

/**
 * Listed sampling methods converted into a type to use for slash command parameter validation.
 */
type SamplingMethods = typeof sampleMethods[number];

/**
 * Schema for the body of the POST request when interfacing with the stable-diffusion-webui API's txt2img endpoint.
 */
interface ITxt2ImgPayload {
    /**
     * Use a two step process to partially create an image at smaller resolution, upscale, and then improve details in it without changing composition
     */
    enable_hr?: boolean;
    /**
     * Determines how little respect the algorithm should have for image's content. At 0, nothing will change, and at 1 you'll get an unrelated image. With values below 1.0, processing will take less steps than the Sampling Steps slider specifies.
     */
    denoising_strength?: number;
    /**
     * Width of the first pass image when highres fix is enabled.
     */
    firstphase_width?: number;
    /**
     * Height of the first pass image when highres fix is enabled.
     */
    firstphase_height?: number;
    /**
     * Text prompt for AI to think about
     */
    prompt: string;
    /**
     * Style to apply; styles have components for both positive and negative prompts and apply to bot
     */
    styles?: string[];
    /**
     * A value that determines the output of random number generator - if you create an image with same parameters and seed as another image, you'll get the same result
     */
    seed?: number;
    /**
     * Seed of a different picture to be mixed into the generation.
     */
    subseed?: number;
    /**
     * How strong of a variation to produce. At 0, there will be no effect. At 1, you will get the complete picture with variation seed (except for ancestral samplers, where you will just get something).
     */
    subseed_strength?: number;
    /**
     * Make an attempt to produce a picture similar to what would have been produced with same seed at specified resolution
     */
    seed_resize_from_h?: number;
    /**
     * Make an attempt to produce a picture similar to what would have been produced with same seed at specified resolution
     */
    seed_resize_from_w?: number;
    /**
     * How many image to create in a single batch
     */
    batch_size?: number;
    /**
     * How many batches of images to create
     */
    n_iter?: number;
    /**
     * How many times to improve the generated image iteratively; higher values take longer; very low values can produce bad results
     */
    steps?: number;
    /**
     * Classifier Free Guidance Scale - how strongly the image should conform to prompt - lower values produce more creative results
     */
    cfg_scale?: number;
    /**
     * Width of the generated image
     */
    width?: number;
    /**
     * Height of the generated image
     */
    height?: number;
    /**
     * Restore low quality faces using GFPGAN neural network
     */
    restore_faces?: boolean;
    /**
     * Produce an image that can be tiled
     */
    tiling?: boolean;
    /**
     * Text prompt for AI to avoid thinking about
     */
    negative_prompt?: string;
    /**
     * If this values is non-zero, it will be added to seed and used to initialize RNG for noises when using samplers with Eta. You can use this to produce even more variation of images, or you can use this to match images of other software if you know what you are doing.
     */
    eta?: number;
    s_churn?: number;
    s_tmax?: number;
    s_tmin?: number;
    s_noise?: number;
    /**
     * Which algorithm to use to produce the image
     */
    sampler_index?: SamplingMethods;
    /**
     * A list of settings and values to override the current settings only for the single interaction.
     */
    override_settings?: ISDSettings
};

/**
 * Expected response schema of the stable-diffusion-webui API's txt2img endpoint.
 */
interface ITxt2ImgResponse {
    /**
     * A list of output images encoded in base64.
     */
    images: string[];
    /**
     * A list of updated parameters that stable-diffusion used in generating the images.
     */
    parameters: ITxt2ImgPayload;
    /**
     * Extra information provided by stable-diffusion that resulted from generating images.
     */
    info: string;
};

/**
 * A schema for all of stable-diffusion-webui's internal settings.
 * There are so many more, but I will add only the ones I plan to use.
 */
interface ISDSettings {
    /**
     * The name of the hypernetwork being used.
     */
    sd_hypernetwork?: string;
    /**
     * The strength of the hypernetwork's affect on the current model.
     */
    sd_hypernetwork_strength?: number;
}

interface ISDCustomizations {
    /**
     * Sidebar color of embed while image is generating.
     */
    unfinishedEmbedColor: number;
    /**
     * Link of image to use for the embed while image is generating.
     */
    unfinishedEmbedThumbnail: string | null;
    /**
     * Description of embed while image is generating.
     */
    unfinishedEmbedDescription: string | null;
    /**
     * Sidebar color of embed after image finishes generating.
     */
    finishedEmbedColor: number;
    /**
     * Link of image to use for the embed after image finishes generating.
     */
    finishedEmbedThumbnail: string | null;
    /**
     * Description of embed after image finishes generating.
     */
    finishedEmbedDescription: string | null;
    /**
     * A list of parameters to not be inline when displayed within the embed.
     */
    embedParametersNoInline: string[];
    /**
     * Milliseconds before RESTful request times out.
     */
    requestTimeout: number;
}

export { ITxt2ImgPayload, ITxt2ImgResponse, SamplingMethods, ISDSettings, ISDCustomizations };