const potStep = (pots, rules, debug) => {
  let newPots = {};
  Object.keys(pots).map((k) => {
    if(pots[k]) {
      newPots[k] = false
    }
  });
  const potKeys = Object.keys(pots).map((x) => Number.parseInt(x));
  const leftMost = Math.min(...potKeys);
  const rightMost = Math.max(...potKeys);

  for(let r = 0; r < rules.length; r++) {
    let hadAMatch = false;

    const { rule, outcome } = rules[r];
    debug && console.log(rule);
    for(let p = leftMost - 4; p <= rightMost + 4; p++) {
      debug && console.log(`checking pot ${p} against rule ${r}`);
      let match = true;
      for(let i = 0; i < rule.length; i++) {
        const pp = p - 2 + i;
        const hasPlant = (potKeys.indexOf(pp) >= 0) && pots[pp];
        debug && console.log(`subcheck ${i} => ${pp}`);
        debug && console.log(hasPlant);
        if(hasPlant !== rule[i]) {
          debug && console.log('no match, aborting');
          match = false;
          break;
        } else {
          debug && console.log('matching so far');
        }
      }

      if(match) {
        if(outcome) {
          debug && console.log(`Growing a plant at ${p} because of rule ${r}.`);
        } else {
          debug && console.log(`Not growing a plant at ${p} because of rule ${r}.`);
        }

        if(outcome || hadAMatch) {
          newPots[p] = outcome;
          hadAMatch = true;
        }
      }
    }
  }

  return newPots;
}

const renderPots = (pots, step) => {
  const keys = Object.keys(pots).sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
  return `${step} (start at ${keys[0]}): ${keys.map((k) => pots[k] ? '#' : '.').join('')}`;
}

const scorePots = (pots) => {
  return Object.keys(pots).
                  map((k) => pots[k] ? Number.parseInt(k) : 0).
                  reduce((s, e) => s + e);
}

exports.solver = function(input) {
  /*input = `initial state: #..#.#..##......###...###

..... => .
....# => .
...#. => .
...## => #
..#.. => #
..#.# => .
..##. => .
..### => .
.#... => #
.#..# => .
.#.#. => #
.#.## => #
.##.. => #
.##.# => .
.###. => .
.#### => #
#.... => .
#...# => .
#..#. => .
#..## => .
#.#.. => .
#.#.# => #
#.##. => .
#.### => #
##... => .
##..# => .
##.#. => #
##.## => #
###.. => #
###.# => #
####. => #
##### => .`;*/

  input = input.split('\n');
  let pots = input[0].match(/[.#]+/)[0].
                      split('').
                      reduce((s, e, i) => {
                        s[i] = e === '#';
                        return s;
                      }, {});
  const rules = input.slice(2).map((r) => {
    const components = r.match(/([.#]+) => ([.#])/);
    return {
      rule: components[1].split('').map((x) => x === '#'),
      outcome: components[2] === '#'
    };
  })
  // possible point of failure
  // and lo, it was (stoopy dev)
  //filter((r) => r.rule[2] !== r.outcome);

  console.log(renderPots(pots, 0))

  const nSteps = 155;
  let solution1 = 0;
  for(let i = 0; i < nSteps; i++) {
    pots = potStep(pots, rules);
    console.log(renderPots(pots, i + 1));

    if(i == 19) {
      solution1 = scorePots(pots);
    }
  }

  const scoreAtStabilization = scorePots(pots);
  const nFloaters = Object.keys(pots).filter((k) => pots[k]).length;
  console.log(nFloaters);
  const solution2 = (50000000000 - nSteps)*nFloaters + scoreAtStabilization;

  return `The sum of pots with plant after 20 steps is ${solution1}(?).
After Billions and Billions of [-stars-] generatons, the score is ${solution2}.`
}
