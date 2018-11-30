const fs = require('fs');
const fsp = require('fs').promises;

const solveDay = (day) => {
  const solver = require('./solvers/day' + day).solver;

  return fsp.readFile('./inputs/day' + day + '.txt', {encoding: 'utf-8'}).then((input) => {
    input = input.replace(/(\r\n$|\n$|\r$)/gm, '');

    const output = solver(input);

    if(output !== null) {
      if(output) {
        console.log(output);
        console.log('\n');
      }
    } else {
      console.log('Solver not implemented yet!\n\n');
    }
  }).catch((e) => {
    console.log(e);
    //console.log('Input not found!');
  });
}

const dayDriver = (day, endDay) => {
  if(day <= endDay) {
    console.log('=================================');
    console.log(`Day ${day}:`)
    console.log('=================================');

    const inputFile = `./inputs/day${day}.txt`

    if(fs.existsSync(inputFile)) {
      solveDay(day).then(() => dayDriver(day+1, endDay));
    } else {
      console.log('No input found.\n\n');
      dayDriver(day + 1, endDay);
    }
  }
}

exports.solveDay = solveDay;
exports.dayDriver = dayDriver;
