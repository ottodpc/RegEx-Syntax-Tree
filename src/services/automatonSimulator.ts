import { RegExParser, RegExTree } from "./regexParser";

let globalStateIdCounter = 0;

function resetStateIdCounter() {
  globalStateIdCounter = 0;
}

function getNextStateId(): number {
  return globalStateIdCounter++;
}

class State {
  id: number;
  isAccepting: boolean;

  constructor(id?: number, isAccepting = false) {
    this.id = id !== undefined ? id : getNextStateId();
    this.isAccepting = isAccepting;
  }
}

class Transition {
  fromState: State;
  toState: State;
  symbol: string | null;

  constructor(fromState: State, toState: State, symbol: string | null) {
    this.fromState = fromState;
    this.toState = toState;
    this.symbol = symbol;
  }
}

class Automaton {
  states: State[] = [];
  transitions: Transition[] = [];
  startState: State;
  acceptState: State;

  constructor(startState: State, acceptState: State) {
    this.startState = startState;
    this.acceptState = acceptState;
    this.states.push(startState, acceptState);
  }

  addTransition(fromState: State, toState: State, symbol: string | null) {
    this.transitions.push(new Transition(fromState, toState, symbol));
  }

  addState(isAccepting = false): State {
    const newState = new State(undefined, isAccepting);
    this.states.push(newState);
    return newState;
  }
}

function simulateNFA(automaton: Automaton, input: string): boolean {
  function epsilonClosure(state: State, visited: Set<State>): Set<State> {
    const closure = new Set<State>([state]);
    visited.add(state);

    const epsilonTransitions = automaton.transitions.filter(
      (t) => t.fromState === state && t.symbol === null
    );

    for (const transition of epsilonTransitions) {
      if (!visited.has(transition.toState)) {
        const recursiveClosure = epsilonClosure(transition.toState, visited);
        recursiveClosure.forEach((s) => closure.add(s));
      }
    }

    return closure;
  }

  function move(states: Set<State>, symbol: string): Set<State> {
    const result = new Set<State>();

    for (const state of states) {
      const symbolTransitions = automaton.transitions.filter(
        (t) => t.fromState === state && t.symbol === symbol
      );

      for (const transition of symbolTransitions) {
        const closure = epsilonClosure(transition.toState, new Set<State>());
        closure.forEach((s) => result.add(s));
      }
    }

    return result;
  }

  let currentStates = epsilonClosure(automaton.startState, new Set<State>());

  for (const symbol of input) {
    currentStates = move(currentStates, symbol);
  }

  return [...currentStates].some((state) => state.isAccepting);
}

function syntaxTreeToAutomaton(tree: RegExTree): Automaton {
  // Note: reset state counter  causes ID conflicts in recursive calls

  switch (tree.root) {
    case RegExParser.CONCAT:
      return handleConcat(tree);
    case RegExParser.ALTERN:
      return handleUnion(tree);
    case RegExParser.ETOILE:
      return handleKleeneStar(tree);
    case RegExParser.DOT:
      return handleDot();
    default:
      return handleSymbol(tree.root);
  }
}

function handleConcat(tree: RegExTree): Automaton {
  const leftAutomaton = syntaxTreeToAutomaton(tree.subTrees[0]);
  const rightAutomaton = syntaxTreeToAutomaton(tree.subTrees[1]);

  // Remove accepting status from left accept state
  leftAutomaton.acceptState.isAccepting = false;

  // Only the right accept state should be accepting
  rightAutomaton.acceptState.isAccepting = true;

  // Merge automata into a new automaton
  const automaton = new Automaton(
    leftAutomaton.startState,
    rightAutomaton.acceptState
  );

  // Combine all states
  automaton.states = [...leftAutomaton.states, ...rightAutomaton.states];

  // Combine all transitions and add the epsilon transition to connect them
  automaton.transitions = [
    ...leftAutomaton.transitions,
    ...rightAutomaton.transitions,
    new Transition(leftAutomaton.acceptState, rightAutomaton.startState, null),
  ];

  return automaton;
}

function handleUnion(tree: RegExTree): Automaton {
  const leftAutomaton = syntaxTreeToAutomaton(tree.subTrees[0]);
  const rightAutomaton = syntaxTreeToAutomaton(tree.subTrees[1]);

  // Remove accepting status from sub-automaton accept states
  leftAutomaton.acceptState.isAccepting = false;
  rightAutomaton.acceptState.isAccepting = false;

  const startState = new State();
  const acceptState = new State(undefined, true);

  const automaton = new Automaton(startState, acceptState);

  // Add all states
  automaton.states.push(...leftAutomaton.states, ...rightAutomaton.states);

  // Add all transitions from sub-automata
  automaton.transitions.push(
    ...leftAutomaton.transitions,
    ...rightAutomaton.transitions
  );

  // Add new epsilon transitions
  automaton.addTransition(startState, leftAutomaton.startState, null);
  automaton.addTransition(startState, rightAutomaton.startState, null);
  automaton.addTransition(leftAutomaton.acceptState, acceptState, null);
  automaton.addTransition(rightAutomaton.acceptState, acceptState, null);

  return automaton;
}

function handleKleeneStar(tree: RegExTree): Automaton {
  const innerAutomaton = syntaxTreeToAutomaton(tree.subTrees[0]);

  // Remove accepting status from inner automaton accept state
  innerAutomaton.acceptState.isAccepting = false;

  const startState = new State();
  const acceptState = new State(undefined, true);

  const automaton = new Automaton(startState, acceptState);

  // Add all states from inner automaton
  automaton.states.push(...innerAutomaton.states);
  automaton.transitions.push(...innerAutomaton.transitions);

  // Epsilon from start to accept (allows zero occurrences)
  automaton.addTransition(startState, acceptState, null);
  // Epsilon from start to inner start
  automaton.addTransition(startState, innerAutomaton.startState, null);
  // Epsilon from inner accept back to inner start (loop)
  automaton.addTransition(
    innerAutomaton.acceptState,
    innerAutomaton.startState,
    null
  );
  // Epsilon from inner accept to final accept
  automaton.addTransition(innerAutomaton.acceptState, acceptState, null);

  return automaton;
}

function handleSymbol(root: number): Automaton {
  const startState = new State();
  const acceptState = new State(undefined, true);

  const automaton = new Automaton(startState, acceptState);
  automaton.addTransition(startState, acceptState, String.fromCharCode(root));

  return automaton;
}

function handleDot(): Automaton {
  // DOT matches any single character
  // For simplicity, we'll create an automaton that matches common printable ASCII
  const startState = new State();
  const acceptState = new State(undefined, true);

  const automaton = new Automaton(startState, acceptState);

  // Add transitions for printable ASCII characters (32-126)
  for (let i = 32; i <= 126; i++) {
    automaton.addTransition(startState, acceptState, String.fromCharCode(i));
  }

  return automaton;
}

// Wrapper function that ensures state IDs are reset before building the automaton
function buildAutomatonFromTree(tree: RegExTree): Automaton {
  resetStateIdCounter();
  return syntaxTreeToAutomaton(tree);
}

export {
  Automaton,
  State,
  Transition,
  syntaxTreeToAutomaton,
  simulateNFA,
  resetStateIdCounter,
  buildAutomatonFromTree,
};
