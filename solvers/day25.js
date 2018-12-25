const manhattanDist = (a, b) => {
  let d = 0;
  for(let i = 0; i < a.length; i++) {
    d += Math.abs(a[i] - b[i]);
  }
  return d;
}

class Cluster {
  constructor(points) {
    this.points = points.map((e) => [...e]);
  }

  touches(other, d = 3) {
    for(let mine of this.points) {
      for(let theirs of other.points) {
        if(manhattanDist(mine, theirs) <= d) {
          return true;
        }
      }
    }

    return false;
  }
}

class Clusterverse {
  constructor(clusters) {
    this.clusters = clusters;
  }

  static fromLines(lines) {
    let clusters = [];
    for(let l of lines) {
      clusters.push(new Cluster([l.split(',').map((x) => Number.parseInt(x))]));
    }

    return new Clusterverse(clusters);
  }

  coalesce() {
    let { clusters } = this;
    let merged = true;
    while(merged) {
      console.log();
      console.log();
      console.log(this.render());
      merged = false;
      for(let i = 0; i < clusters.length - 1; i++) {
        for(let j = i + 1; j < clusters.length; j++) {
          if(clusters[i].touches(clusters[j])) {
            clusters[i] = new Cluster([...clusters[i].points, ...clusters[j].points]);
            clusters.splice(j, 1);
            merged = true;
            break;
          }
        }
        if(merged) {
          break;
        }
      }
    }
  }

  render() {
    return this.clusters.map((c, i) => `Cluster ${i}: ${c.points.map((p) => p.join()).join('\n')}`).join('\n\n');
  }
}

exports.solver = function(input) {
  testInput1 = `0,0,0,0
3,0,0,0
0,3,0,0
0,0,3,0
0,0,0,3
0,0,0,6
9,0,0,0
12,0,0,0`;

  testInput2 = `-1,2,2,0
0,0,2,-2
0,0,0,-2
-1,2,0,0
-2,-2,-2,2
3,0,2,-1
-1,3,2,2
-1,0,-1,0
0,2,1,-2
3,0,0,0`;

  testInput3 = `1,-1,0,1
2,0,-1,0
3,2,-1,0
0,0,3,1
0,0,-1,-1
2,3,-2,0
-2,2,0,0
2,-2,0,-1
1,-1,0,-1
3,2,0,2`;

  testInput4 = `1,-1,-1,-2
-2,-2,0,1
0,2,1,3
-2,3,-2,1
0,2,3,-2
-1,-1,1,-2
0,-2,-1,0
-2,2,3,-1
1,2,2,0
-1,-2,0,-2`;

  let clusters = Clusterverse.fromLines(input.split('\n'));
  clusters.coalesce();
  return `There are ${clusters.clusters.length} clusters.`
}
