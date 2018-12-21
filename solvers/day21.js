const addr = (registers, instr) => {
  let out = [...registers];
  out[instr[2]] = registers[instr[0]] + registers[instr[1]];
  return out;
}

const addi = (registers, instr) => {
  let out = [...registers];
  out[instr[2]] = registers[instr[0]] + instr[1];
  return out;
}

const mulr = (registers, instr) => {
  let out = [...registers];
  out[instr[2]] = registers[instr[0]] * registers[instr[1]];
  return out;
}

const muli = (registers, instr) => {
  let out = [...registers];
  out[instr[2]] = registers[instr[0]] * instr[1];
  return out;
}

const banr = (registers, instr) => {
  let a = instr[0];
  let b = instr[1];
  let c = instr[2];
  let out = [...registers];
  out[c] = registers[a] & registers[b];
  return out;
}

const bani = (registers, instr) => {
  let a = instr[0];
  let b = instr[1];
  let c = instr[2];
  let out = [...registers];
  out[c] = registers[a] & b;
  return out;
}

const borr = (registers, instr) => {
  let a = instr[0];
  let b = instr[1];
  let c = instr[2];
  let out = [...registers];
  out[c] = registers[a] | registers[b];
  return out;
}

const bori = (registers, instr) => {
  let a = instr[0];
  let b = instr[1];
  let c = instr[2];
  let out = [...registers];
  out[c] = registers[a] | b;
  return out;
}

const setr = (registers, instr) => {
  let out = [...registers];
  out[instr[2]] = registers[instr[0]];
  return out;
}

const seti = (registers, instr) => {
  // ET phone earth
  let out = [...registers];
  out[instr[2]] = instr[0];
  return out;
}

const gtir = (registers, instr) => {
  let a = instr[0];
  let b = instr[1];
  let c = instr[2];
  let out = [...registers];
  out[c] = a > registers[b] ? 1 : 0;
  return out;
}

const gtri = (registers, instr) => {
  let a = instr[0];
  let b = instr[1];
  let c = instr[2];
  let out = [...registers];
  out[c] = registers[a] > b ? 1 : 0;
  return out;
}

const gtrr = (registers, instr) => {
  let a = instr[0];
  let b = instr[1];
  let c = instr[2];
  let out = [...registers];
  out[c] = registers[a] > registers[b] ? 1 : 0;
  return out;
}

const eqir = (registers, instr) => {
  let a = instr[0];
  let b = instr[1];
  let c = instr[2];
  let out = [...registers];
  out[c] = a === registers[b] ? 1 : 0;
  return out;
}

const eqri = (registers, instr) => {
  let a = instr[0];
  let b = instr[1];
  let c = instr[2];
  let out = [...registers];
  out[c] = registers[a] === b ? 1 : 0;
  return out;
}

const eqrr = (registers, instr) => {
  let a = instr[0];
  let b = instr[1];
  let c = instr[2];
  let out = [...registers];
  out[c] = registers[a] === registers[b] ? 1 : 0;
  return out;
}

const instructionSet = {
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

const parseProgram = (input) => {
  let lines = input.split('\n');
  console.log(lines[0]);
  let ip = lines[0].match(/([0-9]+)/)[1];
  let instructions = [];
  //#ip 1
  //addi 1 16 1
  for(let i = 1; i < lines.length; i++) {
    if(lines[i].match(/#/)) {
      continue;
    }
    let comps = lines[i].match(/([a-z]+) ([0-9]+) ([0-9]+) ([0-9]+)/);
    let instruction = comps[1];
    let registers = [Number.parseInt(comps[2]), Number.parseInt(comps[3]), Number.parseInt(comps[4])];
    instructions.push({
      instruction,
      registers
    });
  }

  return {
    ip,
    instructions
  }
}

exports.solver = function(input) {
  /*input = `#ip 0
seti 5 0 1
seti 6 0 2
addi 0 1 0
addr 1 2 3
setr 1 0 0
seti 8 0 4
seti 9 0 5`;*/
  program = parseProgram(input);
  console.log('done parsing')

  console.log(program);

  let ipR = program.ip;
  let instructions = program.instructions;
  let ip = 0;
  let registers = [0, 0, 0, 0, 0, 0];

  let step = 0;

  while(ip < instructions.length) {
    //console.log(ip);
    let rBefore = [...registers];
    console.log(rBefore);

    console.log(instructions[ip])

    registers[ipR] = ip;
    registers = instructionSet[instructions[ip].instruction](registers, instructions[ip].registers);
    ip = registers[ipR];
    ip++;

    step++;
    if(step === 100) {
      break;
    }
  }
  console.log(registers);

  /*step = 0;
  ip = 0;
  registers = [1, 0, 0, 0, 0, 0 ]
  while(ip < instructions.length) {
    /*console.log(ip);
    let rBefore = [...registers];
    console.log(rBefore);

    console.log(instructions[ip]);

    registers[ipR] = ip;
    registers = instructionSet[instructions[ip].instruction](registers, instructions[ip].registers);
    ip = registers[ipR];
    ip++;

    //console.log(registers);

    (++step % 1000) == 0 && console.log(registers);
    (step % 1000) == 0 && console.log(step);
  }*/
}
