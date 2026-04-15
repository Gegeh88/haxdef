FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    nmap \
    dnsutils \
    unzip \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Nuclei
RUN NUCLEI_VERSION=$(curl -s https://api.github.com/repos/projectdiscovery/nuclei/releases/latest | grep '"tag_name"' | cut -d'"' -f4 | tr -d 'v') \
    && wget -q "https://github.com/projectdiscovery/nuclei/releases/download/v${NUCLEI_VERSION}/nuclei_${NUCLEI_VERSION}_linux_amd64.zip" -O /tmp/nuclei.zip \
    && unzip -o /tmp/nuclei.zip -d /usr/local/bin/ \
    && rm /tmp/nuclei.zip \
    && chmod +x /usr/local/bin/nuclei

# Install subfinder
RUN SUBFINDER_VERSION=$(curl -s https://api.github.com/repos/projectdiscovery/subfinder/releases/latest | grep '"tag_name"' | cut -d'"' -f4 | tr -d 'v') \
    && wget -q "https://github.com/projectdiscovery/subfinder/releases/download/v${SUBFINDER_VERSION}/subfinder_${SUBFINDER_VERSION}_linux_amd64.zip" -O /tmp/subfinder.zip \
    && unzip -o /tmp/subfinder.zip -d /usr/local/bin/ \
    && rm /tmp/subfinder.zip \
    && chmod +x /usr/local/bin/subfinder

# Create non-root user with proper home directory
RUN useradd -m -d /home/scanner -s /bin/bash scanner

# Download Nuclei templates as scanner user with explicit HOME
USER scanner
ENV HOME=/home/scanner
RUN nuclei -update-templates 2>&1 | tail -5 \
    && echo "=== Template directory ===" \
    && ls -la /home/scanner/nuclei-templates/ 2>/dev/null || ls -la /home/scanner/.local/nuclei/templates/ 2>/dev/null || echo "Checking .nuclei-templates" \
    && ls /home/scanner/.nuclei-templates/ 2>/dev/null || echo "No templates in .nuclei-templates" \
    && echo "=== Template count ===" \
    && nuclei -tl 2>/dev/null | wc -l

# Switch back to root to set up the app
USER root
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Make app files readable by scanner
RUN chown -R scanner:scanner /app

# Run as non-root for security
USER scanner
ENV HOME=/home/scanner

CMD ["node", "src/worker.js"]
