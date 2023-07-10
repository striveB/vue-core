import { effect, watch } from "../packages/effect.js";
import { reactive } from "../packages/reactive.js";

const data = { text: "hello world!", isOk: true, num: 1, num1: 2 };
let obj = reactive(data);

// 普通的响应式对象监听
// watch(obj, (newVal, oldVal) => {
//   console.log("新num：", newVal.num, ",旧num:", oldVal.num);
// });

// 函数监听
watch(
  () => obj.num,
  (newVal, oldVal) => {
    console.log("新num：", newVal, ",旧num:", oldVal);
  }
);

function test() {
  obj.num = 10;
  obj.num = 11;
}
test();
