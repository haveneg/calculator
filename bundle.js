(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Interpreter = require('calc-lang');
const interpreter = new Interpreter(); //sets up the calculator interpreter


let textinput = document.getElementById("textinput"); //main text input box
let result = 0; //main result variable

let numButtons = document.querySelectorAll(".num"); //number buttons
let operButtons = document.querySelectorAll(".oper"); //operator buttons


//initialize keys
let enterButton = document.getElementById("enter");
enterButton.addEventListener("click", main);

let clearButton = document.getElementById("clearButton");
clearButton.addEventListener("click", ac);

let delButton = document.getElementById("delButton");
delButton.addEventListener("click", del);

numButtons.forEach((button) => { //adds each number to the text box when it is clicked
    button.addEventListener("click", () => {
        textinput.value += button.value.trim();
    });
});

operButtons.forEach((button) => { //adds an operator to the text box when it is clicked
    button.addEventListener("click", () => {
        textinput.value += button.value.trim();
    });
});

document.addEventListener("keypress", (event) => { //uses the enter key to run the main function
    if (event.key == "enter") {
        main();
    }
})

function main() { //main function that interprets the expression and spits out an answer with the package
    
    result = interpreter.run(textinput.value); //runs the expression through  the interpreter
    textinput.value = result; //prints the result to the text box
}

function ac() {
    textinput.value = ""; //clears the text input box
}

function del() {
    textinput.value = textinput.value.slice(0, -1); //backspace for the text input box
}
},{"calc-lang":2}],2:[function(require,module,exports){
const Interpreter = require('./src/Interpreter');

module.exports = Interpreter;

},{"./src/Interpreter":3}],3:[function(require,module,exports){
'use strict';

const Parser = require('./Parser');

const ERRORS = {
  syntaxError: {
    code: 'syntax_error',
    text: (value) => `Could not parse '${value}'.`
  }
};

class Interpreter {

  constructor() {
    this.parser = new Parser();
    this.input = '';
    this.index = 0;
    this.stack = [];

    this.handlers = {
      'OP_PUSH': (instruction) => {
        this.stack.push(instruction);
      },
      'OP_NEGATIVE': () => {
        let token = this.stack.pop();
        token.value = -1 * token.value;
        this.stack.push(token);
      },
      'OP_ADD': () => {
        let tokenA = this.stack.pop();
        let tokenB = this.stack.pop();
        tokenA.value = tokenB.value + tokenA.value;
        this.stack.push(tokenA);
      },
      'OP_SUBTRACT': () => {
        let tokenA = this.stack.pop();
        let tokenB = this.stack.pop();
        tokenA.value = tokenB.value - tokenA.value;
        this.stack.push(tokenA);
      },
      'OP_MULTIPLY': () => {
        let tokenA = this.stack.pop();
        let tokenB = this.stack.pop();
        tokenA.value = tokenB.value * tokenA.value;
        this.stack.push(tokenA);
      },
      'OP_DIVIDE': () => {
        let tokenA = this.stack.pop();
        let tokenB = this.stack.pop();
        tokenA.value = tokenB.value / tokenA.value;
        this.stack.push(tokenA);
      },
    };
  }

  reset() {
    this.parser.reset();
    this.input = '';
    this.index = 0;
    this.stack = [];
  }

  run(text) {
    this.reset();
    const instructions = this.parser.parse(text);
    this.executeInstructions(instructions);
    const output = this.stack.pop();
    return output && output.value;
  }

  executeInstructions(instructions) {
    instructions.forEach((instruction) => {
      const handler = this.handlers[instruction.operation];
      handler && handler(instruction);
    })
  }
}

module.exports = Interpreter;

},{"./Parser":4}],4:[function(require,module,exports){
// Precedence is based on this order of operations:
// https://en.wikipedia.org/wiki/Order_of_operations#Programming_languages
'use strict';

const Scanner = require('./Scanner');

const ERRORS = {
  parseError: {
    code: 'parse_error',
    text: (value, column) => `Could not parse '${value}' at column ${column + 1}.`
  }
};

const PRECEDENCE = {
  LOW: {
    TK_PLUS: 1,
    TK_MINUS: 1,
  },
  HIGH: {
    TK_MULTIPLY: 1,
    TK_DIVIDE: 1,
    TK_MOD: 1,
  },
  UNARY: {
    TK_MINUS: 1,
    TK_NOT: 1
  },
  LITERAL: {
    TK_NUMBER: 1
  },
};

class Parser {
  constructor() {
    this.scanner = new Scanner();
    this.instructions = [];
    this.index = 0;
  }

  reset() {
    this.scanner.reset();
    this.instructions = [];
    this.index = 0;
  }

  parse(text) {
    this.reset();
    this.scanner.scan(text);
    this._parseTokens();
    return this.instructions;
  }

  get currentToken() {
    return this.scanner.tokens[this.index];
  }

  _matchToken(tokenType) {
    if (this.currentToken.type !== tokenType) {
      throw new SyntaxError(ERRORS.parseError.text(this.currentToken.value, this.index));
    }

    this._nextToken();
  }

  _nextToken() {
    this.index += 1;
  }

  _parseTokens() {
    while (this.currentToken && this.currentToken.type !== 'TK_EOF') {
      this._expression();
      this._nextToken();
    }
  }

  _expression() {
    this._term()

    while (PRECEDENCE.LOW[this.currentToken.type]) {
      const operator = this.currentToken;
      this._matchToken(operator.type);
      this._term();

      switch (operator.type) {
        case 'TK_PLUS':
          this._generateInstruction(operator, 'OP_ADD'); break;
        case 'TK_MINUS':
          this._generateInstruction(operator, 'OP_SUBTRACT'); break;
      }
    }
  }

  _term() {
    this._factor();

    while (PRECEDENCE.HIGH[this.currentToken.type]) {
      const operator = this.currentToken;
      this._matchToken(operator.type);
      this._factor();

      switch (operator.type) {
        case 'TK_MULTIPLY':
          this._generateInstruction(operator, 'OP_MULTIPLY'); break;
        case 'TK_DIVIDE':
          this._generateInstruction(operator, 'OP_DIVIDE'); break;
        case 'TK_MOD':
          this._generateInstruction(operator, 'OP_MOD'); break;
      }
    }
  }

  _factor() {
    const token = this.currentToken;

    if (PRECEDENCE.LITERAL[token.type]) {
      this._matchToken(token.type);
      this._generateInstruction(token, 'OP_PUSH');
    }

    else if (PRECEDENCE.UNARY[token.type]) {
      this._matchToken(token.type);
      this._factor();

      switch (token.type) {
        case 'TK_MINUS':
          this._generateInstruction(token, 'OP_NEGATIVE'); break;
        case 'TK_NOT':
          this._generateInstruction(token, 'OP_NEGATE'); break;
      }
    }

    else if (token.type === 'TK_OPEN_PAREN') {
      this._matchToken('TK_OPEN_PAREN');
      this._expression();
      this._matchToken('TK_CLOSE_PAREN');
    }
  }

  _generateInstruction(token, operation) {
    operation && token.setOperation(operation);
    this.instructions.push(token);
  }
}

module.exports = Parser;

},{"./Scanner":5}],5:[function(require,module,exports){
const Token = require('./Token').Token;

class Scanner {
  constructor() {
    this.tokens = [];
    this.index = 0;
    this.current_number = '';
  }

  reset() {
    this.tokens = [];
    this.index = 0;
    this.current_number = '';
  }

  scan(text) {
    this.reset();

    const cleanedText = this._clean(text);
    for (this.index = 0; this.index < cleanedText.length; this.index++) {
      this._analyzeToken(cleanedText[this.index]);
    }

    this._pushNumber();
    this.tokens.push(new Token('EOF', 'TK_EOF'))
    return this.tokens;
  }

  _clean(text) {
    return text.toLowerCase().replace(/require|eval/g, '').trim();
  }

  _pushNumber() {
    if (this.current_number) {
      this.tokens.push(new Token(parseFloat(this.current_number), 'TK_NUMBER'));
      this.current_number = '';
    }
  }

  _analyzeToken(char) {
    this._matchNumber(char) ? this._handleNumber(char) :
    this._matchDecimalPoint(char) ? this._handleDecimalPoint(char) :
    this._matchPlus(char) ? this._handleOperator(char, 'TK_PLUS') :
    this._matchMinus(char) ? this._handleOperator(char, 'TK_MINUS') :
    this._matchMultiply(char) ? this._handleOperator(char, 'TK_MULTIPLY') :
    this._matchDivide(char) ? this._handleOperator(char, 'TK_DIVIDE') :
    this._matchModulo(char) ? this._handleOperator(char, 'TK_MOD') :
    this._matchPower(char) ? this._handleOperator(char, 'TK_POWER') :
    this._matchOpenParenthesis(char) ? this._handleOperator(char, 'TK_OPEN_PAREN') :
    this._matchCloseParenthesis(char) ? this._handleOperator(char, 'TK_CLOSE_PAREN') :
    this._handleOther(char);
  }

  _matchNumber(char) {
    return /[0-9]/.test(char);
  }

  _handleNumber(char) {
    this.current_number += char;
  }

  _matchDecimalPoint(char) {
    return char === '.';
  }

  _handleDecimalPoint(char) {
    const isNewDecimalPoint = this.current_number.indexOf('.') === -1;

    if (isNewDecimalPoint) {
      this.current_number += char;
    } else {
      throw new SyntaxError('. at column ' + (this.index + 1));
    }
  }

  _handleOperator(char, token_type) {
    this._pushNumber();
    this.tokens.push(new Token(char, token_type));
  }

  _matchPlus(char) {
    return char === '+';
  }

  _matchMinus(char) {
    return char === '-';
  }

  _matchMultiply(char) {
    return (
      char === '*' || char === 'x'
    );
  }

  _matchDivide(char) {
    return char === '/';
  }

  _matchModulo(char) {
    return char === '%';
  }

  _matchPower(char) {
    return char === '^';
  }

  _matchOpenParenthesis(char) {
    return char === '(';
  }

  _matchCloseParenthesis(char) {
    return char === ')';
  }

  _handleOther(char) {

  }
}

module.exports = Scanner;

},{"./Token":6}],6:[function(require,module,exports){
const TOKEN_TABLE = exports.TOKEN_TABLE = {
  TK_EOF: {
    name: 'EOF',
    type: 'descriptor'
  },
  TK_NUMBER: {
    name: 'number',
    type: 'data',
  },
  TK_DOT: {
    name: 'dot',
    type: 'data',
  },
  TK_OPEN_PAREN: {
    name: 'open_parenthesis',
    type: 'operator',
  },
  TK_CLOSE_PAREN: {
    name: 'close_parenthesis',
    type: 'operator',
  },
  TK_POWER: {
    name: 'power',
    type: 'operator',
  },
  TK_SIN: {
    name: 'sine',
    type: 'function',
  },
  TK_COS: {
    name: 'cosine',
    type: 'function',
  },
  TK_TAN: {
    name: 'tan',
    type: 'function',
  },
  TK_MULTIPLY: {
    name: 'multiply',
    type: 'operator',
  },
  TK_DIVIDE: {
    name: 'divide',
    type: 'operator',
  },
  TK_MOD: {
    name: 'modulo',
    type: 'operator',
  },
  TK_PLUS: {
    name: 'plus',
    type: 'operator',
  },
  TK_MINUS: {
    name: 'minus',
    type: 'operator',
  },
};

class Token {
  constructor(value, type) {
    this.value = value;
    this.type = type;
  }

  get token() {
    return TOKEN_TABLE[this.type];
  }

  setOperation(operation) {
    this.operation = operation;
  }
}

exports.Token = Token;

},{}]},{},[1]);
