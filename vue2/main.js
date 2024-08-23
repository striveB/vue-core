import { Observer, Watcher } from './core/vue.js';
var obj = {
  name: '',
  age: 0,
  arr: [1, 2]
};
new Observer(obj);
// new Watcher(obj, 'name', (newVal, oldValue) => {
//   document.querySelector('#app').innerHTML = newVal;
// });
// new Watcher(obj, 'age', (newVal, oldValue) => {
//   document.querySelector('#app').innerHTML = newVal;
// });
// setTimeout(() => {
//   obj.name = '小明';
// }, 1000);
// setTimeout(() => {
//   obj.age = 33;
// }, 2500);

new Watcher(obj, 'arr', (newVal, oldValue) => {
  console.log('数组变化:', newVal, oldValue);
});
obj.arr.push(123);
obj.arr.unshift(333);
obj.arr.splice(1, 1);
