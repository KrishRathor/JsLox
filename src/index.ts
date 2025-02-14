import { Scanner } from "./scanner";

export class Lox {
  constructor() {
  }

  error(line: number, message: string) {
    console.error(`[Line ${line}] Error: ${message}`);
  }
}

const main = () => {

  const source = '(){} != == === "hello, world" 34 == 74.54'
  const scanner = new Scanner(source);

  const tokens = scanner.scanTokens();
  tokens.map(token => console.log(token.toString()))
}

main();
