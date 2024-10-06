import { RegExParser, RegExTree } from "./regexParser";

class State {
  id: number;
  isAccepting: boolean;

  constructor(id: number, isAccepting = false) {
    this.id = id;
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
    const newState = new State(this.states.length, isAccepting);
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

  return [...currentStates].some((state) => state === automaton.acceptState);
}

function syntaxTreeToAutomaton(tree: RegExTree): Automaton {
  switch (tree.root) {
    case RegExParser.CONCAT:
      return handleConcat(tree);
    case RegExParser.ALTERN:
      return handleUnion(tree);
    case RegExParser.ETOILE:
      return handleKleeneStar(tree);
    default:
      return handleSymbol(tree.root);
  }
}

function handleConcat(tree: RegExTree): Automaton {
  const leftAutomaton = syntaxTreeToAutomaton(tree.subTrees[0]);
  const rightAutomaton = syntaxTreeToAutomaton(tree.subTrees[1]);
  leftAutomaton.addTransition(
    leftAutomaton.acceptState,
    rightAutomaton.startState,
    null
  );
  return new Automaton(leftAutomaton.startState, rightAutomaton.acceptState);
}

function handleUnion(tree: RegExTree): Automaton {
  const leftAutomaton = syntaxTreeToAutomaton(tree.subTrees[0]);
  const rightAutomaton = syntaxTreeToAutomaton(tree.subTrees[1]);
  const startState = new State(-1);
  const acceptState = new State(-2);
  const automaton = new Automaton(startState, acceptState);
  automaton.addTransition(startState, leftAutomaton.startState, null);
  automaton.addTransition(startState, rightAutomaton.startState, null);
  automaton.addTransition(leftAutomaton.acceptState, acceptState, null);
  automaton.addTransition(rightAutomaton.acceptState, acceptState, null);
  automaton.states.push(...leftAutomaton.states, ...rightAutomaton.states);
  automaton.transitions.push(
    ...leftAutomaton.transitions,
    ...rightAutomaton.transitions
  );
  return automaton;
}

function handleKleeneStar(tree: RegExTree): Automaton {
  const innerAutomaton = syntaxTreeToAutomaton(tree.subTrees[0]);
  const startState = new State(-1);
  const acceptState = new State(-2);
  const automaton = new Automaton(startState, acceptState);
  automaton.addTransition(startState, acceptState, null);
  automaton.addTransition(startState, innerAutomaton.startState, null);
  automaton.addTransition(
    innerAutomaton.acceptState,
    innerAutomaton.startState,
    null
  );
  automaton.addTransition(innerAutomaton.acceptState, acceptState, null);
  automaton.states.push(...innerAutomaton.states);
  automaton.transitions.push(...innerAutomaton.transitions);
  return automaton;
}

function handleSymbol(root: number): Automaton {
  const startState = new State(-1);
  const acceptState = new State(-2);
  const automaton = new Automaton(startState, acceptState);
  automaton.addTransition(startState, acceptState, String.fromCharCode(root));
  return automaton;
}

export { Automaton, State, Transition, syntaxTreeToAutomaton, simulateNFA };
