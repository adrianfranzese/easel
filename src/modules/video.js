import { createElement } from '/modules/dom'
import { dispatch } from '/store/store'
import { VIDEO_FRAME } from '/store/actions'

export function createCamera() {
  const video = createElement('video', {
    id: 'camera',
    autoplay: true,
    playsinline: true,
    constrols: true,
  })

  async function loadWebCamStream() {
    try {
      return navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user"
        }
      })
    } catch(e) {
      // console.warn('Webcam access failed')
      // return new MediaStream()
      throw new Error(e)
    }
  }

  video.addEventListener('mount', async event => {
    video.srcObject = await loadWebCamStream()
  })

  video.addEventListener('loadedmetadata', event => {
    video.width = video.videoWidth / 4
    video.height = video.videoHeight / 4
  })

  return video
}

export function createVideoStream(video) {
  video.addEventListener('loadeddata', () => {
    const videoCanvas = createElement('canvas', {
      width: video.width,
      height: video.height,
    })

    const videoContext = videoCanvas.getContext('2d')
    requestAnimationFrame(() => sendStream(videoContext))
  })

  function sendStream(videoContext) {
    requestAnimationFrame(() => sendStream(videoContext))

    videoContext.drawImage(video, 0, 0, video.width, video.height)
    const videoBuffer = videoContext.getImageData(0, 0, video.width, video.height)

    dispatch(VIDEO_FRAME, {
      width: video.width,
      height: video.height,
      buffer: videoBuffer.data.buffer,
    }, [videoBuffer.data.buffer])
  }
}
