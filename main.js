// TODO: parametize these
let squiggle = 0.25 // 0.25 to 0.9
let cannyMin = 100
let cannyMax = 175
let simplifyFactor = 2 // 2 to 30?
// TODO: create list of colour schemes
window.onload = function () {
  paper.setup('drawing')

  let video = document.getElementById("cam") // load video element
      video.height = 100
      video.width = 140
  let c = document.getElementById('vidCapture')
      c.width = video.width
      c.height = video.height
  let cx = c.getContext('2d')

  // Create some blank OpenCV Matrices to draw load data into
  let source = new cv.Mat(video.height, video.width, cv.CV_8UC4)
  let contours = new cv.MatVector()
  let hierarchy = new cv.Mat()
  let hull = new cv.MatVector();
  // let vOutput = new cv.Mat(video.height, video.width, cv.CV_8UC1)
  // let source = cv.imread('img')
  // let output = cv.Mat.zeros(source.rows, source.cols, cv.CV_8UC3)


  // initialise webcam
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
      video.srcObject = stream
      video.play()
      processVideo()
      // initRaster(c.width, c.height)
      // streamReady = true
    })
    .catch(e => console.error(e))

    function processVideo() {
      // OPTIMIZE:  initMats()
      cx.drawImage(video, 0, 0, video.width, video.height)
      source = cv.imread(c)
      source = drawEdges(source, cannyMin, cannyMax)
      cv.imshow(c, source)

      cv.findContours(source, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

      // delete previous paths
      paper.project.activeLayer.removeChildren()

      for (let i = 0; i < contours.size(); i++) {
        let contour = contours.get(i)
        let area = cv.contourArea(contour, false);
        // console.log(area);
        // if (contour.rows > 20) {
        if (area > 1) {
          drawHull(contour)
          drawAContour(contour)
        }
      }
      paper.project.activeLayer.scale(2)
      paper.project.activeLayer.position = paper.view.center;

      // OPTIMIZE: clearMats()
      // Only load next frame every 3 seconds
      setTimeout(function() {
        requestAnimationFrame(processVideo)
      }, 3000)
    }

  // let canvas = document.getElementById('canvas')
  // let ctx = canvas.getContext('2d')

  // cv.cvtColor(source, source, cv.COLOR_RGBA2GRAY, 0)
  // cv.threshold(source, source, 50, 80, cv.THRESH_BINARY_INV)


  function drawEdges(_input, _minVal, _maxVal) {
    cannyOutput = new cv.Mat();
    cv.cvtColor(_input, _input, cv.COLOR_RGBA2GRAY);
    cv.equalizeHist(_input, _input);
    // cv.imshow(c, _input)
    cv.Canny(_input, cannyOutput, _minVal, _maxVal, 3, false);
    return cannyOutput;
  }

  function drawPoints(thisContour, thisPath) {
    for (let c = 0; c < thisContour.length; c+=2) {
      // [x1][y1],[x2][y2]....
      //  c  +1 ,  c  +1 ....
      thisPath.add(new paper.Point({
        x: thisContour[c],
        y: thisContour[c+1]
      }))
      // ctx.lineTo(thisContour[c], thisContour[c+1]);
    }
  }

  // QUESTION: should this use threshold instead of canny?
  function drawHull(thisContour) {
    let thisHull = new cv.Mat();
    cv.convexHull(thisContour, thisHull, false, true);
    thisHull = thisHull.data32S

    let fill = new paper.Path({
      fillColor: {
        hue: Math.random() * 360,
        saturation: 0.8,
        brightness: 1
      },
      blendMode: 'multiply'
    })
    // console.log(thisHull);
    drawPoints(thisHull, fill)
    fill.closePath()
    // fill.reduce()
    fill.simplify()
    // TODO which smoothing type to use?
    fill.smooth({
      // type: 'continuous'
      type: 'catmull-rom',
      factor: 1.0
    })
    // hull.push_back(tmp);
  }


  function drawAContour(thisContour) {
    // thisContour = thisContour.data16U
    thisContour = thisContour.data32S
    // ctx.fillStyle = 'red';
    // ctx.beginPath();
    let path = new paper.Path({
      strokeColor: 'midnightblue',
      selected: false,
      strokeCap: 'round',
      strokeJoin: 'round',
    })

    drawPoints(thisContour, path)

    path.reduce()
    path.simplify(simplifyFactor)
    // TODO which smoothing type to use?
    path.smooth({
      type: 'geometric',
      factor: squiggle
    })

    // IDEA: asign weight based on contour properties?
    path.strokeWidth = 0.5 + Math.random() * 2

    // path.onFrame = function(frame) {
    //   let sinus = Math.sin(this.index + frame.count / 30) / 100
    //   // let prevStroke = this.strokeWidth
    //   // console.log(sinus);
    //   // this.strokeWidth = map(sinus, -1, 1, 0.5, 2)
    //   this.strokeWidth += sinus
    //
    //   // for (segment of this.segments) {
    //   //   segment.point = segment.point.add(sinus*2)
    //   // }
    // }
    // ctx.closePath();
    // ctx.fill();
  }
  // ---------------

  // for (let i = 0; i < contours.size(); ++i) {
  //   let color = new cv.Scalar(255, 255, 255);
  //   cv.drawContours(output, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
  // }
  // cv.imshow('canvas', source);
  // source.delete(); output.delete(); contours.delete(); hierarchy.delete();
}

function saveCanvas() {
  let url = `data:image/svg+xml;utf8,${encodeURIComponent(paper.project.exportSVG({asString:true}))}`;
  let datetime = new Date()
  let dw = document.createElement("a");
  dw.download = `portrait ${datetime.toLocaleTimeString()}.svg`;
  dw.href = url;
  dw.target = `_blank`
  document.body.appendChild(dw);
  dw.click();
  document.body.removeChild(dw)
}

function map(n, in_min, in_max, out_min, out_max) {
  return (n - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function randomBetween(min, max) {
  return (Math.random() * (max - min + 1)) + min
  //The maximum is inclusive and the minimum is inclusive
}

function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low);
};
