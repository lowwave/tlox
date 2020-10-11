import { RuntimeError } from './RuntimeError';
import { Scanner } from './Scanner';
import { Token } from './Token';
import { TokenEnum } from './types';

type PartialConsole = {
  error(message?: any, ...optionalParams: any[]): void;
  log(message?: any, ...optionalParams: any[]): void;
};

export class Lox {
  private logger: PartialConsole;

  private hadError = false;
  private hadRuntimeError = false;

  private stdout = (m: string) => this.logger.log(m);
  private runtimeError = (error: RuntimeError) => {
    if (error.token) this.logger.error(`${error.message}\n[line ${error!.token!.line}]`);
    this.hadRuntimeError = true;
  }

  constructor(logger: PartialConsole = console) {
    this.logger = logger;
  }

  public run(source: string): boolean {
    try {
      const scanner = new Scanner(source, this.error);
      const tokens = scanner.scanTokens();

      const errors = this.hadError || this.hadRuntimeError;
      if (errors) return false;

      return true;
    } catch(err) {
      console.log(err);
      return false;
    }
  }

  private error(line: number | Token, message: string) {
    if (typeof line === "number") this.report(line, "", message);
    else if (Object.keys(line).includes("type")) {
      this.report(
        line.line,
        line.type === TokenEnum.EOF ? " at end" : `at '${line.lexeme}'`,
        message
      );
    }
  }

  private report(line: number, where: string, message: string) {
    this.logger.error(`[line: ${line}]: Error ${where}: ${message}`);
    this.hadError = true;
  }
}
