import { Token } from './Token';

export abstract class Expr {
  abstract accept<T>(visitor: Visitor<T>): T;
}

export default Expr;

export interface Visitor<T> {
  visitAssignExpr(assign: Assign): T;
  visitBinaryExpr(binary: Binary): T;
  visitGroupingExpr(grouping: Grouping): T;
  visitLiteralExpr(literal: Literal): T;
  visitLogicalExpr(logical: Logical): T;
  visitUnaryExpr(unary: Unary): T;
  visitVariableExpr(variable: Variable): T;
}

export class Assign extends Expr {
  readonly name: Token;
  readonly value: Expr;

  constructor(name: Token, value: Expr) {
    super();
    this.name = name;
    this.value = value;
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitAssignExpr(this);
  }
}

export class Binary extends Expr {
  readonly left: Expr;
  readonly operator: Token;
  readonly right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}

export class Grouping extends Expr {
  readonly expression: Expr;

  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal extends Expr {
  readonly value: any;

  constructor(value: any) {
    super();
    this.value = value;
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }
}

export class Logical extends Expr {
  readonly left: Expr;
  readonly operator: Token;
  readonly right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLogicalExpr(this);
  }
}

export class Unary extends Expr {
  readonly operator: Token;
  readonly right: Expr;

  constructor(operator: Token, right: Expr) {
    super();
    this.operator = operator;
    this.right = right;
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }
}

export class Variable extends Expr {
  readonly name: Token;

  constructor(name: Token) {
    super();
    this.name = name;
  }

  public accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVariableExpr(this);
  }
}