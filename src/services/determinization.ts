import { Automaton, State, Transition } from "./automatonSimulator";

/**
 * Subset Construction Algorithm (Aho-Ullman pages 547-552)
 * Converts an epsilon-NFA to a DFA using the powerset construction
 */

function epsilonClosure(states: Set<State>, transitions: Transition[]): Set<State> {
  const closure = new Set<State>(states);
  const stack = Array.from(states);

  while (stack.length > 0) {
    const state = stack.pop()!;

    // Find all epsilon transitions from this state
    const epsilonTransitions = transitions.filter(
      (t) => t.fromState === state && t.symbol === null
    );

    for (const transition of epsilonTransitions) {
      if (!closure.has(transition.toState)) {
        closure.add(transition.toState);
        stack.push(transition.toState);
      }
    }
  }

  return closure;
}

function move(states: Set<State>, symbol: string, transitions: Transition[]): Set<State> {
  const result = new Set<State>();

  for (const state of states) {
    const symbolTransitions = transitions.filter(
      (t) => t.fromState === state && t.symbol === symbol
    );

    for (const transition of symbolTransitions) {
      result.add(transition.toState);
    }
  }

  return result;
}

function getAlphabet(transitions: Transition[]): Set<string> {
  const alphabet = new Set<string>();

  for (const transition of transitions) {
    if (transition.symbol !== null) {
      alphabet.add(transition.symbol);
    }
  }

  return alphabet;
}

function stateSetToString(states: Set<State>): string {
  const ids = Array.from(states).map(s => s.id).sort((a, b) => a - b);
  return ids.join(",");
}

/**
 * Convert NFA to DFA using subset construction (Algorithm from Aho-Ullman pages 547-552)
 */
export function nfaToDfa(nfa: Automaton): Automaton {
  // Get alphabet from NFA transitions
  const alphabet = getAlphabet(nfa.transitions);

  // Map from state set string to DFA state
  const stateSetMap = new Map<string, State>();

  // DFA transitions
  const dfaTransitions: Transition[] = [];

  // Queue of unmarked DFA states (represented as NFA state sets)
  const unmarkedStates: Set<State>[] = [];

  // Start with epsilon closure of NFA start state
  const startClosure = epsilonClosure(new Set([nfa.startState]), nfa.transitions);
  const startKey = stateSetToString(startClosure);

  const dfaStartState = new State(0);
  stateSetMap.set(startKey, dfaStartState);
  unmarkedStates.push(startClosure);

  let nextStateId = 1;

  // Process each unmarked state
  while (unmarkedStates.length > 0) {
    const currentSet = unmarkedStates.shift()!;
    const currentKey = stateSetToString(currentSet);
    const currentDfaState = stateSetMap.get(currentKey)!;

    // For each symbol in alphabet
    for (const symbol of alphabet) {
      // Compute move and epsilon closure
      const moved = move(currentSet, symbol, nfa.transitions);
      const closure = epsilonClosure(moved, nfa.transitions);

      if (closure.size === 0) continue;

      const closureKey = stateSetToString(closure);

      // If this is a new state set
      if (!stateSetMap.has(closureKey)) {
        const newDfaState = new State(nextStateId++);
        stateSetMap.set(closureKey, newDfaState);
        unmarkedStates.push(closure);
      }

      const targetDfaState = stateSetMap.get(closureKey)!;

      // Add transition to DFA (avoid duplicates)
      const existingTransition = dfaTransitions.find(
        (t) => t.fromState === currentDfaState &&
               t.toState === targetDfaState &&
               t.symbol === symbol
      );

      if (!existingTransition) {
        dfaTransitions.push(
          new Transition(currentDfaState, targetDfaState, symbol)
        );
      }
    }
  }

  // Find DFA accept states (any set containing NFA accept state)
  let dfaAcceptState: State | null = null;

  for (const [key, dfaState] of stateSetMap.entries()) {
    const nfaStates = key.split(",").map(id => parseInt(id));

    // Check if this set contains the NFA accept state
    if (nfaStates.includes(nfa.acceptState.id)) {
      dfaState.isAccepting = true;
      if (!dfaAcceptState) {
        dfaAcceptState = dfaState;
      }
    }
  }

  // If no accepting state found, create one (edge case)
  if (!dfaAcceptState) {
    dfaAcceptState = new State(nextStateId++, true);
  }

  // Build DFA automaton
  const dfa = new Automaton(dfaStartState, dfaAcceptState);

  // Set all states directly (clearer than filtering)
  dfa.states = Array.from(stateSetMap.values());
  dfa.transitions = dfaTransitions;

  return dfa;
}
