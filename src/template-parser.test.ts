import { TemplateParser } from "./template-parser";

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
  }`;
const templateInvalid1 = `### {{if true}}
### bar = blah
resource "aws_security_group_rule" "ae_egress_kafka_service" {
    ### {{if isLocalstack}}
    ### security_group_id = module.ae-listener.service_sg_id
    ### {{/if}}
  }`;
const templateInvalid2 = `resource "aws_security_group_rule" "ae_egress_kafka_service" {
      ### {{else}}
      ### security_group_id = module.ae-listener.service_sg_id
      ### {{/else}}
    }`;
const transformedPlain = `resource "aws_security_group_rule" "ae_egress_kafka_service" {
    security_group_id = other_thing
    type              = "egress"
    from_port         = 9092
    to_port           = 9092
    cidr_blocks       = ["0.0.0.0/0"]
    ipv6_cidr_blocks  = ["::/0"]
  }`;
const transformedLocalstackY = `resource "aws_security_group_rule" "ae_egress_kafka_service" {
    security_group_id = module.ae-listener.service_sg_id
    from_port         = 9092
    to_port           = 9092
    cidr_blocks       = ["0.0.0.0/0"]
    ipv6_cidr_blocks  = ["::/0"]
  }`;
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
