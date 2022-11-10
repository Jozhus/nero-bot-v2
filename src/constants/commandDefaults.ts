import { IRollOptions } from "../models/IRollOptions";
import { ITxt2ImgPayload } from "../models/ITxt2Img";

const rollDefaults: IRollOptions = {
    amount: 1,
    sides: 100,
    maxDice: 50
};

const txt2imgDefaults: ITxt2ImgPayload = {
    prompt: "",
    steps: 32,
    cfg_scale: 12,
    width: 512,
    height: 512,
    negative_prompt: "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts,signature, watermark, username, blurry, artist name",
    sampler_index: "Euler",
    restore_faces: false,
    seed: -1
};

export { rollDefaults, txt2imgDefaults };
