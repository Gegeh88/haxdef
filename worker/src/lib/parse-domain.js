/**
 * Parse a domain string that may include a custom port.
 * Examples:
 *   "example.com" → { hostname: "example.com", port: null }
 *   "example.com:8080" → { hostname: "example.com", port: 8080 }
 */
function parseDomain(domainStr) {
  const colonIdx = domainStr.lastIndexOf(':');
  if (colonIdx > 0) {
    const portPart = domainStr.slice(colonIdx + 1);
    const port = parseInt(portPart, 10);
    if (!isNaN(port) && port > 0 && port < 65536 && /^\d+$/.test(portPart)) {
      return { hostname: domainStr.slice(0, colonIdx), port };
    }
  }
  return { hostname: domainStr, port: null };
}

module.exports = { parseDomain };
