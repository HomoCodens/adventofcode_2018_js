const erosionLevel = (x, depth) => (x + depth) % 20183;

function Cave(target, depth) {
  this.target = {
    x: target[0],
    y: target[1],
    t: 1
  };

  this.depth = depth;

  this.erosionLevelMap = [[erosionLevel(0, depth)]];
}

Cave.prototype.at = function(x, y) {
  if(x < 0 || y < 0) {
    return null;
  }

  let { erosionLevelMap, depth, target } = this;
  let nCol = erosionLevelMap[0].length;
  let nRow = erosionLevelMap.length;

  // Grow vertically until y is in range
  while(y >= nRow) {
    erosionLevelMap.push(new Array(nCol).fill(0));
    for(let xx = 0; xx < nCol; xx++) {
      if(xx === target.x && nRow === target.y) {
        erosionLevelMap[nRow][xx] = erosionLevel(0, depth);
      } else if(xx === 0) {
        erosionLevelMap[nRow][xx] = erosionLevel(48271*nRow, depth);
      } else {
        erosionLevelMap[nRow][xx] = erosionLevel(
            erosionLevelMap[nRow - 1][xx]*erosionLevelMap[nRow][xx - 1],
            depth
          )
      }
    }
    nRow = erosionLevelMap.length;
  }



  // Grow horizontally until x is in range
  while(x >= nCol) {
    for(let yy = 0; yy < nRow; yy++) {
      if(nCol === target.x && yy === target.y) {
        erosionLevelMap[yy].push(erosionLevel(0, depth));
      } else if(yy === 0) {
        erosionLevelMap[yy].push(erosionLevel(16807*nCol, depth));
      } else {
        erosionLevelMap[yy].push(erosionLevel(erosionLevelMap[yy - 1][nCol]*erosionLevelMap[yy][nCol - 1], depth));
      }
    }
    nCol = erosionLevelMap[0].length;
  }

  this.erosionLevelMap = erosionLevelMap;
  return erosionLevelMap[y][x] % 3;
}

Cave.prototype.getCross = function(x, y) {
  let neighbors = [];
  let cell = null;
  for(let xx = x - 1; xx <= x + 1; xx++) {
    for(let yy = y - 1; yy <= y + 1; yy++) {
      if(xx === x || yy === y) {
        if(xx === x && yy === y) {
          cell = { x: xx, y: yy, type: this.at(xx, yy) };
        } else {
          neighbors.push({ x: xx, y: yy, type: this.at(xx, yy) });
        }
      }
    }
  }

  return {
    neighbors: neighbors.filter((e) => e.type !== null),
    cell
  };
}

Cave.prototype.findShortestPath = function(targetX, targetY) {
  let done = [];
  let dists = {
    '0|0|1': { x: 0, y: 0, t: 1, d: 0, done: false }
  };
  let edge = [
    '0|0|1'
  ];

  let cnt = 0;

  // TODO: Well, a heap would do wonders here

  const addToEdge = (x) => {
    let ok = true;
    for(let i = 0; i < edge.length; i++) {
      if(edge[i] === x) {
        ok = false;
        break;
      }
    }
    if(ok) {
      edge.push(x);
    }
  }

  const getNextNode = (edg) => {
    let bestI = 0;
    let out = dists[edg[0]];
    for(let i = 1; i < edg.length; i++) {
      // TODO: Add heuristic to break ties based on distance to target
      if(dists[edg[i]].d < out.d) {
        out = dists[edg[i]];
        bestI = i;
      }
    }
    edg.splice(bestI, 1);
    return out;
  }

  while(edge.length) {
    let loggingTime = (cnt++ % 1000) === 0;

    loggingTime && console.log('Getting next node...');
    /*let id = edge.pop();
    let { x, y, t, d } = dists[id];*/
    let { x, y, t, d } = getNextNode(edge);
    let id = `${x}|${y}|${t}`;

    if(x === targetX && y === targetY && t === 1) {
      return d;
    }

    if(loggingTime) {
      console.log(`At: ${id}`);
      console.log(edge.length);
    }

    loggingTime && console.log('Setting node to done...');
    dists[id].done = true;

    loggingTime && console.log('Getting cross...');
    let { neighbors, cell } = this.getCross(x, y);

    loggingTime && console.log('Considering spacial neighbors...');
    for(let n of neighbors) {
      if(n.type !== t) {
        let nid = `${n.x}|${n.y}|${t}`;
        loggingTime && console.log(`${nid}...`);
        if(dists[nid] === undefined || !dists[nid].done) {
          loggingTime && console.log('Adding to edge...');
          addToEdge(nid);

          loggingTime && console.log('Updating dists...');
          if(dists[nid] === undefined) {
            loggingTime && console.log('Need to add...');
            dists[nid] = { x: n.x, y: n.y, t, d: d + 1, done: false, from: { x, y, t } };
          } else {
            loggingTime && console.log('Just updating');
            dists[nid].d = Math.min(dists[nid].d, d + 1);
            dists[nid].from = { x, y, t };
          }
        }
      }
    }


    // Yes, I suppose getCross could just also return the tooly neighbors
    loggingTime && console.log('Tooly neighbors...');
    for(let tt = 0; tt <= 2; tt++) {
      if(tt !== t) {
        if(cell.type !== tt) {
          let nid = `${x}|${y}|${tt}`
          loggingTime && console.log(`${nid}...`);
          if(dists[nid] === undefined || !dists[nid].done) {
            loggingTime && console.log('Adding to edge...');
            addToEdge(nid);

            loggingTime && console.log('Updating dists...');
            if(dists[nid] === undefined) {
              loggingTime && console.log('Need to add...');
              dists[nid] = { x, y, t: tt, d: d + 7, from: { x, y, t} };
            } else {
              loggingTime && console.log('Just updating');
              dists[nid].d = Math.min(dists[nid].d, d + 7);
              dists[nid].from = { x, y, t };
            }
          }
        }
      }
    }

    // Sort by distance and break ties based on manhattan distance to target
    /*loggingTime && console.log('sorting edge...');
    edge.sort((a, b) => {
      let aa = dists[a];
      let bb = dists[b];
      let t = bb.d - aa.d;
      if(t === 0) {
        let mhdA = Math.abs(aa.x - targetX) + Math.abs(aa.y - targetY);
        let mhdB = Math.abs(bb.x - targetX) + Math.abs(bb.y - targetY);
        return mhdB - mhdA;
      }
      return t;
    });*/
    /*console.log(cnt);
    console.log(edge);
    console.log(done);
    console.log(dists);*/
  }
}

Cave.prototype.getCave = function() {
  return this.erosionLevelMap.map((e) => e.map((ee) => ee % 3));
}

Cave.prototype.renderCave = function() {
  let { target } = this;
  let symbols = ['.', '=', '|'];
  let mapped = this.getCave().map((e) => e.map((ee) => symbols[ee]));
  mapped[0][0] = 'M';
  if(target.x < mapped[0].length && target.y < mapped.length) {
    mapped[target.y][target.x] = 'T';
  }
  return mapped.map((e) => e.join('')).join('\n');
}

const buildCave = (target, depth, nRow = target[1] + 1, nCol = target[0] + 1) => {
  // Allocate map
  let map = [];
  for(let i = 0; i < nRow; i++) {
    map.push(new Array(nCol).fill(0));
  }

  //// Geologic index

  // Fill map
  // D'oh!
  /*map = map.map((e, iy, a) => {
    if(iy === 0) {
      console.log('Filling first row');
      return e.map((ee, ix) => 16807*ix);
    } else {
      console.log(`Filling ${iy}th row`);
      return e.map((ee, ix, aa) => {
        if(ix == 0) {
          console.log('First column')
          return 48271*iy;
        } else {
          console.log(`${ix}th column`)
          return aa[ix-1] * a[iy-1][ix];
        }
      });
    }
  });*/

  for(let y = 0; y < nRow; y++) {
    for(let x = 0; x < nCol; x++) {
      if(y === 0) {
        if(x === 0) {
          map[y][x] = erosionLevel(0, depth);
        } else {
          map[y][x] = erosionLevel(16807*x, depth);
        }
      } else if(x === 0) {
        map[y][x] = erosionLevel(48271*y, depth);
      } else if(x === target[0] && y === target[1]) {
        map[y][x] = erosionLevel(0, depth);
      } else {
        map[y][x] = erosionLevel(map[y-1][x]*map[y][x-1], depth);
      }
    }
  }

  return map.map((e) => e.map((ee) => ee % 3));
}



exports.solver = function(input) {
  testInput = 'depth: 510 target: 10,10';

  const testDepth = Number.parseInt(testInput.match(/depth: (\d+)/)[1]);
  const testTargetMatch = testInput.match(/target: (\d+),(\d+)/);
  const testTarget = [testTargetMatch[1], testTargetMatch[2]].map((x) => Number.parseInt(x));

  const testCave = new Cave(testTarget, testDepth);
  //testCave.at(15, 15);
  console.log(testCave.renderCave());
  console.log(testCave.getCave());

  console.log(testCave.findShortestPath(10, 10));

  const depth = Number.parseInt(input.match(/depth: (\d+)/)[1]);
  const targetMatch = input.match(/target: (\d+),(\d+)/);
  const target = [targetMatch[1], targetMatch[2]].map((x) => Number.parseInt(x));

  const cave = new Cave(target, depth);

  cave.at(1000, 1000);

  const t = cave.findShortestPath(target[0], target[1]);

  console.log(t);
  console.log(cave.renderCave());

  // TODO: Add getMapTo or something to Cave
  //const riskLevel = cave.reduce((s, e) => s + e.reduce((ss, ee) => ss + ee), 0);
  return `The risk level to get to the target is ${riskLevel}.
It takes ${t} minutes to get to santas friend.`;
}
