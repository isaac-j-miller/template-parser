#!/usr/bin/env node

import { ArgumentParser } from "argparse";
import fs from "./fs";
import { ParserConfig, TemplateParser } from "./template-parser";

const parser = new ArgumentParser({
  description: "CLI template parser",
});

parser.add_argument("file", {
  help: "filepath of file to parse",
});
parser.add_argument("-o", "--outfile", {
  nargs: "?",
  dest: "outfile",
  help: "filepath of file to write output to. If not specified, the input file will be overwritten",
});
parser.add_argument("-c", "--config", {
  nargs: "?",
  dest: "configJsonPath",
  help: "path to JSON configuration file containing variable declarations",
});
parser.add_argument("-j", "--config-json", {
  nargs: "?",
  dest: "configJsonInline",
  help: "JSON string containing variable declarations",
});
parser.add_argument("-v", "--var", {
  nargs: "*",
  dest: "vars",
  help: 'variable declarations to add to scope, as a space-separated list in the same format as if individual lines of {{assign}} block. Use "%20" to for spaces. i.e. --var x=foo y=true z=235 w=space%20var',
});

type CliConfig = {
  file: string;
  outfile?: string;
  configJsonPath?: string;
  configJsonInline?: string;
  vars?: string[];
};

const config: CliConfig = parser.parse_args();

const main = async (c: CliConfig): Promise<void> => {
  const { file, outfile, configJsonPath, configJsonInline, vars } = c;
  const cliAssigns =
    vars && vars.length > 0
      ? `{{force-assign}}\n${vars.join("\n").replace(/%20/g, " ")}\n{{/force-assign}}\n`
      : "";
  const fileContents = await fs.readFile(file, { encoding: "utf8" });
  const actualContents = cliAssigns + fileContents;
  let config: ParserConfig = {};
  if (configJsonPath) {
    try {
      const json = await fs.readFile(configJsonPath, { encoding: "utf8" });
      config = { ...config, ...JSON.parse(json) };
    } catch (e) {
      throw new Error(`Error parsing JSON config file: ${e}`);
    }
  }
  if (configJsonInline) {
    try {
      config = { ...config, ...JSON.parse(configJsonInline) };
    } catch (e) {
      throw new Error(`Error parsing inline JSON config: ${e}`);
    }
  }
  const parser = new TemplateParser(actualContents, config);
  const parsed = parser.parseTemplate();
  const outputFile = outfile ?? file;
  await fs.writeFile(outputFile, parsed, { encoding: "utf8" });
};

main(config)
  .then(() => {
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
