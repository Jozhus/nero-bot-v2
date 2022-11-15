import { hypernetworkCategories } from "../constants/stringConstants";

type HypernetworkCategories = typeof hypernetworkCategories[number];

interface IHypernetworkItem {
    name: string;
    path: string;
};

type IHypernetworkList = {
    [category in HypernetworkCategories]?: {
        [hypernetwork: string]: string[];
    };
};

export { IHypernetworkItem, IHypernetworkList, HypernetworkCategories };