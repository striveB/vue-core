import { parsePath, isObj, hasOwn } from './utils.js';
export function observer(value) {
  if(!isObj(value)) return;
  let ob
  if(hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
  }
  return ob;
}

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
    console.log('通知更新', this.subs);
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
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;
    console.log('使用了数组方法！');
    let inserted
    switch(method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if(inserted) ob.observeArray(inserted);
    // 数组监听到变化发送通知
    ob.dep.notify();
    return result;
  })
});

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}

export class Observer {
  constructor(value) {
    this.value = value;
    this.dep = new Dep();
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      this.value.__proto__ = arrayMethods;
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  // 侦测Array中的每一项
  observeArray(items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observer(items[i]);
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
  let childOb = observer(val)
  let dep = new Dep();
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.depend();
      if(childOb) {
        childOb.dep.depend();
      }
      return val;
    },
    set: function (newVal) {
      if (newVal === val) return;
      val = newVal;
      dep.notify();
    },
  });
}
