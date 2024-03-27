import { parsePath } from './utils.js';

class Dep {
  constructor() {
    this.subs = [];
  }
  removeSub(arr, item) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
  depend() {
    window.target && this.subs.push(window.target);
    window.target = null;
  }
  notify() {
    // 防止死循环，拷贝一个新的数组
    const subs = this.subs.slice();
    for (let i = 0; i < subs.length; i++) {
      this.subs[i].update();
    }
  }
}
export class Watcher {
  constructor(vm, expOrRn, cb) {
    this.vm = vm;
    this.getter = parsePath(expOrRn);
    this.cb = cb;
    this.value = this.get();
  }
  get() {
    window.target = this;
    let value = this.getter.call(this.vm, this.vm);
    window.target = undefined;
    return value;
  }
  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }
}

// 拦截array方法
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);
console.log(arrayMethods);
const methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
];
methods.forEach((method) => {
  let original = arrayProto[method];
  Object.defineProperty(arrayMethods, method, {
    value: function mutator(...args) {
      console.log('执行了！！');
      return original.apply(this, args);
    },
    enumerable: false,
    writable: true,
    configurable: true,
  });
});

export class Observer {
  constructor(value) {
    this.value = value;
    if (Array.isArray(value)) {
      this.value.__proto__ = arrayMethods;
    } else {
      this.walk(value);
    }
  }
  walk(obj) {
    const keys = Object.keys(obj);
    keys.forEach((key) => {
      defineReactive(obj, key, obj[key]);
    });
  }
}
function defineReactive(data, key, val) {
  if (typeof val === 'object') {
    new Observer(val);
  }
  let dep = new Dep();
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.depend();
      return val;
    },
    set: function (newVal) {
      if (newVal === val) return;
      val = newVal;
      dep.notify();
    },
  });
}
