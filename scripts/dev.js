const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[32m%s\x1b[0m', '=======================================================');
console.log('\x1b[32m%s\x1b[0m', ' 🚀 Starting RoadLife AI (Express Backend + Vite Web) ');
console.log('\x1b[32m%s\x1b[0m', '=======================================================');

function runService(name, cwd, script, color) {
  const child = spawn(npmCmd, ['run', script], {
    cwd: path.resolve(root, cwd),
    stdio: 'pipe',
    shell: true
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log(`${color}[${name}]\x1b[0m ${line}`);
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.error(`${color}[${name} ERR]\x1b[0m ${line}`);
    });
  });

  child.on('close', (code) => {
    console.log(`${color}[${name}]\x1b[0m exited with code ${code}`);
  });

  return child;
}

const backend = runService('Backend ', path.join('backend', 'express-api'), 'dev', '\x1b[36m');
const frontend = runService('Frontend', 'frontend', 'dev', '\x1b[35m');

function cleanup() {
  console.log('\nShutting down services...');
  try {
    if (isWindows) {
      if (backend.pid) spawn('taskkill', ['/pid', backend.pid, '/f', '/t']);
      if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid, '/f', '/t']);
    } else {
      backend.kill();
      frontend.kill();
    }
  } catch (e) {
    // ignore
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
