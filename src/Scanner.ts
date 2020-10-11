import { Token } from './Token';
import { LogError, TokenEnum } from './types';

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
        while(!this.isAtEnd()) {
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

            case " ":
            case "\r":
            case "\t":
                break;
            case "\n":
                this.line++;
                break;
            
            default:
                this.errorLogger(this.line, "Unexpected character.");
                break;
        }
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

    private advance(): string {
        this.current++;
        return this.source.charAt(this.current - 1);
    }

    private addToken(type: TokenEnum): void {
        this.createAndAddToken(type, null);
    }

    private createAndAddToken(type: TokenEnum, literal: any): void {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));    
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

}