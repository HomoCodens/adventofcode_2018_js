exports.solver = function(input) {

  const changes = input.split('\n').
                          map((x) => Number.parseInt(x));
  const resultingFrequency = changes.reduce((s, e) => s + e);

  let visitedFreqs = [];
  let runningFreq = 0;
  let i = 0;
  while(visitedFreqs.indexOf(runningFreq += changes[i]) === -1) {
    visitedFreqs.push(runningFreq);
    i = (i + 1) % changes.length;
  }

  return `The final frequency is ${resultingFrequency}.
When looping, the first double frequency is ${runningFreq}.`;
}
