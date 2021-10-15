import rewire from "rewire"
import { TemplateParser } from "./template-parser"

const template_parser = rewire("./template-parser")
const isDirective = template_parser.__get__("isDirective")
const executeWithVars = template_parser.__get__("executeWithVars")
const parseAssignLine = template_parser.__get__("parseAssignLine")
const template = `### {{assign}}
### x = foo
### y = 0
### z = true
### xx = -2
### isLocalstack = false
### {{/assign}}
### {{force-assign}}
### bar = blah
### {{/force-assign}}
resource "aws_security_group_rule" "ae_egress_kafka_service" {
    ### {{if isLocalstack}}
    ### security_group_id = module.ae-listener.service_sg_id
    ### {{/if}}
    ### {{else}}
    security_group_id = other_thing
    ### {{/else}}
    ### {{if y===0}}
    type              = "egress"
    ### {{/if}}
    ### {{if x==="bar"}}
    protocol          = "tcp"
    ### {{/if}}
    ### {{if bar === "blah"}}
    from_port         = 9092
    ### {{/if}}
    to_port           = 9092
    cidr_blocks       = ["0.0.0.0/0"]
    ipv6_cidr_blocks  = ["::/0"]
  }`
const templateInvalid1 = `### {{if true}}
### bar = blah
resource "aws_security_group_rule" "ae_egress_kafka_service" {
    ### {{if isLocalstack}}
    ### security_group_id = module.ae-listener.service_sg_id
    ### {{/if}}
  }`
const templateInvalid2 = `resource "aws_security_group_rule" "ae_egress_kafka_service" {
      ### {{else}}
      ### security_group_id = module.ae-listener.service_sg_id
      ### {{/else}}
    }`
const transformedPlain = `resource "aws_security_group_rule" "ae_egress_kafka_service" {
    security_group_id = other_thing
    type              = "egress"
    from_port         = 9092
    to_port           = 9092
    cidr_blocks       = ["0.0.0.0/0"]
    ipv6_cidr_blocks  = ["::/0"]
  }`
const transformedLocalstackY = `resource "aws_security_group_rule" "ae_egress_kafka_service" {
    security_group_id = module.ae-listener.service_sg_id
    from_port         = 9092
    to_port           = 9092
    cidr_blocks       = ["0.0.0.0/0"]
    ipv6_cidr_blocks  = ["::/0"]
  }`
describe("works", () => {
  it("without config", () => {
    const parser = new TemplateParser(template);
    const parsed = parser.parseTemplate();
    expect(parsed).toEqual(transformedPlain);
    expect(parser.config).toEqual({
      x: "foo",
      y: 0,
      z: true,
      xx: -2,
      isLocalstack: false,
      bar: "blah",
    });
  });
  it("with config", () => {
    const parser = new TemplateParser(template, {
      y: 1,
      isLocalstack: true,
      bar: "asdlfkj",
    });
    const parsed = parser.parseTemplate();
    expect(parsed).toEqual(transformedLocalstackY);
    expect(parser.config).toEqual({
      x: "foo",
      y: 1,
      z: true,
      xx: -2,
      isLocalstack: true,
      bar: "blah",
    });
  });
  it("invalid missing end tag", () => {
    const parser = new TemplateParser(templateInvalid1);
    expect(() => parser.parseTemplate()).toThrow("Line 3: Missing end tag for {{if}} (line 0)");
  });
  it("invalid else missing if", () => {
    const parser = new TemplateParser(templateInvalid2);
    expect(() => parser.parseTemplate()).toThrow("Line 1: {{else}} with no previous {{if}} tag");
  });
});

// @ponicode
describe("isDirective", () => {
    test("0", () => {
        let callFunction: any = () => {
            isDirective("ponicode.com")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            isDirective("email@Google.com")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            isDirective("something.example.com")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            isDirective("user@host:300")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            isDirective("TestUpperCase@Example.com")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction: any = () => {
            isDirective("")
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("executeWithVars", () => {
    test("0", () => {
        let callFunction: any = () => {
            executeWithVars("/path/to/file", {})
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            executeWithVars(".", {})
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            executeWithVars("C:\\\\path\\to\\file.ext", {})
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            executeWithVars("C:\\\\path\\to\\folder\\", {})
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            executeWithVars("path/to/file.ext", {})
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction: any = () => {
            executeWithVars("", {})
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("parseAssignLine", () => {
    test("0", () => {
        let callFunction: any = () => {
            parseAssignLine("George###George")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            parseAssignLine("###")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            parseAssignLine("Anas######Michael=George###George")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            parseAssignLine("=")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            parseAssignLine("Michael###==###Edmond")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction: any = () => {
            parseAssignLine("")
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("assignToConfig", () => {
    let inst: any

    beforeEach(() => {
        inst = new template_parser.TemplateParser("", undefined)
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.assignToConfig({})
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("forceAssignToConfig", () => {
    let inst: any

    beforeEach(() => {
        inst = new template_parser.TemplateParser("", undefined)
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.forceAssignToConfig({})
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("parseTemplate", () => {
    let inst: any

    beforeEach(() => {
        inst = new template_parser.TemplateParser("", undefined)
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.parseTemplate()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("template_parser.transformTemplateFile", () => {
    test("0", async () => {
        await template_parser.transformTemplateFile("", undefined)
    })
})
