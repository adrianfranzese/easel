  let field = []
  let image
window.onload = function() {
  paper.setup('canvas');

  image = new paper.Raster('trump-sobel.png', new paper.Point(paper.view.center))
  // Flow Field
  const resolution = 10
  const cols = Math.ceil(paper.view.size.width / resolution)
  const rows = Math.ceil(paper.view.size.height / resolution)

  let flowLayer = new paper.Layer()
  image.onLoad = function() {
    image.visible = false
    for (let i = 0; i < cols; i++) {
      field.push([])
      for (let j = 0; j < rows; j++) {
        let grayVal = image.getPixel(i*resolution, j*resolution).gray
        field[i].push(new paper.Point({
          length: 1,
          angle: rad2deg((grayVal + 3*Math.PI)*Math.PI)
          // angle: rad2deg((grayVal.square() + 3*Math.PI * 0.25)*Math.PI)
          // angle: rad2deg(grayVal) * Math.PI/2
        }))
        // Uncomment to show vector field
        let x = new paper.Path.Line({
          from: new paper.Point(i * resolution, j * resolution),
          to: new paper.Point(i * resolution + resolution, j * resolution),
          strokeColor: 'lightgray'
        })
        x.rotate(field[i][j].angle)
      }
    }
  }

  function lookup(_pos) {
    let c = Math.floor(constrain(_pos.x / resolution, 0, cols - 1))
    let r = Math.floor(constrain(_pos.y / resolution, 0, rows - 1))
    return field[c][r]
  }
  // -------------------------------------------------

  // Worm class
  function Worm(_location) {
    this.path = new paper.Path({
      strokeColor: {
        hue: Math.random() * 360,
        saturation: 1,
        brightness: 1
      },
      strokeWidth: 5,
      strokeCap: 'round',
      blendMode: 'multiply',
      opacity: 5,
      // selected: true
    })

    this.velocity = new paper.Point(0, 0)
    this.acceleration = new paper.Point(0, 0)

    this.maxSpeed = 0.5
    this.maxForce = 0.2
  }

  Worm.prototype = {
    applyForce: function(force) {
      this.acceleration = this.acceleration.add(force)
    },

    move: function() {
      this.velocity = this.velocity.add(this.acceleration)
      this.velocity = this.velocity.limit(this.maxSpeed)
      this.path.lastSegment.point = this.path.lastSegment.point.add(this.velocity)
      this.path.smooth({
        type: 'continuous'
      })
    },

    seek: function() {
      let desired = lookup(this.path.lastSegment.point)
      desired.length = this.maxSpeed
      let steer = desired.subtract(this.velocity)
      steer = steer.limit(this.maxForce)

      this.applyForce(steer)
    },

    moveChain: function() {
      for (let i = this.path.segments.length - 1; i > 0; i--) {
        let segment = this.path.segments[i]
        let prevSegment = segment.previous
        let vector = segment.point.subtract(prevSegment.point)
        vector.length = resolution
        prevSegment.point = segment.point.subtract(vector)
      }
    },

    isOutOfView: function() {
      if (this.path.isInside(paper.view.bounds)) {
        return false
      } else {
        return true
      }
    }
  }

  // ----------------------------------------------

  let foreground = new paper.Layer()
  let worms = []
  let worm

  let pen = new paper.Tool();

  pen.fixedDistance = resolution
  pen.onMouseDown = function(click) {
    worm = new Worm()

    worm.path.add(click.point)
    worm.path.add(click.point.add(10))

    worms.push(worm)
  }

  pen.onMouseDrag = function(click) {
    worm.path.add(click.point)
  }

  paper.view.onFrame = function(frame) {
    if (paper.project.activeLayer.hasChildren) {
      for (let w of worms) {
        w.seek()
        w.move()
        w.moveChain()

        // if (w.isOutOfView()) {
        //   w.path.remove()
        //   worms.removeElement(w)
        // }
      }
    }
  }
}

paper.Point.prototype.limit = function limit(max) {
  let limited = this
  let mSq = this.x * this.x + this.y * this.y
  if (mSq > max * max) {
    limited = this.divide(Math.sqrt(mSq)) //normalize it
      .multiply(max);
  }
  return limited;
}

function randomBetween(min, max) {
  return (Math.random() * (max - min + 1)) + min
  //The maximum is inclusive and the minimum is inclusive
}

function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low);
};

Number.prototype.map = function(in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

Array.prototype.removeElement = function(element) {
  let index = this.indexOf(element);
  if (index !== -1) {
    this.splice(index, 1);
  }
}

function rad2deg(angleInRadians) {
  return angleInRadians / (Math.PI/180)
}

function deg2rad(angleInDegrees) {
  return angleInDegrees * (Math.PI/180)
}

Number.prototype.square = function () {
  this * this
};
