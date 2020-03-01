import { ParserConfig } from './type';
import { LRDFA } from './LRdfa';

export class LRParser {
  dfa: LRDFA;

  constructor(config: ParserConfig) {
    this.dfa = new LRDFA(config);
  }
}
