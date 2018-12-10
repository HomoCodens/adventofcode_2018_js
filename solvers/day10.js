const parseStar = (l) => {
  const components = l.match(/position=<(.*), (.*)> velocity=<(.*), (.*)>/).
                        map((x) => Number.parseInt(x));

  return {
    x: [components[1], components[2]],
    v: [components[3], components[4]]
  };
}

const starExtrema = (stars) => {
  return stars.reduce((s, e) => {
    const { x } = e;
    const xx = x[0];
    const yy = x[1];
    const { xMin, xMax, yMin, yMax } = s;
    return {
      xMin: xx < xMin ? xx : xMin,
      xMax: xx > xMax ? xx : xMax,
      yMin: yy < yMin ? yy : yMin,
      yMax: yy > yMax ? yy : yMax
    };
  }, {
    xMin: Infinity,
    xMax: -Infinity,
    yMin: Infinity,
    yMax: -Infinity
  });
}

const stArea = (stars) => {
  const { xMin, xMax, yMin, yMax } = starExtrema(stars);

  return (xMax - xMin + 1)*(yMax - yMin + 1);
}

const stEp = (stars, direction = 1) => {
  return stars.map((s) => {
    let { x, v } = s;
    v.map((e, i) => {
      x[i] += direction*e;
    });
    return {
      x,
      v
    };
  });
}

const renderSky = (stars) => {
  const { xMin, xMax, yMin, yMax } = starExtrema(stars);
  const yDim = yMax - yMin + 1;
  const xDim = xMax - xMin + 1;
  let sky = [];
  for(let i = 0; i < yDim; i++) {
    sky.push(new Array(xDim).fill('.'));
  }

  console.log(`Sky is ${xDim} by ${yDim}`);

  for(let i = 0; i < stars.length; i++) {
    const { x: pos } = stars[i];
    const x = pos[0] - xMin;
    const y = pos[1] - yMin;
    //console.log(`lighting [${x}, ${y}]`);
    sky[y][x] = '#'
  }

  return sky.map((x) => x.join('')).join('\n');
}

exports.solver = function(input) {
  /*input = `position=< 9,  1> velocity=< 0,  2>
position=< 7,  0> velocity=<-1,  0>
position=< 3, -2> velocity=<-1,  1>
position=< 6, 10> velocity=<-2, -1>
position=< 2, -4> velocity=< 2,  2>
position=<-6, 10> velocity=< 2, -2>
position=< 1,  8> velocity=< 1, -1>
position=< 1,  7> velocity=< 1,  0>
position=<-3, 11> velocity=< 1, -2>
position=< 7,  6> velocity=<-1, -1>
position=<-2,  3> velocity=< 1,  0>
position=<-4,  3> velocity=< 2,  0>
position=<10, -3> velocity=<-1,  1>
position=< 5, 11> velocity=< 1, -2>
position=< 4,  7> velocity=< 0, -1>
position=< 8, -2> velocity=< 0,  1>
position=<15,  0> velocity=<-2,  0>
position=< 1,  6> velocity=< 1,  0>
position=< 8,  9> velocity=< 0, -1>
position=< 3,  3> velocity=<-1,  1>
position=< 0,  5> velocity=< 0, -1>
position=<-2,  2> velocity=< 2,  0>
position=< 5, -2> velocity=< 1,  2>
position=< 1,  4> velocity=< 2,  1>
position=<-2,  7> velocity=< 2, -2>
position=< 3,  6> velocity=<-1, -1>
position=< 5,  0> velocity=< 1,  0>
position=<-6,  0> velocity=< 2,  0>
position=< 5,  9> velocity=< 1, -2>
position=<14,  7> velocity=<-2,  0>
position=<-3,  6> velocity=< 2, -1>`;*/

  let stars = input.split('\n').map(parseStar);
  let a = stArea(stars);
  let minArea = Infinity;
  let second = 0;

  // Kun's lemma: If it spells, it's probably not spread across the whole sky.
  while(a < minArea) {
    console.log(a);
    minArea = a;
    stars = stEp(stars);
    a = stArea(stars);
    second++;
  }

  // We overshot by 1
  stars = stEp(stars, -1);
  second--;

  return `${renderSky(stars)}
That took ${second} seconds to appear.`
}
