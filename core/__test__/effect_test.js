import { effect } from "../packages/effect.js";
import { reactive } from "../packages/reactive.js";

const data = { text: "hello world!", isOk: true, num: 1, num1: 2 };
let obj = reactive(data);
effect(() => {
  test();
});
function test() {
  console.log("obj", obj);
}
