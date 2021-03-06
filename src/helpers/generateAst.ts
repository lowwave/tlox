import { writeFileSync } from "fs";

function generateAst(args: any) {
  const [, , out] = args;

  if (!out) {
    console.error("An argument for output directory was not provided");
  }

  defineAst(
    out,
    "Expr",
    {
      Binary: ["left: Expr", "operator: Token", "right: Expr"],
      Grouping: ["expression: Expr"],
      Literal: ["value: any"],
      Unary: ["operator: Token", "right: Expr"]
    },
    ["Token"]
  );

  defineAst(
    out,
    "Stmt",
    {
      Expression: ["expr: Expr"],
      Print: ["expr: Expr"],
    },
    ["Expr"]
  );
}

function defineAst(outputDir: string, baseName: string, types: { [key: string]: string[] }, deps?: string[]) {
  const path = `${outputDir}/${baseName}.ts`;
  const typeNames = Object.keys(types);

  const data = ` --- GENERATED FILE ---
  ${deps && defineImports(deps)}
  
  export abstract class ${baseName} {
    abstract accept<T>(visitor: Visitor<T>): T;
  }

  export default ${baseName};

  ${defineVisitorInterface(baseName, typeNames)}

  ${typeNames.map(type => defineType(baseName, type, types[type])).join("\n")}`;

  writeFileSync(path, data);
}

function defineVisitorInterface(baseName: string, types: string[]): string {
  return `export interface Visitor<R> {
    ${types.map(type => ` visit${type}${baseName}(${type.toLowerCase()}: ${type}): R;`).join("\n")}
  }`;
}

function defineImports(imports: string[]): string {
  return imports.map(i => `import { ${i} } from "./${i}";`).join("\n");
}

function defineType(baseName: string, type: string, fields: string[]): string {
  function fieldName(field: string): string {
    return field.substr(0, field.indexOf(":"));
  }

  return `export class ${type} extends ${baseName} {
    ${fields.map(field => ` readonly ${field};`).join("\n")}

    constructor(${fields.join(", ")}) {
      super();

      ${fields.map(field => ` this.${fieldName(field)} = ${fieldName(field)};`).join("\n")}
    }

    public accept<R>(visitor: Visitor<R>): R {
      return visitor.visit${type}${baseName}(this);
    }
  }`
}

generateAst(process.argv);