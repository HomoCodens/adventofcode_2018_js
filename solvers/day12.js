exports.solver = function(input) {
  input = input.split('\n');
  let pots = input[0].match(/[.#]+/)[0].
                      split('').
                      reduce((s, e, i) => {
                        s[i] = e === '#';
                        return s;
                      }, {});
  const rules = input.slice(2);

  console.log(pots);
  console.log(rules);
}
