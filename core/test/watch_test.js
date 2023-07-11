import { watch } from "../packages/effect.js";
import { reactive } from "../packages/reactive.js";

const data = { text: "hello world!", isOk: true, num: 1, num1: 2, time: 1000 };
let obj = reactive(data);

// 普通的响应式对象监听 - 监听对象时 newVal, oldVal 一样
watch(
  obj,
  (newVal, oldVal) => {
    console.log("watch-1 -> 新num：", newVal.num, ",旧num:", oldVal?.num);
  },
  {
    // 立即执行
    immediate: true,
    flush: "post",
  }
);

// 函数监听
watch(
  () => obj.num,
  (newVal, oldVal) => {
    console.log("watch-2 -> 新num：", newVal, ",旧num:", oldVal);
  },
  {
    // 控制调度器的执行时机
    flush: "pre", // 还可以设置为post
  }
);

// 竞态处理
watch(obj, async (newValue, oldValue, onInvalidate) => {
  let expired = false;
  // 过期后的回调，第二次触发watch时会在第一次的回调中调用
  onInvalidate(() => {
    expired = true;
  });
  let res = await req(obj.time);
  if (!expired) {
    console.log("请求结果！！", res);
  }
});

function req(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data: 200, time });
    }, time);
  });
}
// 即使obj.time 第一次是2秒后才返回结果的 但是因为被后边wach的触发被清除了副作用函数即使他2后才返回结果 但是覆盖后边的200毫秒的结果
obj.time = 2000;
obj.time = 500;
obj.time = 200;
// setTimeout(() => {
//   obj.num1++;
// }, 1000);
// obj.num1++;
// function test() {
//   obj.num = 10;
// }
// test();
