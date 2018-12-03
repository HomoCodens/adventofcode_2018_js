const parseClaim = (claim) => {
  //#1 @ 167,777: 23x12
  const components = claim.match(/#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/).
                            map((x) => Number.parseInt(x));
  return {
    id: components[1],
    x: components[2],
    y: components[3],
    w: components[4],
    h: components[5]
  };
}

exports.solver = function(input) {
  const fabricDim = 1000;

  input = input.split('\n');
  const claims = input.map(parseClaim);

  let fabric = [];
  for(let i = 0; i < fabricDim; i++) {
    fabric.push(new Array(fabricDim).fill(0));
  }

  for(let i = 0; i < claims.length; i++) {
    const {id, x, y, w, h} = claims[i];
    for(let c = x; c < x + w; c++) {
      for(let r = y; r < y + h; r++) {
        fabric[r][c]++;
      }
    }
  }

  let noOverlapId = 0;
  for(let i = 0; i < claims.length && noOverlapId == 0; i++) {
    const {id, x, y, w, h} = claims[i];
    let overlaps = false;
    for(let c = x; c < x + w && !overlaps; c++) {
      for(let r = y; r < y + h && !overlaps; r++) {
        overlaps = overlaps || fabric[r][c] > 1;
      }
    }
    if(!overlaps) {
      noOverlapId = id;
    }
  }

  const nMultiClaim = fabric.reduce((s, e) => {
    return s + e.reduce((s, e) => s + (e > 1), 0);
  }, 0);


  return `A total of ${nMultiClaim} square inches are claimed multiple times.
The only claim with no overlap AT ALL is ${noOverlapId}.`
}
