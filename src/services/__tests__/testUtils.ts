/**
 * Test Utilities for RegEx Testing
 *
 * Provides helper functions for test validation and debugging
 */

import { RegExTree, CONCAT, ETOILE, ALTERN } from '../regexParser';
import { Automaton, State } from '../automatonSimulator';

/**
 * Visualize syntax tree structure (for debugging)
 */
export function printTree(tree: RegExTree, indent = 0): string {
  const spaces = '  '.repeat(indent);
  let result = spaces;

  // Convert root to readable string
  if (tree.root === CONCAT) {
    result += 'CONCAT\n';
  } else if (tree.root === ETOILE) {
    result += 'STAR\n';
  } else if (tree.root === ALTERN) {
    result += 'ALTERN\n';
  } else {
    result += `'${String.fromCharCode(tree.root)}'\n`;
  }

  // Recursively print subtrees
  for (const subtree of tree.subTrees) {
    result += printTree(subtree, indent + 1);
  }

  return result;
}

/**
 * Count nodes in tree by type
 */
export function countNodesByType(tree: RegExTree): {
  concat: number;
  star: number;
  altern: number;
  leaves: number;
} {
  const counts = { concat: 0, star: 0, altern: 0, leaves: 0 };

  function traverse(node: RegExTree) {
    if (node.root === CONCAT) counts.concat++;
    else if (node.root === ETOILE) counts.star++;
    else if (node.root === ALTERN) counts.altern++;
    else counts.leaves++;

    node.subTrees.forEach(traverse);
  }

  traverse(tree);
  return counts;
}

/**
 * Validate tree structure invariants
 */
export function validateTreeStructure(tree: RegExTree): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  function validate(node: RegExTree, path: string) {
    if (node.root === CONCAT || node.root === ALTERN) {
      if (node.subTrees.length !== 2) {
        errors.push(`${path}: Binary operator has ${node.subTrees.length} children (expected 2)`);
      }
    } else if (node.root === ETOILE) {
      if (node.subTrees.length !== 1) {
        errors.push(`${path}: Unary operator has ${node.subTrees.length} children (expected 1)`);
      }
    } else {
      if (node.subTrees.length !== 0) {
        errors.push(`${path}: Leaf node has ${node.subTrees.length} children (expected 0)`);
      }
    }

    node.subTrees.forEach((subtree, idx) => {
      validate(subtree, `${path}.${idx}`);
    });
  }

  validate(tree, 'root');
  return { valid: errors.length === 0, errors };
}

/**
 * Get automaton statistics
 */
export function getAutomatonStats(automaton: Automaton): {
  stateCount: number;
  transitionCount: number;
  epsilonTransitionCount: number;
  symbolTransitionCount: number;
  acceptingStateCount: number;
  alphabet: string[];
} {
  const epsilonTrans = automaton.transitions.filter(t => t.symbol === null);
  const symbolTrans = automaton.transitions.filter(t => t.symbol !== null);
  const alphabet = [...new Set(symbolTrans.map(t => t.symbol!))].sort();
  const acceptingStates = automaton.states.filter(s => s.isAccepting);

  return {
    stateCount: automaton.states.length,
    transitionCount: automaton.transitions.length,
    epsilonTransitionCount: epsilonTrans.length,
    symbolTransitionCount: symbolTrans.length,
    acceptingStateCount: acceptingStates.length,
    alphabet
  };
}

/**
 * Check if automaton is deterministic
 */
export function isDeterministic(automaton: Automaton): boolean {
  // No epsilon transitions
  const hasEpsilon = automaton.transitions.some(t => t.symbol === null);
  if (hasEpsilon) return false;

  // Each state has at most one transition per symbol
  for (const state of automaton.states) {
    const outgoing = automaton.transitions.filter(t => t.fromState === state);
    const symbols = outgoing.map(t => t.symbol);
    const uniqueSymbols = new Set(symbols);

    if (symbols.length !== uniqueSymbols.size) {
      return false;
    }
  }

  return true;
}

/**
 * Find unreachable states
 */
export function findUnreachableStates(automaton: Automaton): State[] {
  const reachable = new Set<State>([automaton.startState]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const transition of automaton.transitions) {
      if (reachable.has(transition.fromState) && !reachable.has(transition.toState)) {
        reachable.add(transition.toState);
        changed = true;
      }
    }
  }

  return automaton.states.filter(s => !reachable.has(s));
}

/**
 * Generate test inputs for a pattern (exhaustive for small alphabets)
 */
export function generateTestInputs(alphabet: string[], maxLength: number): string[] {
  const inputs: string[] = [''];

  function generate(current: string) {
    if (current.length >= maxLength) return;

    for (const char of alphabet) {
      const next = current + char;
      inputs.push(next);
      generate(next);
    }
  }

  generate('');
  return inputs;
}

/**
 * Compare two automata for language equivalence (simple version)
 */
export function compareAutomataOnInputs(
  automaton1: Automaton,
  automaton2: Automaton,
  testInputs: string[]
): { equivalent: boolean; counterExample?: string } {
  for (const input of testInputs) {
    const result1 = simulateNFAHelper(automaton1, input);
    const result2 = simulateNFAHelper(automaton2, input);

    if (result1 !== result2) {
      return { equivalent: false, counterExample: input };
    }
  }

  return { equivalent: true };
}

/**
 * Helper to simulate NFA (duplicated to avoid circular dependency)
 */
function simulateNFAHelper(automaton: Automaton, input: string): boolean {
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

  return [...currentStates].some((state) => state === automaton.acceptState || state.isAccepting);
}

/**
 * Format test result for display
 */
export function formatTestResult(
  pattern: string,
  input: string,
  expected: boolean,
  actual: boolean
): string {
  const status = expected === actual ? '✓' : '✗';
  return `${status} Pattern: "${pattern}" Input: "${input}" Expected: ${expected} Got: ${actual}`;
}

/**
 * Batch test a pattern against multiple inputs
 */
export interface TestCase {
  input: string;
  expected: boolean;
}

export function batchTest(
  pattern: string,
  testCases: TestCase[],
  simulator: (input: string) => boolean
): { passed: number; failed: number; results: string[] } {
  let passed = 0;
  let failed = 0;
  const results: string[] = [];

  for (const testCase of testCases) {
    const actual = simulator(testCase.input);
    const result = formatTestResult(pattern, testCase.input, testCase.expected, actual);
    results.push(result);

    if (actual === testCase.expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return { passed, failed, results };
}
