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

  guardStats = Object.keys(guardStats).
                      map((e) => {
                        return {
                          id: Number.parseInt(e),
                          stats: guardStats[e]
                        }
                      });

  const guardsRanked = guardStats.map((e) => {
                             return {
                               ...e,
                               tTot: e.stats.reduce((e, s) => s + e)
                             };
                          }).
                            sort((a, b) => b.tTot - a.tTot);

  const myGuard = guardsRanked[0];
  // OK, that's taking it a bit far
  const bestMinute = myGuard.stats.reduce((s, e, i) => {
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

  const asleepMostOftenAt = guardStats.
                            reduce((s, e, i) => {
                              const {id, stats} = e;
                              for(let j = 0; j < 60; j++) {
                                if(stats[j] > s[j].value) {
                                  s[j] = {id, minute: j, value: stats[j]};
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

  return `Guard ${myGuard.id} is asleep for a total of ${myGuard.tTot}.
The optimal time to sneak past him is ${bestMinute}, therefore ${myGuard.id*bestMinute}.
When using strategy 2 we choose ${strategy2.id} for ${strategy2.id * strategy2.minute}`;
}
