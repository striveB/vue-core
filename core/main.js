import { effect, computed } from "./packages/effect.js";
import { reactive } from "./packages/reactive.js";

const data = { text: "hello world!", isOk: true, num: 1, num1: 1 };
let obj = reactive(data);
let val = computed(() => obj.num + obj.num1);
console.log(val.value);
console.log(val.value);
// console.log(obj.num1);
// let effectFn = effect(() => obj.num + obj.num1, {
//   // scheduler(fn) {
//   //   setTimeout(() => {
//   //     fn();
//   //   }, 0);
//   // },
//   lazy: true,
// });
// let value = effectFn();
// console.log(value);
