const acorn = require('acorn');
const Parser = acorn.Parser;
const TokenType = acorn.TokenType;

Parser.acorn.keywordTypes['guang'] = new TokenType('guang', { keyword: 'guang' });

module.exports = function (Parser) {
  return class extends Parser {
    parse(program) {
      let newKeywords =
        'break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this const class extends export import super';
      newKeywords += ' guang';
      this.keywords = new RegExp('^(?:' + newKeywords.replace(/ /g, '|') + ')$');
      return super.parse(program);
    }
    parseStatement(...args) {
      var startType = this.type;

      if (startType == Parser.acorn.keywordTypes['guang']) {
        var node = this.startNode();
        return this.parseGuangStatement(node);
      } else {
        return super.parseStatement(...args);
      }
    }

    parseGuangStatement(node) {
      this.next();
      return this.finishNode({ value: 'guang' }, 'GuangStatement');
    }
  };
};
