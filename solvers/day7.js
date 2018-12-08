const canExecute = (step, completedSteps) => {
  const { prerequisites } = step;
  for(let i = 0; i < prerequisites.length; i++) {
    if(completedSteps.indexOf(prerequisites[i]) < 0) {
      return false;
    }
  }
  return true;
}

exports.solver = function(input) {
  /*input = `Step C must be finished before step A can begin.
Step C must be finished before step F can begin.
Step A must be finished before step B can begin.
Step A must be finished before step D can begin.
Step B must be finished before step E can begin.
Step D must be finished before step E can begin.
Step F must be finished before step E can begin.`;*/

  const allSteps = input.match(/([A-Z])\W/gm).
                          reduce((s, e) => {
                            e = e.trim();
                            if(s.indexOf(e) < 0) {
                              return [...s, e];
                            }
                            return s;
                          }, []).
                          sort((a, b) => a.charCodeAt() - b.charCodeAt());

  const jobTimeOffset = allSteps.length === 6 ? 0 : 60;
  const nWorkers = allSteps.length === 6 ? 2 : 5;
  const codeA = 'A'.charCodeAt();

  // Step W must be finished before step T can begin.
  let instructions = input.split('\n').
                              reduce((s, e) => {
                                const steps = e.match(/Step (\w).* step (\w).*/);
                                const step = steps[2];
                                const prerequisite = steps[1];
                                if(s.hasOwnProperty(step)) {
                                  s[step].prerequisites.push(prerequisite);
                                } else {
                                  s[step] = {
                                    step,
                                    time: step.charCodeAt() -
                                            codeA + 1 +
                                            jobTimeOffset,
                                    prerequisites: [prerequisite]
                                  };
                                }
                                return s;
                              }, {});

  for(let i = 0; i < allSteps.length; i++) {
    const instruction = allSteps[i];
    if(!instructions.hasOwnProperty(instruction)) {
      instructions[instruction] = {
        step: instruction,
        time: instruction.charCodeAt() - codeA + 1 + jobTimeOffset,
        prerequisites: []
      }
    }
  }

  let remainingSteps = [...allSteps];
  let instructionOrder = [];
  while(remainingSteps.length) {
    for(let i = 0; i < remainingSteps.length; i++) {
      const instruction = remainingSteps[i];
      if(!instructions.hasOwnProperty(instruction) ||
          canExecute(instructions[instruction], instructionOrder)) {
        instructionOrder.push(instruction);
        remainingSteps.splice(i, 1);
        break;
      }
    }
  }
  const solution1 = instructionOrder.join('');

  // Yes, technically we don't NEED to keep track of WHO does what. Fun though.
  let workers = new Array(nWorkers);
  let activeJobs = 0;
  let t = 0;
  instructionOrder = [];
  remainingSteps = [...allSteps];

  let header = 't';
  for(let i = 0; i < nWorkers; i++) {
    header += `\t${i+1}`;
  }
  console.log(header);
  console.log('-------------------------------');

  while(instructionOrder.length < allSteps.length) {
    // Check for finished jobs
    let finishedJobs = [];
    for(let w = 0; w < nWorkers; w++) {
      if(workers[w] !== undefined) {
        const { job, tJob: t } = workers[w];
        if(tJob === instructions[job].time) {
          finishedJobs.push(job);
          workers[w] = undefined;
          activeJobs--;
        }
      }
    }

    if(finishedJobs.length) {
      instructionOrder = instructionOrder.concat(finishedJobs.sort((a, b) =>
      a.charCodeAt() - b.charCodeAt()));
    }

    // Assign new jobs
    for(let i = 0; i < remainingSteps.length; ) {
      const instruction = remainingSteps[i];
      //console.log(`Checking assignability of ${instruction}`);
      if(activeJobs < nWorkers &&
            canExecute(instructions[instruction], instructionOrder)) {
          activeJobs++;
          for(let w = 0; w < nWorkers; w++) {
            //console.log(`Attempting assignment ${instruction} -> ${w+1}`);
            if(workers[w] === undefined) {
              //console.log(`Assigning job ${instruction} to worker ${w+1}`);
              workers[w] = {
                job: instruction,
                t: 0
              };
              break;
            }
          }
          remainingSteps.splice(i, 1);
      } else {
        i++;
      }
    }

    // Do work
    workers = workers.map((w) => {
      if(w) {
        return {
          ...w,
          t: w.t + 1
        };
      }
    });

    let state = `${t}`;
    for(let i = 0; i < nWorkers; i++) {
      if(workers[i]) {
        state += `\t${workers[i].job}`;
      } else {
        state += `\t.`;
      }
    }
    console.log(state);

    t++;
  }

  return `The correct way of assembling the 'Sleigh' is ${solution1}.
When working together, assembly takes ${t - 1} seconds.`;
}
