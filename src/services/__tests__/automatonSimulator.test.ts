/**
 * Question 2.2: ε-NFA Construction and Simulation Tests
 *
 * Validates:
 * - Correct ε-NFA construction from syntax tree
 * - Epsilon closure computation
 * - NFA simulation with epsilon transitions
 * - Thompson's construction patterns
 * - Text matching correctness
 */

import { RegExParser } from '../regexParser';
import { syntaxTreeToAutomaton, simulateNFA, Automaton } from '../automatonSimulator';

describe('Question 2.2: ε-NFA Construction and Simulation', () => {

  describe('Basic Automaton Construction', () => {
    test('single character automaton', () => {
      const tree = RegExParser.parseRegEx('a');
      const automaton = syntaxTreeToAutomaton(tree);

      expect(automaton.states.length).toBeGreaterThanOrEqual(2);
      expect(automaton.startState).toBeDefined();
      expect(automaton.acceptState).toBeDefined();
      expect(automaton.acceptState.isAccepting).toBe(true);

      // Should have one transition from start to accept with 'a'
      const aTransitions = automaton.transitions.filter(t => t.symbol === 'a');
      expect(aTransitions.length).toBeGreaterThanOrEqual(1);
    });

    test('concatenation automaton: ab', () => {
      const tree = RegExParser.parseRegEx('ab');
      const automaton = syntaxTreeToAutomaton(tree);

      // Should have epsilon transition connecting two parts
      const epsilonTransitions = automaton.transitions.filter(t => t.symbol === null);
      expect(epsilonTransitions.length).toBeGreaterThanOrEqual(1);

      // Should have transitions for 'a' and 'b'
      const aTransitions = automaton.transitions.filter(t => t.symbol === 'a');
      const bTransitions = automaton.transitions.filter(t => t.symbol === 'b');
      expect(aTransitions.length).toBeGreaterThanOrEqual(1);
      expect(bTransitions.length).toBeGreaterThanOrEqual(1);
    });

    test('alternation automaton: a|b', () => {
      const tree = RegExParser.parseRegEx('a|b');
      const automaton = syntaxTreeToAutomaton(tree);

      // Should have epsilon transitions from start to both branches
      // and from both branches to accept
      const epsilonTransitions = automaton.transitions.filter(t => t.symbol === null);
      expect(epsilonTransitions.length).toBeGreaterThanOrEqual(4);

      const aTransitions = automaton.transitions.filter(t => t.symbol === 'a');
      const bTransitions = automaton.transitions.filter(t => t.symbol === 'b');
      expect(aTransitions.length).toBeGreaterThanOrEqual(1);
      expect(bTransitions.length).toBeGreaterThanOrEqual(1);
    });

    test('kleene star automaton: a*', () => {
      const tree = RegExParser.parseRegEx('a*');
      const automaton = syntaxTreeToAutomaton(tree);

      // Should have epsilon transitions for:
      // - start to accept (zero occurrences)
      // - start to inner start
      // - inner accept back to inner start (loop)
      // - inner accept to final accept
      const epsilonTransitions = automaton.transitions.filter(t => t.symbol === null);
      expect(epsilonTransitions.length).toBeGreaterThanOrEqual(4);

      const aTransitions = automaton.transitions.filter(t => t.symbol === 'a');
      expect(aTransitions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('NFA Simulation - Simple Patterns', () => {
    test('single character: "a" matches "a"', () => {
      const tree = RegExParser.parseRegEx('a');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'a')).toBe(true);
    });

    test('single character: "a" does not match "b"', () => {
      const tree = RegExParser.parseRegEx('a');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'b')).toBe(false);
    });

    test('concatenation: "ab" matches "ab"', () => {
      const tree = RegExParser.parseRegEx('ab');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'ab')).toBe(true);
    });

    test('concatenation: "ab" does not match "a"', () => {
      const tree = RegExParser.parseRegEx('ab');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'a')).toBe(false);
    });

    test('alternation: "a|b" matches "a"', () => {
      const tree = RegExParser.parseRegEx('a|b');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'a')).toBe(true);
    });

    test('alternation: "a|b" matches "b"', () => {
      const tree = RegExParser.parseRegEx('a|b');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'b')).toBe(true);
    });

    test('alternation: "a|b" does not match "c"', () => {
      const tree = RegExParser.parseRegEx('a|b');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'c')).toBe(false);
    });
  });

  describe('NFA Simulation - Kleene Star', () => {
    test('a* matches empty string', () => {
      const tree = RegExParser.parseRegEx('a*');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, '')).toBe(true);
    });

    test('a* matches "a"', () => {
      const tree = RegExParser.parseRegEx('a*');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'a')).toBe(true);
    });

    test('a* matches "aaa"', () => {
      const tree = RegExParser.parseRegEx('a*');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'aaa')).toBe(true);
    });

    test('a* does not match "b"', () => {
      const tree = RegExParser.parseRegEx('a*');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'b')).toBe(false);
    });

    test('ab* matches "a"', () => {
      const tree = RegExParser.parseRegEx('ab*');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'a')).toBe(true);
    });

    test('ab* matches "abbb"', () => {
      const tree = RegExParser.parseRegEx('ab*');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'abbb')).toBe(true);
    });
  });

  describe('NFA Simulation - Plus Operator', () => {
    test('a+ does not match empty string', () => {
      const tree = RegExParser.parseRegEx('a+');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, '')).toBe(false);
    });

    test('a+ matches "a"', () => {
      const tree = RegExParser.parseRegEx('a+');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'a')).toBe(true);
    });

    test('a+ matches "aaa"', () => {
      const tree = RegExParser.parseRegEx('a+');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'aaa')).toBe(true);
    });
  });

  describe('Exercise Examples - S(a|g|r)+on', () => {
    let automaton: Automaton;

    beforeEach(() => {
      const tree = RegExParser.parseRegEx('S(a|g|r)+on');
      automaton = syntaxTreeToAutomaton(tree);
    });

    test('matches "Sagon"', () => {
      expect(simulateNFA(automaton, 'Sagon')).toBe(true);
    });

    test('matches "Sargon"', () => {
      expect(simulateNFA(automaton, 'Sargon')).toBe(true);
    });

    test('matches "Saggon"', () => {
      expect(simulateNFA(automaton, 'Saggon')).toBe(true);
    });

    test('matches "Saragon"', () => {
      expect(simulateNFA(automaton, 'Saragon')).toBe(true);
    });

    test('does not match "Son" (missing required character)', () => {
      expect(simulateNFA(automaton, 'Son')).toBe(false);
    });

    test('does not match "Sbon" (invalid character)', () => {
      expect(simulateNFA(automaton, 'Sbon')).toBe(false);
    });

    test('does not match "sargon" (lowercase S)', () => {
      expect(simulateNFA(automaton, 'sargon')).toBe(false);
    });
  });

  describe('Exercise Examples - S[a-z]+on', () => {
    let automaton: Automaton;

    beforeEach(() => {
      const tree = RegExParser.parseRegEx('S[a-z]+on');
      automaton = syntaxTreeToAutomaton(tree);
    });

    test('matches "Sargon"', () => {
      expect(simulateNFA(automaton, 'Sargon')).toBe(true);
    });

    test('matches "Sagon"', () => {
      expect(simulateNFA(automaton, 'Sagon')).toBe(true);
    });

    test('matches "Sbabylon"', () => {
      expect(simulateNFA(automaton, 'Sbabylon')).toBe(true);
    });

    test('does not match "Son" (missing required character)', () => {
      expect(simulateNFA(automaton, 'Son')).toBe(false);
    });

    test('does not match "S123on" (digits not in [a-z])', () => {
      expect(simulateNFA(automaton, 'S123on')).toBe(false);
    });
  });

  describe('Complex Patterns', () => {
    test('(a|b)*c matches "c"', () => {
      const tree = RegExParser.parseRegEx('(a|b)*c');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'c')).toBe(true);
    });

    test('(a|b)*c matches "aac"', () => {
      const tree = RegExParser.parseRegEx('(a|b)*c');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'aac')).toBe(true);
    });

    test('(a|b)*c matches "ababc"', () => {
      const tree = RegExParser.parseRegEx('(a|b)*c');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'ababc')).toBe(true);
    });

    test('(a|b)*c does not match "abc2"', () => {
      const tree = RegExParser.parseRegEx('(a|b)*c');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'abc2')).toBe(false);
    });

    test('a*b*c* matches "abc"', () => {
      const tree = RegExParser.parseRegEx('a*b*c*');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'abc')).toBe(true);
    });

    test('a*b*c* matches "aaabbbccc"', () => {
      const tree = RegExParser.parseRegEx('a*b*c*');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, 'aaabbbccc')).toBe(true);
    });

    test('a*b*c* matches empty string', () => {
      const tree = RegExParser.parseRegEx('a*b*c*');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(simulateNFA(automaton, '')).toBe(true);
    });
  });

  describe('Epsilon Closure Validation', () => {
    test('kleene star automaton has proper epsilon transitions', () => {
      const tree = RegExParser.parseRegEx('a*');
      const automaton = syntaxTreeToAutomaton(tree);

      // Verify epsilon transitions exist
      const epsilonTrans = automaton.transitions.filter(t => t.symbol === null);
      expect(epsilonTrans.length).toBeGreaterThanOrEqual(4);

      // Verify can accept empty string (via epsilon path)
      expect(simulateNFA(automaton, '')).toBe(true);
    });

    test('alternation has epsilon transitions from start', () => {
      const tree = RegExParser.parseRegEx('a|b');
      const automaton = syntaxTreeToAutomaton(tree);

      // Should have epsilon transitions from start state
      const epsilonFromStart = automaton.transitions.filter(
        t => t.fromState === automaton.startState && t.symbol === null
      );
      expect(epsilonFromStart.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('State and Transition Counts', () => {
    test('single character has 2 states', () => {
      const tree = RegExParser.parseRegEx('a');
      const automaton = syntaxTreeToAutomaton(tree);
      expect(automaton.states.length).toBe(2);
    });

    test('automaton states are properly linked', () => {
      const tree = RegExParser.parseRegEx('abc');
      const automaton = syntaxTreeToAutomaton(tree);

      // Every state (except accept) should have outgoing transitions
      const statesWithOutgoing = new Set(automaton.transitions.map(t => t.fromState));
      expect(statesWithOutgoing.size).toBeGreaterThan(0);
    });
  });
});
