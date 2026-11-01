#!/usr/bin/env bash
# Host-side launcher for the Docker variant of the CMA self-hosted sandbox demo.
#
# Builds the per-session image, then runs `eno beta:worker poll` on the host
# with --on-work pointed at on-work.sh, which `docker run`s a per-session
# container per claimed work item. The poller never executes tools itself; it
# only claims work and hands each item to the script.
#
# Requires: docker, and `eno` on PATH (same CLI build as the image — see
# ANT_VERSION in ./Dockerfile; install snippet in ./README.md).
#
# Env:
#   ENOPHIC_ENVIRONMENT_ID   - the self-hosted environment id (env_...)
#   ENOPHIC_ENVIRONMENT_KEY  - the environment key: the only credential, for
#                                both the control-plane poll and (inside the
#                                container) every per-session call
#   ENOPHIC_BASE_URL         - optional, default https://api.enophic.com
#   MONGO_URI                  - optional; if set, forwarded into each per-session container so
#                                the agent can query MongoDB from bash (see README). Your secret,
#                                never sent to Enophic.
set -euo pipefail
cd "$(dirname "$0")"

: "${ENOPHIC_ENVIRONMENT_ID:?set ENOPHIC_ENVIRONMENT_ID (env_...)}"
: "${ENOPHIC_ENVIRONMENT_KEY:?set ENOPHIC_ENVIRONMENT_KEY (sk-eno-oat...)}"
export ENOPHIC_BASE_URL="${ENOPHIC_BASE_URL:-https://api.enophic.com}"

command -v docker >/dev/null || { echo "docker not found on PATH" >&2; exit 1; }
command -v eno >/dev/null || {
  echo "eno not found on PATH. Install the pinned build (see README.md):" >&2
  grep -m1 ANT_VERSION Dockerfile >&2
  exit 1
}

IMAGE="${CMA_IMAGE:-cma-self-hosted-sandbox-docker}"
echo "[start] building ${IMAGE} (eno CLI pinned in Dockerfile)…"
docker build -t "$IMAGE" .

echo "[start] polling env=${ENOPHIC_ENVIRONMENT_ID} base=${ENOPHIC_BASE_URL}"
# --on-work delegates each work item to on-work.sh (CMA_IMAGE/ENOPHIC_* are
# inherited). The poll side runs no tools, so its --workdir is unused; point it
# at a throwaway. Exits cleanly on SIGTERM/SIGINT.
exec env CMA_IMAGE="$IMAGE" MONGO_URI="${MONGO_URI:-}" \
  eno beta:worker poll \
    --on-work "$PWD/on-work.sh" \
    --workdir /tmp \
    --log-format json
