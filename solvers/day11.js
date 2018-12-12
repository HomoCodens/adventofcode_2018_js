const powerLevel = (x, y, gridSerialNr) => {
  const rackId = x + 10;
  let powerLevel = rackId*y;
  powerLevel += gridSerialNr;
  powerLevel *= rackId;
  powerLevel = Math.floor((powerLevel % 1000)/100);
  powerLevel -= 5;
  return powerLevel;
}

const maximumPowerSubgrid = (grid, size) => {
  const gridDim = grid.length;

  let solution = {
    power: 0,
    pos: [1, 1]
  };

  for(let y = 1; y <= (gridDim - size + 1); y++) {
    for(let x = 1; x <= (gridDim - size + 1); x++) {
      let pwr = 0;
      for(let xx = x - 1; xx <= x + size - 2; xx++) {
        for(let yy = y - 1; yy <= y + size - 2; yy++) {
          //console.log(`[${xx}, ${yy}]`);
          pwr += grid[yy][xx];
        }
      }
      if(pwr > solution.power) {
        solution = {
          power: pwr,
          pos: [x, y]
        };
      }
    }
  }

  return {
    ...solution,
    size
  };
}

exports.solver = function(input) {
  console.log(powerLevel(3, 5, 8)); // 4
  console.log(powerLevel(122, 79, 57)); // -5
  console.log(powerLevel(217, 196, 39)); // 0
  console.log(powerLevel(101, 153, 71)); // 4

  const gridSerialNr = Number.parseInt(input);
  const gridDim = 300;

  let grid = [];
  for(let y = 1; y <= gridDim; y++) {
    let row = [];
    for(let x = 1; x <= gridDim; x++) {
      row.push(powerLevel(x, y, gridSerialNr));
    }
    grid.push(row);
  }

  const { pos: pos1, power: power1 } = maximumPowerSubgrid(grid, 3);

  let solution2 = {
    power: -Infinity
  };

  for(let s = 1; s <= gridDim; s++) {
    process.stdout.write(`\rSearching w/ size ${s}...`);
    let sol = maximumPowerSubgrid(grid, s);
    if(sol.power > solution2.power) {
      solution2 = sol;
    }
  }
  process.stdout.write('\n');

  const { pos: pos2, power: power2, size } = solution2;

  return `The cell at [${pos1[0]}, ${pos1[1]}] has max power (${power1}).
When twiddling the knob, we get [${pos2[0]}, ${pos2[1]}], size ${size} (${power2}).`;
}
