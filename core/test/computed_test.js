import { effect, computed } from "../packages/effect.js";
import { reactive } from "../packages/reactive.js";

const data = { text: "hello world!", isOk: true, num: 1, num1: 2 };
let obj = reactive(data);
let val = computed(() => {
  return obj.num + obj.num1;
});
// 测试computed
effect(function effectFn() {
  console.log("effect", val.value);
});
obj.num = 12;
