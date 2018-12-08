const makeTree = (inp) => {
  const nChildren = inp.shift();
  const nMeta = inp.shift();
  let children = [];
  let meta = [];
  for(let i = 0; i < nChildren; i++) {
    children.push(makeTree(inp));
  }
  for(let i = 0; i < nMeta; i++) {
    meta.push(inp.shift());
  }
  return {
    children,
    meta
  };
}

const sumMeta = (node) => {
  return node.meta.reduce((s, e) => s + e) +
                node.children.map(sumMeta).reduce((s, e) => s + e, 0);
}

const nodeValue = (node) => {
  const { children, meta } = node;
  if(children.length == 0) {
    return meta.reduce((s, e) => s + e);
  } else {
    return meta.map((x) => {
      if(x == 0 || x > children.length) {
        return 0;
      } else {
        return nodeValue(children[x-1]);
      }
    }).reduce((s, e) => s + e);
  }
}

const nDescendants = (node) => {
  return node.children.length + node.children.map(nDescendants).reduce((s, e) => s + e, 0);
}

exports.solver = function(input) {
  //input = '2 3 0 3 10 11 12 1 1 0 1 99 2 1 1 2';
  input = input.split(' ').map((x) => Number.parseInt(x));
  const tree = makeTree(input);

  console.log(`Btw, the tree contains ${nDescendants(tree) + 1} nodes. just saying.`);

  return `The metadata of the tree sums up to ${sumMeta(tree)}.
The value of the root node is ${nodeValue(tree)}.`;
}
