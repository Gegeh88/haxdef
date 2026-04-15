#!/bin/bash
# Override IPv6-only DNS (fd12::10) that breaks Go's resolver in Railway containers
# This MUST happen at runtime, not in Dockerfile RUN (Railway overwrites resolv.conf)
echo "nameserver 8.8.8.8" > /etc/resolv.conf
echo "nameserver 1.1.1.1" >> /etc/resolv.conf
echo "options timeout:2 attempts:3 single-request" >> /etc/resolv.conf

echo "[ENTRYPOINT] DNS overridden:"
cat /etc/resolv.conf

# Drop privileges to scanner user and run worker
exec su -s /bin/bash scanner -c "cd /app && node src/worker.js"
