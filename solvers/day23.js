const manhattanDistance = (a, b) => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
}

const inRange = (bot, x) => {
  return manhattanDistance(bot, x) <= bot.r;
}

const botsOverlap = (a, b) => {
  return manhattanDistance(a, b) <= a.r + b.r;
}

const parseBot = (l) => {
  //pos=<0,0,0>, r=4
  const components = l.match(/pos=<(-?\d+),(-?\d+),(-?\d+)>, r=(\d+)/).
                        map((x) => Number.parseInt(x));
  return {
    x: components[1],
    y: components[2],
    z: components[3],
    r: components[4]
  };
}

// Works, much too sloooow
const largestMutuallyConnectedGroup = (cluster, bots, clustersSoFar) => {
  //console.log('in');
  cluster.length >= 990 && console.log(cluster);
  if(cluster.length === 1) {
    //console.log('out');
    //console.log([cluster]);
    return [cluster];
  }

  // If all bots already mutually overlap, save the stepping down
  let fullyConnected = true;
  for(let botA of cluster) {
    for(let botB of cluster) {
      if(!botsOverlap(bots[botA], bots[botB])) {
        fullyConnected = false;
        break;
      }
    }
    if(!fullyConnected) {
      break;
    }
  }

  if(fullyConnected) {
    return [cluster];
  }

  let largestClusters = [];
  let largestClusterSize = 0;
  for(let botA of cluster) {
    //console.log(botA);

    let clusterA = [];
    for(let botB of cluster) {
      if(botA !== botB) {
        if(botsOverlap(bots[botA], bots[botB])) {
          clusterA.push(botB);
        }
      }
    }

    //console.log('intermediate')
    //console.log(clusterA);

    if(clusterA.length > 0 && clusterA.length + 1 >= largestClusterSize) {
      let subclusters = largestMutuallyConnectedGroup(clusterA, bots);
      /*if(subclusters.length > largestClusterSize) {
        largestClusters = [botA, ...subclusters];
        largestClusterSize = subclusters.length;
      }*/
      let subclusterSize = subclusters[0].length + 1;
      if(largestClusterSize <= subclusterSize) {
        //console.log(`Old largest was ${largestClusterSize}, new is ${subclusterSize}`)
        if(largestClusterSize === subclusterSize) {
          //console.log('concating');
          //console.log(subclusters)
          subclusters = subclusters.map((e) => [botA, ...e]);
          largestClusters = largestClusters.concat(subclusters);
        } else {
          //console.log('overwriting');
          largestClusters = subclusters.map((e) => [botA, ...e]);
        }
        largestClusterSize = subclusterSize;
      }
    }
  }

  largestClusters = largestClusters.map((e) => e.sort()).sort();
  let out = [];
  for(let i = 0; i < largestClusters.length; i++) {
    let ok = true;
    for(let j = 0; j < out.length; j++) {
      if(out[j].join() === largestClusters[i].join()) {
        ok = false;
        break;
      }
    }

    if(ok) {
      out.push(largestClusters[i]);
    }
  }

  //console.log('out')
  //console.log(out);

  return out;
}

const corners = (bot) => {
  let { x, y, z, r } = bot;
  return [
    { ...bot, x: x - r },
    { ...bot, x: x + r },
    { ...bot, y: y - r },
    { ...bot, y: y + r },
    { ...bot, z: z - r },
    { ...bot, z: z + r}
  ];
}

exports.solver = function(input) {
  /*input = `pos=<0,0,0>, r=4
pos=<1,0,0>, r=1
pos=<4,0,0>, r=3
pos=<0,2,0>, r=1
pos=<0,5,0>, r=3
pos=<0,0,3>, r=1
pos=<1,1,1>, r=1
pos=<1,1,2>, r=1
pos=<1,3,1>, r=1`;*/

  /*input = `pos=<10,12,12>, r=2
pos=<12,14,12>, r=2
pos=<16,12,12>, r=4
pos=<14,14,14>, r=6
pos=<50,50,50>, r=200
pos=<10,10,10>, r=5`;

  input = `pos=<-10,5,0>, r=5
pos=<-5,5,0>, r=7
pos=<5,5,0>, r=7
pos=<10,5,0>, r=5
pos=<0,-5,0>, r=9
pos=<0,-10,0>, r=5
pos=<15,6,0>, r=2
pos=<16,5,0>, r=2;
pos=<15,4,0>, r=2`;*/

  /*input =  `pos=<1,1,1>, r=3
pos=<2,2,2>, r=6`*/

  let nanoBots = input.split('\n').map(parseBot);

  let largestR = nanoBots[0];
  for(let i = 1; i < nanoBots.length; i++) {
    if(nanoBots[i].r > largestR.r) {
      largestR = nanoBots[i];
    }
  }

  let nBotsInRangeOfLargestR = 0;
  for(let i = 0; i < nanoBots.length; i++) {
    if(inRange(largestR, nanoBots[i])) {
      nBotsInRangeOfLargestR++;
    }
  }

  console.log(nanoBots);
  console.log(largestR);


  /*
  Works theoretically, blows up memory real fast in practice

  // Cluster: A group of nanobots with overlapping radii
  let clusters = [];

  // For each bot
  for(let i = 0; i < nanoBots.length && i < 3; i++) {
    console.log(`Looking at bot ${i}...`)
    let myClusters = [[i]];

    // For each other bot
    for(let j = 0; j < nanoBots.length; j++) {
      if(i !== j) {
        console.log(`Comparing to bot ${j}...`)

        // For each of my clusters
        let nClusters = myClusters.length;
        for(let k = 0; k < nClusters; k++) {
          //console.log(`Checking against cluster ${k}...`)

          // If the other bot belongs to that cluster
          let belongs = true;
          for(let l = 0; l < myClusters[k].length; l++) {
            //console.log(`Member ${l}...`)
            if(!botsOverlap(nanoBots[myClusters[k][l]], nanoBots[j])) {
              //console.log('Nope!')
              belongs = false;
              break;
            }
          }

          // Add a new cluster containing that bot
          if(belongs) {
            //console.log(`Adding new cluster...`)
            myClusters.push([...myClusters[k], j]);
            //console.log(myClusters.length);
          }
        }
        console.log(myClusters);
      }
    }

    myClusters.sort((a, b) => b.length - a.length);
    let longest = myClusters[0].length;

    // Add my biggest clusters to the global list
    for(let i = 0; i < myClusters.length && myClusters[i].length === longest; i++) {
      let ok = true;
      for(let j = 0; j < clusters.length; j++) {
        // Lazy man's array compare
        if(myClusters[i].sort().join() === clusters[j].sort().join()) {
          ok = false;
          break;
        }
      }

      if(ok) {
        clusters.push(myClusters[i]);
      }
    }
  }

  clusters.sort((a, b) => b.length - a.length);

  console.log(clusters);

  let clustersOfInterest = [clusters[0]];
  let i = 1;
  while(clusters[i].length === clustersOfInterest[0].length) {
    clustersOfInterest.push(clusters[i]);
    i++;
  }

  console.log(clustersOfInterest);*/

  //console.log(largestMutuallyConnectedGroup(new Array(nanoBots.length).fill(0).map((x, i) => i), nanoBots));

  /*let bestCorner = {
    pos: {},
    nBots: 0
  }

  for(let bot of nanoBots) {
    corners(bot).forEach((c) => {
      let nBots = nanoBots.filter((b) => manhattanDistance(b, c) <= b.r).length;
      if(nBots > bestCorner.nBots) {
        bestCorner = { pos: c, nBots };
      }
    });
  }

  let bestBots = nanoBots.filter((b) => manhattanDistance(b, bestCorner.pos) <= b.r);

  console.log(bestCorner);
  console.log(bestBots);*/


  // OK it works, but somehow it feels like this is vulnerable to local minima
  let minX = Math.min(0, nanoBots.reduce((s, e) => {
    let x = e.x - e.r;
    return s < x ? s : x;
  }, Infinity));
  let maxX = Math.max(0, nanoBots.reduce((s, e) => {
    let x = e.x + e.r;
    return s > x ? s : x;
  }, -Infinity));
  let minY = Math.min(0, nanoBots.reduce((s, e) => {
    let y = e.y - e.r;
    return s < y ? s : y;
  }, Infinity));
  let maxY = Math.max(0, nanoBots.reduce((s, e) => {
    let y = e.y + e.r;
    return s > y ? s : y;
  }, -Infinity));
  let minZ = Math.min(0, nanoBots.reduce((s, e) => {
    let z = e.z - e.r;
    return s < z ? s : z;
  }, Infinity));
  let maxZ = Math.max(0, nanoBots.reduce((s, e) => {
    let z = e.z + e.r;
    return s > z ? s : z;
  }, -Infinity));

  let smallestRadius = nanoBots.reduce((s, e) => s < e.r ? s : e.r, Infinity);

  let stepSize = 1;
  while(stepSize < smallestRadius/2) {
    stepSize *= 2;
  }
  minX = Math.floor(minX/stepSize)*stepSize;
  maxX = Math.ceil(maxX/stepSize)*stepSize;
  minY = Math.floor(minY/stepSize)*stepSize;
  maxY = Math.ceil(maxY/stepSize)*stepSize;
  minZ = Math.floor(minZ/stepSize)*stepSize;
  maxZ = Math.ceil(maxZ/stepSize)*stepSize;



  let found = false;
  let sol2 = null;
  let origin = {x: 0, y: 0, z: 0}
  while(!found) {
    console.log(`stepping at ${stepSize}`)
    let opt = {x: maxX, y: maxY, z: maxZ, count: 0};
    for(let xx = minX; xx <= maxX; xx += stepSize) {
      //console.log(`x: ${xx}`)
      for(let yy = minY; yy <= maxY; yy += stepSize) {
        //console.log(`x: ${xx}, y: ${yy}`)
        for(let zz = minZ; zz <= maxZ; zz += stepSize) {
          let ok = true;
          let moi = {x: xx, y: yy, z: zz};

          let count = nanoBots.filter((e) => inRange(e, moi)).length;
          if(count > opt.count) {
            opt = {x: xx, y: yy, z: zz, count};
          } else if(count === opt.count && manhattanDistance(moi, origin) < manhattanDistance(opt, origin)) {
            opt = {x: xx, y: yy, z: zz, count};
          }
        }
      }
    }

    if(stepSize === 1) {
      sol2 = opt;
      found = true;
    } else {
      console.log(`Optimum currently at [${[opt.x, opt.y, opt.z].join()}]`)
      stepSize /= 2;
      minX = opt.x - stepSize;
      maxX = opt.x + stepSize;
      minY = opt.y - stepSize;
      maxY = opt.y + stepSize;
      minZ = opt.z - stepSize;
      maxZ = opt.z + stepSize;
    }

  }

  console.log([sol2.x, sol2.y, sol2.z].join());
  return `${nBotsInRangeOfLargestR} nanobots are in range of the one with the largest range.
To be in range of the most bots we need to move ${manhattanDistance(sol2, origin)} spaces`
}
