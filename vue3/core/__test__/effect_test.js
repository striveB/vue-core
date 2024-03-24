import { effect } from "../packages/effect.js";
import { reactive } from "../packages/reactive.js";

const data = { text: "hello world!", isOk: true, num: 1, num1: 2 };
let obj = reactive(data);
let effectFn = effect(
  () => {
    console.log("obj", obj.num);
  },
  {
    scheduler: (fn) => {
      console.log("ccccc");
      fn();
    },
    // lazy: true,
  }
);
// effectFn();
obj.num = 10;
