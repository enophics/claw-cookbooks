FROM debian:12-slim
ARG ANT_VERSION=1.10.0
ARG TARGETOS=linux
ARG TARGETARCH=amd64
# ca-certificates + curl: fetch the eno CLI. python3 + python3-pymongo: let the agent query
# MongoDB from its bash tool (e.g. python3 -c "from pymongo import MongoClient; ..."). The
# connection string arrives as the MONGO_URI env var, set host-side in on-work.sh — see README.
# python3-dnspython is REQUIRED for mongodb+srv:// URIs (every Atlas connection string is SRV);
# pymongo raises "The dnspython module must be installed to use mongodb+srv:// URIs" without it.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl python3 python3-pymongo python3-dnspython \
 && rm -rf /var/lib/apt/lists/*
ADD https://github.com/enophics/enophic-cli/releases/download/v${ANT_VERSION}/ant_${ANT_VERSION}_${TARGETOS}_${TARGETARCH}.tar.gz /tmp/eno.tgz
RUN tar -xzf /tmp/eno.tgz -C /usr/local/bin eno \
 && chmod +x /usr/local/bin/eno && rm /tmp/eno.tgz
# /workspace is the agent's working tree (skills download here, file tools are
# scoped here). Created by WORKDIR; a per-session volume is mounted over it by
# on-work.sh so the tree + skills survive across containers for one session.
WORKDIR /workspace
# Env contract (`eno beta:worker run`): ENOPHIC_{SESSION_ID,ENVIRONMENT_ID,
# WORK_ID,ENVIRONMENT_KEY,BASE_URL}. on-work.sh also passes ENOPHIC_AUTH_TOKEN
# (= the environment key) so the CLI's skill-download client authenticates.
# --max-idle: exit 60s after session.status_idle/end_turn, reset on any event.
ENTRYPOINT ["eno", "beta:worker", "run", "--workdir", "/workspace", "--unrestricted-paths", "--max-idle", "60s", "--log-format", "json"]
