export const createEmitter = () => {
    let savedResolve;
    let savedReject;
    const emit = (eventName, ...args) => {
        if (eventName === 'resolve')
            return savedResolve(...args);
        if (eventName === 'reject')
            return savedReject(...args);
        // Event handlers are executed in a microtask
        // so that if events are fired right before event listeners are added,
        // the new event listeners are fired
        Promise.resolve().then(() => {
            const handlers = eventHandlers[eventName] || [];
            for (const handler of handlers)
                handler(...args);
        });
    };
    const on = (eventName, handler) => {
        (eventHandlers[eventName] ?? (eventHandlers[eventName] = [])).push(handler);
        return emitter; // Allow chaining
    };
    const promise = new Promise((resolve, reject) => {
        savedResolve = resolve;
        savedReject = reject;
    });
    const eventHandlers = {};
    const emitter = { promise, on, emit };
    return emitter;
};
