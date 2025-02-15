import { TokenType, Token } from "./token";

export abstract class Expression {
  abstract accept<T>(visitor: Visitor<T>): T;
}

interface Visitor<T> {
  visitBinaryExpr(expr: Binary): T;
  visitGroupingExpr(expr: Grouping): T;
  visitLiteralExpr(expr: Literal): T;
  visitUnaryExpr(expr: Unary): T;
}

export class Binary extends Expression {
  left: Expression;
  operator: Token;
  right: Expression;

  constructor(left: Expression, operator: Token, right: Expression) {
    super();
    this.left = left;
    this.right = right;
    this.operator = operator;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}

export class Grouping extends Expression {
  expression: Expression;

  constructor(expression: Expression) {
    super();
    this.expression = expression;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }
}

export class Unary extends Expression {
  operator: Token;
  right: Expression;

  constructor(operator: Token, right: Expression) {
    super();
    this.operator = operator;
    this.right = right;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }
}

export class Literal extends Expression {
  value: Object | null;

  constructor(value: Object | null) {
    super()
    this.value = value;
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }
}

export class AstPrinter implements Visitor<String> {
  print(expression: Expression): string {
    return expression.accept(this);
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) return "nil";
    return expr.value.toString();
  }

  visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  parenthesize(name: string, ...exprs: Expression[]): string {
    let builder = `(${name}`;
    for (const expr of exprs) {
      builder += " " + expr.accept(this);
    }
    builder += ")";
    return builder;
  }
}


