const getNeighborCounts = (x, y, field) => {
  let nTrees = 0;
  let nLumberYards = 0;
  const nRow = field.length;
  const nCol = field[0].length;
  for(let xx = x - 1; xx <= x + 1; xx++) {
    if(xx >= 0 && xx < nCol) {
      for(let yy = y - 1; yy <= y + 1; yy++) {
        if(yy >= 0 && yy < nRow) {
          if(!(xx == x && yy == y)) {
            nTrees += field[yy][xx] === '|';
            nLumberYards += field[yy][xx] === '#';
          }
        }
      }
    }
  }

  return {
    nTrees,
    nLumberYards
  };
}

const step = (field) => {
  const nRow = field.length;
  const nCol = field[0].length;
  let newField = field.map((r) => r.map((x) => x));
  for(let y = 0; y < nRow; y++) {
    for(let x = 0; x < nCol; x++) {
      const neighbors = getNeighborCounts(x, y, field);
      //console.log(`${x} -- ${y}`);
      //console.log(neighbors);
      if(field[y][x] === '.' && neighbors.nTrees >= 3) {
        //console.log('spawning tree');
        newField[y][x] = '|';
      } else if (field[y][x] === '|' && neighbors.nLumberYards >= 3) {
        //console.log('upgrading to lumberyard')
        newField[y][x] = '#';
      } else if(field[y][x] === '#' && (neighbors.nTrees === 0 || neighbors.nLumberYards === 0)) {
        //console.log('decaying back to open');
        newField[y][x] = '.';
      }
    }
  }

  return newField;
}

const calculateScore = (field) => {
  const nTrees = field.reduce((s, e) => {
    return s + e.reduce((ss, ee) => ss + (ee === '|'), 0);
  }, 0);

  const nLumberYards = field.reduce((s, e) => {
    return s + e.reduce((ss, ee) => ss + (ee === '#'), 0);
  }, 0);

  return {
    nTrees,
    nLumberYards,
    score: nTrees * nLumberYards
  };
}

const render = (field) => field.map((r) => r.join('')).join('\n')  + '\n\n';

exports.solver = function(input) {
  /*input = `.#.#...|#.
.....#|##|
.|..|...#.
..|#.....#
#.#|||#|#|
...#.||...
.|....|...
||...#|.#|
|.||||..|.
...#.|..|.`;*/

  let state = input.split('\n').map((x) => x.split(''));

  console.log(render(state));

  for(let i = 0; i < 10; i++) {
    state = step(state);
    console.log(render(state));
  }

  const sol1 = calculateScore(state);

  state = input.split('\n').map((x) => x.split(''));

  let diffs = [];
  let diffReg = [];
  let cyclingDiffs = [];
  let matchCount = 0;
  let recodring = false;
  const matchThreshold = 5;
  let prevScore = 0;
  const nGenerations = 1000000000;
  let generation = 0;
  for(; generation < nGenerations; generation++) {
    state = step(state);
    let s = calculateScore(state);
    let d = s.score - prevScore;
    prevScore = s.score;

    if(!recodring) {
      diffReg.push(d);
      if(diffReg.length > matchThreshold) {
        diffReg.shift();
      }
      diffs.push(d);

      /*console.log('diffReg');
      console.log(diffReg);
      console.log('diffs');
      console.log(diffs);*/

      if(diffReg.length === matchThreshold && diffs.length > 3*matchThreshold) {
        let nMatches = 0;
        //console.log('looking for diffReg in diffs');
        let match = true;
        for(let i = diffs.length - 1; i >= 0; i--) {
          match = true;
          for(let ii = 0; ii < diffReg.length; ii++) {
            //console.log(`comparing: ${i}, ${ii} : ${i - ii}, ${diffReg.length - ii - 1} : ${diffs[i - ii]}, ${diffReg[diffReg.length - ii - 1]}`)
            if(diffs[i - ii] !== diffReg[diffReg.length - ii - 1]) {
              match = false;
              break;
            }
          }
          if(match) {
            let anyNegative = false;
            //console.log('found a match');
            //for(let i = 0; i < )
            nMatches++;
            //console.log(nMatches);
            if(nMatches == 3) {
              //console.log('switch to recodring mode');
              recodring = true;
              break;
            }
          }
        }
      }
    } else {
      cyclingDiffs.push(d);
      if(cyclingDiffs.length % 2 === 0) {
        let cycleLength = cyclingDiffs.length/2;
        let match = true;
        for(let i = 0; i < cycleLength; i++) {
          if(cyclingDiffs[i] !== cyclingDiffs[cycleLength + i]) {
            match = false;
          }
        }
        if(match) {
          //console.log(cyclingDiffs);
          cyclingDiffs = cyclingDiffs.splice(0, cycleLength);
          //console.log('found me some cycle');
          break; // out of the main loop
        }
      }
    }
  }


  let generationsRemaining = nGenerations - generation;
  let generationsContributing = generationsRemaining % cyclingDiffs.length;

  let sol2 = calculateScore(state).score;
  for(let i = 0; i < generationsContributing - 1; i++) {
    sol2 += cyclingDiffs[i];
  }
  console.log(render(state));

  /*let scores = [];
  let prevScore = 0;

  for(let i = 0; i < 1000; i++) {
    state = step(state);
    //(i % 1000 === 0) && console.log(i);
    const s = calculateScore(state);
    scores.push(s.score);
    console.log(s.score - prevScore);
    prevScore = s.score;
    //console.log(render(state));
  }*/

  /*let diff = scores.map((e, i, a) => {
    if(i > 0) {
      return e - a[i-1];
    }
  });

  console.log(diff);*/

  return `After 10 generations, there are ${sol1.nTrees} trees, ${sol1.nLumberYards} lumber yards giving ${sol1.score}.
After a whopping ${nGenerations} there is still ${sol2} thingies.`;

}
