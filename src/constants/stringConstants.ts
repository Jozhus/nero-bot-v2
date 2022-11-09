import { fileURLToPath } from 'url';
import { dirname } from "path";

// __dirname is not defined globally for reasons, so here is a hacky workaround.
const rootDir: string = dirname(fileURLToPath(import.meta.url)).replace("constants", '');

const loginToken: string = process.env.TOKEN;
const clientId: string = process.env.CLIENTID;
const sdAPI: string = process.env.SDAPI_TXT2IMG;

export { rootDir, loginToken, clientId, sdAPI };