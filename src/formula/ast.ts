export type Ast =
  | { kind: "Call"; name: string; args: Ast[] }
  | { kind: "Binary"; op: string; left: Ast; right: Ast }
  | { kind: "Unary"; op: string; expr: Ast }
  | { kind: "Paren"; inner: Ast }
  | { kind: "Num"; text: string }
  | { kind: "Str"; text: string }
  | { kind: "Ref"; text: string }
  | { kind: "Raw"; text: string };
