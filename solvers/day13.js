const drive = (cart) => {
  //console.log('driving');
  //console.log(cart);
  let { x, v } = cart;
  for(let i = 0; i < 2; i++) {
    x[i] += v[i];
  }

  return {
    x,
    ...cart
  };
}

const straight = (cart) => cart;

const curveLeft = (cart) => {
  //console.log('curving left');
  let { v } = cart;
  v = [v[1], -v[0]];
  return {...cart, v};
}

const curveRight = (cart) => {
  //console.log('curving right');
  let { v } = cart;
  v = [-v[1], v[0]];
  return {...cart, v};
}

const intersection = (cart) => {
  //console.log('intersection!');
  // left, straight, right
  let { intersectionMode } = cart;
  const newCart = {
    ...cart,
    intersectionMode: (intersectionMode + 1) % 3
  }
  switch(intersectionMode) {
    case 0:
      return curveLeft(newCart);
    case 1:
      return straight(newCart);
    case 2:
      return curveRight(newCart);
  }
}

const makeCart = (x, y, facing) => {
  const vs = {
    '>': [1, 0],
    'v': [0, 1],
    '<': [-1, 0],
    '^': [0, -1]
  };

  return {
    x: [x, y],
    v: vs[facing],
    intersectionMode: 0,
    id: `${x}-${y}`
  };
}

const applyTrack = (cart, segment) => {
  //console.log(segment);
  switch(segment) {
    case '|':
    case '-':
      return straight(cart);
    case '+':
      return intersection(cart);
    case '/':
      if(cart.v[0] == 0) {
        return curveRight(cart);
      } else {
        return curveLeft(cart);
      }
    case '\\':
      if(cart.v[1] == 0) {
        return curveRight(cart);
      } else {
        return curveLeft(cart);
      }
  }
}

const findCollision = (carts) => {
  for(let i = 0; i < carts.length - 1; i++) {
    for(let j = i + 1; j < carts.length; j++) {
      let { x: xa } = carts[i];
      let { x: xb } = carts[j];
      if(xa[0] === xb[0] && xa[1] === xb[1]) {
        return [...xa];
      }
    }
  }

  return null;
}

const doStep = (carts, map) => {
  carts.sort((a, b) => {
    let t = a.x[1] - b.x[1];
    if(t === 0) {
      return a.x[0] - b.x[0];
    } else {
      return t;
    }
  });

  let collision = false;
  let collisionAt = [];

  for(let i = 0; i < carts.length && carts.length > 0; i++) {
    const cart = drive(carts[i]);
    //console.log(`doing this cart at ${i}.`);
    //console.log(cart);
    const { x } = cart;

    carts[i] = applyTrack(cart, map[x[1]][x[0]]);
    let coll = findCollision(carts);
    if(coll !== null) {
      i = Math.max(i - 1, 0);
      //console.log('Ouchie');
      collision = true;
      collisionAt.push(x);
      carts = carts.filter((e, idx) => {
        if(e.x[0] === x[0] && e.x[1] === x[1]) {
          //console.log(`killing:`);
          //console.log(e);
          i = idx <= i ? Math.max(i - 1, 0) : i;
          //i--;
          return false;
        }

        return true;
      });

      //console.log(carts);
    } else {
      // console.log('No collision, everything OK!');
    }
  }

  return {
    carts,
    collision,
    collisionAt
  };
}

const render = (carts, collisions, map) => {
  return map.map((r, i) => {
    let nr = [...r];
    for(let c = 0; c < carts.length; c++) {
      let { x, v } = carts[c];
      if(x[1] === i) {
        if(nr[x[0]].match(/[>v<^]/)) {
          nr[x[0]] = 'X';
        } else {
          let cartSymbol = '>';
          if(v[0] === 0 && v[1] === 1) {
            cartSymbol = 'v';
          } else if(v[0] === -1 && v[1] === 0) {
            cartSymbol = '<';
          } else if(v[0] === 0 && v[1] === -1) {
            cartSymbol = '^';
          }
          nr[x[0]] = cartSymbol;
        }
      }
    }

    if(collisions) {
      for(let c = 0; c < collisions.length; c++) {
        if(collisions[c][1] === i) {
          nr[collisions[c][0]] = 'X';
        }
      }
    }

    return nr.join('');
  }).join('\n');
}

exports.solver = function(input) {
  // (in)sanity ckeck
  //input = '/-<>-\\\n|    |\n|    |\n\\----/';

  // Example from site
  /*input = `/->-\\        \n|   |  /----\\
| /-+--+-\\  |
| | |  | v  |
\\-+-/  \\-+--/
  \\------/   `;*/

  // (in)sanity ckeck 2
  //input = '/-<>-\\\n|    |\n|    |\n\\-->-/';

  // example p2
  /*input = `/>-<\\
|   |
| /<+-\\
| | | v
\\>+</ |
  |   ^
  \\<->/`;*/

  // insanity
  //input = '/<--\\\n|   |\n|   ^\n\\---/';

  let carts = [];
  let map = input.split('\n').map((r) => r.split(''));
  for(let i = 0; i < map.length; i++) {
    for(let j = 0; j < map[i].length; j++) {
      if(map[i][j].match(/[>v<^]/)) {
        carts.push(makeCart(j, i, map[i][j]));
        if(map[i][j].match(/[<>]/)) {
          map[i][j] = '-';
        } else {
          map[i][j] = '|';
        }
      }
    }
  }

  //console.log(carts);
  /*console.log(map);
  console.log(findCollision(carts));*/
  console.log(render(carts, [], map));

  let coll = null;
  let step = 0;
  let firstCollision = null;
  let nextState = {
    collision: false
  };

  while(carts.length > 1) {
    console.log(`Step: ${step}, surviving carts: ${carts.length}.`);
    const nextState = doStep(carts, map);
    carts = nextState.carts;
    map.length <= 20 && console.log(render(carts, nextState.collisionAt, map));
    if(nextState.collision && firstCollision === null) {
      firstCollision = nextState.collisionAt[0];
    }
    step++;
  }

  return `The ferst crash does happen at ${firstCollision}.
The Highlander Cart arrives at ${carts[0].x}.`;
}
