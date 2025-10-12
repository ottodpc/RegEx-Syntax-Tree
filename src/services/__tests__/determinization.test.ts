/**
 * Question 2.3: DFA Construction via Subset Construction Tests
 *
 * Validates:
 * - Correct DFA construction from ε-NFA (Aho-Ullman algorithm)
 * - No epsilon transitions in resulting DFA
 * - Determinism: each state has at most one transition per symbol
 * - Equivalence: DFA accepts same language as NFA
 * - State count and transition correctness
 */

import { RegExParser } from '../regexParser';
import { syntaxTreeToAutomaton, simulateNFA } from '../automatonSimulator';
import { nfaToDfa } from '../determinization';

describe('Question 2.3: DFA Construction (Subset Construction)', () => {

  describe('Determinization Correctness', () => {
    test('DFA has no epsilon transitions', () => {
      const tree = RegExParser.parseRegEx('a*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      const epsilonTransitions = dfa.transitions.filter(t => t.symbol === null);
      expect(epsilonTransitions.length).toBe(0);
    });

    test('DFA is deterministic: no duplicate transitions', () => {
      const tree = RegExParser.parseRegEx('(a|b)*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      // Check each state has at most one transition per symbol
      for (const state of dfa.states) {
        const outgoing = dfa.transitions.filter(t => t.fromState === state);
        const symbols = outgoing.map(t => t.symbol);
        const uniqueSymbols = new Set(symbols);

        expect(symbols.length).toBe(uniqueSymbols.size);
      }
    });

    test('DFA has defined start and accept states', () => {
      const tree = RegExParser.parseRegEx('ab');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      expect(dfa.startState).toBeDefined();
      expect(dfa.acceptState).toBeDefined();
      expect(dfa.acceptState.isAccepting).toBe(true);
    });
  });

  describe('Language Equivalence - Simple Patterns', () => {
    test('single character: DFA accepts "a"', () => {
      const tree = RegExParser.parseRegEx('a');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      expect(simulateNFA(dfa, 'a')).toBe(true);
      expect(simulateNFA(dfa, 'b')).toBe(false);
    });

    test('concatenation: DFA for "ab"', () => {
      const tree = RegExParser.parseRegEx('ab');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      expect(simulateNFA(dfa, 'ab')).toBe(true);
      expect(simulateNFA(dfa, 'a')).toBe(false);
      expect(simulateNFA(dfa, 'b')).toBe(false);
      expect(simulateNFA(dfa, 'ba')).toBe(false);
    });

    test('alternation: DFA for "a|b"', () => {
      const tree = RegExParser.parseRegEx('a|b');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      expect(simulateNFA(dfa, 'a')).toBe(true);
      expect(simulateNFA(dfa, 'b')).toBe(true);
      expect(simulateNFA(dfa, 'c')).toBe(false);
      expect(simulateNFA(dfa, 'ab')).toBe(false);
    });
  });

  describe('Language Equivalence - Kleene Star', () => {
    test('a*: DFA matches NFA behavior', () => {
      const tree = RegExParser.parseRegEx('a*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      const testInputs = ['', 'a', 'aa', 'aaa', 'b', 'ab'];

      for (const input of testInputs) {
        const nfaResult = simulateNFA(nfa, input);
        const dfaResult = simulateNFA(dfa, input);
        expect(dfaResult).toBe(nfaResult);
      }
    });

    test('(a|b)*: DFA matches NFA behavior', () => {
      const tree = RegExParser.parseRegEx('(a|b)*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      const testInputs = ['', 'a', 'b', 'ab', 'ba', 'aabb', 'c', 'abc'];

      for (const input of testInputs) {
        const nfaResult = simulateNFA(nfa, input);
        const dfaResult = simulateNFA(dfa, input);
        expect(dfaResult).toBe(nfaResult);
      }
    });

    test('ab*: DFA matches NFA behavior', () => {
      const tree = RegExParser.parseRegEx('ab*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      const testInputs = ['a', 'ab', 'abb', 'abbb', '', 'b', 'ba'];

      for (const input of testInputs) {
        const nfaResult = simulateNFA(nfa, input);
        const dfaResult = simulateNFA(dfa, input);
        expect(dfaResult).toBe(nfaResult);
      }
    });
  });

  describe('Exercise Examples - S(a|g|r)+on', () => {
    let dfa: any;

    beforeEach(() => {
      const tree = RegExParser.parseRegEx('S(a|g|r)+on');
      const nfa = syntaxTreeToAutomaton(tree);
      dfa = nfaToDfa(nfa);
    });

    test('DFA has no epsilon transitions', () => {
      const epsilonTrans = dfa.transitions.filter((t: any) => t.symbol === null);
      expect(epsilonTrans.length).toBe(0);
    });

    test('DFA matches "Sargon"', () => {
      expect(simulateNFA(dfa, 'Sargon')).toBe(true);
    });

    test('DFA matches "Sagon"', () => {
      expect(simulateNFA(dfa, 'Sagon')).toBe(true);
    });

    test('DFA matches "Saggon"', () => {
      expect(simulateNFA(dfa, 'Saggon')).toBe(true);
    });

    test('DFA does not match "Son"', () => {
      expect(simulateNFA(dfa, 'Son')).toBe(false);
    });

    test('DFA does not match "Sbon"', () => {
      expect(simulateNFA(dfa, 'Sbon')).toBe(false);
    });

    test('DFA is deterministic', () => {
      for (const state of dfa.states) {
        const outgoing = dfa.transitions.filter((t: any) => t.fromState === state);
        const symbols = outgoing.map((t: any) => t.symbol);
        const uniqueSymbols = new Set(symbols);
        expect(symbols.length).toBe(uniqueSymbols.size);
      }
    });
  });

  describe('Exercise Examples - S[a-z]+on', () => {
    let dfa: any;

    beforeEach(() => {
      const tree = RegExParser.parseRegEx('S[a-z]+on');
      const nfa = syntaxTreeToAutomaton(tree);
      dfa = nfaToDfa(nfa);
    });

    test('DFA matches "Sargon"', () => {
      expect(simulateNFA(dfa, 'Sargon')).toBe(true);
    });

    test('DFA matches "Sbabylon"', () => {
      expect(simulateNFA(dfa, 'Sbabylon')).toBe(true);
    });

    test('DFA does not match "Son"', () => {
      expect(simulateNFA(dfa, 'Son')).toBe(false);
    });

    test('DFA does not match "S123on"', () => {
      expect(simulateNFA(dfa, 'S123on')).toBe(false);
    });
  });

  describe('Complex Patterns', () => {
    test('(a|b)*c: DFA equivalence', () => {
      const tree = RegExParser.parseRegEx('(a|b)*c');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      const testInputs = ['c', 'ac', 'bc', 'aac', 'ababc', 'abcd', 'd'];

      for (const input of testInputs) {
        const nfaResult = simulateNFA(nfa, input);
        const dfaResult = simulateNFA(dfa, input);
        expect(dfaResult).toBe(nfaResult);
      }
    });

    test('a*b*c*: DFA equivalence', () => {
      const tree = RegExParser.parseRegEx('a*b*c*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      const testInputs = ['', 'a', 'b', 'c', 'abc', 'aabbcc', 'bca'];

      for (const input of testInputs) {
        const nfaResult = simulateNFA(nfa, input);
        const dfaResult = simulateNFA(dfa, input);
        expect(dfaResult).toBe(nfaResult);
      }
    });

    test('(ab)+: DFA equivalence', () => {
      const tree = RegExParser.parseRegEx('(ab)+');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      const testInputs = ['ab', 'abab', 'ababab', 'a', 'b', '', 'ba'];

      for (const input of testInputs) {
        const nfaResult = simulateNFA(nfa, input);
        const dfaResult = simulateNFA(dfa, input);
        expect(dfaResult).toBe(nfaResult);
      }
    });
  });

  describe('State Reduction Analysis', () => {
    test('DFA typically has fewer states than NFA for simple patterns', () => {
      const tree = RegExParser.parseRegEx('a');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      // DFA should be more compact or equal
      expect(dfa.states.length).toBeLessThanOrEqual(nfa.states.length);
    });

    test('DFA may have more states for complex patterns', () => {
      const tree = RegExParser.parseRegEx('(a|b)*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      // Both should be valid automata
      expect(dfa.states.length).toBeGreaterThan(0);
      expect(nfa.states.length).toBeGreaterThan(0);
    });
  });

  describe('Alphabet Coverage', () => {
    test('DFA covers all symbols from NFA', () => {
      const tree = RegExParser.parseRegEx('abc');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      const nfaSymbols = new Set(
        nfa.transitions.filter(t => t.symbol !== null).map(t => t.symbol!)
      );
      const dfaSymbols = new Set(
        dfa.transitions.filter(t => t.symbol !== null).map(t => t.symbol!)
      );

      // DFA should have all NFA symbols
      for (const symbol of nfaSymbols) {
        expect(dfaSymbols.has(symbol)).toBe(true);
      }
    });
  });

  describe('Accept State Validation', () => {
    test('DFA has at least one accepting state for valid pattern', () => {
      const tree = RegExParser.parseRegEx('a*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      const acceptingStates = dfa.states.filter(s => s.isAccepting);
      expect(acceptingStates.length).toBeGreaterThanOrEqual(1);
    });

    test('accepting states are reachable', () => {
      const tree = RegExParser.parseRegEx('ab');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      // Verify at least one path to accepting state
      const reachableStates = new Set([dfa.startState]);
      let changed = true;

      while (changed) {
        changed = false;
        for (const transition of dfa.transitions) {
          if (reachableStates.has(transition.fromState) &&
              !reachableStates.has(transition.toState)) {
            reachableStates.add(transition.toState);
            changed = true;
          }
        }
      }

      const acceptingStates = dfa.states.filter(s => s.isAccepting);
      const acceptingReachable = acceptingStates.some(s => reachableStates.has(s));
      expect(acceptingReachable).toBe(true);
    });
  });
});
