import { sampleMethods } from "../constants/stringConstants";

type SamplingMethods = typeof sampleMethods[number];

interface ITxt2ImgPayload {
    /**
     * Use a two step process to partially create an image at smaller resolution, upscale, and then improve details in it without changing composition
     */
    enable_hr?: boolean;
    /**
     * Determines how little respect the algorithm should have for image's content. At 0, nothing will change, and at 1 you'll get an unrelated image. With values below 1.0, processing will take less steps than the Sampling Steps slider specifies.
     */
    denoising_strength?: number;
    firstphase_width?: number;
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
     * Width of output image
     */
    width?: number;
    /**
     * Heigh of output image
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
    override_settings?: ISettings
};

interface ITxt2ImgResponse {
    images: string[];
    parameters: ITxt2ImgPayload;
    info: string;
};

interface ISettings {
    sd_hypernetwork?: string;
    sd_hypernetwork_strength?: number;
    // There are so many more, but I will add only the ones I plan to use
}

export { ITxt2ImgPayload, ITxt2ImgResponse, SamplingMethods, ISettings };