import axios, { AxiosError, AxiosResponse } from "axios";

function imgUrl2Base64(url: string): Promise<string> {
    return axios({
        method: "GET",
        url,
        responseType: "arraybuffer"
    })
    .then((response: AxiosResponse<string>) => {
        return Buffer.from(response.data, "binary").toString("base64");
    })
    .catch((err: AxiosError) => {
        // TODO: Use logger
        throw err;
    });
}

export { imgUrl2Base64 }