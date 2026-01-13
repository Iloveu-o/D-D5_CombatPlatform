
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.term = null;
  }
}

export class TermTrie {
  constructor(terms) {
    this.root = new TrieNode();
    if (terms) {
      terms.forEach(term => this.insert(term));
    }
  }

  insert(term) {
    let node = this.root;
    for (const char of term) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
    node.term = term;
  }

  // Maximum Munch parsing
  parse(text) {
    if (!text) return [];
    const tokens = [];
    let i = 0;
    while (i < text.length) {
      let node = this.root;
      let longestMatch = null;
      let matchLength = 0;
      
      // Try to find longest matching prefix from current position
      for (let j = i; j < text.length; j++) {
        const char = text[j];
        if (!node.children[char]) break;
        node = node.children[char];
        if (node.isEnd) {
          longestMatch = node.term;
          matchLength = j - i + 1;
        }
      }

      if (longestMatch) {
        tokens.push({ type: 'term', value: longestMatch });
        i += matchLength;
      } else {
        // No match, push text char
        // Optimization: accumulate text tokens
        const lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === 'text') {
          lastToken.value += text[i];
        } else {
          tokens.push({ type: 'text', value: text[i] });
        }
        i++;
      }
    }
    return tokens;
  }
}
