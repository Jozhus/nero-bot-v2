import axios, { AxiosResponse } from "axios"
import { sdAPI } from "../constants/stringConstants.js"
import { HypernetworkCategories, IHypernetworkItem, IHypernetworkList } from "../models/IHypernetworkItem.js";
import { normalize, sep } from "path";

const hypernetworkFlatList: string[] = [];
const hypernetworkListSorted: IHypernetworkList = {}; // No idea if I'll ever get to use this.

await axios({
    method: "GET",
    url: sdAPI + "/sdapi/v1/hypernetworks"
})
.then((response: AxiosResponse<IHypernetworkItem[]>) => {
    return response.data.forEach((hypernetwork: IHypernetworkItem) => {
        const pathElements: string[] = normalize(hypernetwork.path).split(sep);
        const category: HypernetworkCategories = pathElements[pathElements.indexOf("hypernetworks") + 1] as HypernetworkCategories;
        const name: string = pathElements[pathElements.indexOf("hypernetworks") + 2];

        if (!Object.keys(hypernetworkListSorted).includes(category)) {
            hypernetworkListSorted[category] = {};
        }

        if (!Object.keys(hypernetworkListSorted[category]).includes(name)) {
            hypernetworkListSorted[category][name] = [];
        }

        hypernetworkFlatList.push(`[${category}: ${name}] - ${hypernetwork.name}`);
        hypernetworkListSorted[category][name].push(hypernetwork.name);
    });
});

export { hypernetworkFlatList, hypernetworkListSorted };