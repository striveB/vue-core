import { watch } from "../packages/effect.js";
import { reactive } from "../packages/reactive.js";

const data = { text: "hello world!", isOk: true, num: 1, num1: 2 };
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

function test() {
  obj.num = 10;
}
test();
