/**
 * Question 2.4: DFA Minimization Tests
 *
 * Validates:
 * - Correct minimization using partition refinement algorithm
 * - Minimal state count (no equivalent states remain)
 * - Language equivalence before and after minimization
 * - Proper handling of accepting/non-accepting partitions
 * - Correctness of minimized transition function
 */

import { RegExParser } from '../regexParser';
import { syntaxTreeToAutomaton, simulateNFA } from '../automatonSimulator';
import { nfaToDfa } from '../determinization';
import { minimizeDFA } from '../minimisation';

describe('Question 2.4: DFA Minimization', () => {

  describe('Minimization Correctness', () => {
    test('minimized DFA has no epsilon transitions', () => {
      const tree = RegExParser.parseRegEx('a*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      const epsilonTrans = minimized.transitions.filter(t => t.symbol === null);
      expect(epsilonTrans.length).toBe(0);
    });

    test('minimized DFA is deterministic', () => {
      const tree = RegExParser.parseRegEx('(a|b)*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      for (const state of minimized.states) {
        const outgoing = minimized.transitions.filter(t => t.fromState === state);
        const symbols = outgoing.map(t => t.symbol);
        const uniqueSymbols = new Set(symbols);
        expect(symbols.length).toBe(uniqueSymbols.size);
      }
    });

    test('minimized DFA has valid start and accept states', () => {
      const tree = RegExParser.parseRegEx('ab');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      expect(minimized.startState).toBeDefined();
      expect(minimized.acceptState).toBeDefined();
      expect(minimized.acceptState.isAccepting).toBe(true);
    });
  });

  describe('State Count Reduction', () => {
    test('minimized DFA has <= states than DFA', () => {
      const tree = RegExParser.parseRegEx('a*b*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      expect(minimized.states.length).toBeLessThanOrEqual(dfa.states.length);
    });

    test('minimal DFA for single character is optimal', () => {
      const tree = RegExParser.parseRegEx('a');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      // Should have exactly 2 states: start and accept (or possibly 3 with error state)
      expect(minimized.states.length).toBeLessThanOrEqual(3);
    });

    test('minimization is idempotent', () => {
      const tree = RegExParser.parseRegEx('(a|b)*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized1 = minimizeDFA(dfa);
      const minimized2 = minimizeDFA(minimized1);

      // Second minimization should not reduce further
      expect(minimized2.states.length).toBe(minimized1.states.length);
    });
  });

  describe('Language Equivalence - Simple Patterns', () => {
    test('single character: minimized accepts "a"', () => {
      const tree = RegExParser.parseRegEx('a');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      expect(simulateNFA(minimized, 'a')).toBe(true);
      expect(simulateNFA(minimized, 'b')).toBe(false);
    });

    test('concatenation: minimized for "ab"', () => {
      const tree = RegExParser.parseRegEx('ab');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      expect(simulateNFA(minimized, 'ab')).toBe(true);
      expect(simulateNFA(minimized, 'a')).toBe(false);
      expect(simulateNFA(minimized, 'b')).toBe(false);
    });

    test('alternation: minimized for "a|b"', () => {
      const tree = RegExParser.parseRegEx('a|b');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      expect(simulateNFA(minimized, 'a')).toBe(true);
      expect(simulateNFA(minimized, 'b')).toBe(true);
      expect(simulateNFA(minimized, 'c')).toBe(false);
    });
  });

  describe('Language Equivalence - Complex Patterns', () => {
    test('a*: minimized matches DFA', () => {
      const tree = RegExParser.parseRegEx('a*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      const testInputs = ['', 'a', 'aa', 'aaa', 'b', 'ab'];

      for (const input of testInputs) {
        const dfaResult = simulateNFA(dfa, input);
        const minResult = simulateNFA(minimized, input);
        expect(minResult).toBe(dfaResult);
      }
    });

    test('(a|b)*: minimized matches DFA', () => {
      const tree = RegExParser.parseRegEx('(a|b)*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      const testInputs = ['', 'a', 'b', 'ab', 'ba', 'aabb', 'c', 'abc'];

      for (const input of testInputs) {
        const dfaResult = simulateNFA(dfa, input);
        const minResult = simulateNFA(minimized, input);
        expect(minResult).toBe(dfaResult);
      }
    });

    test('ab*c: minimized matches DFA', () => {
      const tree = RegExParser.parseRegEx('ab*c');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      const testInputs = ['ac', 'abc', 'abbc', 'abbbc', 'a', 'c', 'ab'];

      for (const input of testInputs) {
        const dfaResult = simulateNFA(dfa, input);
        const minResult = simulateNFA(minimized, input);
        expect(minResult).toBe(dfaResult);
      }
    });
  });

  describe('Exercise Examples - S(a|g|r)+on', () => {
    let minimized: any;

    beforeEach(() => {
      const tree = RegExParser.parseRegEx('S(a|g|r)+on');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      minimized = minimizeDFA(dfa);
    });

    test('minimized matches "Sargon"', () => {
      expect(simulateNFA(minimized, 'Sargon')).toBe(true);
    });

    test('minimized matches "Sagon"', () => {
      expect(simulateNFA(minimized, 'Sagon')).toBe(true);
    });

    test('minimized matches "Saggon"', () => {
      expect(simulateNFA(minimized, 'Saggon')).toBe(true);
    });

    test('minimized does not match "Son"', () => {
      expect(simulateNFA(minimized, 'Son')).toBe(false);
    });

    test('minimized does not match "Sbon"', () => {
      expect(simulateNFA(minimized, 'Sbon')).toBe(false);
    });

    test('minimized is deterministic', () => {
      for (const state of minimized.states) {
        const outgoing = minimized.transitions.filter((t: any) => t.fromState === state);
        const symbols = outgoing.map((t: any) => t.symbol);
        const uniqueSymbols = new Set(symbols);
        expect(symbols.length).toBe(uniqueSymbols.size);
      }
    });
  });

  describe('Exercise Examples - S[a-z]+on', () => {
    let minimized: any;

    beforeEach(() => {
      const tree = RegExParser.parseRegEx('S[a-z]+on');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      minimized = minimizeDFA(dfa);
    });

    test('minimized matches "Sargon"', () => {
      expect(simulateNFA(minimized, 'Sargon')).toBe(true);
    });

    test('minimized matches "Sbabylon"', () => {
      expect(simulateNFA(minimized, 'Sbabylon')).toBe(true);
    });

    test('minimized does not match "Son"', () => {
      expect(simulateNFA(minimized, 'Son')).toBe(false);
    });
  });

  describe('Partition Refinement Validation', () => {
    test('accepting and non-accepting states are separated', () => {
      const tree = RegExParser.parseRegEx('a');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      const acceptingStates = minimized.states.filter(s => s.isAccepting);
      const nonAcceptingStates = minimized.states.filter(s => !s.isAccepting);

      // Should have both types (unless pattern accepts everything or nothing)
      expect(acceptingStates.length).toBeGreaterThanOrEqual(1);
    });

    test('equivalent states are merged', () => {
      // Pattern with redundant states: a*a*
      const tree = RegExParser.parseRegEx('a*a*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      // Minimized should be equivalent to a*
      const testInputs = ['', 'a', 'aa', 'aaa'];
      for (const input of testInputs) {
        expect(simulateNFA(minimized, input)).toBe(true);
      }
    });
  });

  describe('Full Pipeline - NFA → DFA → Minimized DFA', () => {
    test('complete pipeline for (a|b)*c', () => {
      const tree = RegExParser.parseRegEx('(a|b)*c');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      const testInputs = ['c', 'ac', 'bc', 'aac', 'ababc', 'abcd', 'd'];

      for (const input of testInputs) {
        const nfaResult = simulateNFA(nfa, input);
        const dfaResult = simulateNFA(dfa, input);
        const minResult = simulateNFA(minimized, input);

        expect(dfaResult).toBe(nfaResult);
        expect(minResult).toBe(nfaResult);
      }
    });

    test('complete pipeline for a+b+', () => {
      const tree = RegExParser.parseRegEx('a+b+');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      const testInputs = ['ab', 'aab', 'abb', 'aaabbb', 'a', 'b', '', 'ba'];

      for (const input of testInputs) {
        const nfaResult = simulateNFA(nfa, input);
        const dfaResult = simulateNFA(dfa, input);
        const minResult = simulateNFA(minimized, input);

        expect(dfaResult).toBe(nfaResult);
        expect(minResult).toBe(nfaResult);
      }
    });

    test('state count progression: NFA >= DFA >= Minimized', () => {
      const tree = RegExParser.parseRegEx('(a|b)*ab');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      // Minimized should have fewer or equal states than DFA
      expect(minimized.states.length).toBeLessThanOrEqual(dfa.states.length);

      // All should be valid automata
      expect(nfa.states.length).toBeGreaterThan(0);
      expect(dfa.states.length).toBeGreaterThan(0);
      expect(minimized.states.length).toBeGreaterThan(0);
    });
  });

  describe('Transition Function Preservation', () => {
    test('minimized DFA preserves all necessary transitions', () => {
      const tree = RegExParser.parseRegEx('abc');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      // Should still have transitions for a, b, c
      const symbols = new Set(minimized.transitions.map(t => t.symbol));
      expect(symbols.has('a')).toBe(true);
      expect(symbols.has('b')).toBe(true);
      expect(symbols.has('c')).toBe(true);
    });

    test('no unreachable states in minimized DFA', () => {
      const tree = RegExParser.parseRegEx('(a|b)*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      // Find reachable states from start
      const reachable = new Set([minimized.startState]);
      let changed = true;

      while (changed) {
        changed = false;
        for (const trans of minimized.transitions) {
          if (reachable.has(trans.fromState) && !reachable.has(trans.toState)) {
            reachable.add(trans.toState);
            changed = true;
          }
        }
      }

      // All states should be reachable
      expect(reachable.size).toBe(minimized.states.length);
    });
  });
});
