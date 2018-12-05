const alchemize = (x) => {
  x = [...x];
  const regUpper = /[A-Z]/;
  const regLower = /[a-z]/;
  for(let i = 0; i < (x.length - 1); ) {
    const a = x[i];
    const b = x[i+1];
    if((regUpper.test(a) && regLower.test(b) ||
          regLower.test(a) && regUpper.test(b)) &&
        a.toLowerCase() === b.toLowerCase()) {
          x.splice(i, 2);
          //console.log(`splicing ${a}${b}`);
    } else {
      i++;
    }
  }

  return x;
}

const fullyAlchemize = (x) => {
  while(x.length !== (x = alchemize(x)).length) {}
  return x;
}

exports.solver = function(input) {
  const componentsInput = input.split('');

  const solution1 = fullyAlchemize([...componentsInput]);

  let bestLength = input.length;
  let bestLetter = 'a';
  for(let l = 'a'.charCodeAt(0); l <= 'z'.charCodeAt(0); l++) {
    const lLower = String.fromCharCode(l);
    const lUpper = lLower.toUpperCase();
    //console.log(lLower);
    const reg = new RegExp(`[${lLower}${lUpper}]`, 'g');
    let components = input.replace(reg, '').
                            split('');
    const solution = fullyAlchemize(components);
    if(solution.length < bestLength) {
      bestLength = solution.length;
      bestLetter = lLower;
    }
  }

  return `After alchemizing a couple of times, we are left with a polymer of length ${solution1.length}
Element ${bestLetter} is causing problems. After removing it, we get ${bestLength}.`;
}
