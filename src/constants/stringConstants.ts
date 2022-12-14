import { fileURLToPath } from 'url';
import { dirname } from "path";

// __dirname is not defined globally for reasons, so here is a hacky workaround.
const rootDir: string = dirname(fileURLToPath(import.meta.url)).replace("constants", '');

const loginToken: string = process.env.TOKEN;
const clientId: string = process.env.CLIENTID;
const sdAPI: string = process.env.SDAPI;
const sampleMethods = ["Euler a", "Euler", "LMS", "Heun", "DPM2", "DPM2 a", "DPM++ 2S a", "DPM++ 2M", "DPM++ 2M", "DPM fast", "DPM adaptive", "LMS Karras", "DPM2 Karras", "DPM2 a Karras", "DPM++ 2S a Karras", "DPM++ 2M Karras", "DPM++ SDE Karras", "DDIM", "PLMS"] as const;
const hypernetworkCategories = ["anime", "artist", "character", "game"] as const;
const resize_modes: string[] = ["Just resize", "Crop and resize", "Resize and fill"];

export { rootDir, loginToken, clientId, sdAPI, sampleMethods, hypernetworkCategories, resize_modes };