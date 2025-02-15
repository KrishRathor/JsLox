import { AstPrinter } from "./expression";
import { Parser } from "./parser";
import { Scanner } from "./scanner";

export class Lox {
  constructor() {
  }

  error(line: number, message: string) {
    console.error(`[Line ${line}] Error: ${message}`);
  }
}

const main = () => {

  const source = '3 + 4 * (2 - 1)'
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();

  const parser = new Parser(tokens);
  const expressions = parser.parse();
  console.log("=== Parser === \n ");

  if (expressions == null) {
    console.error("Null");
    return;
  }

  const printer = new AstPrinter();
  const result = printer.print(expressions);
  console.log(result);
}

main();
