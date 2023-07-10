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
  // 没有副作用函数时直接return
  if (!activeEffect) return;
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
      if (!dirty) {
        dirty = true;
        trigger(obj, "value");
      }
    },
  });

  const obj = {
    // 当读取value时才执行effectFn
    get value() {
      if (dirty) {
        console.log("重新计算了");
        value = effectFn();
        dirty = false;
      }
      track(obj, "value");
      return value;
    },
  };
  return obj;
}

function watch(source, callback, options = {}) {
  let getter;
  if (typeof source === "function") {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  let oldValue, newValue;

  // 提取scheduler调度函数为一个独立的job函数
  const job = () => {
    // 调度器重执行effectFn得到的就是新值
    newValue = effectFn();
    callback(newValue, oldValue);
    // 传递过去之后更新一下旧值
    oldValue = newValue;
  };
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler: job,
  });

  // 如果是立即执行的话，就直接调用job函数 第一次立即执行就没有了旧值一说了
  if (options.immediate) {
    job();
  } else {
    // 直接调用effectFn得到的就是旧值
    oldValue = effectFn();
  }
}
// watch 的读取操作会触发
function traverse(value, seen = new Set()) {
  // 如果要读取的是数据时原始数据，或者已经被读取过了，那什么都不做
  if (typeof value !== "object" || value === null || seen.has(value)) return;
  seen.add(value);
  // 这里暂时不考虑数组等其他结构
  // ...

  // 如果value就是一个对象的话 那么我们可以使用for in来遍历对象的所有属性,并且递归调用traverse进行处理
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}
export { effect, track, trigger, computed, watch };
