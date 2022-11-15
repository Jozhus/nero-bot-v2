// Please ignore all the generic / any types
function flattenObject(obj: Object): Object {
    const result = {};

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