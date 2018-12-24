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

// Don't run this tho, just a sketch
const leProgram = (x = 0) => {
  let qq = 0;
  let laMappa = {};

  let a = 0;
  let b = 0;
  let c = 0;
  let d = 0;
  // Assert bani works with numbers
  while(qq < 100000) {
    c = d | 65536;
    d = 4332021;
    while(true) {
      /*b = c % 256;
      d += b;
      d %= 16777216;
      d *= 65899;
      d %= 16777216;*/
      d = (((d + (c % 256)) % 16777216)*65899) % 16777216;
      if(c < 256) {
        break;
      }
      //b = 0;
      /*while((b + 1)*256 <= c) {
        b++;
      }*/
      //c = b;
      c = Math.floor(c/256);
      //console.log([x, a, b, c, d, 0]);
    }

    /*if(x === d) {
      break;
    }*/
    if(laMappa[d] !== undefined) {
      console.log('cycle found!');
      console.log(qq);
      break;
    } else {
      laMappa[d] = d;
    }
    console.log(d);
    qq++;
  }

  console.log([x, a, b, c, d, 0]);

  /*while(d !== x) {
    c = d | 65536;
    d = 4332021;
    console.log(`c: ${c}`);
    while(c >= 256) {
      console.log('begin anew');
      b = c % 256;
      d += b;
      console.log(`d: ${d}`);
      d %= 16777216;
      console.log(`d: ${d}`);
      d *= 65899;
      console.log(`d: ${d}`);
      d %= 16777216;
      console.log(`d: ${d}`);
      b = 0;
      a = 1;
      while(a*256 <= c) {
        b++;
        a++;
      }
      c = b;
      console.log('done');
      console.log([x, a, b, c, d, 0]);
      //return;
    }
  }*/
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

  leProgram();

  /*let ipR = program.ip;
  let instructions = program.instructions;
  let ip = 0;
  let registers = [9566170, 0, 0, 0, 0, 0];

  let step = 0;
  let check = 0;

  while(ip < instructions.length) {
    //console.log(ip);
    let rBefore = [...registers];
    console.log(rBefore);

    console.log(instructions[ip])

    registers[ipR] = ip;
    registers = instructionSet[instructions[ip].instruction](registers, instructions[ip].registers);
    ip = registers[ipR];
    ip++;
    //console.log(registers);

    if(registers[5] == 22) {
      check++;
    }

    if(check == 2) {
      step++;
      if(step == 100) {
        break;
      }
    }
  }
  console.log(registers);*/

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
