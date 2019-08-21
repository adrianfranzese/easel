export function createElement(tag, props = {}, ...children) {
  const element = document.createElement(tag)

  for (let key in props) {
    if (props.hasOwnProperty(key)) {
      element.setAttribute(key, props[key])
    }
  }

  for (let child of children) {
    if (typeof child === 'string') {
      const textNode = document.createTextNode(child)
      element.appendChild(textNode)
    } else if (typeof child === 'object') {
      element.appendChild(child)
    }
  }

  return element
}

const onmount = new Event('mount')
const onunmount = new Event('unmount')

const domChanges = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        node.dispatchEvent(onmount)
      }
    }
    for (const node of mutation.removedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        node.dispatchEvent(onunmount)
      }
    }
  })
})

export function mount(parent, ...children) {
  domChanges.observe(parent, {
    childList: true,
    subtree: true,
  })

  const fragment = document.createDocumentFragment()

  for (const child of children) {
    fragment.appendChild(child)
  }

  parent.appendChild(fragment)

  return parent
}
