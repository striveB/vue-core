// 存储被注册的effect函数
let activeEffect;

// effect 栈
const effectStack = [];

// 用于注册副作用函数effect
function effect(fn, options) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    let res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  effectFn.options = options;
  effectFn.deps = [];
  if (!options?.lazy) {
    effectFn();
  }
  return effectFn;
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
  // // 没有副作用函数时直接return
  if (!activeEffect) return target[key];
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
  const depsToRun = new Set();
  effects &&
    effects.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        depsToRun.add(effectFn);
      }
    });
  depsToRun.forEach((effectFn) => {
    if (effectFn.options && effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
  // console.log(activeEffect.deps);
  // effects.forEach((fn) => fn());
};

function computed(getter) {
  // value 用来缓存上一次计算的值
  let value;
  // 为true则代表脏数据 需要重新计算
  let dirty = true;
  // 把 getter作为副作用函数，创建一个lazy的effect
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true;
      console.log("执行！");
      trigger(obj, "value");
    },
  });

  const obj = {
    // 当读取value时才执行effectFn
    get value() {
      if (dirty) {
        console.log("重新计算了");
        value = effectFn();
        dirty = false;
        track(obj, "value");
      }
      return value;
    },
  };
  return obj;
}
export { effect, track, trigger, computed };
