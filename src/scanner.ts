import { Lox } from ".";
import { TokenType, Token } from "./token";

export class Scanner {
  source: string;
  tokens: Token[];
  start = 0;
  current = 0;
  line = 1;
  lox = new Lox();
  keywords: Map<string, TokenType>

  constructor(source: string) {
    this.source = source;
    this.tokens = [];
    this.keywords = new Map<string, TokenType>();
    this.keywords.set("and", TokenType.AND);
    this.keywords.set("class", TokenType.CLASS);
    this.keywords.set("else", TokenType.ELSE);
    this.keywords.set("false", TokenType.FALSE);
    this.keywords.set("for", TokenType.FOR);
    this.keywords.set("fun", TokenType.FUN);
    this.keywords.set("if", TokenType.IF);
    this.keywords.set("nil", TokenType.NIL);
    this.keywords.set("or", TokenType.OR);
    this.keywords.set("print", TokenType.PRINT);
    this.keywords.set("return", TokenType.RETURN);
    this.keywords.set("super", TokenType.SUPER);
    this.keywords.set("this", TokenType.THIS);
    this.keywords.set("true", TokenType.TRUE);
    this.keywords.set("var", TokenType.VAR);
  }

  isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  advance(): string {
    this.current++;
    const char = this.source.at(this.current - 1);
    if (typeof char === "string") {
      return char;
    }
    return "";
  }

  addToken(type: TokenType, literal: string | null | number = null) {
    const lexeme = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, lexeme, literal, this.line));
  }

  match(expected: string) {
    if (this.isAtEnd()) return false;
    if (this.source.at(this.current) != expected) return false;

    this.current++;
    return true;
  }

  peek() {
    if (this.isAtEnd()) return "\0";
    return this.source.at(this.current) ?? "";
  }

  handleString() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == "\n") this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      this.lox.error(this.line, "Unterminated string.");
      return;
    }

    this.advance();

    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  isDigit(c: string) {
    return c >= '0' && c <= '9';
  }

  peekNext() {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.at(this.current + 1) ?? "";
  }

  handleNumber() {
    while (this.isDigit(this.peek())) this.advance();

    if (this.peek() == '.' && this.isDigit(this.peekNext())) {
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }

    let literal = parseFloat(this.source.substring(this.start, this.current));
    this.addToken(TokenType.NUMBER, literal);
  }

  isAlpha(c: string) {
    return (c >= 'a' && c <= 'z') ||
      (c >= 'A' && c <= 'Z') ||
      c == '_';
  }

  isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    let type = this.keywords.get(this.source.substring(this.start, this.current))
    if (type == null) type = TokenType.IDENTIFIER;

    this.addToken(type);
  }

  scanToken() {
    const c = this.advance();
    switch (c) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      case '/':
        if (this.match("/")) {
          while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case ' ':
        break;
      case '\r':
        break;
      case '\t':
        break;
      case '\n':
        this.line++;
        break;
      case '"':
        this.handleString();
        break
      default:
        if (this.isDigit(c)) {
          this.handleNumber();
        } else if (this.isAlpha(c)) {
          this.identifier()
        } else {
          this.lox.error(this.line, 'Unexpected Character');
        }
        break;
    }
  }

  scanTokens(): Token[] {

    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, 0));
    return this.tokens;
  }
}

