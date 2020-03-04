#!/usr/bin/env node

import path from 'path';
import { readFileSync } from 'fs';
import { cac } from 'cac';

import { LRParser } from './LRparser';

const cli = cac('XParse');

cli.help();

cli
  .command('build', 'Build LR Parser')
  .option('--config <config>', 'Config file path', { default: 'xparse.config' })
  .action(async (option: { config: string }) => {
    const config = await import(path.resolve(process.cwd(), option.config));
    new LRParser(config);
  });

cli
  .command('', 'Run LR Parser')
  .option('--config <config>', 'Config file path', { default: 'xparse.config' })
  .action(async (option: { config: string }) => {
    const config = await import(path.resolve(process.cwd(), option.config));
    const parser = new LRParser(config);

    const text: string[] = [];
    process.stdin.on('data', data => {
      text.push(String(data));
    });
    process.stdin.on('end', () => {
      try {
        const result = parser.parse(JSON.parse(text.join('')));
        console.log(result);
      } catch (err) {
        console.log(err);
        process.exit(1);
      }
    });
  });

cli.version(
  JSON.parse(readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'))
    .version
);

cli.parse();
