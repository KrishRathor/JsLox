import { Binary, Expression, Grouping, Literal, Unary } from "./expression";
import { TokenType, Token } from "./token";

export class Parser {

  tokens: Token[];
  current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  isAtEnd(): boolean {
    return this.peek().type == TokenType.EOF;
  }

  peek(): Token {
    return this.tokens[this.current];
  }

  previous(): Token {
    return this.tokens[this.current - 1];
  }

  advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type == type;
  }

  match(tokens: TokenType[]): boolean {
    for (const token of tokens) {
      if (this.check(token)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private comparison(): Expression {
    let expr = this.term();

    while (this.match([TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL])) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private term(): Expression {
    let expr = this.factor();

    while (this.match([TokenType.PLUS, TokenType.MINUS])) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expression {
    let expr = this.unary();

    while (this.match([TokenType.SLASH, TokenType.STAR])) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expression {
    if (this.match([TokenType.BANG, TokenType.MINUS])) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(this.peek(), message);
  }

  report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error${where}: ${message}`);
  }

  error(token: Token, message: string) {
    if (token.type === TokenType.EOF) {
      this.report(token.line, " at end", message);
    } else {
      this.report(token.line, ` at '${token.lexeme}'`, message);
    }
  }

  private primary(): Expression {
    if (this.match([TokenType.FALSE])) return new Literal(false);
    if (this.match([TokenType.TRUE])) return new Literal(true);
    if (this.match([TokenType.NIL])) return new Literal(null);

    if (this.match([TokenType.NUMBER, TokenType.STRING])) {
      return new Literal(this.previous().literal);
    }

    if (this.match([TokenType.LEFT_PAREN])) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }
    throw this.error(this.peek(), "Expect expression.");
  }

  equality(): Expression {
    let expr: Expression = this.comparison();

    while (this.match([TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL])) {
      const operator: Token = this.previous();
      const right: Expression = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  expression(): Expression {
    return this.equality();
  }

  parse(): Expression | null {
    try {
      return this.expression();
    } catch (error) {
      return null;
    }
  }
}
