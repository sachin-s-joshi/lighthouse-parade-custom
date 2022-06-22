import { createEmitter } from './emitter.js';
export const createFakeCrawler = () => {
    const { emit, on, promise } = createEmitter();
    return {
        fakeCrawler: () => ({
            promise,
            on,
        }),
        emit,
    };
};
