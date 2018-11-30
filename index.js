const {solveDay, dayDriver} = require('./utils');

let startDay = 1;
let endDay = 25;
const startDayParam = Number.parseInt(process.argv[2]);
const endDayParam = Number.parseInt(process.argv[3]);

if(!Number.isNaN(startDayParam)) {
  startDay = startDayParam;
  if(!Number.isNaN(endDayParam)) {
    endDay = endDayParam;
  } else {
    endDay = startDayParam;
  }
}

dayDriver(startDay, endDay);
