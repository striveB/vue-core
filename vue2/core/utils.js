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
