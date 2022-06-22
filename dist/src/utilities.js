import sanitize from 'sanitize-filename';
export const isContentTypeHtml = (contentType) => {
    return contentType?.toLowerCase().includes('html');
};
export const usefulDirName = () => {
    const date = new Date();
    const iso = date.toISOString();
    const withoutColons = iso.replace(/:/g, '_');
    const trimmed = withoutColons.split('.')[0];
    return trimmed;
};
export const makeFileNameFromUrl = (url, extension) => {
    const newUrl = url.replace(/\./g, '_').replace(/\//g, '-');
    return `${sanitize(newUrl)}.${extension}`;
};
