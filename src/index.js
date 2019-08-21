import { createVideoStream, createCamera } from './modules/video'
import { createElement, mount } from './modules/dom'

import { subscribe } from './store/store.js'

function createCanvas(width, height) {
  const canvas = createElement('canvas', {
    id: 'drawing',
    width: width,
    height: height
  })

  return canvas.getContext('2d')
}

const draw = createCanvas(300, 300)
const video = createCamera()

createVideoStream(video)

const drawing = subscribe(data => {
  const newImageData = draw.createImageData(data.width, data.height)
  newImageData.data.set(data.imageData)

  draw.putImageData(newImageData, 150 - data.width/2, 150 - data.height/2)
})

const app = document.getElementById('app')
mount(app, draw.canvas, video)
