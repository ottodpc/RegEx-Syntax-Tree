import { Automaton, State, Transition } from "../services/automatonSimulator";

function minimizeDFA(automaton: Automaton): Automaton {
  const { states, transitions, startState, acceptState } = automaton;

  let partitions: Set<State>[] = [
    new Set(states.filter((state) => state.isAccepting)),
    new Set(states.filter((state) => !state.isAccepting)),
  ];

  let newPartitions: Set<State>[] = [];

  let hasChanged = true;
  while (hasChanged) {
    newPartitions = [];
    hasChanged = false;

    for (const partition of partitions) {
      const groups = new Map<string, Set<State>>();

      for (const state of partition) {
        const key = getStateTransitionKey(state, transitions, partitions);

        if (!groups.has(key)) {
          groups.set(key, new Set<State>());
        }

        groups.get(key)?.add(state);
      }

      if (groups.size > 1) {
        hasChanged = true;
      }

      for (const group of groups.values()) {
        newPartitions.push(group);
      }
    }

    partitions = newPartitions;
  }

  const minimizedStates = partitions.map(
    (partition, index) =>
      new State(
        index,
        [...partition].some((s) => s.isAccepting)
      )
  );
  const minimizedAutomaton = new Automaton(
    findCorrespondingState(minimizedStates, startState, partitions),
    findCorrespondingState(minimizedStates, acceptState, partitions)
  );

  for (const partition of partitions) {
    const representativeState = [...partition][0];

    const originalState = findCorrespondingState(
      minimizedStates,
      representativeState,
      partitions
    );

    for (const transition of transitions) {
      if (transition.fromState === representativeState) {
        const toState = findCorrespondingState(
          minimizedStates,
          transition.toState,
          partitions
        );
        minimizedAutomaton.addTransition(
          originalState,
          toState,
          transition.symbol
        );
      }
    }
  }

  return minimizedAutomaton;
}

function getStateTransitionKey(
  state: State,
  transitions: Transition[],
  partitions: Set<State>[]
): string {
  const keyParts: string[] = [];

  for (const transition of transitions) {
    if (transition.fromState === state) {
      const partitionIndex = partitions.findIndex((partition) =>
        partition.has(transition.toState)
      );
      keyParts.push(`${transition.symbol}->${partitionIndex}`);
    }
  }

  return keyParts.join("|");
}

function findCorrespondingState(
  minimizedStates: State[],
  originalState: State,
  partitions: Set<State>[]
): State {
  const partitionIndex = partitions.findIndex((partition) =>
    partition.has(originalState)
  );
  return minimizedStates[partitionIndex];
}

export { minimizeDFA };
