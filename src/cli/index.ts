#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';

import arg from 'arg';
import { dim, red, bold, magenta, lightMagenta } from 'kolorist';

import pkgJson from '../../package.json' with { type: 'json' };
import { buildStaticMusea } from './build.ts';
import { devMusea } from './dev.ts';
import { previewStaticMusea } from './preview.ts';

type CliCommand = 'dev' | 'build' | 'preview' | 'help';

interface CliOptions {
  command: CliCommand;
  outDir?: string;
  host?: string;
  port?: number;
}

const prefix = bold(lightMagenta('[@viyuni/musea]'));

function parsePort(value: string) {
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid port: ${value}`);
  }
  return port;
}

function printHelp() {
  console.log(`
  ${bold(lightMagenta('MUSEA'))} ${dim(`v${pkgJson.version}`)}

  ${bold(magenta('Usage'))}
    $ musea ${lightMagenta('build')}   ${dim('[--outDir <dir>]')}
    $ musea ${lightMagenta('dev')}     ${dim('[--host <host>] [--port <port>]')}
    $ musea ${lightMagenta('preview')} ${dim('[--outDir <dir>] [--host <host>] [--port <port>]')}

  ${bold(magenta('Options'))}
    ${lightMagenta('--outDir, -o')}  Output directory ${dim('(default: .musea)')}
    ${lightMagenta('--host')}        Specify hostname
    ${lightMagenta('--port, -p')}    Specify port number
    ${lightMagenta('--help, -h')}    Show this help message

  ${dim('Ready to serve. (⌐■_■)')}
`);
}

function parseArgs(argv: string[]): CliOptions {
  try {
    const parsed = arg(
      {
        '--help': Boolean,
        '--outDir': String,
        '--host': String,
        '--port': parsePort,
        '-h': '--help',
        '-o': '--outDir',
        '-p': '--port',
      },
      { argv },
    );

    if (parsed._.length === 0 || parsed._[0] === 'help' || parsed['--help']) {
      return { command: 'help' };
    }

    const command = parsed._[0] as CliCommand;
    const allowed: CliCommand[] = ['build', 'dev', 'preview'];

    if (!allowed.includes(command)) {
      throw new Error(`Unknown command "${command}" (⊙_⊙?)`);
    }

    if (parsed._.length > 1) {
      throw new Error(`Unexpected argument "${parsed._[1]}" ╮(￣ω￣;)╭`);
    }

    return {
      command,
      outDir: parsed['--outDir'],
      host: parsed['--host'],
      port: parsed['--port'],
    };
  } catch (err: any) {
    throw new Error(err.message);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.command === 'help') {
    printHelp();
    return;
  }

  console.log(`\n${prefix} ${dim(`v${pkgJson.version}`)}`);

  switch (options.command) {
    case 'build': {
      console.log(`${prefix} ${dim('building assets...')}\n`);

      const { outDir } = await buildStaticMusea(options);
      const relativePath = path.relative(process.cwd(), outDir);

      console.log(
        `\n${prefix} ${lightMagenta('success')} ${dim('build saved to')} ${lightMagenta(relativePath)} (✿◠‿◠)\n`,
      );
      break;
    }

    case 'dev': {
      console.log(`${prefix} ${bold('dev')} ${dim('starting server...')}\n`);

      const server = await devMusea(options);

      server.printUrls();
      break;
    }

    case 'preview': {
      console.log(`${prefix} ${bold('preview')} ${dim('starting server...')}`);

      const server = await previewStaticMusea(options);

      server.printUrls();
      console.log(`\n${dim('local preview running...')}\n`);
      break;
    }
  }
}

main().catch((error: unknown) => {
  const errorPrefix = bold(red('[error]'));
  const msg = error instanceof Error ? error.message : String(error);

  console.error(`\n${errorPrefix} ${dim(msg)}`);

  if (error instanceof Error && error.stack) {
    console.error(dim(error.stack.split('\n').slice(1).join('\n')));
  }

  console.log(`\n${magenta('Process terminated.')} ${dim('(╯°□°)╯︵ ┻━┻')}\n`);
  process.exit(1);
});
