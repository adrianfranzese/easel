export function drawCubic(points, ctx) {
  /* https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo
  [           Start     Control 1   Control 2   End
  Point 1: [ [ 50, 0 ], [ 100, 0 ], [ 100, 0 ], [ 100, 50 ] ],
  Point 2: [ [ 100, 50 ], [ 100, 100 ], [ 100, 100 ], [ 50, 100 ] ],
  Point 3: [ [ 50, 100 ], [ 0, 100 ], [ 0, 100 ], [ 0, 50 ] ],
  Point 4: [ [ 0, 50 ], [ 0, 0 ], [ 0, 0 ], [ 50, 0 ] ]
  ]
  */
  points.forEach(p => {
    // [ Start | C1 | C2 | End ]
    // [ x | y ]
    ctx.moveTo(p[0][0], p[0][1])
    ctx.bezierCurveTo(p[1][0], p[1][1], p[2][0], p[2][1], p[3][0], p[3][1])
  })
}
