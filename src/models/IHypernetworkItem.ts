import { hypernetworkCategories } from "../constants/stringConstants";

/**
 * Listed hypernetwork categories converted into a type to use for slash command parameter validation.
 */
type HypernetworkCategories = typeof hypernetworkCategories[number];

/**
 * Expected response schema of the stable-diffusion-webui API's hypernetworks endpoint.
 */
interface IHypernetworkItem {
    /**
     * Name of the hypernetwork.
     */
    name: string;
    /**
     * Absolute path of the hypernetwork file on the system.
     */
    path: string;
};

/**
 * Generalized schema for the parsed hypernetwork response.
 */
type IHypernetworkList = {
    [category in HypernetworkCategories]?: {
        [hypernetwork: string]: string[];
    };
};

export { IHypernetworkItem, IHypernetworkList, HypernetworkCategories };