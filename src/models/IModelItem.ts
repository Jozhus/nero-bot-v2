/**
 * Expected response schema of the stable-diffusion-webui API's models endpoint.
 */
 interface IModelItem {
    /**
     * Full title of the model name including hash.
     */
    title: string;
    /**
     * Name of the model.
     */
    model_name: string;
    /**
     * Hash of the model
     */
    hash: string;
    /**
     * Absolute path of the model file.
     */
    filename: string;
    /**
     * Absolute path of the model's config file.
     */
    config: string;
};

export { IModelItem };