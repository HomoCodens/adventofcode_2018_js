/*
 cart: {
   x: [x, y],
   v: [vx, vy],
   intersectionMode: 0
 }*/

 const drive = (cart) => {
   let { x, v } = cart;
   for(let i = 0; i < 2; i++) {
     x[i] += v[i];
   }

   return {
     x,
     ...cart
   };
 }

const straight = drive;

const curveLeft = (cart) => {
  let { v } = cart;
  v = [v[1], -v[0]];
  return drive({v, ...cart});
}

const curveRight = (cart) => {
  let { v } = cart;
  v = [-v[1], v[0]];
  return drive({v, ...cart});
}

const intersection = (cart) => {
  // left, straight, right
  let { intersectionMode } = cart;
  const newCart = {
    intersectionMode: (intersectionMode + 1) % 3,
    ...cart
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
    intersectionMode: 0
  };
}

exports.solver = function(input) {
  return null;
}
