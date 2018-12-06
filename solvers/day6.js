function Point(x, y, id) {
  this.x = x;
  this.y = y;
  this.id = id;
}

Point.prototype.manhattanDist = function(other) {
  return Math.abs(this.x - other.x) + Math.abs(this.y - other.y)
}

exports.solver = function(input) {
  /*input = `1, 1
1, 6
8, 3
3, 4
5, 5
8, 9`;*/

  console.log('Parsing input...');

  const points = input.split('\n').
                        map((x, i) => {
                          const coords = x.match(/(\d+), (\d+)/);
                          return new Point(
                            Number.parseInt(coords[1]),
                            Number.parseInt(coords[2]),
                            i
                          );
                        });

    // Mayhaps calculate this dynamically (works for the puzzle though)
    const gridSize = 1000;

    console.log('Setting up grid...');
    let grid = [];
    for(let i = 0; i < gridSize; i++) {
      grid.push(new Array(gridSize).fill(-1));
    }

    console.log('Populating grid...');
    for(let x = 0; x < gridSize; x++) {
      for(let y = 0; y < gridSize; y++) {
        const p = new Point(x, y);
        const dists = points.map((x) => {
          return {
            ...x,
            dist: x.manhattanDist(p)
          };
        }).sort((a, b) => a.dist - b.dist);
        if(dists[0].dist !== dists[1].dist) {
          grid[y][x] = dists[0].id;
        }
      }
    }

    console.log('Calculating areas...');
    const areas = grid.reduce((s, e) => {
      let out = [...s];
      e.map((x) => {
        if(x >= 0) {
          out[x]++
        }
      });
      return out;
    }, new Array(points.length).fill(0));

    const areaIsInfinite = (id) => {
      if(grid[0].indexOf(id) >= 0 || grid[gridSize - 1].indexOf(id) >= 0) {
        //console.log(`${id} is infinite because it appears at the top or bottom`);
        return true;
      }

      for(let i = 1; i < gridSize - 2; i++) {
          if(grid[i][0] == id || grid[i][gridSize - 1] == id) {
            //console.log(`${id} is infinite because it appears on the left or right`);
            return true;
          }
      }

      return false;
    }

    const biggestNonInfinite = areas.reduce((s, e, i) => {
      if(e > s.area && !areaIsInfinite(i)) {
        return {
          id: i,
          area: e
        };
      } else {
        return {...s}
      }
    }, {
      id: -1,
      area: 0
    });

    const {id: biggestId, area: biggestArea} = biggestNonInfinite;

    const maxDistSum = 10000;

    let grid2 = [];
    for(let i = 0; i < gridSize; i++) {
      grid2.push(new Array(gridSize).fill(false));
    }

    for(let x = 0; x < gridSize; x++) {
      for(let y = 0; y < gridSize; y++) {
        const p = new Point(x, y);
        const distFromAll = points.reduce((s, e) => s + e.manhattanDist(p), 0);
        if(distFromAll < maxDistSum) {
          grid2[y][x] = true;
        }
      }
    }

    const biggestSafeArea = grid2.reduce((s, e) => {
      return s + e.reduce((ss, ee) => ss + ee);
    }, 0);

    return `The biggest area stems from ${biggestId} and is ${biggestArea} cells big.
The biggest safe area is ${biggestSafeArea} cells big.`;
}
