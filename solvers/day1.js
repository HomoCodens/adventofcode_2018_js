exports.solver = function(input) {

  const changes = input.split('\n').
                          map((x) => Number.parseInt(x));
  const resultingFrequency = changes.reduce((s, e) => s + e);

  let visitedFreqs = [];
  let runningFreq = 0;
  let i = 0;
  const nChanges = changes.length;
  while(visitedFreqs.indexOf(runningFreq += changes[i++ % nChanges]) === -1) {
    visitedFreqs.push(runningFreq);
  }

  /*let a = 0;
  let l = 10;
  for(let b = 0; b < 100; b++) {
    console.log(a);
    a = ++a < l ? a : 0;  // FUUUN!
  }*/

  return `The final frequency is ${resultingFrequency}.
When looping, the first double frequency is ${runningFreq}.`;
}
