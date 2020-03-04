import { ParserConfig, Production } from './type';
import { LRDFA } from './LRdfa';

export class LRParser {
  dfa: LRDFA;

  readonly action: Map<string, Production | number | string>[];
  readonly goto: Map<string, number>[];

  constructor(config: ParserConfig) {
    this.dfa = new LRDFA(config);
    this.action = this.dfa.Action;
    this.goto = this.dfa.Goto;
  }
}
