function EdgeSpace(current, future, dead) {
  this.current = current;
  this.future = future;
  this.dead = dead;
}

EdgeSpace.prototype.contains = function(e) {
  for(let i = 0; i < this.dead.length; i++) {
    if(e.x === this.dead[i].x && e.y === this.dead[i].y) {
      return true;
    }
  }

  for(let i = 0; i < this.current.length; i++) {
    if(e.x === this.current[i].x && e.y === this.current[i].y) {
      return true;
    }
  }

  for(let i = 0; i < this.future.length; i++) {
    if(e.x === this.future[i].x && e.y === this.future[i].y) {
      return true;
    }
  }

  return false;
}

EdgeSpace.prototype.next = function() {
  let e = this.current.pop();
  this.addToFuture(e);
  return e;
}

EdgeSpace.prototype.addToFuture = function(e) {
  let ok = !this.contains(e);

  if(ok) {
    let {x, y} = e;
    this.future.push({x, y});
  }
}

EdgeSpace.prototype.addToCurrent = function(e) {
  let ok = !this.contains(e);

  if(ok) {
    let {x, y} = e;
    this.current.push({x, y});
  }
}

EdgeSpace.prototype.concatCurrent = function(es) {
  for(let i = 0; i < es.length; i++) {
    this.addToCurrent(es[i]);
  }
}

EdgeSpace.prototype.futureToCurrent = function(e) {
  let {x, y} = e;
  let ok = false;
  for(let i = 0; i < this.future.length; i++) {
    if(this.future.x === x && this.future.y === y) {
      ok = true;
      this.future.splice(i, 1);
      break;
    }
  }
  this.current.push({x, y});
}

// Mark a cell as "not to be used again" regardless of its current state
// i.e. if it is still in current it may be used but not readded to future
EdgeSpace.prototype.kill = function(e) {
  /*for(let i = 0; i < this.current.length; i++) {
    if(this.current[i].x === e.x && this.current[i].y === e.y) {
      this.dead.push(this.current[i]);
      this.current.splice(i, 1);
      return;
    }
  }*/

  for(let i = 0; i < this.future.length; i++) {
    if(this.future[i].x === e.x && this.future[i].y === e.y) {
      this.future.splice(i, 1);
    }
  }

  this.dead.push({...e});
}

EdgeSpace.prototype.refillEdge = function(field) {
  this.future.sort((a, b) => b.y - a.y);
  for(let i = 0; i < this.future.length; i++) {
    let { x, y } = this.future[i];
    if(y < field.length - 1 && field[y + 1][x] !== '|') {
      this.futureToCurrent({x, y});
      this.kill({x, y});
    }
  }
}

const expandDots = (x) => {
  const comps = x.split('..').map((x) => Number.parseInt(x));
  let out = [];
  for(let i = comps[0]; i <= comps[1]; i++) {
    out.push(i);
  }

  return out;
}

const parseField = (input) => {
  const parts = input.split('\n').
                      map((l) => {
                        //x=545, y=1483..1485
                        //y=618, x=494..497
                        const xcomp = l.match(/x=([.0-9]+)/)[1];
                        const ycomp = l.match(/y=([.0-9]+)/)[1];

                        let x = null;
                        let y = null;
                        if(xcomp.match(/\./)) {
                          x = expandDots(xcomp);
                          y = [Number.parseInt(ycomp)];
                        } else {
                          x = [Number.parseInt(xcomp)];
                          y = expandDots(ycomp);
                        }

                        return {
                          x,
                          y
                        };
                      });

  let { xMin, xMax, yMin, yMax } = parts.reduce((s, e) => {
    const xmi = Math.min(...e.x);
    const xma = Math.max(...e.x);
    const ymi = Math.min(...e.y);
    const yma = Math.max(...e.y);
    const { xMin, xMax, yMin, yMax } = s;
    return {
      xMin: xmi < xMin ? xmi : xMin,
      xMax: xma > xMax ? xma : xMax,
      yMin: ymi < yMin ? ymi : yMin,
      yMax: yma > yMax ? yma : yMax
    };
  }, {
    xMin: Infinity,
    xMax: -Infinity,
    yMin: Infinity,
    yMax: -Infinity
  });

  // Add edges (theoretically infinite but water can only ever flow 1 past extrema)
  xMin = xMin - 1;
  xMax = xMax + 1;

  let field = [];
  const xDim = xMax - xMin + 1;
  const yDim = yMax - yMin + 1;
  for(let i = 0; i < yDim; i++) {
    field.push(new Array(xDim).fill('.'));
  }

  for(let i = 0; i < parts.length; i++) {
    parts[i].y.forEach((y) => {
      parts[i].x.forEach((x) => {
        field[y - yMin][x - xMin] = '#';
      });
    });
  }

  field[0][500 - xMin] = '+';

  return {
    field,
    xMin,
    xMax,
    yMin,
    yMax
  };
}

const getCandidates = (pos, field) => {
  let neighbors = [];
  const {x, y} = pos;

  if(y + 1 < field.length) {
    if(field[y + 1][x] === '.') {
      neighbors.push({x, y: y + 1});
    } else if(field[y + 1][x] !== '|'){
      if(field[y][x - 1] === '.') {
        neighbors.push({x: x - 1, y});
      }

      if(field[y][x + 1] === '.') {
        neighbors.push({x: x + 1, y});
      }
    }
  }

  return neighbors;
}

const addToEdge = (e, x) => {
  for(let i = 0; i < e.length; i++) {
    if(x.x === e[i].x && x.y === e[i].y) {
      return [...e];
    }
  }

  return [...e, x];
}

const removeFromEdge = (e, x) => {
  let out = [...e];
  return out.filter((el) => !(el.x === x.x && el.y === x.y));
}

const settleWater = (field, edgespace) => {
  field = field.map((r, y) => {
    r = [...r];
    let lastWall = null;
    for(let x = 0; x < r.length; x++) {
      if(r[x] === '#') {
        while(x < r.length && r[x] === '#') {
          x++;
        }
        x--;
        if(lastWall === null) {
          lastWall = x;
        } else if(x - lastWall > 1){
          for(let xx = lastWall + 1; xx < x; xx++) {
            // TODO: Get this right without check
            if(r[xx] !== '#') {
              edgespace.kill({x: xx, y});
              r[xx] = '~';
            }
          }
          lastWall = null;
        }
      } else if(r[x] !== '|' && lastWall !== null) {
        lastWall = null;
      }
    }
    return r;
  });

  return {
    field,
    es: edgespace
  };
}

const getNextEdge = (field, futureEdgeCandidates) => {
  futureEdgeCandidates.sort((a, b) => b.y - a.y);
  let edge = [];
  for(let i = 0; i < futureEdgeCandidates.length; i++) {
    let { x, y } = futureEdgeCandidates[i];
    if(y < field.length - 1 && field[y + 1][x] !== '|') {
      edge.push({x, y});
      futureEdgeCandidates = removeFromEdge(futureEdgeCandidates, {x, y});
    }
  }

  return {
    futureEdgeCandidates,
    edge
  };
}

const render = (field) => field.map((x) => x.join('')).join('\n');

exports.solver = function(input) {
  /*input = `x=495, y=2..7
y=7, x=495..501
x=501, y=3..7
x=498, y=2..4
x=506, y=1..2
x=498, y=10..13
x=504, y=10..13
y=13, x=498..504`;*/

  let debug = false;
  if(debug) {
    let buggyPot1 = `....................
.....#....#.......|.
#....#....#.......|.
#....#....#.......|#
#....#....#.......|#
#....#....#.......|#
#....#....#.......|#
#....#....#.......|#
#....#....#.......|#
#....#....#.......|#
#....######||||||||#
#~~~~~~~~~~~~~~~~~~#
#~~~~~~~~~~~~~~~~~~#
#~~~~~~~~~~~~~~~~~~#
####################`;
    let field = buggyPot1.split('\n').map((x) => x.split(''));
    let qq = settleWater(field, new EdgeSpace([], [], []));
    console.log(render(qq.field));

  } else {

    let { field, xMin, yMin, xMax, yMax } = parseField(input);

    let es = new EdgeSpace([{x: 500 - xMin, y: 0}], [], []);

    //console.log(render(field) + '\n');

    while(es.current.length) {
      let box = es.next();
      let neighbors = getCandidates(box, field);
      es.concatCurrent(neighbors);
      for(let n = 0; n < neighbors.length; n++) {
        let { x, y }  = neighbors[n];
        field[y][x] = '|';
      }

      //console.log(render(field) + '\n');

      if(es.current.length === 0) {
        let settled = settleWater(field, es);
        field = settled.field;
        es = settled.es;

        es.refillEdge(field);
      }
    }

    let s = settleWater(field, es);

    console.log(render(s.field));

    const cellTouchedByWater = field.reduce((s, e, i) => {
        return s + e.reduce((ss, ee) => ss + (ee === '|' || ee === '~' || ee === '+'), 0);
    }, 0);

    const retainedWater = field.reduce((s, e, i) => {
        return s + e.reduce((ss, ee) => ss + (ee === '~'), 0);
    }, 0);

    return `A totla of ${cellTouchedByWater} cells are touched by water in some way.
  After the well runs dry, we are left with ${retainedWater} many water.`;
  }
}
