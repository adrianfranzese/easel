import { createPubSub } from '/modules/pubsub'

// Initialise worker
const w = new Worker('/worker.js')
export const { subscribe, dispatch } = createPubSub(w)

console.log(w);
