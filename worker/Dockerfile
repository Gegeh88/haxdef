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

# Create non-root user
RUN useradd -m -d /home/scanner -s /bin/bash scanner

# Download Nuclei templates via git clone (most reliable in Docker)
# This avoids DNS/API issues that nuclei -update-templates has in containers
RUN git clone --depth 1 https://github.com/projectdiscovery/nuclei-templates.git /home/scanner/nuclei-templates \
    && chown -R scanner:scanner /home/scanner/nuclei-templates \
    && echo "Templates downloaded:" \
    && find /home/scanner/nuclei-templates -name "*.yaml" | wc -l

# Set up app
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN chown -R scanner:scanner /app

# Run as non-root
USER scanner
ENV HOME=/home/scanner

CMD ["node", "src/worker.js"]
