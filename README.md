# Introduction

Lightweight template parser using typescript This parser was originally created to transform
terraform files for different deployment environments, but it is well-suited to any build task which
needs a lightweight template parser with minimal dependencies.

# Installation

`yarn add -D text-template-parser` or `npm i --save-dev text-template-parser`

# Syntax

The template syntax is similar to handlebars. There are 4 block types: `assign`, `force-assign`,
`if`, and `else`. Blocks are declared using the following syntax:

```bash
### {{assign}}
### x = 4
### y = foo
### z = true
### {{/assign}}
```

All blocks must be terminated with a close tag (`{{/tag}}`), similar to HTML/XML.

# # {{if}}

The `{{if}}` block evaluates a conditional javascript expression, with the scope being the config
passed to the parser and the variables assigned in previous `{{assign}}` blocks, and writes the text
within the block to the output if the conditional evaluates to `true`. Example:

```bash
    ### {{assign}}
    ### foo = bar
    ### {{/assign}}
    ### {{if foo === "bar"}}
    ### echo "foo === bar"
    ### {{/if}}
    ### {{else}}
    ### echo "foo !== bar"
    ### {{/else}}
```

The output of this transform will be

```bash
    echo "foo === bar"
```

# # {{else}}

The `{{else}}` block inverts the conditional of the preceding `{{if}}` block and writes the text
within the block only if the conditional of the preceding `{{if}}` block evaluates to `false`.

# # {{assign}}

The `{{assign}}` block adds the variable assignments contained within to the current scope, without
overwriting the scope passed to the parser. Numeric values are automatically parsed as numbers,
"true" and "false" are parsed as booleans, and all other values are parsed as strings.

# # {{force-assign}}

the `{{force-assign}}` block behaves the same as the `{{assign}}` block, except assignments within
this block overwrite the config passed to the parser.

# Usage

The parser can be consumed from typescript/javascript or from the cli.

# # TS/JS usage

For ts/js usage:

```ts
import { TemplateParser } from "text-template-parser";

const testTemplate = `
    #!/bin/bash
    ### {{assign}}
    ### foo = bar
    ### {{/assign}}
    ### {{assign}}
    ### y = baz
    ### {{/assign}}
    ### {{if foo === "bar"}}
    ### echo "foo === bar"
    ### {{/if}}
    ### {{else}}
    ### echo "foo !== bar"
    ### {{/else}}
    echo "done"
    ### {{if x >= 0}}
    ### exit 0
    ### {{/if}}
    ### {{else}}
    ### exit 1
    ### {{/else}}
`;

const config = {
  x: 2,
  y: "foo",
};

const parser = new TemplateParser(testTemplate, config);
console.log(parser.parseTemplate());
```

This will log the following:

```
#!/bin/bash
echo "foo === bar"
echo "done"
exit 0
```

# # cli usage

If the text contained in `testTemplate` from the previous example is in a file called
`testfile.txt`, you can achieve the same result with
`yarn template-parser-cli testfile.txt -o testout.txt -v x=2 y=foo` Additional documentation can be
found by running `yarn template-parser-cli -h`
