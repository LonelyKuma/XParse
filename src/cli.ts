#!/usr/bin/env node

import path from 'path';
import { readFileSync } from 'fs';
import { cac } from 'cac';

import { LRParser } from './LRparser';

const cli = cac('XParse');

cli.help();

cli
  .command('build')
  .option('--config <config>', 'Config file path', { default: 'xparse.config' })
  .action(async (option: { config: string }) => {
    const config = await import(path.resolve(process.cwd(), option.config));
    new LRParser(config);
  });

cli.version(
  JSON.parse(readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'))
    .version
);

cli.parse();
