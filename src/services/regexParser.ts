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
  if (c === ".") return CONCAT;
  if (c === "*") return ETOILE;
  if (c === "|") return ALTERN;
  if (c === "(") return PARENTHESEOUVRANT;
  if (c === ")") return PARENTHESEFERMANT;
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
      result.push(new RegExTree(CONCAT, [processRegExTree(content)]));
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
    if (!foundFirst && t.root !== ALTERN) {
      foundFirst = true;
      continue;
    }
    if (foundFirst && t.root !== ALTERN) return true;
    if (t.root === ALTERN) foundFirst = false;
  }

  return false;
}

function processConcat(trees: RegExTree[]): RegExTree[] {
  const result: RegExTree[] = [];
  let found = false;
  let foundFirst = false;

  for (const t of trees) {
    if (!found && !foundFirst && t.root !== ALTERN) {
      foundFirst = true;
      result.push(t);
      continue;
    }
    if (!found && foundFirst && t.root === ALTERN) {
      foundFirst = false;
      result.push(t);
      continue;
    }
    if (!found && foundFirst && t.root !== ALTERN) {
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

class RegExParser {
  static CONCAT = 0xc04ca7;
  static ETOILE = 0xe7011e;
  static ALTERN = 0xa17e54;
  static PROTECTION = 0xbaddad;
  static PARENTHESEOUVRANT = 0x16641664;
  static PARENTHESEFERMANT = 0x51515151;
  static DOT = 0xd07;

  private static regEx: string;

  // Main parsing function
  static parseRegEx(input: string): RegExTree {
    this.regEx = input;
    const trees = this.buildTrees();
    return this.parseConcat(trees);
  }

  private static buildTrees(): RegExTree[] {
    const result: RegExTree[] = [];
    for (let i = 0; i < this.regEx.length; i++) {
      const c = this.regEx.charAt(i);
      result.push(new RegExTree(this.charToRoot(c)));
    }
    return result;
  }

  private static charToRoot(c: string): number {
    if (c === ".") return this.DOT;
    if (c === "*") return this.ETOILE;
    if (c === "|") return this.ALTERN;
    if (c === "(") return this.PARENTHESEOUVRANT;
    if (c === ")") return this.PARENTHESEFERMANT;
    return c.charCodeAt(0);
  }

  private static parseConcat(trees: RegExTree[]): RegExTree {
    while (trees.length > 1) {
      const left = trees.shift()!;
      const right = trees.shift()!;
      const concatTree = new RegExTree(this.CONCAT, [left, right]);
      trees.unshift(concatTree);
    }
    return trees[0];
  }
}

export { parseRegEx, RegExTree, CONCAT, ETOILE, ALTERN, RegExParser };
