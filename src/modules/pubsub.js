export function createPubSub(worker) {
  function subscribe(listener) {
    const callback = event => listener(event.data)

    worker.addEventListener('message', callback)

    return {
      unsubscribe() {
        worker.removeEventListener('message', callback)
      }
    }
  }

  function dispatch(type, payload, transfer = []) {
    const action = { type, payload }
    worker.postMessage(action, transfer)
  }

  return {
    subscribe,
    dispatch
  }
}

export function createReducer(reducer, store, workerSelf) {
  workerSelf.addEventListener('message', e => {
    // update store with reducer function
    store = Object.assign({}, store, reducer(store, e.data))
    // send store over to main as event.data
    workerSelf.postMessage(store)
  })
}
