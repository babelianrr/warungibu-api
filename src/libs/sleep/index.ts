export const resolveTimeout = (time = 8000) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, time);
    });
