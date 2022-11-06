import { fileURLToPath } from 'url';
import { dirname } from "path";

// __dirname is not defined globally for reasons, so here is a hacky workaround.
const rootDir: string = dirname(fileURLToPath(import.meta.url)).replace("constants", '');

const loginToken: string = process.env.TOKEN;
const clientId: string = process.env.CLIENTID;

export { rootDir, loginToken, clientId };