import { RuntimeError } from './RuntimeError';
import { Token } from './Token';

export interface TokenType {
    type: TokenEnum;
    lexeme: string;
    literal: any;
    line: number;
}

export enum TokenEnum {
  // Single-character tokens
  LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
  COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,

  // One or two character tokens
  BANG, BANG_EQUAL,
  EQUAL, EQUAL_EQUAL,
  GREATER, GREATER_EQUAL,
  LESS, LESS_EQUAL,

  // Literals
  IDENTIFIER, STRING, NUMBER,

  // Keywords
  AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
  PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,

  EOF
}

export type LogRuntimeError = (err: RuntimeError) => void;
export type LogError = (line: number | Token, message: string) => void;