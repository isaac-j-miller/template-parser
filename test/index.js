const {TemplateParser} = require("text-template-parser");

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