/**
 * Integration Tests: Complete RegEx Processing Pipeline
 *
 * Tests the full workflow:
 * RegEx → Syntax Tree → ε-NFA → DFA → Minimized DFA
 *
 * Validates end-to-end correctness with real-world patterns
 */

import { RegExParser } from '../regexParser';
import { syntaxTreeToAutomaton, simulateNFA } from '../automatonSimulator';
import { nfaToDfa } from '../determinization';
import { minimizeDFA } from '../minimisation';

describe('Integration Tests: Full Pipeline', () => {

  describe('Exercise Text: "Livre sur Babylone"', () => {
    const text = 'Livre sur Babylone';
    const words = text.split(' ');

    describe('Pattern: S(a|g|r)+on', () => {
      test('does not match "Livre"', () => {
        const tree = RegExParser.parseRegEx('S(a|g|r)+on');
        const nfa = syntaxTreeToAutomaton(tree);
        const dfa = nfaToDfa(nfa);
        const minimized = minimizeDFA(dfa);

        expect(simulateNFA(minimized, 'Livre')).toBe(false);
      });

      test('does not match "sur"', () => {
        const tree = RegExParser.parseRegEx('S(a|g|r)+on');
        const nfa = syntaxTreeToAutomaton(tree);
        const dfa = nfaToDfa(nfa);
        const minimized = minimizeDFA(dfa);

        expect(simulateNFA(minimized, 'sur')).toBe(false);
      });

      test('does not match "Babylone" (no S prefix)', () => {
        const tree = RegExParser.parseRegEx('S(a|g|r)+on');
        const nfa = syntaxTreeToAutomaton(tree);
        const dfa = nfaToDfa(nfa);
        const minimized = minimizeDFA(dfa);

        expect(simulateNFA(minimized, 'Babylone')).toBe(false);
      });

      test('would match "Sargon" if present', () => {
        const tree = RegExParser.parseRegEx('S(a|g|r)+on');
        const nfa = syntaxTreeToAutomaton(tree);
        const dfa = nfaToDfa(nfa);
        const minimized = minimizeDFA(dfa);

        expect(simulateNFA(minimized, 'Sargon')).toBe(true);
      });
    });

    describe('Pattern: S[a-z]+on', () => {
      test('does not match "Livre"', () => {
        const tree = RegExParser.parseRegEx('S[a-z]+on');
        const nfa = syntaxTreeToAutomaton(tree);
        const dfa = nfaToDfa(nfa);
        const minimized = minimizeDFA(dfa);

        expect(simulateNFA(minimized, 'Livre')).toBe(false);
      });

      test('would match "Sargon"', () => {
        const tree = RegExParser.parseRegEx('S[a-z]+on');
        const nfa = syntaxTreeToAutomaton(tree);
        const dfa = nfaToDfa(nfa);
        const minimized = minimizeDFA(dfa);

        expect(simulateNFA(minimized, 'Sargon')).toBe(true);
      });

      test('would match "Salon"', () => {
        const tree = RegExParser.parseRegEx('S[a-z]+on');
        const nfa = syntaxTreeToAutomaton(tree);
        const dfa = nfaToDfa(nfa);
        const minimized = minimizeDFA(dfa);

        expect(simulateNFA(minimized, 'Salon')).toBe(true);
      });

      test('would match "Saaaaaon"', () => {
        const tree = RegExParser.parseRegEx('S[a-z]+on');
        const nfa = syntaxTreeToAutomaton(tree);
        const dfa = nfaToDfa(nfa);
        const minimized = minimizeDFA(dfa);

        expect(simulateNFA(minimized, 'Saaaaaon')).toBe(true);
      });
    });
  });

  describe('Real-World Patterns', () => {
    test('email-like pattern: [a-z]+@[a-z]+', () => {
      const tree = RegExParser.parseRegEx('[a-z]+@[a-z]+');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      expect(simulateNFA(minimized, 'user@domain')).toBe(true);
      expect(simulateNFA(minimized, 'a@b')).toBe(true);
      expect(simulateNFA(minimized, '@domain')).toBe(false);
      expect(simulateNFA(minimized, 'user@')).toBe(false);
    });

    test('identifier pattern: [a-z][a-z]*', () => {
      const tree = RegExParser.parseRegEx('[a-z][a-z]*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      expect(simulateNFA(minimized, 'a')).toBe(true);
      expect(simulateNFA(minimized, 'abc')).toBe(true);
      expect(simulateNFA(minimized, 'variable')).toBe(true);
      expect(simulateNFA(minimized, '')).toBe(false);
    });

    test('optional element: a(b|c)*d', () => {
      const tree = RegExParser.parseRegEx('a(b|c)*d');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      expect(simulateNFA(minimized, 'ad')).toBe(true);
      expect(simulateNFA(minimized, 'abd')).toBe(true);
      expect(simulateNFA(minimized, 'acd')).toBe(true);
      expect(simulateNFA(minimized, 'abcd')).toBe(true);
      expect(simulateNFA(minimized, 'acbcbd')).toBe(true);
      expect(simulateNFA(minimized, 'a')).toBe(false);
      expect(simulateNFA(minimized, 'd')).toBe(false);
    });
  });

  describe('Pipeline Consistency', () => {
    const patterns = [
      'a',
      'ab',
      'a|b',
      'a*',
      'a+',
      '(ab)*',
      'a*b*',
      '(a|b)*c',
      'S[a-z]+on',
      '[a-c]+[d-f]*'
    ];

    const testInputs = [
      '',
      'a',
      'b',
      'c',
      'ab',
      'abc',
      'aaa',
      'Sargon',
      'Son'
    ];

    patterns.forEach(pattern => {
      describe(`Pattern: ${pattern}`, () => {
        let nfa: any, dfa: any, minimized: any;

        beforeAll(() => {
          const tree = RegExParser.parseRegEx(pattern);
          nfa = syntaxTreeToAutomaton(tree);
          dfa = nfaToDfa(nfa);
          minimized = minimizeDFA(dfa);
        });

        test('NFA, DFA, and Minimized DFA accept same language', () => {
          testInputs.forEach(input => {
            const nfaResult = simulateNFA(nfa, input);
            const dfaResult = simulateNFA(dfa, input);
            const minResult = simulateNFA(minimized, input);

            expect(dfaResult).toBe(nfaResult);
            expect(minResult).toBe(nfaResult);
          });
        });

        test('DFA has no epsilon transitions', () => {
          const epsilonTrans = dfa.transitions.filter((t: any) => t.symbol === null);
          expect(epsilonTrans.length).toBe(0);
        });

        test('Minimized DFA has no epsilon transitions', () => {
          const epsilonTrans = minimized.transitions.filter((t: any) => t.symbol === null);
          expect(epsilonTrans.length).toBe(0);
        });

        test('State count: Minimized <= DFA', () => {
          expect(minimized.states.length).toBeLessThanOrEqual(dfa.states.length);
        });
      });
    });
  });

  describe('Performance Characteristics', () => {
    test('simple patterns process quickly', () => {
      const start = Date.now();

      const tree = RegExParser.parseRegEx('abc');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);
      simulateNFA(minimized, 'abc');

      const duration = Date.now() - start;

      // Should complete in reasonable time (< 100ms for simple pattern)
      expect(duration).toBeLessThan(100);
    });

    test('character class expansion handles [a-z]', () => {
      const start = Date.now();

      const tree = RegExParser.parseRegEx('[a-z]');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      const duration = Date.now() - start;

      // Should handle even with 26 character expansion
      expect(duration).toBeLessThan(500);
      expect(simulateNFA(minimized, 'a')).toBe(true);
      expect(simulateNFA(minimized, 'z')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('empty kleene star: ()*', () => {
      const tree = RegExParser.parseRegEx('()*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      // Should accept empty string
      expect(simulateNFA(minimized, '')).toBe(true);
    });

    test('nested stars: (a*)*', () => {
      const tree = RegExParser.parseRegEx('(a*)*');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      expect(simulateNFA(minimized, '')).toBe(true);
      expect(simulateNFA(minimized, 'a')).toBe(true);
      expect(simulateNFA(minimized, 'aaa')).toBe(true);
    });

    test('alternation chain: a|b|c|d', () => {
      const tree = RegExParser.parseRegEx('a|b|c|d');
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minimized = minimizeDFA(dfa);

      expect(simulateNFA(minimized, 'a')).toBe(true);
      expect(simulateNFA(minimized, 'b')).toBe(true);
      expect(simulateNFA(minimized, 'c')).toBe(true);
      expect(simulateNFA(minimized, 'd')).toBe(true);
      expect(simulateNFA(minimized, 'e')).toBe(false);
    });
  });

  describe('Correctness Verification', () => {
    test('all stages maintain language equivalence', () => {
      const patterns = ['a*b', '(a|b)*', 'a+b+', '[a-c]+'];
      const inputs = ['', 'a', 'b', 'ab', 'ba', 'aab', 'abb', 'aabb'];

      patterns.forEach(pattern => {
        const tree = RegExParser.parseRegEx(pattern);
        const nfa = syntaxTreeToAutomaton(tree);
        const dfa = nfaToDfa(nfa);
        const minimized = minimizeDFA(dfa);

        inputs.forEach(input => {
          const nfaResult = simulateNFA(nfa, input);
          const dfaResult = simulateNFA(dfa, input);
          const minResult = simulateNFA(minimized, input);

          expect(dfaResult).toBe(nfaResult);
          expect(minResult).toBe(nfaResult);
        });
      });
    });
  });
});
