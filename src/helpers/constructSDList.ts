import axios, { AxiosError, AxiosResponse } from "axios"
import { sdAPI } from "../constants/stringConstants.js"
import { HypernetworkCategories, IHypernetworkItem, IHypernetworkList } from "../models/IHypernetworkItem.js";
import { normalize, sep } from "path";
import { IModelItem } from "../models/IModelItem.js";

/* Provide both flat and sorted list of available hypernetworks. */
let modelList: IModelItem[] = [];
const hypernetworkFlatList: string[] = [];
const hypernetworkListSorted: IHypernetworkList = {};

// TODO: Throw these into function to update them on-demand.

await axios({
    method: "GET",
    url: sdAPI + "/sdapi/v1/sd-models"
})
.then((response: AxiosResponse<IModelItem[]>) => {
    modelList = response.data;
})
.catch((err: AxiosError) => {
    // TODO: Use logger
    throw err;
});

await axios({
    method: "GET",
    url: sdAPI + "/sdapi/v1/hypernetworks"
})
.then((response: AxiosResponse<IHypernetworkItem[]>) => {
    response.data.forEach((hypernetwork: IHypernetworkItem) => {
        /* Parse the absolute path of the hypernetwork's file to determine both the category it belongs and its name. */
        const pathElements: string[] = normalize(hypernetwork.path).split(sep);
        const category: HypernetworkCategories = pathElements[pathElements.indexOf("hypernetworks") + 1] as HypernetworkCategories;
        const name: string = pathElements[pathElements.indexOf("hypernetworks") + 2];

        /* Instantiate the categories / hypernetwork name's folder if they don't already exist. */
        if (!Object.keys(hypernetworkListSorted).includes(category)) {
            hypernetworkListSorted[category] = {};
        }

        if (!Object.keys(hypernetworkListSorted[category]).includes(name)) {
            hypernetworkListSorted[category][name] = [];
        }

        hypernetworkFlatList.push(`[${category}: ${name}] - ${hypernetwork.name}`);
        hypernetworkListSorted[category][name].push(hypernetwork.name);
    });
})
.catch((err: AxiosError) => {
    // TODO: Use logger
    throw err;
});

export { hypernetworkFlatList, hypernetworkListSorted, modelList };