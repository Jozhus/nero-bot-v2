/**
 * Flattens a deep-branching object.
 * 
 * Please ignore all the generic / any types.
 * I didn't want to install an entire library when I only want one function that I could write on my own.
 * 
 * @param obj The object to flatten.
 * @returns A flattened version of the given object.
 */
function flattenObject(obj: Object): Object {
    const result: Object = {};

    Object.entries(obj).forEach(([prop, value]: [any, any]) => {
        if (typeof value === "object" && !Array.isArray(value)) {
            Object.entries(flattenObject(value)).forEach(([p, v]: [any, any]) => {
                result[p] = v;
            });
        } else {
            result[prop] = value;
        }
    });
 
    return result;
}

export { flattenObject }; 