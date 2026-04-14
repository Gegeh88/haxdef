const { spawn } = require('child_process');

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 300000; // 5 min default
    let stdout = '';
    let stderr = '';
    let killed = false;
    let resolved = false;

    const proc = spawn(command, args, {
      env: { ...process.env, ...options.env },
    });

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        resolve({ code, stdout, stderr });
      }
    });

    proc.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    // Kill if timeout
    const timer = setTimeout(() => {
      if (!resolved) {
        killed = true;
        try { proc.kill('SIGTERM'); } catch {}
        setTimeout(() => {
          try { proc.kill('SIGKILL'); } catch {}
        }, 5000);
        resolved = true;
        reject(new Error(`Command timed out after ${timeout}ms`));
      }
    }, timeout);

    // Clean up timer when process ends
    proc.on('close', () => clearTimeout(timer));
  });
}

module.exports = { runCommand };
