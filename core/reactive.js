// 存储被注册的effect函数
let activeEffect;

// 用于注册副作用函数effect
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    fn();
  };
  effectFn.deps = [];
  effectFn();
  console.log(activeEffect.deps);
}
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

// 存储副作用函数effect的桶
const bucket = new WeakMap();

const track = function (target, key) {
  // 从桶中拿出当前对象对应的 map
  let depsMap = bucket.get(target);
  window.bucket = bucket;
  if (!depsMap) {
    window.target = target;
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  // 当读取属性时将effect存储到桶中
  deps.add(activeEffect);
  activeEffect.deps.push(deps);
  // console.log(bucket);
};
const trigger = function (target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  if (!effects) return;
  const depsToRun = new Set(effects);
  depsToRun.forEach((effectFn) => {
    effectFn();
  });
  // effects.forEach((fn) => fn());
};

// 原始数据
const data = { text: "hello world!", isOk: true };
// 对原始数据进行响应式处理
const obj = new Proxy(data, {
  get(target, key) {
    // 没有副作用函数时直接return
    if (!activeEffect) return target[key];
    track(target, key);
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    trigger(target, key);
    return true;
  },
});

function upd() {
  console.log("更新了文本！");
  document.body.innerText = obj.isOk ? obj.text : "xxx";
}
function say() {
  console.log("读取文本！", obj.isOk, obj.text);
}

effect(upd);
effect(say);

setTimeout(() => {
  obj.isOk = false;
  obj.text = "123!";
}, 1000);
