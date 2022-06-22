import Crawler from 'simplecrawler';
import { createEmitter } from './emitter.js';
import { isContentTypeHtml } from './utilities.js';
import globrex from 'globrex';
export const crawl = (siteUrl, opts) => {
    const { on, emit, promise } = createEmitter();
    const crawler = new Crawler(siteUrl);
    if (opts.userAgent)
        crawler.userAgent = opts.userAgent;
    crawler.respectRobotsTxt = !opts.ignoreRobotsTxt;
    if (opts.maxCrawlDepth !== undefined)
        crawler.maxDepth = opts.maxCrawlDepth;
    const initialPath = new URL(siteUrl).pathname;
    crawler.addFetchCondition(createUrlFilter(opts.includePathGlob.length > 0
        ? [...opts.includePathGlob, initialPath]
        : [], opts.excludePathGlob));
    const emitWarning = (queueItem, response) => {
        emit('warning', `Error fetching (${response.statusCode}): ${queueItem.url}`);
    };
    crawler.on('fetchcomplete', (queueItem, responseBuffer, response) => {
        const url = queueItem.url;
        const contentType = response.headers['content-type'];
        if (!isContentTypeHtml(contentType))
            return;
        const statusCode = response.statusCode;
        if (!contentType || !statusCode)
            return;
        emit('urlFound', url, contentType, responseBuffer.length, statusCode);
    });
    crawler.on('complete', () => emit('resolve'));
    crawler.on('fetcherror', emitWarning);
    crawler.on('fetch404', emitWarning);
    crawler.on('fetch410', emitWarning);
    crawler.start();
    return { on, promise };
};
export const createUrlFilter = (includeGlob, excludeGlob) => {
    const pathIncludeRegexes = includeGlob.map((glob) => globrex(glob.replace(/\/$/, ''), globOpts).regex);
    const pathExcludeRegexes = excludeGlob.map((glob) => globrex(glob.replace(/\/$/, ''), globOpts).regex);
    return ({ path }) => {
        const withoutTrailingSlash = path.replace(/\/$/, '');
        return ((pathIncludeRegexes.length === 0 ||
            pathIncludeRegexes.some((regex) => regex.test(withoutTrailingSlash))) &&
            !pathExcludeRegexes.some((regex) => regex.test(withoutTrailingSlash)));
    };
};
const globOpts = { globstar: true, extended: true };
