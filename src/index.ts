import { fileURLToPath } from 'url';
import { dirname, resolve } from "path";
import dotenv from "dotenv";

const rootDir = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(rootDir, "../.env") });

import("./bot.js");

export { rootDir };