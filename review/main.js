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

// 存储副作用函数的桶
const bucket = new Set();

// 对原始数据进行代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数effect存入桶中
    bucket.add(activeEffect);
    return target[key];
  },
  // 拦截设置操作
  set(target, key, value) {
    target[key] = value;
    // 执行桶中的副作用函数
    bucket.forEach((effect) => effect());
    return true;
  },
});

effect(() => {
  document.body.innerText = obj.text;
});
setTimeout(() => {
  obj.text = "hello proxy!";
}, 1000);
