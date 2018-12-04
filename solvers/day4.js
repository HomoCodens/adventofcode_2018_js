const BEGIN_SHIFT = 'BEGIN_SHIFT';
const WAKE_UP = 'WAKE_UP';
const FALL_ASLEEP = 'FALL_ASLEEP';

exports.solver = function(input) {
  const entries = input.split('\n').
                        map((x) => {
                          const timestamp = new Date(x.match(/\[(.*)\]/)[1]);
                          const idMatch = x.match(/#(\d+)/)
                          if(idMatch) {
                            return {
                              type: BEGIN_SHIFT,
                              id: Number.parseInt(idMatch[1]),
                              timestamp
                            };
                          } else if(x.match(/wake/)) {
                            return {
                              type: WAKE_UP,
                              timestamp
                            };
                          } else {
                            return {
                              type: FALL_ASLEEP,
                              timestamp
                            }
                          }
                        }).
                        sort((a, b) => a.timestamp - b.timestamp);

  let guardStats = {};
  let currentGuard = null;
  let t_fall_asleep = 0;
  for(let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    switch(entry.type) {
      case BEGIN_SHIFT:
        currentGuard = entry.id;
        break;
      case FALL_ASLEEP:
        t_fall_asleep = entry.timestamp.getMinutes();
        break;
      case WAKE_UP:
        if(!guardStats.hasOwnProperty(currentGuard)) {
          guardStats[currentGuard] = new Array(60).fill(0);
        }
        const t_wake_up = entry.timestamp.getMinutes();
        for(let m = t_fall_asleep; m < t_wake_up; m++) {
          guardStats[currentGuard][m]++;
        }
        break;
    }
  }

  const t_asleep = Object.keys(guardStats)
                           .reduce((s, e) => {
                             let out = {...s};
                             out[e] = guardStats[e].reduce((s, e) => s + e);
                             return out;
                           }, {});

  const guardRanks = Object.keys(guardStats).
                            sort((a, b) => t_asleep[b] - t_asleep[a]);

  const myGuard = guardRanks[0];
  // OK, that's taking it a bit far
  const bestMinute = guardStats[myGuard].reduce((s, e, i) => {
    if(e >= s.value) {
      return {
        minute: i,
        value: e
      };
    } else {
      return {...s};
    }
  }, {
    minute: -1,
    value: -1
  }).minute;

  const asleepMostOftenAt = Object.keys(guardStats).
                            reduce((s, e, i) => {
                              const guard = guardStats[e];
                              for(let j = 0; j < 60; j++) {
                                if(guard[j] > s[j].value) {
                                  s[j] = {id: e, minute: j, value: guard[j]};
                                }
                              }
                              return s;
                            }, (new Array(60)).fill({
                              id: 0,
                              minute: -1,
                              value: -1
                            })).
                            sort((a, b) => b.value - a.value);

  const strategy2 = asleepMostOftenAt[0];

  return `Guard ${myGuard} is asleep for a total of ${t_asleep[myGuard]}.
The optimal time to sneak past him is ${bestMinute}, therefore ${myGuard*bestMinute}.
When using strategy 2 we choose ${strategy2.id} for ${strategy2.id * strategy2.minute}`;
}
