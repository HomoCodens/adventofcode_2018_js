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

  let solution = {
    power: 0,
    pos: [1, 1]
  };

  for(let y = 1; y <= (gridDim - 2); y++) {
    for(let x = 1; x <= (gridDim - 2); x++) {
      let pwr = 0;
      for(let xx = x - 1; xx <= x + 1; xx++) {
        for(let yy = y - 1; yy <= y + 1; yy++) {
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

  const { pos, power } = solution;
  return `The cell at [${pos[0]}, ${pos[1]}] has max power (${power}).`;
}
