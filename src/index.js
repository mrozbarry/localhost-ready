#!/usr/bin/env node

const process = require('process');
const net = require('net');
const childProcess = require('child_process');
const version = require('../package.json').version;
const merge = (a, b) => Object.assign({}, a, b);
const isFlag = arg => arg.startsWith('--');

const parseArgs = (argv, defaults) => {
  return argv.reduce((memo, arg) => {
    if (memo.key === null && !isFlag(arg)) return memo;
    if (memo.key !== null && !isFlag(arg)) {
      return {
        key: null,
        args: merge(memo.args, { [memo.key]: arg }),
      };
    }

    const key = arg.replace(/^--/, '');
    return { key: key, args: merge(memo.args, { [key]: true }) };
  }, { args: defaults, key: null }).args;
}

const args = parseArgs(process.argv, { timeout: 60000, port: 8080, help: false });

if (args.help) {
  console.log(`localhost-ready
version ${version}

Try and connect to a localhost tcp server within timeout milliseconds. Return status 0 (success) or 1 (failed).

arguments

  flag                      default  summary

  --timeout [milliseconds]  60000    how long to wait for the server
  --port [port]             8080     which tcp port to try and connect to
  --help                             this screen (returns non-zero to prevent chaining)

example

localhost-ready --port 1234 && yarn doThing
`);
  process.exit(1);
}

const localhostReady = ({ timeout, port }) => new Promise((resolve, reject) => {
  const ms = parseInt(timeout, 10)
  const tcpPort = parseInt(port, 10);
  console.log(`[localhost-ready] Connecting to localhost:${tcpPort}, retry ${ms > 0 ? `for ${ms} millisecond(s)` : 'indefinitely'}`);
  let tryAgainHandle = null;
  let socket = null;

  const cleanup = (fn) => {
    [timeoutHandle, tryAgainHandle].forEach(clearTimeout);
    if (socket) socket.end();
    fn();
  };

  const timeoutHandle = ms <= 0 ? null : setTimeout(() => cleanup(() => reject('Timed out')), ms);
  const retryDelay = ms <= 0 ? 250 : 1;

  const tryConnect = () => {
    socket = new net.Socket();

    socket.on('error', () => {
      socket.end(() => {
        tryAgainHandle = setTimeout(tryConnect, retryDelay);
      });
    });

    socket.connect(tcpPort, 'localhost', () => cleanup(resolve));
  }

  tryConnect();
});

localhostReady(args)
  .then(() => 0)
  .catch((e) => {
    console.log(`[localhost-ready] Failed (${e.toString()})`);
    return 1;
  })
  .then(process.exit);
