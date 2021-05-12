import fs from "./fs";
import { assertIsDefined, assertNever } from "./helpers";
type ObjectMap<T> = {
  [key: string]: T;
};
const directives = ["if", "else", "assign", "force-assign"] as const;
type Directive = typeof directives[number];
type ParserState = "none" | Directive;
export type ParserConfig = ObjectMap<string | number | boolean>;

type ParserStateWithLine = {
  state: ParserState;
  line?: number;
};
const defaultState: ParserStateWithLine = {
  state: "none",
};
const isDirective = (s: string): s is Directive => {
  return directives.includes(s as unknown as Directive);
};

function executeWithVars<T>(toExecute: string, variables: ParserConfig): T {
  const assignments = Object.entries(variables).map(
    ([k, v]) => `const ${k} = ${typeof v === "string" ? `"${v}"` : v};`
  );
  const actualExec = (assignments.join("\n") + "\n" + toExecute).trim();
  const v = eval(actualExec);
  return v;
}

function parseAssignLine(line: string): ParserConfig {
  const [key, value] = line
    .replace("###", "")
    .split("=")
    .map(s => s.trim());
  assertIsDefined(key);
  assertIsDefined(value);
  if (!Number.isNaN(Number(value))) {
    return { [key]: Number(value) };
  }
  if (["true", "false"].includes(value)) {
    return { [key]: value === "true" ? true : false };
  }
  return { [key]: value };
}

const directiveRegex =
  /{{(?:[\s]*)(if|unless|else|assign|force-assign)(?:[\s]*)([a-z|A-Z|0-9|\s|+|=|-|?|'|"|`|{|}|\[|\]|\(|\)|&|/|\$|:|;|<|>|.|,|_|!|@|#|%|\^|\||\\|~|\*]*)(?:[\s]*)}}/g;
const endDirectiveRegex = /{{(?:[\s]*)\/(if|unless|else|assign|force-assign)(?:[\s]*)}}/g;

export class TemplateParser {
  private lines: string[];
  private state: ParserStateWithLine;
  private prevState: ParserStateWithLine;
  private currentCondition?: boolean;
  config: ParserConfig;
  constructor(private text: string, config?: ParserConfig) {
    this.lines = this.text.split("\n");
    this.state = { ...defaultState };
    this.prevState = { ...defaultState };
    this.config = config ?? {};
  }
  private assignToConfig(newVars: ParserConfig) {
    // config passed to parser should override that in script
    this.config = { ...newVars, ...this.config };
  }
  private forceAssignToConfig(newVars: ParserConfig) {
    this.config = { ...this.config, ...newVars };
  }
  parseTemplate(): string {
    const lines: string[] = [];
    this.lines.forEach((line, i) => {
      const matchDirective = directiveRegex.exec(line);
      if (matchDirective !== null) {
        const directive = matchDirective[1];
        if (isDirective(directive)) {
          if (this.state.state !== "none") {
            throw new Error(
              `Line ${i}: Missing end tag for {{${this.state.state}}} (line ${this.state.line})`
            );
          }
          this.state = { state: directive, line: i };
          if (directive === "if") {
            try {
              this.currentCondition = executeWithVars(matchDirective[2], this.config);
            } catch (e) {
              throw new Error(`Line ${i}: Error parsing conditional: ${e}`);
            }
          }
          if (directive === "else") {
            if (this.prevState.state !== "if") {
              throw new Error(`Line ${i}: {{else}} with no previous {{if}} tag`);
            }
            assertIsDefined(this.currentCondition);
            this.currentCondition = !this.currentCondition;
          }
        }
      }
      const matchEndDirective = endDirectiveRegex.exec(line);
      if (matchEndDirective !== null) {
        const directive = matchEndDirective[1];
        if (isDirective(directive)) {
          if (this.state.state !== directive) {
            throw new Error(
              `Line ${i}: Tag mismatch: End tag is {{${directive}}} while current tag is {{${this.state.state}}} (line ${this.state.line})`
            );
          }
          this.prevState = this.state;
          this.state = { ...defaultState };
        }
      }
      if (matchDirective === null && matchEndDirective === null) {
        try {
          switch (this.state.state) {
            case "if":
              assertIsDefined(this.currentCondition);
              if (this.currentCondition) {
                lines.push(line.replace("### ", ""));
              }
              break;
            case "else":
              assertIsDefined(this.currentCondition);
              if (this.currentCondition) {
                lines.push(line.replace("### ", ""));
              }
              break;
            case "assign":
              this.assignToConfig(parseAssignLine(line));
              break;
            case "force-assign":
              this.forceAssignToConfig(parseAssignLine(line));
              break;
            case "none":
              lines.push(line);
              break;
            default:
              assertNever(this.state.state);
          }
        } catch (e) {
          throw new Error(`Line ${i}: Parsing error: ${e}`);
        }
      }
    });
    return lines.join("\n");
  }
}

export type TransformConfig = {
  to?: string;
  config?: ParserConfig;
};

export async function transformTemplateFile(
  fname: string,
  config?: TransformConfig
): Promise<void> {
  const str = await fs.readFile(fname, { encoding: "utf8" });
  const parser = new TemplateParser(str, config?.config);
  const parsed = parser.parseTemplate();
  await fs.writeFile(config?.to ?? fname, parsed);
}
