/**
 * Question 2.1: Syntax Tree Construction Tests
 *
 * Validates:
 * - Correct tree structure for basic patterns
 * - Operator precedence (parentheses > star > concat > alternation)
 * - Character class expansion ([a-z])
 * - Plus operator expansion (a+ -> aa*)
 * - Error handling for invalid patterns
 */

import { RegExParser, RegExTree, CONCAT, ETOILE, ALTERN } from '../regexParser';

describe('Question 2.1: Syntax Tree Construction', () => {

  describe('Basic Patterns', () => {
    test('single character', () => {
      const tree = RegExParser.parseRegEx('a');
      expect(tree.root).toBe('a'.charCodeAt(0));
      expect(tree.subTrees.length).toBe(0);
    });

    test('concatenation: ab', () => {
      const tree = RegExParser.parseRegEx('ab');
      expect(tree.root).toBe(CONCAT);
      expect(tree.subTrees.length).toBe(2);
      expect(tree.subTrees[0].root).toBe('a'.charCodeAt(0));
      expect(tree.subTrees[1].root).toBe('b'.charCodeAt(0));
    });

    test('alternation: a|b', () => {
      const tree = RegExParser.parseRegEx('a|b');
      expect(tree.root).toBe(ALTERN);
      expect(tree.subTrees.length).toBe(2);
      expect(tree.subTrees[0].root).toBe('a'.charCodeAt(0));
      expect(tree.subTrees[1].root).toBe('b'.charCodeAt(0));
    });

    test('kleene star: a*', () => {
      const tree = RegExParser.parseRegEx('a*');
      expect(tree.root).toBe(ETOILE);
      expect(tree.subTrees.length).toBe(1);
      expect(tree.subTrees[0].root).toBe('a'.charCodeAt(0));
    });
  });

  describe('Operator Precedence', () => {
    test('star has higher precedence than concat: ab*', () => {
      const tree = RegExParser.parseRegEx('ab*');
      expect(tree.root).toBe(CONCAT);
      expect(tree.subTrees[0].root).toBe('a'.charCodeAt(0));
      expect(tree.subTrees[1].root).toBe(ETOILE);
      expect(tree.subTrees[1].subTrees[0].root).toBe('b'.charCodeAt(0));
    });

    test('concat has higher precedence than alternation: a|bc', () => {
      const tree = RegExParser.parseRegEx('a|bc');
      expect(tree.root).toBe(ALTERN);
      expect(tree.subTrees[0].root).toBe('a'.charCodeAt(0));
      expect(tree.subTrees[1].root).toBe(CONCAT);
    });

    test('parentheses override precedence: (a|b)c', () => {
      const tree = RegExParser.parseRegEx('(a|b)c');
      expect(tree.root).toBe(CONCAT);
      expect(tree.subTrees[0].root).toBe(CONCAT); // Wrapper from parentheses
      expect(tree.subTrees[1].root).toBe('c'.charCodeAt(0));
    });

    test('parentheses with star: (ab)*', () => {
      const tree = RegExParser.parseRegEx('(ab)*');
      expect(tree.root).toBe(ETOILE);
      expect(tree.subTrees[0].root).toBe(CONCAT);
    });
  });

  describe('Exercise Examples', () => {
    test('S(a|g|r)+on pattern', () => {
      const tree = RegExParser.parseRegEx('S(a|g|r)+on');

      // Should be: S . ((a|g|r)(a|g|r)*) . o . n
      expect(tree.root).toBe(CONCAT);

      // First part should start with 'S'
      let current = tree;
      while (current.root === CONCAT && current.subTrees.length > 0) {
        if (current.subTrees[0].root !== CONCAT) {
          expect(current.subTrees[0].root).toBe('S'.charCodeAt(0));
          break;
        }
        current = current.subTrees[0];
      }
    });

    test('S[a-z]+on character class expansion', () => {
      const tree = RegExParser.parseRegEx('S[a-z]+on');

      // Should expand [a-z] to (a|b|c|...|z)
      // Then apply + expansion
      expect(tree.root).toBe(CONCAT);

      // Verify structure contains alternations for character class
      const hasAlternation = (t: RegExTree): boolean => {
        if (t.root === ALTERN) return true;
        return t.subTrees.some(st => hasAlternation(st));
      };

      expect(hasAlternation(tree)).toBe(true);
    });
  });

  describe('Complex Patterns', () => {
    test('nested alternation: (a|b)|(c|d)', () => {
      const tree = RegExParser.parseRegEx('(a|b)|(c|d)');
      expect(tree.root).toBe(ALTERN);
      expect(tree.subTrees.length).toBe(2);
    });

    test('multiple stars: a*b*c*', () => {
      const tree = RegExParser.parseRegEx('a*b*c*');
      expect(tree.root).toBe(CONCAT);

      // Count star operators
      const countStars = (t: RegExTree): number => {
        let count = t.root === ETOILE ? 1 : 0;
        return count + t.subTrees.reduce((sum, st) => sum + countStars(st), 0);
      };

      expect(countStars(tree)).toBe(3);
    });

    test('complex pattern: (a|b)*c(d|e)+', () => {
      const tree = RegExParser.parseRegEx('(a|b)*c(d|e)+');
      expect(tree.root).toBe(CONCAT);

      // Verify contains both star and plus (expanded to star)
      const hasEtoile = (t: RegExTree): boolean => {
        if (t.root === ETOILE) return true;
        return t.subTrees.some(st => hasEtoile(st));
      };

      expect(hasEtoile(tree)).toBe(true);
    });
  });

  describe('Character Class Expansion', () => {
    test('[a-c] expands to (a|b|c)', () => {
      const tree = RegExParser.parseRegEx('[a-c]');

      // Count leaf nodes (actual characters)
      const countLeaves = (t: RegExTree): number => {
        if (t.subTrees.length === 0) return 1;
        return t.subTrees.reduce((sum, st) => sum + countLeaves(st), 0);
      };

      // Should have exactly 3 characters: a, b, c
      expect(countLeaves(tree)).toBe(3);
    });

    test('[a-z] expands to 26-character alternation', () => {
      const tree = RegExParser.parseRegEx('[a-z]');

      // Count leaf nodes (actual characters)
      const countLeaves = (t: RegExTree): number => {
        if (t.subTrees.length === 0) return 1;
        return t.subTrees.reduce((sum, st) => sum + countLeaves(st), 0);
      };

      expect(countLeaves(tree)).toBe(26);
    });
  });

  describe('Plus Operator Expansion', () => {
    test('a+ expands to aa*', () => {
      const tree = RegExParser.parseRegEx('a+');

      // Should be concat of 'a' and 'a*'
      expect(tree.root).toBe(CONCAT);
      expect(tree.subTrees[0].root).toBe('a'.charCodeAt(0));
      expect(tree.subTrees[1].root).toBe(ETOILE);
      expect(tree.subTrees[1].subTrees[0].root).toBe('a'.charCodeAt(0));
    });

    test('(ab)+ expands to (ab)(ab)*', () => {
      const tree = RegExParser.parseRegEx('(ab)+');

      expect(tree.root).toBe(CONCAT);
      expect(tree.subTrees[1].root).toBe(ETOILE);
    });
  });

  describe('Error Handling', () => {
    test('unmatched opening parenthesis', () => {
      expect(() => RegExParser.parseRegEx('(ab')).toThrow();
    });

    test('unmatched closing parenthesis', () => {
      expect(() => RegExParser.parseRegEx('ab)')).toThrow();
    });

    test('star with no operand', () => {
      expect(() => RegExParser.parseRegEx('*')).toThrow();
    });

    test('alternation with no left operand', () => {
      expect(() => RegExParser.parseRegEx('|a')).toThrow();
    });

    test('alternation with no right operand', () => {
      expect(() => RegExParser.parseRegEx('a|')).toThrow();
    });
  });

  describe('Tree Structure Validation', () => {
    test('binary operators have exactly 2 subtrees', () => {
      const tree = RegExParser.parseRegEx('a|b');
      expect(tree.subTrees.length).toBe(2);

      const tree2 = RegExParser.parseRegEx('ab');
      expect(tree2.subTrees.length).toBe(2);
    });

    test('unary operators have exactly 1 subtree', () => {
      const tree = RegExParser.parseRegEx('a*');
      expect(tree.subTrees.length).toBe(1);
    });

    test('leaves have no subtrees', () => {
      const tree = RegExParser.parseRegEx('a');
      expect(tree.subTrees.length).toBe(0);
    });
  });
});
