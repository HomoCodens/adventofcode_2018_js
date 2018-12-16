const addr = (registers, instr) => {
  let out = [...registers];
  out[instr[3]] = registers[instr[1]] + registers[instr[2]];
  return out;
}

const addi = (registers, instr) => {
  let out = [...registers];
  out[instr[3]] = registers[instr[1]] + instr[2];
  return out;
}

const mulr = (registers, instr) => {
  let out = [...registers];
  out[instr[3]] = registers[instr[1]] * registers[instr[2]];
  return out;
}

const muli = (registers, instr) => {
  let out = [...registers];
  out[instr[3]] = registers[instr[1]] * instr[2];
  return out;
}

const banr = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = registers[a] & registers[b];
  return out;
}

const bani = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = registers[a] & b;
  return out;
}

const borr = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = registers[a] | registers[b];
  return out;
}

const bori = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = registers[a] | b;
  return out;
}

const setr = (registers, instr) => {
  let out = [...registers];
  out[instr[3]] = registers[instr[1]];
  return out;
}

const seti = (registers, instr) => {
  // ET phone earth
  let out = [...registers];
  out[instr[3]] = instr[1];
  return out;
}

const gtir = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = a > registers[b] ? 1 : 0;
  return out;
}

const gtri = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = registers[a] > b ? 1 : 0;
  return out;
}

const gtrr = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = registers[a] > registers[b] ? 1 : 0;
  return out;
}

const eqir = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = a === registers[b] ? 1 : 0;
  return out;
}

const eqri = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = registers[a] === b ? 1 : 0;
  return out;
}

const eqrr = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = registers[a] === registers[b] ? 1 : 0;
  return out;
}

const instructions = {
  addr,
  addi,
  mulr,
  muli,
  banr,
  bani,
  borr,
  bori,
  setr,
  seti,
  gtir,
  gtri,
  gtrr,
  eqir,
  eqri,
  eqrr
}

const parseInput = (input) => {
  /*Before: [2, 0, 3, 1]
  3 2 3 3
  After:  [2, 0, 3, 0]

  Before: [3, 1, 2, 2]
  11 1 2 3
  After:  [3, 1, 2, 0]



  15 1 2 1
  4 0 0 0
  14 0 3 0*/

  input = input.split('\n');
  let examples = [];
  let testProgram = [];
  while(input.length) {
    let line = input.shift();
    if(line.match(/Before/)) {
      let before = line.match(/\[(.*)\]/)[1].split(', ').map((x) => Number.parseInt(x));
      line = input.shift();
      let instr = line.split(' ').map((x) => Number.parseInt(x));
      line = input.shift();
      let after = line.match(/\[(.*)\]/)[1].split(', ').map((x) => Number.parseInt(x));
      examples.push({before, instr, after});
    } else if(line.length > 0) {
      testProgram.push(line.split(' ').map((x) => Number.parseInt(x)));
    }
  }



  return {
    examples,
    testProgram
  };
}

exports.solver = function(input) {
  /*const sin = [3, 2, 1, 1];
  const sis = [9, 2, 1, 2];
  Object.keys(instructions).forEach((i) => {
    console.log(i);
    console.log(instructions[i](sin, sis));
  })*/

  let stuff = parseInput(input);

  const { examples, testProgram } = stuff;

  let sol1 = 0;

  const nInstr = 16;

  let behavesLike = [];
  for(let i = 0; i < nInstr; i++) {
    behavesLike.push(Object.keys(instructions));
  }

  for(let i = 0; i < examples.length; i++) {
    let count = 0;
    const { before, after, instr } = examples[i];
    Object.keys(instructions).forEach((i) => {
      let output = instructions[i](before, instr);
      let match = output.join('-') == after.join('-');
      count += match;

      if(!match) {
        behavesLike[instr[0]] = [...behavesLike[instr[0]]].filter((e) => e != i);
      }
    });
    sol1 += count >= 3;
  }

  for(let p = 0; p < nInstr; p++) {
    for(let i = 0; i < nInstr; i++) {
      if(behavesLike[i].length === 1) {
        for(let k = 0; k < nInstr; k++) {
          if(i != k) {
            behavesLike[k] = [...behavesLike[k]].filter((e) => e != behavesLike[i][0])
          }
        }
      }
    }
  }

  behavesLike = behavesLike.map((e) => e[0]);

  let registers = [0, 0, 0, 0];
  for(let i = 0; i < testProgram.length; i++) {
    registers = instructions[behavesLike[testProgram[i][0]]](registers, testProgram[i]);
  }
  return `${sol1} examples behave like 3 or more opcodes.
Executing the test program yields ${registers.join('-')}.`
}
