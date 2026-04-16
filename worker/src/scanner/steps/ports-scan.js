const net = require('net');
const { runCommand } = require('../../lib/process-runner');
const { parseDomain } = require('../../lib/parse-domain');

const COMMON_PORTS = [
  { port: 21, service: 'FTP' },
  { port: 22, service: 'SSH' },
  { port: 23, service: 'Telnet' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 80, service: 'HTTP' },
  { port: 110, service: 'POP3' },
  { port: 143, service: 'IMAP' },
  { port: 443, service: 'HTTPS' },
  { port: 445, service: 'SMB' },
  { port: 993, service: 'IMAPS' },
  { port: 995, service: 'POP3S' },
  { port: 3306, service: 'MySQL' },
  { port: 3389, service: 'RDP' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 5900, service: 'VNC' },
  { port: 6379, service: 'Redis' },
  { port: 8080, service: 'HTTP-Alt' },
  { port: 8443, service: 'HTTPS-Alt' },
  { port: 27017, service: 'MongoDB' },
];

const RISKY_PORTS = new Set([21, 22, 23, 25, 445, 3306, 3389, 5432, 5900, 6379, 27017]);

async function scanPorts(domain) {
  const findings = [];
  let openPorts;

  // Strip port suffix if present and add it to the scan list
  const { hostname, port: customPort } = parseDomain(domain);
  const portsToScan = customPort && !COMMON_PORTS.find(p => p.port === customPort)
    ? [...COMMON_PORTS, { port: customPort, service: 'Custom' }]
    : COMMON_PORTS;

  try {
    // Try nmap first
    openPorts = await scanWithNmap(hostname, portsToScan);
  } catch {
    // Fallback to TCP connect scan
    openPorts = await scanWithTCP(hostname, portsToScan);
  }

  if (openPorts.length === 0) {
    findings.push({
      type: 'ports-filtered',
      title: 'No open ports detected',
      severity: 'info',
      description: 'No common ports appear to be open. The server may be behind a firewall.',
      url: domain,
    });
    return findings;
  }

  for (const { port, service } of openPorts) {
    const isRisky = RISKY_PORTS.has(port);

    findings.push({
      type: 'open-port',
      title: `Port ${port} (${service}) is open`,
      severity: isRisky ? 'medium' : 'info',
      description: isRisky
        ? `Port ${port} (${service}) is open and potentially risky if exposed to the internet.`
        : `Port ${port} (${service}) is open.`,
      remediation: isRisky
        ? `Consider restricting access to port ${port} using firewall rules. Only expose this port if absolutely necessary.`
        : undefined,
      evidence: `TCP port ${port} responded to connection`,
      url: domain,
    });
  }

  return findings;
}

async function scanWithNmap(hostname, portsList) {
  const ports = portsList.map(p => p.port).join(',');
  const { stdout, code } = await runCommand('nmap', [
    '-Pn', '-sT', '--open',
    '-p', ports,
    '--host-timeout', '30s',
    hostname,
  ], { timeout: 60000 });

  if (code !== 0) throw new Error('nmap failed');

  const openPorts = [];
  const lines = stdout.split('\n');
  for (const line of lines) {
    const match = line.match(/^(\d+)\/tcp\s+open\s+(\S+)/);
    if (match) {
      const port = parseInt(match[1]);
      const knownService = portsList.find(p => p.port === port);
      openPorts.push({
        port,
        service: knownService?.service || match[2],
      });
    }
  }
  return openPorts;
}

async function scanWithTCP(hostname, portsList) {
  const openPorts = [];
  const promises = portsList.map(({ port, service }) =>
    checkPort(hostname, port).then(open => {
      if (open) openPorts.push({ port, service });
    })
  );
  await Promise.all(promises);
  return openPorts.sort((a, b) => a.port - b.port);
}

function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

module.exports = { scanPorts };
