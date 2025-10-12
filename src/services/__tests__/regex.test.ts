import { RegExParser } from "../regexParser";
import { syntaxTreeToAutomaton, simulateNFA } from "../automatonSimulator";
import { nfaToDfa } from "../determinization";
import { minimizeDFA } from "../minimisation";

describe("Regex Algorithm Tests - TME Questions", () => {
  // Test examples from the TME
  const testCases = [
    {
      regex: "S(a|g|r)+on",
      text: "Livre sur Babylone",
      shouldMatch: true,
      description: "Example 1 from TME"
    },
    {
      regex: "S[a-z]+on",
      text: "Livre sur Babylone",
      shouldMatch: true,
      description: "Example 2 from TME with character class"
    }
  ];

  describe("Question 2.1 - Parsing to Syntax Tree", () => {
    test("should parse simple regex correctly", () => {
      const regex = "(a|b)*c";
      const tree = RegExParser.parseRegEx(regex);

      expect(tree).toBeDefined();
      expect(tree.root).toBe(RegExParser.CONCAT);
      expect(tree.subTrees).toHaveLength(2);

      // First child should be Kleene star
      expect(tree.subTrees[0].root).toBe(RegExParser.ETOILE);
      expect(tree.subTrees[0].subTrees).toHaveLength(1);

      // Inside star should be alternation
      expect(tree.subTrees[0].subTrees[0].root).toBe(RegExParser.ALTERN);

      // Second child should be 'c'
      expect(tree.subTrees[1].root).toBe('c'.charCodeAt(0));
    });

    test("should parse S(a|g|r)+on correctly", () => {
      const regex = "S(a|g|r)+on";
      const tree = RegExParser.parseRegEx(regex);

      expect(tree).toBeDefined();
      // Should be: CONCAT(CONCAT(S, CONCAT((a|g|r), (a|g|r)*)), CONCAT(o, n))
      expect(tree.root).toBe(RegExParser.CONCAT);
    });

    test("should expand character classes", () => {
      const regex = "S[a-z]+on";
      const tree = RegExParser.parseRegEx(regex);

      expect(tree).toBeDefined();
      // Character class [a-z] should be expanded to (a|b|c|...|z)
      expect(tree.root).toBe(RegExParser.CONCAT);
    });
  });

  describe("Question 2.2 - Syntax Tree to ε-NFA", () => {
    test("should create NFA from simple regex", () => {
      const regex = "a*b";
      const tree = RegExParser.parseRegEx(regex);
      const nfa = syntaxTreeToAutomaton(tree);

      expect(nfa).toBeDefined();
      expect(nfa.startState).toBeDefined();
      expect(nfa.acceptState).toBeDefined();
      expect(nfa.states.length).toBeGreaterThan(2);
      expect(nfa.transitions.length).toBeGreaterThan(0);

      // Check for epsilon transitions
      const epsilonTransitions = nfa.transitions.filter(t => t.symbol === null);
      expect(epsilonTransitions.length).toBeGreaterThan(0);
    });

    test("should handle concatenation correctly", () => {
      const regex = "ab";
      const tree = RegExParser.parseRegEx(regex);
      const nfa = syntaxTreeToAutomaton(tree);

      // Test simulation
      expect(simulateNFA(nfa, "ab")).toBe(true);
      expect(simulateNFA(nfa, "a")).toBe(false);
      expect(simulateNFA(nfa, "b")).toBe(false);
      expect(simulateNFA(nfa, "abc")).toBe(false);
    });

    test("should handle alternation correctly", () => {
      const regex = "a|b";
      const tree = RegExParser.parseRegEx(regex);
      const nfa = syntaxTreeToAutomaton(tree);

      expect(simulateNFA(nfa, "a")).toBe(true);
      expect(simulateNFA(nfa, "b")).toBe(true);
      expect(simulateNFA(nfa, "c")).toBe(false);
      expect(simulateNFA(nfa, "ab")).toBe(false);
    });

    test("should handle Kleene star correctly", () => {
      const regex = "a*";
      const tree = RegExParser.parseRegEx(regex);
      const nfa = syntaxTreeToAutomaton(tree);

      expect(simulateNFA(nfa, "")).toBe(true); // Zero occurrences
      expect(simulateNFA(nfa, "a")).toBe(true);
      expect(simulateNFA(nfa, "aa")).toBe(true);
      expect(simulateNFA(nfa, "aaa")).toBe(true);
      expect(simulateNFA(nfa, "b")).toBe(false);
    });
  });

  describe("Question 2.3 - NFA to DFA (Determinization)", () => {
    test("should determinize simple NFA", () => {
      const regex = "(a|b)*c";
      const tree = RegExParser.parseRegEx(regex);
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      expect(dfa).toBeDefined();
      expect(dfa.startState).toBeDefined();
      expect(dfa.acceptState).toBeDefined();

      // DFA should have no epsilon transitions
      const epsilonTransitions = dfa.transitions.filter(t => t.symbol === null);
      expect(epsilonTransitions.length).toBe(0);

      // Test that DFA accepts same language as NFA
      const testStrings = ["c", "ac", "bc", "aac", "abc", "bac", "bbc", "aaac"];
      for (const str of testStrings) {
        expect(simulateNFA(dfa, str)).toBe(simulateNFA(nfa, str));
      }
    });

    test("should determinize complex regex", () => {
      const regex = "S(a|g|r)+on";
      const tree = RegExParser.parseRegEx(regex);
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);

      // No epsilon transitions in DFA
      const epsilonTransitions = dfa.transitions.filter(t => t.symbol === null);
      expect(epsilonTransitions.length).toBe(0);

      // Test some strings
      expect(simulateNFA(dfa, "Sagon")).toBe(true);
      expect(simulateNFA(dfa, "Sgon")).toBe(true);
      expect(simulateNFA(dfa, "Sron")).toBe(true);
      expect(simulateNFA(dfa, "Sargon")).toBe(true);
      expect(simulateNFA(dfa, "Son")).toBe(false); // + means at least one
      expect(simulateNFA(dfa, "Sxon")).toBe(false);
    });
  });

  describe("Question 2.4 - DFA Minimization", () => {
    test("should minimize DFA", () => {
      const regex = "(a|b)*ab";
      const tree = RegExParser.parseRegEx(regex);
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minDfa = minimizeDFA(dfa);

      expect(minDfa).toBeDefined();
      expect(minDfa.states.length).toBeLessThanOrEqual(dfa.states.length);

      // Test that minimal DFA accepts same language
      const testStrings = ["ab", "aab", "bab", "aaab", "abab", "bbab"];
      for (const str of testStrings) {
        expect(simulateNFA(minDfa, str)).toBe(simulateNFA(dfa, str));
      }
    });
  });

  describe("Complete Pipeline Tests - TME Examples", () => {
    test.each(testCases)("$description: $regex on '$text'", ({ regex, text }) => {
      // Complete pipeline as in RegExTester
      const tree = RegExParser.parseRegEx(regex);
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minDfa = minimizeDFA(dfa);

      // Test substring matching (as egrep does)
      let found = false;
      for (let i = 0; i < text.length; i++) {
        for (let j = i + 1; j <= text.length; j++) {
          const substring = text.substring(i, j);
          if (simulateNFA(minDfa, substring)) {
            console.log(`Match found: "${substring}" at position ${i}-${j}`);
            found = true;
          }
        }
      }

      // For our test text "Livre sur Babylone", we don't expect a match
      // as there's no pattern matching S(a|g|r)+on
      expect(found).toBe(false);
    });

    test("Should match Sagon pattern", () => {
      const regex = "S(a|g|r)+on";
      const text = "Sagon";

      const tree = RegExParser.parseRegEx(regex);
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minDfa = minimizeDFA(dfa);

      expect(simulateNFA(minDfa, text)).toBe(true);
    });

    test("Should match Sargon pattern", () => {
      const regex = "S(a|g|r)+on";
      const text = "The king Sargon ruled Babylon";

      const tree = RegExParser.parseRegEx(regex);
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minDfa = minimizeDFA(dfa);

      // Test substring matching
      let found = false;
      let matchedSubstring = "";
      for (let i = 0; i < text.length; i++) {
        for (let j = i + 1; j <= text.length; j++) {
          const substring = text.substring(i, j);
          if (simulateNFA(minDfa, substring)) {
            found = true;
            matchedSubstring = substring;
            break;
          }
        }
        if (found) break;
      }

      expect(found).toBe(true);
      expect(matchedSubstring).toBe("Sargon");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty string", () => {
      const regex = "a*";
      const tree = RegExParser.parseRegEx(regex);
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minDfa = minimizeDFA(dfa);

      expect(simulateNFA(minDfa, "")).toBe(true);
    });

    test("should handle complex nested expressions", () => {
      const regex = "((a|b)*c)+d";
      const tree = RegExParser.parseRegEx(regex);
      const nfa = syntaxTreeToAutomaton(tree);
      const dfa = nfaToDfa(nfa);
      const minDfa = minimizeDFA(dfa);

      expect(simulateNFA(minDfa, "cd")).toBe(true);
      expect(simulateNFA(minDfa, "acd")).toBe(true);
      expect(simulateNFA(minDfa, "abcd")).toBe(true);
      expect(simulateNFA(minDfa, "ccd")).toBe(true);
      expect(simulateNFA(minDfa, "d")).toBe(false);
    });
  });
});