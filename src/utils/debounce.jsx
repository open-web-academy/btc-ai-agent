export function debounce(fn, delay) {
  let timeout;

  return async function (...args) {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(async () => {
        const result = await fn(...args);
        resolve(result);
      }, delay);
    });
  };
}