import { Token } from './Token';
import { LogError, TokenEnum } from './types';
import { isDigit, isAlpha, isAlphaNumeric } from './utils';

const Keywords: { [key: string]: TokenEnum } = {
    and: TokenEnum.AND,
    class: TokenEnum.CLASS,
    else: TokenEnum.ELSE,
    false: TokenEnum.FALSE,
    for: TokenEnum.FOR,
    fun: TokenEnum.FUN,
    if: TokenEnum.IF,
    nil: TokenEnum.NIL,
    or: TokenEnum.OR,
    print: TokenEnum.PRINT,
    return: TokenEnum.RETURN,
    super: TokenEnum.SUPER,
    this: TokenEnum.THIS,
    true: TokenEnum.TRUE,
    var: TokenEnum.VAR,
    while: TokenEnum.WHILE
}

export class Scanner {
    private errorLogger: LogError;
    private source: string;
    private tokens: Token[] = [];
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;

    constructor(source: string, logger: LogError) {
        this.source = source;
        this.errorLogger = logger;
    }

    public scanTokens(): Token[] {
        while (!this.isAtEnd()) {
            // next lexeme
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenEnum.EOF, "", null, this.line));
        return this.tokens;
    }

    private scanToken() {
        const c = this.advance();

        switch (c) {
            case "(":
                this.addToken(TokenEnum.LEFT_PAREN)
                break;
            case ")":
                this.addToken(TokenEnum.RIGHT_PAREN)
                break;
            case "{":
                this.addToken(TokenEnum.LEFT_BRACE)
                break;
            case "}":
                this.addToken(TokenEnum.RIGHT_BRACE)
                break;
            case ",":
                this.addToken(TokenEnum.COMMA)
                break;
            case ".":
                this.addToken(TokenEnum.DOT)
                break;
            case "-":
                this.addToken(TokenEnum.MINUS)
                break;
            case "+":
                this.addToken(TokenEnum.PLUS)
                break;
            case ";":
                this.addToken(TokenEnum.SEMICOLON)
                break;
            case "*":
                this.addToken(TokenEnum.STAR)
                break;

            case "!":
                this.addToken(this.match("=") ? TokenEnum.BANG_EQUAL : TokenEnum.BANG);
                break;
            case "=":
                this.addToken(this.match("=") ? TokenEnum.EQUAL_EQUAL : TokenEnum.EQUAL);
                break;
            case "<":
                this.addToken(this.match("=") ? TokenEnum.LESS_EQUAL : TokenEnum.LESS);
                break;
            case ">":
                this.addToken(this.match("=") ? TokenEnum.GREATER_EQUAL : TokenEnum.GREATER);
                break;

            case "/":
                if (this.match("/")) {
                    // a comment goes until the end of line
                    while (this.peek() !== "\n" && !this.isAtEnd()) this.advance();
                } else {
                    this.addToken(TokenEnum.SLASH);
                }
                break;

            case '"':
                this.string();
                break;

            case " ":
            case "\r":
            case "\t":
                break;
            case "\n":
                this.line++;
                break;

            default:
                if (isDigit(c)) {
                    this.number();
                } else if (isAlpha(c)) {
                    this.identifier();
                }
                this.errorLogger(this.line, "Unexpected character.");
                break;
        }
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    private advance(): string {
        this.current++;
        return this.source.charAt(this.current - 1);
    }

    private match(expected: string) {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) !== expected) return false;

        this.current++;
        return true;
    }

    private peek(): string {
        if (this.isAtEnd()) return "\0";
        return this.source.charAt(this.current);
    }

    private peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';

        return this.source.charAt(this.current + 1);
    }

    private addToken(type: TokenEnum): void {
        this.createAndAddToken(type, null);
    }

    private createAndAddToken(type: TokenEnum, literal: any): void {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }

    private string(): void {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === "\n") this.line++;
            this.advance();
        }

        if (this.isAtEnd()) {
            this.errorLogger(this.line, "Unterminated string.");
            return;
        }

        this.advance();

        const value = this.source.substring(this.start + 1, this.current - 1);
        this.createAndAddToken(TokenEnum.STRING, value);
    }

    private number(): void {
        const advanceIfDigit = (): void => {
            while (isDigit(this.peek())) {
                this.advance();
            }
        }

        advanceIfDigit();

        if (this.peek() === '.' && isDigit(this.peekNext())) {
            this.advance();
            advanceIfDigit();
        }

        const numberToken = this.source.substring(this.start, this.current);
        this.createAndAddToken(TokenEnum.NUMBER, Number(numberToken));
    }

    private identifier(): void {
        while (isAlphaNumeric(this.peek())) this.advance();

        const text = this.source.substring(this.start, this.current);
        const tokenType = Keywords[text] || TokenEnum.IDENTIFIER;

        this.addToken(tokenType);
    }
}