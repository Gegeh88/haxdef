# Stage 1: Build Wapiti (needs Python 3.13)
FROM python:3.13-slim AS wapiti-build
RUN pip install --no-cache-dir wapiti3

# Stage 2: Main worker image
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

# Copy entire Python 3.13 installation from build stage
COPY --from=wapiti-build /usr/local/ /usr/local/
RUN ldconfig

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

# Download Nuclei templates
RUN git clone --depth 1 https://github.com/projectdiscovery/nuclei-templates.git /home/scanner/nuclei-templates \
    && chown -R scanner:scanner /home/scanner/nuclei-templates \
    && echo "Templates downloaded:" \
    && find /home/scanner/nuclei-templates -name "*.yaml" | wc -l

# Set up app
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# Copy entrypoint script and fix line endings
COPY entrypoint.sh /app/entrypoint.sh
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh \
    && chown -R scanner:scanner /app

ENV HOME=/home/scanner

CMD ["/app/entrypoint.sh"]
