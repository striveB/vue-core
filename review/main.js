// 原始数据
const data = { text: "hello world!" };

// 用一个全局变量存储被注册的副作用函数
let activeEffect;

// effect函数用户注册副作用函数
function effect(fn) {
  // 当调用effect函数时，将传入的函数赋值给全局变量activeEffect
  activeEffect = fn;
  fn();
}

// 存储副作用函数的桶，数据结构：WeakMap<target, Map<key, Set()<effects>>>
const bucket = new WeakMap();

// 对原始数据进行代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    track(target, key);
    return target[key];
  },
  // 拦截设置操作
  set(target, key, value) {
    target[key] = value;
    trigger(target, key);
    return true;
  },
});

// 收集副作用
function track(target, key) {
  // 没有activeEffect说明不是在effect函数中读取数据，直接返回数据
  if (!activeEffect) return target[key];
  // 根据target从桶中拿到despMap，他也是一个Map类型，结构：key -> Set()<effects>
  let depsMap = bucket.get(target);
  // 如果没有despMap，说明是第一次读取数据，初始化一个despMap
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  // 根据key从despMap中拿到effects，他也是一个Set类型，结构：Set()<effects>
  let effects = depsMap.get(key);
  // 如果没有effects，说明是第一次读取数据，初始化一个effects
  if (!effects) {
    depsMap.set(key, (effects = new Set()));
  }
  // 将副作用函数effect存入effects中
  effects.add(activeEffect);
}

// 触发副作用
function trigger(target, key) {
  // 根据target从桶中拿到despMap，他也是一个Map类型，结构：key -> Set()<effects>
  let depsMap = bucket.get(target);
  if (!depsMap) return true;
  // 根据key从despMap中拿到effects，他也是一个Set类型，结构：Set()<effects>
  let effects = depsMap.get(key);
  // 执行桶中的副作用函数
  effects && effects.forEach((effect) => effect());
}

effect(() => {
  document.body.innerText = obj.text;
});
setTimeout(() => {
  obj.text = "hello proxy!";
}, 1000);
