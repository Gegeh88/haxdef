const { spawn } = require('child_process');

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 300000; // 5 min default
    let stdout = '';
    let stderr = '';

    const proc = spawn(command, args, {
      timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB
      ...options,
    });

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    proc.on('error', (err) => {
      reject(err);
    });

    // Kill if timeout
    setTimeout(() => {
      try { proc.kill('SIGTERM'); } catch {}
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);
  });
}

module.exports = { runCommand };
