FROM debian:12-slim
ARG ANT_VERSION=1.9.0
ARG TARGETOS=linux
ARG TARGETARCH=amd64
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*
ADD https://github.com/enophics/enophic-cli/releases/download/v${ANT_VERSION}/ant_${ANT_VERSION}_${TARGETOS}_${TARGETARCH}.tar.gz /tmp/eno.tgz
RUN tar -xzf /tmp/eno.tgz -C /usr/local/bin eno \
 && chmod +x /usr/local/bin/eno && rm /tmp/eno.tgz
WORKDIR /workspace
# --max-idle: exit 60s after session.status_idle/end_turn, reset on any event.
ENTRYPOINT ["eno", "beta:worker", "run", "--workdir", "/workspace", "--unrestricted-paths", "--max-idle", "60s", "--log-format", "json"]
