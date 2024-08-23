export function parsePath(path) {
  const bailRE = /[^\w.$]/;
  if (bailRE.test(path)) return;
  const segments = path.split('.');
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}

export function isObj(obj) {
  return obj !== null && typeof obj === 'object';
}
export function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}