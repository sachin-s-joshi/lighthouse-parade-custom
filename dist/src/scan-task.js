import fs from 'fs';
import { runLighthouseReport } from './lighthouse.js';
import { crawl as defaultCrawler } from './crawl.js';
import { createEmitter } from './emitter.js';
export const scan = (siteUrl, { crawler = defaultCrawler, lighthouse = runLighthouseReport, dataDirectory, lighthouseConcurrency, ...opts }) => {
    const { promise, on, emit } = createEmitter();
    fs.mkdirSync(dataDirectory, { recursive: true });
    /** Used so we can display an error if no pages are found while crawling */
    let hasFoundAnyPages = false;
    emit('info', 'Starting the crawl...');
    const crawlerEmitter = crawler(siteUrl, opts);
    const lighthousePromises = [];
    crawlerEmitter.on('urlFound', (url, contentType, bytes, statusCode) => {
        hasFoundAnyPages = true;
        emit('urlFound', url, contentType, bytes, statusCode);
        lighthousePromises.push(new Promise((resolve) => {
            lighthouse(url, lighthouseConcurrency)
                .on('begin', () => emit('reportBegin', url))
                .on('complete', (reportData) => {
                emit('reportComplete', url, reportData);
                resolve();
            })
                .on('error', (error) => {
                emit('reportFail', url, error);
                // Resolves instead of rejects because we want to continue with the other lighthouses even if one fails
                resolve();
            });
        }));
    });
    crawlerEmitter.on('warning', (message) => emit('warning', message));
    crawlerEmitter.promise
        .then(async () => {
        await Promise.all(lighthousePromises);
        emit('info', 'Scan complete');
        if (!hasFoundAnyPages) {
            emit('warning', `No pages were found for this site. The two most likely reasons for this are:
1) the URL is incorrect
2) the crawler is being denied by a robots.txt file`);
            return;
        }
        emit('resolve');
    })
        .catch((error) => emit('reject', error));
    return { promise, on };
};
