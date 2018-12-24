const IMMUNE_SYSTEM = 'immune system';
const INFECTION = 'infection';

// Derp, why didn't I use this notation from the beginning?
class Unit {
  constructor(units, hp, weaknesses, immunities, dmg, dmgType, initiative, team) {
    this.units = units;
    this.hp = hp;
    this.weaknesses = weaknesses;
    this.immunities = immunities;
    this.dmg = dmg;
    this.dmgType = dmgType;
    this.initiative = initiative;
    this.team = team;
  }

  static fromLine(line, team) {
    // Let's be verbose but clear what's what
    const groups = line.match(/(\d+) units each with (\d+) hit points (?:\((.*)\) )?with an attack that does (\d+) (.*) damage at initiative (\d+)/);
    const units = Number.parseInt(groups[1]);
    const hp = Number.parseInt(groups[2]);

    let weaknesses = [];
    let immunities = [];
    if(groups[3]) {
      const wi = groups[3].split(';');
      for(let i = 0; i < wi.length; i++) {
        let comps = wi[i].match(/(.*) to (.*)/);

        if(comps[1].trim() === 'weak') {
          weaknesses = comps[2].split(', ');
        } else {
          immunities = comps[2].split(', ');
        }
      }
    }

    const dmg = Number.parseInt(groups[4]);
    const dmgType = groups[5];
    const initiative = Number.parseInt(groups[6]);

    return new Unit(
      units,
      hp,
      weaknesses,
      immunities,
      dmg,
      dmgType,
      initiative,
      team
    );
  }

  effectivePower() {
    return this.units*this.dmg;
  }

  immuneTo(type) {
    return this.immunities.indexOf(type) >= 0;
  }

  weakTo(type) {
    return this.weaknesses.indexOf(type) >= 0;
  }

  effectiveDamageTaken(amount, type) {
    if(this.immuneTo(type)) {
      return 0;
    } else if(this.weakTo(type)) {
      return 2*amount;
    }

    return amount;
  }

  damageDealtTo(other) {
    return other.effectiveDamageTaken(this.effectivePower(), this.dmgType);
  }

  takeDamage(dmg, type) {
    dmg = this.effectiveDamageTaken(dmg, type);

    const unitsDead = Math.floor(dmg/this.hp);

    this.units -= unitsDead;
    return unitsDead;
  }

  isDead() {
    return this.units <= 0;
  }
}

class Battle {
  constructor(groups, immuneSystemBoost = 0) {
    this.groups = groups.map((e) => {
      if(e.team === IMMUNE_SYSTEM) {
        e.dmg += immuneSystemBoost;
      }
      return e;
    });
    this.immuneSystemBoost = immuneSystemBoost;
    this.tied = false;
  }

  static fromLines(lines, immuneSystemBoost = 0) {
    let units = [];
    let immuneSystemDone = false;
    for(let line of lines) {
      if(line === 'Immune System:') {
        continue;
      }

      if(line === 'Infection:') {
        immuneSystemDone = true;
      } else if (line.length) {
        let unit;
        if(!immuneSystemDone) {
          unit = Unit.fromLine(line, IMMUNE_SYSTEM);
        } else {
          unit = Unit.fromLine(line, INFECTION);
        }
        units.push(unit);
      }
    }

    return new Battle(units, immuneSystemBoost);
  }

  targetSelection() {
    let { groups } = this;

    // Array of indices into groups ordered by turn order
    let initiative = groups.map((e, i) => i).
                      sort((a, b) => {
                        let t = groups[b].effectivePower() - groups[a].effectivePower();
                        if(t === 0) {
                          return groups[b].initiative - groups[a].initiative;
                        }
                        return t;
                      });

    let availableTargets = groups.map((e, i) => {
      return {
        i,
        chosen: false
      };
    });

    // Unit i will attack selectedTargets[i] if that is >= 0
    let selectedTargets = groups.map((e, i) => -1);

    for(let g of initiative) {
      //console.log(`Group ${g}...`);
      let attackingGroup = groups[g];

      //console.log(`available: ${availableTargets.filter((e) => !e.chosen).map((e) => e.i).join()}`)

      // All enemy units ordered by attack priority
      let possibleTargets = availableTargets.filter((e) => groups[e.i].team !== attackingGroup.team && !e.chosen).
                            sort((a, b) => {
                              let t = attackingGroup.damageDealtTo(groups[b.i]) - attackingGroup.damageDealtTo(groups[a.i]);

                              if(t === 0) {
                                t = groups[b.i].effectivePower() - groups[a.i].effectivePower();

                                if(t === 0) {
                                  return groups[b.i].initiative - groups[a.i].initiative;
                                }

                                return t;
                              }

                              return t;
                            });

      if(possibleTargets.length) {
        let target = possibleTargets[0].i;
        //console.log(`chosen: ${target}`);
        if(attackingGroup.damageDealtTo(groups[target]) > 0) {
          selectedTargets[g] = target;
          availableTargets[target].chosen = true;
        }
      }
    }

    return selectedTargets;
  }

  resolveAttacks(targets, verbose = false) {
    let tied = true;

    let { groups } = this;
    let initiative = groups.map((e, i) => i).sort((a, b) => groups[b].initiative - groups[a].initiative);
    for(let g of initiative) {
      if(targets[g] >= 0 && !groups[g].isDead()) {
        let dead = groups[targets[g]].takeDamage(groups[g].effectivePower(), groups[g].dmgType);
        verbose && console.log(`Unit ${g} acting attacking ${targets[g]} killing ${dead} (${groups[g].damageDealtTo(groups[targets[g]])} damage)...`)
        tied = tied && dead === 0;
      }
    }

    this.groups = groups.filter((e) => !e.isDead());
    return tied;
  }

  battleOver() {
    let { groups } = this;

    if(groups.length === 0 || this.tied) {
      return true;
    }

    let nOfTeam1 = groups.map((e) => e.team === groups[0].team).reduce((s, e) => s + (e ? 1 : 0), 0);
    return nOfTeam1 === groups.length;
  }

  winningTeam() {
    if(this.battleOver() && !this.tied) {
      return this.groups[0].team;
    }

    return null;
  }

  resolveRound(verbose = false) {
    let targets = this.targetSelection();
    return this.resolveAttacks(targets, verbose);
  }

  resolveBattle(verbose = false) {
    while(!this.battleOver()) {
      let tied = this.resolveRound(verbose);
      if(tied) {
        this.tied = true;
        return null;
      }

      if(verbose) {
        console.log(this.render());
      }
    }

    return this.winningTeam();
  }

  getRemainingUnits() {
    return this.groups.reduce((s, e) => s + e.units, 0);
  }

  render() {
    let is = this.groups.filter((e) => e.team === IMMUNE_SYSTEM).map((e, i) => `Group ${i+1} contains ${e.units} units`);
    let inf = this.groups.filter((e) => e.team === INFECTION).map((e, i) => `Group ${i+1} contains ${e.units} units`);
    return ['Immune system:', ...is, 'Infection:', ...inf, '\n\n'].join('\n');
  }
}

exports.solver = function(input) {
  let inputTest = `Immune System:
17 units each with 5390 hit points (weak to radiation, bludgeoning) with an attack that does 4507 fire damage at initiative 2
989 units each with 1274 hit points (immune to fire; weak to bludgeoning, slashing) with an attack that does 25 slashing damage at initiative 3

Infection:
801 units each with 4706 hit points (weak to radiation) with an attack that does 116 bludgeoning damage at initiative 1
4485 units each with 2961 hit points (immune to radiation; weak to fire, cold) with an attack that does 12 slashing damage at initiative 4`;

 input = input.split('\n');

 let battle1 = Battle.fromLines(input);

 console.log(battle1.render());

 let winners1 = battle1.resolveBattle(true);

 console.log('part 2');
 let boost = 1;
 let battle2 = Battle.fromLines(input, boost);
 while(battle2.resolveBattle(false) !== IMMUNE_SYSTEM) {
   boost++;
   console.log(boost);
   battle2 = Battle.fromLines(input, boost);
 }

 // Nothing to debug. Dumdum me read over "some rounds skipped" when comparing to example
 /*console.log('debugging test case');
 let battle2t = Battle.fromLines(inputTest.split('\n'), 1570);
 battle2t.resolveBattle(true);*/

 return `At first the ${winners1 === IMMUNE_SYSTEM ? 'immune system' : 'infection'} wins with ${battle1.getRemainingUnits()} units remaining.
The reindeer needs a boost of ${boost}, then the immune system wins with ${battle2.getRemainingUnits()}.`
}
