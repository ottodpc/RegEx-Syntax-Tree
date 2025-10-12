class RegExTree {
  root: number;
  subTrees: RegExTree[];

  constructor(root: number, subTrees: RegExTree[] = []) {
    this.root = root;
    this.subTrees = subTrees;
  }
}

const CONCAT = 0xc04ca7;
const ETOILE = 0xe7011e;
const ALTERN = 0xa17e54;
const PARENTHESEOUVRANT = 0x16641664;
const PARENTHESEFERMANT = 0x51515151;

function charToRoot(c: string): number {
  if (c === "*") return ETOILE;
  if (c === "|") return ALTERN;
  if (c === "(") return PARENTHESEOUVRANT;
  if (c === ")") return PARENTHESEFERMANT;
  if (c === ".") return DOT;
  return c.charCodeAt(0);
}

// Main function to parse the regex into a syntax tree
function parseRegEx(regEx: string): RegExTree {
  const result: RegExTree[] = [];

  for (let i = 0; i < regEx.length; i++) {
    result.push(new RegExTree(charToRoot(regEx.charAt(i))));
  }

  return processRegExTree(result);
}

function processRegExTree(result: RegExTree[]): RegExTree {
  while (containsParentheses(result)) result = processParentheses(result);
  while (containsStar(result)) result = processStar(result);
  while (containsConcat(result)) result = processConcat(result);
  while (containsAltern(result)) result = processAltern(result);

  if (result.length !== 1) throw new Error("Invalid regular expression");

  return result[0];
}

function containsParentheses(trees: RegExTree[]): boolean {
  return trees.some(
    (t) => t.root === PARENTHESEOUVRANT || t.root === PARENTHESEFERMANT
  );
}

function processParentheses(trees: RegExTree[]): RegExTree[] {
  const result: RegExTree[] = [];
  let found = false;

  for (const t of trees) {
    if (!found && t.root === PARENTHESEFERMANT) {
      const content: RegExTree[] = [];
      while (
        result.length > 0 &&
        result[result.length - 1].root !== PARENTHESEOUVRANT
      ) {
        content.unshift(result.pop()!);
      }
      if (result.length === 0) throw new Error("Unmatched parentheses");
      result.pop();
      found = true;
      result.push(processRegExTree(content));
    } else {
      result.push(t);
    }
  }

  if (!found) throw new Error("Unmatched parentheses");
  return result;
}

function containsStar(trees: RegExTree[]): boolean {
  return trees.some((t) => t.root === ETOILE && t.subTrees.length === 0);
}

function processStar(trees: RegExTree[]): RegExTree[] {
  const result: RegExTree[] = [];
  let found = false;

  for (const t of trees) {
    if (!found && t.root === ETOILE && t.subTrees.length === 0) {
      if (result.length === 0) throw new Error("Star with no operand");
      const last = result.pop()!;
      result.push(new RegExTree(ETOILE, [last]));
      found = true;
    } else {
      result.push(t);
    }
  }

  return result;
}

function containsConcat(trees: RegExTree[]): boolean {
  let foundFirst = false;

  for (const t of trees) {
    const isOperand = t.subTrees.length > 0 || t.root !== ALTERN;
    const isAlternOperator = t.root === ALTERN && t.subTrees.length === 0;

    if (!foundFirst && isOperand) {
      foundFirst = true;
      continue;
    }
    if (foundFirst && isOperand) return true;
    if (isAlternOperator) foundFirst = false;
  }

  return false;
}

function processConcat(trees: RegExTree[]): RegExTree[] {
  const result: RegExTree[] = [];
  let found = false;
  let foundFirst = false;

  for (const t of trees) {
    const isOperand = t.subTrees.length > 0 || t.root !== ALTERN;
    const isAlternOperator = t.root === ALTERN && t.subTrees.length === 0;

    if (!found && !foundFirst && isOperand) {
      foundFirst = true;
      result.push(t);
      continue;
    }
    if (!found && foundFirst && isAlternOperator) {
      foundFirst = false;
      result.push(t);
      continue;
    }
    if (!found && foundFirst && isOperand) {
      const last = result.pop()!;
      result.push(new RegExTree(CONCAT, [last, t]));
      found = true;
    } else {
      result.push(t);
    }
  }

  return result;
}

function containsAltern(trees: RegExTree[]): boolean {
  return trees.some((t) => t.root === ALTERN && t.subTrees.length === 0);
}

function processAltern(trees: RegExTree[]): RegExTree[] {
  const result: RegExTree[] = [];
  let found = false;
  let left: RegExTree | null = null;

  for (const t of trees) {
    if (!found && t.root === ALTERN && t.subTrees.length === 0) {
      if (result.length === 0)
        throw new Error("Alternation with no left operand");
      left = result.pop()!;
      found = true;
    } else if (found && left) {
      result.push(new RegExTree(ALTERN, [left, t]));
      found = false;
    } else {
      result.push(t);
    }
  }

  if (found) throw new Error("Alternation with no right operand");
  return result;
}

const PLUS = 0xab1115;
const DOT = 0xd07;

// Expand [a-z] character classes to alternation
function expandCharClass(pattern: string): string {
  const charClassRegex = /\[([a-z])-([a-z])\]/g;
  return pattern.replace(charClassRegex, (match, start, end) => {
    const chars: string[] = [];
    for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) {
      chars.push(String.fromCharCode(i));
    }
    return `(${chars.join("|")})`;
  });
}

// Expand + operator to equivalent with *
// a+ becomes (a)(a)*  which is a followed by zero or more a's
function expandPlus(pattern: string): string {
  let result = "";
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "+" && i > 0) {
      // Find what comes before the +
      if (pattern[i - 1] === ")") {
        // (abc)+ case - need to find matching (
        let depth = 1;
        let j = i - 2;
        let before = ")";
        while (j >= 0 && depth > 0) {
          if (pattern[j] === ")") depth++;
          if (pattern[j] === "(") depth--;
          before = pattern[j] + before;
          j--;
        }
        // (expr)+ becomes (expr)(expr)*
        // We already have (expr) in result, add (expr)*
        result += before + "*";
      } else {
        // Simple character case: a+ → a(a)*
        // The character is already in result, add (char)*
        const char = pattern[i - 1];
        result += "(" + char + ")*";
      }
    } else {
      result += pattern[i];
    }
  }
  return result;
}

class RegExParser {
  static CONCAT = CONCAT;
  static ETOILE = ETOILE;
  static ALTERN = ALTERN;
  static PLUS = PLUS;
  static DOT = DOT;
  static PARENTHESEOUVRANT = PARENTHESEOUVRANT;
  static PARENTHESEFERMANT = PARENTHESEFERMANT;

  static parseRegEx(input: string): RegExTree {
    // Expand character classes and plus operators
    let expanded = expandCharClass(input);
    expanded = expandPlus(expanded);
    return parseRegEx(expanded);
  }
}

export { parseRegEx, RegExTree, CONCAT, ETOILE, ALTERN, PLUS, DOT, RegExParser };
