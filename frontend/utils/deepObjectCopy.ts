export const deepObjectCopy = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
}