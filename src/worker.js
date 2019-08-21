import { createReducer } from '/modules/pubsub.js'

import { SMOOTH, COUNT, VIDEO_FRAME } from '/store/actions'


let store = {
  count: 0,
  poly: [[0,0], [100,0], [100,100], [0,100]],
  imageData: [],
}

const mutations = {
  invert(imageData) {
    for (var i = 0; i < imageData.length; i += 4) {
      imageData[i]     = 255 - imageData[i];     // red
      imageData[i + 1] = 255 - imageData[i + 1]; // green
      imageData[i + 2] = 255 - imageData[i + 2]; // blue
    }
    return imageData
  },
  smoothed(shape) {
    smooth(shape, 0.8)
  }
}

function myReducer(state, action) {
  switch (action.type) {
    case COUNT:
      return { count: state.count + action.payload }

    case SMOOTH:
      return { poly: mutations.smoothed(state.poly) }

    case VIDEO_FRAME:
      const buffer = new Uint8ClampedArray(action.payload.buffer)
      const inverted = mutations.invert(buffer)
      // const inverted = mutations.invert(action.payload)
      return {
        imageData: inverted,
        width: action.payload.width,
        height: action.payload.height,
      }

    default:
      return state
  }
}

createReducer(myReducer, store, self)
