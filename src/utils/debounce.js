export const debounce = (callback, delay = 1000) => {
  let timerId = null;
  const _debounce = (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => callback.apply(this, args), delay);
  };

  _debounce.stop = () => {
    clearTimeout(timerId);
  };

  return _debounce;
};
