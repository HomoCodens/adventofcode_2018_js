const render = (elves, recipes) => {
  return recipes.map((e, i) => {
    let elf = elves.indexOf(i);
    if(elf >= 0) {
      return `(${elf}: ${e})`;
    } else {
      return `${e}`;
    }
  }).join(' ');
}

const checkCondition2 = (recipes, pattern) => {
  const patternLength = pattern.length;
  const nRecipes = recipes.length;
  if(nRecipes < patternLength) {
    return -1;
  } else {
    /*onst p = recipes.filter((e, i) => i >= nRecipes - patternLength).
                    join('');
    console.log(`${nRecipes}: ${p} (pattern length ${patternLength})`);
    return p == pattern;*/

    let match = 0;
    for(let i = 0; i < patternLength; i++) {
      if(pattern[i] !== recipes[nRecipes - patternLength + i]) {
        match = -1;
        break;
      }
    }

    if(match === 0) {
      return match;
    } else {
      if(nRecipes < patternLength + 1) {
        return -1;
      }
      for(let i = 0; i < patternLength; i++) {
        if(pattern[i] !== recipes[nRecipes - patternLength - 1 + i]) {
          return -1;
        }
      }
    }

    return 1;
  }
}

const doTheRecipeDance = (nSteps, part = 1) => {
  let recipes = [3, 7];
  let elves = [0, 1];

  const patternLength = nSteps.length;

  if(part === 2) {
    nSteps = nSteps.split('').map((x) => Number.parseInt(x));
  }

  //let cnt = 0;
  let patternMatch = 0;

  while((part === 1 && recipes.length < nSteps + 10 + 1) ||
          (part === 2)){
    nSteps <= 20 && console.log(render(elves, recipes));

    //++cnt % 10000 === 0 && console.log(recipes.length);

    const elfScores = elves.map((e) => recipes[e]);
    const totalScore = elfScores.reduce((s, e) => s + e);
    if(totalScore >= 10) {
      recipes.push(Math.floor(totalScore/10));
    }
    recipes.push(totalScore % 10);

    elves = elves.map((e, i) => (e + 1 + elfScores[i]) % recipes.length);

    if(part === 2) {
      patternMatch = checkCondition2(recipes, nSteps);
      if(patternMatch >= 0) {
        break;
      }
    }
  }

  let solution = null;

  if(part == 1) {
    solution = '';
    for(let i = nSteps; i < nSteps + 10; i++) {
      solution += recipes[i];
    }
  } else {
    solution = recipes.length - patternLength - patternMatch;
  }

  return solution;
}

const doTheRecipeDance2 = (pattern) => {
  let recipes = '37';
  let elves = [0, 1];

  const charCode0 = '0'.charCodeAt();

  const patternLength = pattern.length;

  let cnt = 0;

  while(true) {
    ++cnt % 10000 === 0 && console.log(cnt);

    const elfScores = elves.map((e) => recipes.charCodeAt(e) - charCode0);
    const totalScore = '' + elfScores.reduce((s, e) => s + e);
    recipes += totalScore;

    elves = elves.map((e, i) => (e + 1 + elfScores[i]) % recipes.length);

    if(recipes.length >= patternLength && recipes.substr(-patternLength) === pattern) {
      break;
    }
  }

  return recipes.length - patternLength;
}

exports.solver = function(input) {
  const nSteps = Number.parseInt(input);

  console.log(doTheRecipeDance(9));
  console.log(doTheRecipeDance(5));
  console.log(doTheRecipeDance(18));
  console.log(doTheRecipeDance(2018));

  const solution1 = doTheRecipeDance(nSteps);

  console.log(doTheRecipeDance('51589', 2));
  console.log(doTheRecipeDance('451589', 2));
  console.log(doTheRecipeDance('01245', 2));
  console.log(doTheRecipeDance('92510', 2));
  console.log(doTheRecipeDance('59414', 2));

  const solution2 = doTheRecipeDance(input, 2);

  // Wrote another (muuuch slower) version because I thought I was overflowing
  // the JS heap. Turns out, I forgot to take into account the case where
  // the pattern appears in the first from last subpattern of recipes.
  /*console.log(doTheRecipeDance2('51589'));
  console.log(doTheRecipeDance2('451589'));
  console.log(doTheRecipeDance2('01245'));
  console.log(doTheRecipeDance2('92510'));
  console.log(doTheRecipeDance2('59414'));

  const solution2 = doTheRecipeDance2(input);*/

  return `After ${nSteps}, the next 10 scores are ${solution1}.
The solutian to part deux is ${solution2}.`
}
