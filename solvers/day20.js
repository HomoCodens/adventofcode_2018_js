const regex2Tree = (regex) => {
  let node = [];
  //console.log(regex);
  let children = [];
  let segment = '';
  let char = regex.shift();
  if(char === '^') {
    char = regex.shift();
  }
  while(!(char === ')' || char === '$') && regex.length) {
    if(char === '|') {
      //console.log('segment done');
      children.push(segment);
      segment = '';
    } else if(char === '(') {
      //console.log('stepping down');
      children.push(segment);
      segment = '';
      children.push(regex2Tree(regex));
    } else {
      segment += char;
      //console.log(segment);
    }
    char = regex.shift();
  }
  if(segment.length) {
    children.push(segment);
  }
  node.push(children);
  return node;
}

const buildMap = (tree) => {

}

const getAdjacency = (x, y, paths, state) => {
  if(!state) {
    state ={ };
  }

  console.log(`Begin walking from ${x}|${y}`);
  let xCurrent = x;
  let yCurrent = y;

  for(let p of paths) {
    if(p instanceof Array) {
      getAdjacency(xCurrent, yCurrent, p, state);
    } else {
      xCurrent = x;
      yCurrent = y;

      console.log(`start new path: ${p}`);
      for(let d of p) {
        console.log(`moving ${d}`)

        switch(d) {
          case 'N':
            state[`${xCurrent}|${yCurrent}>${xCurrent}|${yCurrent - 1}`] = true;
            state[`${xCurrent}|${yCurrent - 1}>${xCurrent}|${yCurrent}`] = true;
            yCurrent--;
            break;
          case 'E':
            state[`${xCurrent}|${yCurrent}>${xCurrent + 1}|${yCurrent}`] = true;
            state[`${xCurrent + 1}|${yCurrent}>${xCurrent}|${yCurrent}`] = true;
            xCurrent++;
            break;
          case 'S':
            state[`${xCurrent}|${yCurrent}>${xCurrent}|${yCurrent + 1}`] = true;
            yCurrent++;
            break;
          case 'W':
            state[`${xCurrent}|${yCurrent}>${xCurrent - 1}|${yCurrent}`] = true;
            xCurrent--;
            break;
        }
      }
    }
  }

  return state;
}

// Neat BUT does not consider all possible paths of course
// e.g. for input ^NN(E|WSSE)$
/*const walkTheMap = (x, y, paths, state) => {
  if(!state) {
    state = {'0|0': { dMin: 0, dMax: 0}};
  }

  console.log(`Begin walking from ${x}|${y}`)
  let { dMin, dMax } = state[`${x}|${y}`] || { dMin: 0, dMax: 0 };
  let dMinCurrent = dMin;
  let dMaxCurrent = dMax;
  let xCurrent = x;
  let yCurrent = y;

  for(let p of paths) {
    dMinCurrent = dMin;
    dMaxCurrent = dMax;
    if(p instanceof Array) {
      walkTheMap(xCurrent, yCurrent, p, state);
    } else {
      xCurrent = x;
      yCurrent = y;

      console.log(`start new path: ${p}`);
      for(let d of p) {
        dMinCurrent++;
        dMaxCurrent++;

        console.log(`moving ${d}`)

        switch(d) {
          case 'N':
            yCurrent--;
            break;
          case 'E':
            xCurrent++;
            break;
          case 'S':
            yCurrent++;
            break;
          case 'W':
            xCurrent--;
            break;
        }

        let space = state[`${xCurrent}|${yCurrent}`] || { dMin: Infinity, dMax: -Infinity};
        state[`${xCurrent}|${yCurrent}`] = {
          dMin: space.dMin < dMinCurrent ? space.dMin : dMinCurrent,
          dMax: space.dMax > dMinCurrent ? space.dMax : dMinCurrent
        };
        console.log(state);
      }
    }
  }

  return state;
}*/

exports.solver = function(input) {
  input = '^NN(E|WSSE)$';
  //input = '^ENWWW(NEEE|SSE(EE|N))$';
  //input = '^ENNWSWW(NEWS|)SSSEEN(WNSE|)EE(SWEN|)NNN$';
  //input = '^ESSWWN(E|NNENN(EESS(WNSE|)SSS|WWWSSSSE(SW|NNNE)))$';
  //input = '^WSSEESWWWNW(S|NENNEEEENN(ESSSSW(NWSW|SSEN)|WSWWN(E|WWS(E|SS))))$';

  let regArr = input.split('');
  // TODO
  const tree = regex2Tree(regArr)[0];

  let adj = getAdjacency(0, 0, tree);


  console.log(adj);

  return null;
}
