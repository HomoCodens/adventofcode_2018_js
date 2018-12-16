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
  out[instr[2]] = instr[1];
  return out;
}

const gtir = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = a > registers[b] ? 1 : 0;
}

const gtri = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = registers[a] > b ? 1 : 0;
}

const gtrr = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = registers[a] > registers[b] ? 1 : 0;
}

const eqir = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = a === registers[b] ? 1 : 0;
}

const eqri = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = registers[a] === b ? 1 : 0;
}

const eqrr = (registers, instr) => {
  let a = instr[1];
  let b = instr[2];
  let c = instr[3];
  let out = [...registers];
  out[c] = registers[a] === registers[b] ? 1 : 0;
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

exports.solver = function(input) {
  console.log(Object.keys(instructions));

  console.log(instructions.addi([3, 2, 1, 1], [9, 2, 1, 2]))
}
