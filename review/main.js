// 原始数据
const data = { isOk: true, text: "hello world!" };

// 用一个全局变量存储被注册的副作用函数
let activeEffect;

// effect栈
const effectStack = [];

// effect函数用户注册副作用函数
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn);
    // 当调用effect函数时，将传入的函数赋值给全局变量activeEffect
    activeEffect = effectFn;
    // 将effectFn存入effectStack中
    effectStack.push(effectFn);
    fn();
    // 将effectFn从effectStack中删除
    effectStack.pop();
    // 将activeEffect置为栈顶的effectFn
    activeEffect = effectStack[effectStack.length - 1];
  };
  // 用来存储所有与该副作用函数相关联的依赖集合
  effectFn.deps = [];
  effectFn();
}

//清除之前的副作用函数关系
function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    // 将effectFn从deps中删除
    deps.delete(effectFn);
  }
  // 最后需要重置effectFn.deps数组
  effectFn.deps.length = 0;
}

// 存储副作用函数的桶，数据结构：WeakMap<target, Map<key, Set()<effects>>>
const bucket = new WeakMap();

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

  // 将其添加到副作用函数的依赖集合中
  activeEffect.deps.push(effects);
}

// 触发副作用
function trigger(target, key) {
  // 根据target从桶中拿到despMap，他也是一个Map类型，结构：key -> Set()<effects>
  let depsMap = bucket.get(target);
  if (!depsMap) return true;
  // 根据key从despMap中拿到effects，他也是一个Set类型，结构：Set()<effects>
  let effects = depsMap.get(key);

  // 执行桶中的副作用函数，一下防止set无限循环
  const effectsToRun = new Set(effects);
  effectsToRun.forEach((effectFn) => effectFn());
  // effects && effects.forEach((effect) => effect());
}

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

// 测试分支切换清除
// effect(() => {
//   console.log("执行了！");
//   document.body.innerText = obj.isOk ? obj.text : "isNot";
// });
// obj.isOk = false;
// setTimeout(() => {
//   obj.text = "hello proxy!";
// }, 1000);

// 测试effect嵌套
let temp1, temp2;
effect(() => {
  console.log("effectFn1 执行！");
  effect(() => {
    console.log("effectFn2 执行！");
    temp2 = obj.text;
  });
  temp1 = obj.isOk;
});
obj.isOk = false;
