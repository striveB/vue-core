import { effect } from "../packages/effect.js";
import { reactive } from "../packages/reactive.js";
import { render } from "../packages/renderer.js";


let obj = reactive({
  count: 1
})

effect(() => {
  render({
    type: 'div',
    children: [{
      type: 'button',
      props: {
        class: ['bar', {a: true, b: false}],
        disabled: ''
      },
      children: '按钮'
    },{
      type: 'input',
      props: {
        form: 'testForm'
      },
      children: obj.count + '>2'
    }]
  }, document.querySelector("#app"))
})
setTimeout(() => {
  obj.count++
}, 1000)