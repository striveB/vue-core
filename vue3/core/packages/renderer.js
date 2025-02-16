

function createRenderer(options) {
  const { createElement, setElementText, insert, patchProps } = options
  function mountElement(vnode, container) {
    const el = createElement(vnode.type)
    if(typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else if(Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        patch(null, child, el)
      })
    }
    if(vnode.props) {
      for(const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key])
      }
    }
    insert(el, container)
  }
  /**
   * 
   * @param {*} n1 老节点
   * @param {*} n2 新节点
   * @param {*} container 容器
   */
  function patch(n1, n2, container) {
    if(!n1) {
      mountElement(n2, container)
    } else {
      // n1存在则需要对比更新
    }
  }
  function render (vnode, container) {
    if(vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if(container._vnode) {
        container.innerHTML = ''
      }
    }
    container._vnode = vnode;
  }
  return {
    patch,
    render
  }
}
function normalizeClass(value) {
  let res = ''
  if (typeof value === 'string') {
    res = value
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i])
      if (normalized) {
        res += normalized + ' '
      }
    }
  } else if (typeof value === 'object') {
    for (const name in value) {
      if (value[name]) {
        res += name + ' '
      }
    }
  }
  return res.trim()
}
function shouldSetAsProps(el, key, value) {
  // input的form属性是只读的，不能直接复制只能使用setAttribute设置
  if(key === 'form' && el.tagName === 'INPUT') return false
  return key in el
}
let { render } = createRenderer({
  createElement: (tag) => {
    console.log('createElement', tag)
    return document.createElement(tag)
  },
  setElementText: (el, text) => {
    console.log('setElementText', text)
    el.textContent = text
  },
  insert: (el, parent) => {
    console.log('insert', el)
    parent.appendChild(el)
  },
  patchProps(el, key, prevValue, nextValue) {
    if(key === 'class'){
      el.className = normalizeClass(nextValue) || ''
    } else if(shouldSetAsProps(el, key, nextValue)) {
      if(typeof el[key] === 'boolean' && nextValue === '' ) {
        el[key] = true
      } else {
        el[key] = nextValue
      }
    } else {
      el.setAttribute(key, nextValue)
    }
  }

})
export { render }