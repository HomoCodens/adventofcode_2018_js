/******
1) Reading order movements means priority up, left, right, down
2) First idea for strategy:
  a) Flood fill from agent until target hit
  -b) Flood fill from selected destination until agent hit-
  b) Select manhattan dist from each adjacent node to destination
  c) Select step
*/

const OOB = 'oob';
const ELF = 'elf';
const GOBLIN = 'goblin';
const WALL = 'wall';
const OPENSPACE = 'openspace';

function BeverageBandits(elves, goblins, map) {
  this.nRow = map.length;
  this.nCol = map[0].length;
  this.elves = elves;
  this.goblins = goblins;
  this.map = map;
  this.step = 0;
  this.fullRounds = 0;
}

BeverageBandits.prototype.cellContent = function(x, y) {
  if(x < 0 || x >= this.nCol || y < 0 || y >= this.nRow) {
    return oob(x, y);
  }

  if(this.map[y][x] === '#') {
    return wall(x, y);
  }

  for(let i = 0; i < this.elves.length; i++) {
    const elf = this.elves[i];
    if(elf.x === x && elf.y === y && !elf.ded) {
      return elf;
    }
  }

  for(let i = 0; i < this.goblins.length; i++) {
    const goblin = this.goblins[i];
    if(goblin.x === x && goblin.y === y && !goblin.ded) {
      return goblin;
    }
  }

  return openSpace(x, y);
}

BeverageBandits.prototype.allNeighbors = function(x, y) {
  return [
    this.cellContent(x, y-1),
    this.cellContent(x-1, y),
    this.cellContent(x+1, y),
    this.cellContent(x, y+1)
  ];
}

BeverageBandits.prototype.adjacentReachables = function(x, y) {
  return this.allNeighbors(x, y).filter((e) => e.type === OPENSPACE || e.ded);
}

BeverageBandits.prototype.adjacentEnemies = function(x, y, faction) {
  return this.allNeighbors(x, y).filter((e) => {
    if(faction === GOBLIN) {
      return e.type === ELF && !e.ded;
    } else if(faction === ELF) {
      return e.type === GOBLIN && !e.ded;
    }
  });
}

BeverageBandits.prototype.cellPassable = function(x, y) {
  if(this.map[y][x] === '#') {
    return false;
  }

  for(let i = 0; i < this.elves.length; i++) {
    if(!this.elves.ded && this.elves[i].x === x && this.elves[i].y === y) {
      return false;
    }
  }

  for(let i = 0; i < this.goblins.length; i++) {
    if(!this.goblins.ded && this.goblins[i].x === x && this.goblins[i].y === y) {
      return false;
    }
  }

  return true;
}

BeverageBandits.prototype.simulationStep = function() {
  const agents = readingOrder([...this.elves].concat([...this.goblins]));
  this.step++;

  agents.forEach((a, i) => {
    const { x, y, type, ded } = a;

    if(!ded) {
      const move = pathFind(a, this);
      a.x = move.x;
      a.y = move.y;

      let adjacentEnemies = this.adjacentEnemies(move.x, move.y, type);
      if(adjacentEnemies.length > 0) {
        adjacentEnemies = readingOrder(adjacentEnemies);
        adjacentEnemies.sort((a, b) => a.hp - b.hp);
        adjacentEnemies[0].hp -= a.str;

        if(adjacentEnemies[0].hp <= 0) {
          adjacentEnemies[0].ded = true;
        }
      }
    }

    if(i === agents.length - 1 && !this.battleOver()) {
      this.fullRounds++;
    }
  });
}

BeverageBandits.prototype.runToCompletion = function(renderOutput = false) {
  while(!this.battleOver()) {
    this.simulationStep()

    if(renderOutput) {
      console.log();
      console.log(this.step);
      console.log(this.render());
    }
  }
}

BeverageBandits.prototype.battleOver = function() {
  return this.elves.filter((e) => !e.ded).length === 0 ||
          this.goblins.filter((e) => !e.ded).length === 0;
}

BeverageBandits.prototype.winningTeam = function() {
  if(this.battleOver()) {
    return this.elves.filter((e) => !e.ded).length > 0 ? ELF : GOBLIN;
  }

  return null;
}

BeverageBandits.prototype.anyElvesDead = function() {
  return this.elves.reduce((s, e) => s || e.ded, false);
}

BeverageBandits.prototype.score = function() {
  const elvesWon = this.elves.filter((e) => !e.ded).length > 0;
  if(elvesWon) {
    return this.elves.reduce((s, e) => s + (e.ded ? 0 : e.hp), 0)*this.fullRounds;
  } else {
    return this.goblins.reduce((s, e) => s + (e.ded ? 0 : e.hp), 0)*this.fullRounds;
  }
}

BeverageBandits.prototype.render = function() {
  let output = this.map.map((r) => [...r]);

  for(let i = 0; i < this.elves.length; i++) {
    if(!this.elves[i].ded) {
      output[this.elves[i].y][this.elves[i].x] = 'E';
    }
  }

  for(let i = 0; i < this.goblins.length; i++) {
    if(!this.goblins[i].ded) {
      output[this.goblins[i].y][this.goblins[i].x] = 'G';
    }
  }

  const agents = readingOrder([...this.elves].concat([...this.goblins]));

  return output.map((r, i) => {
    let map = r.join('') + '\t';
    let currentAgents = [...agents].filter((e) => e.y === i && !e.ded);
    let status = '';
    for(let a = 0; a < currentAgents.length; a++) {
      status += currentAgents[a].type === ELF ? 'E' : 'G';
      status += '(' + currentAgents[a].hp + ')';
      status += a === currentAgents.length - 1 ? '' : ', ';
    }
    map += status;
    return map;
  }).join('\n');
}

const goblin = (x, y, id) => {
  return {
    type: GOBLIN, // For human readability
    x,
    y,
    id,
    str: 3,
    hp: 200,
    ded: false
  };
}

const elf = (x, y, id, str = 3) => {
  return {
    type: ELF,
    id,
    x,
    y,
    str,
    hp: 200,
    ded: false
  };
}

const openSpace = (x, y) => {
  return {
    type: OPENSPACE,
    x,
    y
  };
}

const wall = (x, y) => {
  return {
    type: WALL,
    x,
    y
  };
}

const oob = (x, y) => {
  return {
    type: OOB,
    x,
    y
  };
}

const readingOrder = (arr) => {
  return [...arr].sort((a, b) => {
    const d = a.y - b.y;
    if(d == 0) {
      return a.x - b.x;
    }

    return d;
  });
}

const parseField = (input, elvenStrength = 3) => {
  let elves = [];
  let goblins = [];
  let elfID = 0;
  let goblinID = 0;

  let map = input.split('\n').
                    map((r, y) => r.trim().
                                    split('').
                                    map((e, x) => {
                                      if(e === 'E') {
                                        elves.push(elf(x, y, ++elfID, elvenStrength));
                                        return '.';
                                      } else if(e === 'G') {
                                        goblins.push(goblin(x, y, --goblinID));
                                        return '.';
                                      }

                                      return e;
                                    }));

  return new BeverageBandits(elves, goblins, map);
}

const getEnemyFaction = (agent) => {
  return agent.type === ELF ? GOBLIN : ELF;
}

const findTargetPosition = (agent, board) => {
  /*console.log('findtp');
  console.log(agent);*/

  const enemyFaction = getEnemyFaction(agent);

  // We are already standing next to an enemy
  if(board.adjacentEnemies(agent.x, agent.y, agent.type).length > 0) {
    return agent;
  }

  const { nRow, nCol } = board;
  let visited = new Array(nRow).fill(0).map(() => new Array(nCol).fill(0));
  let edge = [agent];

  let candidateEnemies = [];

  while(edge.length && candidateEnemies.length === 0) {
    let newEdge = [];

    for(let i = 0; i < edge.length; i++) {
      const node = edge[i];
      visited[node.y][node.x]++;

      const neighbors = board.allNeighbors(node.x, node.y);
      for(let n = 0; n < neighbors.length; n++) {
        const neighbor = neighbors[n];
        const { type } = neighbor;

        if(visited[neighbor.y][neighbor.x] === 0) {
          if(type === enemyFaction && !neighbor.ded) {
            //console.log('yay, enemy');
            candidateEnemies.push(neighbor);
          } else if(candidateEnemies.length === 0 && (type == OPENSPACE || neighbor.ded)) {
            let okToPush = true;
            for(let e = 0; e < newEdge.length; e++) {
              if(newEdge[e].x === neighbor.x && newEdge[e].y === neighbor.y) {
                //console.log('nopedynopen');
                okToPush = false;
                break;
              }
            }
            if(okToPush) {
              newEdge.push(neighbor);
            }
          }
        }
      }
    }

    /*if(board.step === 34) {
      console.log(visited.map((r) => r.join('')).join('\n'));
      console.log('\n\n');
    }*/

    edge = [...newEdge];
    //console.log(edge.length);
  }

  //console.log('mkay, out of the loop');
  //console.log(candidateEnemies);

  if(candidateEnemies.length > 0) {
    candidateEnemies = readingOrder(candidateEnemies);

    // They are already in reading order
    const candidateSpaces = board.adjacentReachables(candidateEnemies[0].x, candidateEnemies[0].y);
    //console.log('returning out of findtp')
    return candidateSpaces.filter((e) => visited[e.y][e.x] === 1)[0];
  } else {
    return agent;
  }
}

const pathFind = (agent, board) => {
  const target = findTargetPosition(agent, board);

  if(target.x === agent.x && target.y === agent.y) {
    return agent;
  }

  const { nRow, nCol } = board;
  let flood = new Array(nRow).fill(0).map(() => new Array(nCol).fill(-1));

  let edge = [target];
  let candidateSpaces = [];
  let step = 1;

  while(edge.length && candidateSpaces.length === 0) {
    let newEdge = [];
    for(let i = 0; i < edge.length; i++) {
      const node = edge[i];
      flood[node.y][node.x] = step;

      const neighbors = board.allNeighbors(node.x, node.y);
      for(let n = 0; n < neighbors.length; n++) {
        const neighbor = neighbors[n];

        if(flood[neighbor.y][neighbor.x] < 0) {
          const { type } = neighbor;
          if(neighbor.x === agent.x && neighbor.y === agent.y) {
            candidateSpaces.push(node);
          } else if(candidateSpaces.length === 0 && (type === OPENSPACE || neighbor.ded)) {
            let okToPush = true;
            for(let e = 0; e < newEdge.length; e++) {
              if(newEdge[e].x === neighbor.x && newEdge[e].y === neighbor.y) {
                //console.log('nopedynopen');
                okToPush = false;
                break;
              }
            }
            if(okToPush) {
              newEdge.push(neighbor);
            }
          }
        }
      }
    }

    /*if(board.step === 34) {
      console.log(flood.map((r) => r.join('')).join('\n'));
      console.log('\n\n');
    }*/

    edge = [...newEdge];
    step++;
  }

  const move = readingOrder(candidateSpaces)[0];
  return move;
}

const doThePart1Thing = (input) => {
  const battle = parseField(input);
  battle.runToCompletion(true);
  console.log('\n\n');

  return battle.score();
}

const doThePart2Thing = (input) => {
  let elvenStrength = 4;
  let battle = null;
  while(true) {
    console.log(`Trying with strength ${elvenStrength}.`);
    battle = parseField(input, elvenStrength);
    battle.runToCompletion(false);
    if(battle.winningTeam() === ELF && !battle.anyElvesDead()) {
      break;
    }
    elvenStrength++;
  }

  return battle.score();
}

exports.solver = function(input) {
  /*const pathFinding101 = `#######
                          #.E...#
                          #.....#
                          #...G.#
                          #######`;
  let pathFinding101Parsed = parseField(pathFinding101);

  console.log(pathFinding101Parsed);

  console.log(pathFinding101Parsed.adjacentReachables(1, 1));
  console.log(pathFinding101Parsed.adjacentReachables(2, 3));

  pathFind(pathFinding101Parsed.elves[0], pathFinding101Parsed);

  console.log(pathFinding101Parsed.render());

  pathFinding101Parsed.simulationStep();
  console.log(pathFinding101Parsed.render());

  const pathFinding102 = `#########
                          #G..G..G#
                          #.......#
                          #.......#
                          #G..E..G#
                          #.......#
                          #.......#
                          #G..G..G#
                          #########`;

  const pathFinding102Parsed = parseField(pathFinding102);
  console.log(pathFinding102Parsed.render());
  for(i = 0; i < 4; i++) {
    console.log(i+1);
    pathFinding102Parsed.simulationStep();
    console.log(pathFinding102Parsed.render());
  }

  const fullExample = parseField(`#######
                                  #.G...#
                                  #...EG#
                                  #.#.#G#
                                  #..G#E#
                                  #.....#
                                  #######`);

  console.log(fullExample.render());
  while(!fullExample.battleOver()) {
    fullExample.simulationStep();
    console.log();
    console.log(fullExample.step);
    console.log(fullExample.render());
  }

  console.log(fullExample.score());*/

  const ex1Score = doThePart1Thing(`#######
#G..#E#
#E#E.E#
#G.##.#
#...#E#
#...E.#
#######`);

  const ex2Score = doThePart1Thing(`#######
#E..EG#
#.#G.E#
#E.##E#
#G..#.#
#..E#.#
#######`);

  const ex3Score = doThePart1Thing(`#######
#E.G#.#
#.#G..#
#G.#.G#
#G..#.#
#...E.#
#######`);

  const ex4Score = doThePart1Thing(`#######
#.E...#
#.#..G#
#.###.#
#E#G#G#
#...#G#
#######`);

  const ex5Score = doThePart1Thing(`#########
#G......#
#.E.#...#
#..##..G#
#...##..#
#...#...#
#.G...G.#
#.....G.#
#########`);

  console.log(`Example 1: ${ex1Score === 36334 ? 'PASS' : 'FAIL'}.`);
  console.log(`Example 2: ${ex2Score === 39514 ? 'PASS' : 'FAIL'}.`);
  console.log(`Example 3: ${ex3Score === 27755 ? 'PASS' : 'FAIL'}.`);
  console.log(`Example 4: ${ex4Score === 28944 ? 'PASS' : 'FAIL'}.`);
  console.log(`Example 5: ${ex5Score === 18740 ? 'PASS' : 'FAIL'}.`);


  return `After a gruesome battle, the score is ${doThePart1Thing(input)}.
Fiddling with the timeline: ${doThePart2Thing(input)}.`
}
