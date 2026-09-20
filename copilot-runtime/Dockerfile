FROM debian:bookworm-slim
ARG COPILOT_VERSION=1.0.7
ENV COPILOT_AUTO_UPDATE=false
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates wget \
    && ARCH="$(dpkg --print-architecture)" \
    && case "${ARCH}" in amd64) COPILOT_ARCH="x64" ;; arm64) COPILOT_ARCH="arm64" ;; *) echo "Unsupported architecture: ${ARCH}" >&2; exit 1 ;; esac \
    && wget -q "https://github.com/github/copilot-cli/releases/download/v${COPILOT_VERSION}/copilot-linux-${COPILOT_ARCH}.tar.gz" \
    && tar -xzf "copilot-linux-${COPILOT_ARCH}.tar.gz" \
    && install -m 0755 copilot /usr/local/bin/copilot \
    && rm -f copilot "copilot-linux-${COPILOT_ARCH}.tar.gz" \
    && apt-get purge -y wget \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
EXPOSE 4321
ENTRYPOINT ["copilot"]
CMD ["--headless", "--host", "0.0.0.0", "--port", "4321"]
