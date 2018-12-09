const getHighScore = (nPlayers, nMarbles) => {
  let scores = new Array(nPlayers).fill(0);
  let marbles = [0];
  let currentMarble = 0;

  for(let m = 1; m <= nMarbles; m++) {
    const marblesInCircle = marbles.length;
    if(m % 23 > 0) {
      currentMarble = (currentMarble + 2) % marblesInCircle;
      if(currentMarble === 0) {
        currentMarble = marblesInCircle;
      }
      // Slow as f
      //marbles = [...marbles.slice(0, currentMarble), m, ...marbles.slice(currentMarble, marblesInCircle)];
      /*for(let i = marblesInCircle + 1; i >= currentMarble; i--) {
        marbles[i] = marbles[i - 1];
      }
      marbles[currentMarble] = m;*/
      marbles.splice(currentMarble, 0, m);
    } else {
      console.log(`score! (${m})`);
      const scoringPlayer = (m - 1) % nPlayers;
      scores[scoringPlayer] += m;
      currentMarble -= 7;
      if(currentMarble < 0) {
        currentMarble += marblesInCircle;
      }
      scores[scoringPlayer] += marbles.splice(currentMarble, 1)[0];
    }
  }

  return [...scores].sort((a, b) => b - a)[0];
}

exports.solver = function(input) {
  //input = '9 25'; // 32
  //input = '10 1618'; // 8317
  //input = '13 7999'; // 146373
  //input = '17 1104'; // 2764
  //input = '21 6111'; // 54718
  //input = '30 5807'; // 37305

  const matches = input.match(/([0-9]+)/g);
  const nPlayers = Number.parseInt(matches[0]);
  const nMarbles = Number.parseInt(matches[1]);

  let scores = new Array(nPlayers).fill(0);
  let marbles = [0];
  let currentMarble = 0;

  const highScore = getHighScore(nPlayers, nMarbles);
  // speed of my answer... yeah.
  const highScorex100 = getHighScore(nPlayers, 100*nMarbles);

  return `The high score is ${highScore}.
When cranking it up TO THE MAX, the highscore is ${highScorex100}.`
}
