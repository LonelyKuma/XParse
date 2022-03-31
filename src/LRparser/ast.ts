export class ASTNode {
  type: string;
  value: any;
  children: ASTNode[] = [];

  constructor(type: string) {
    this.type = type;
  }
}
