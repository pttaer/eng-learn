const { spawn } = require('child_process');

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true });
    p.on('close', code => (code === 0 ? resolve(0) : reject(new Error(`${cmd} exited with code ${code}`))));
  });
}

async function build() {
  try {
    await run('tsc', []);
    await run('vite', ['build']);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

build();

