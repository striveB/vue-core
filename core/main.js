import { effect, computed } from "./packages/effect.js";
import { reactive } from "./packages/reactive.js";

const data = { text: "hello world!", isOk: true, num: 1, num1: 2 };
let obj = reactive(data);
let val = computed(() => {
  console.log("计算了-", obj.num, obj.num1);
  return obj.num + obj.num1;
});
console.log(val.value);
console.log(val.value);
// console.log(obj.num1);
// let effectFn = effect(() => obj.num + obj.num1, {
//   // scheduler(fn) {
//   //   setTimeout(() => {
//   //     fn();
//   //   }, 1000);
//   // },
//   lazy: false,
// });
// let value = effectFn();
// console.log(value);

// setTimeout(() => {
//   obj.num += 1;
//   console.log(val.value);
// }, 1000);

effect(() => {
  console.log("effect", val.value);
});
obj.num = 10;
