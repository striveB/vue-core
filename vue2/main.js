import { Observer, Watcher } from './core/vue.js';
var obj = {
  name: '',
  age: 0,
};
new Observer(obj);
new Watcher(obj, 'name', (newVal, oldValue) => {
  document.querySelector('#app').innerHTML = newVal;
});
new Watcher(obj, 'age', (newVal, oldValue) => {
  document.querySelector('#app').innerHTML = newVal;
});
setTimeout(() => {
  obj.name = '小明';
}, 1000);
setTimeout(() => {
  obj.age = 33;
}, 2500);
