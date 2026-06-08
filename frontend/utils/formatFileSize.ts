export const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    const kbSize = size / 1024;
    if (kbSize < 1024) return `${kbSize.toFixed(2)} KB`;
    const mbSize = kbSize / 1024;
    return `${mbSize.toFixed(2)} MB`;
};