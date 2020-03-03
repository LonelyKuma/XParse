export const Epsilon = '__Epsilon__';

export const Dollar = '__Dollar__';

export const START = '__START__';

export interface ParserHooks {}

export interface ProductionRightRule {
  rule: string[];
  reduce?: (...args: any) => any;
}

export interface ProductionRule {
  left: string;
  right: ProductionRightRule[];
}

export interface ParserConfig {
  hooks?: ParserHooks;
  start: string;
  tokens: string[];
  types: string[];
  productions: ProductionRule[];
}

export interface Production {
  left: string;
  right: string[];
  reduce?: (...args: any) => any;
}
