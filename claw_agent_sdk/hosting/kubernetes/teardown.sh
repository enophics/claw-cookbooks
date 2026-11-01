#!/bin/bash
set -euo pipefail
kind delete cluster --name claw-agent
rm -rf "$(dirname "$0")/certs"
