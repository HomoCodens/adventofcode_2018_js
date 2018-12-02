exports.solver = function(input) {
  /*input = `abcdef
bababc
abbcde
abcccd
aabcdd
abcdee
ababab`;*/

  /*input = `abcde
fghij
klmno
pqrst
fguij
axcye
wvxyz`;*/

  const ids = input.split('\n');

  const types = ids.map((x) => {
    const aCode = 'a'.charCodeAt(0);
    let counts = Array(26).fill(0);
    for(let i = 0; i < x.length; i++) {
      counts[x.charCodeAt(i) - aCode]++;
    }
    return [counts.indexOf(2) >= 0, counts.indexOf(3) >= 0];
  });

  const checkSum = types.reduce((s, e) => {
    return [s[0] + e[0], s[1] + e[1]];
  }).reduce((s, e) => {
    return s * e;
  });

  //////////////////////////////////////////
  // Part deux
  /////////////////////////////////////////
  let boxesWithFabric = [];
  let solution = '';
  let found = false;
  for(let i = 0; i < (ids.length - 1) && !found; i++) {
    let a = ids[i];
    for(let j = i + 1; j < ids.length && !found; j++) {
      let b = ids[j];
      let differingLetters = 0;
      let lastMisMatch = 0;
      for(let l = 0; l < a.length && l < b.length; l++) {
        if(a.charAt(l) !== b.charAt(l)) {
          differingLetters++;
          lastMisMatch = l;
        }
      }
      if(differingLetters === 1) {
        boxesWithFabric = [a, b];
        let aChars = a.split('');
        aChars.splice(lastMisMatch, 1);
        solution = aChars.join('');
        found = true;
      }
    }
  }

  return `The checksum is ${checkSum}
The boxes containing the fabric are ${boxesWithFabric[0]} and ${boxesWithFabric[1]}
The solution is therefore ${solution}`;
}
