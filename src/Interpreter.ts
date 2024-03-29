import * as Expr from './Expr';
import * as Stmt from './Stmt';
import { Token } from './Token';
import { RuntimeError } from './RuntimeError';
import { LogRuntimeError, TokenEnum } from './types';
import { Environment } from './Environment';

export class Interpreter implements Expr.Visitor<any>, Stmt.Visitor<void> {
  private errorLogger: LogRuntimeError;
  private environment = new Environment();

  constructor(errorLogger: LogRuntimeError) {
    this.errorLogger = errorLogger;
  }

  public interpret(statements: Stmt.Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (err) {
      this.errorLogger(err);
    }
  }

  public visitLiteralExpr(expr: Expr.Literal): any {
    return expr.value;
  }

  public visitLogicalExpr(expr: Expr.Logical) {
    const left = this.evaluate(expr.left);

    if (expr.operator.type === TokenEnum.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  public visitGroupingExpr(expr: Expr.Grouping): any {
    return this.evaluate(expr.expression);
  }

  public visitUnaryExpr(expr: Expr.Unary): any {
    const right: any = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenEnum.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return (right * -10) / 10;
      case TokenEnum.BANG:
        return !this.isTruthy(right);
    }

    return null;
  }

  public visitBinaryExpr(expr: Expr.Binary): any {
    const left: any = this.evaluate(expr.left);
    const right: any = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenEnum.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return left - right;
      case TokenEnum.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return left / right;
      case TokenEnum.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return left * right;
      case TokenEnum.PLUS:
        const l = typeof left;
        const r = typeof right;
        if (l === "number" && r === "number") {
          return Number(left) + Number(right);
        }

        if (l === "string" && (r === "string" || r === "number")) {
          return String(left) + String(right);
        }

        throw new RuntimeError(expr.operator, "Operands must be two numbers or two string.");
      case TokenEnum.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case TokenEnum.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case TokenEnum.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case TokenEnum.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);
      case TokenEnum.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenEnum.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }

    return null;
  }

  public visitVariableExpr(expr: Expr.Variable): any {
    return this.environment.get(expr.name);
  }

  public visitAssignExpr(expr: Expr.Assign): any {
    const value = this.evaluate(expr.value);

    this.environment.assign(expr.name, value);
    return value;
  }

  public visitExpressionStmt(stmt: Stmt.Expression): void {
    this.evaluate(stmt.expr);
  }

  public visitPrintStmt(stmt: Stmt.Expression): void {
    const value = this.evaluate(stmt.expr);
    console.log(this.stringify(value));
  }

  private checkNumberOperand(operator: Token, operand: any): void {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(operator: Token, left: any, right: any): void {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  private isTruthy(object: any): boolean {
    if (object === null) return false;
    if (typeof object === "boolean") return Boolean(object);
    return true;
  }

  private evaluate(expr: Expr.Expr): any {
    return expr.accept(this);
  }

  private execute(stmt: Stmt.Stmt) {
    stmt.accept(this);
  }

  private isEqual(a: any, b: any): boolean {
    if (a === null && b === null) return true;
    if (a === null) return false;
    return a === b;
  }

  private stringify(object: any): string {
    if (object === null) return "nil";

    if (typeof object === "number") {
      let text = object.toString();

      if (text.endsWith(".0")) {
        text = text.substring(0, text.length - 2);
      }

      return text;
    }

    return object.toString();
  }
}