#!/usr/bin/env bash
set -euo pipefail

PORT=4173
URL="http://localhost:${PORT}"
REPORT_PATH="$(mktemp -t lighthouse-report-XXXXXX).json"
PREVIEW_PID=""

cleanup() {
  if [ -n "${PREVIEW_PID}" ] && kill -0 "${PREVIEW_PID}" 2>/dev/null; then
    kill "${PREVIEW_PID}" 2>/dev/null || true
    wait "${PREVIEW_PID}" 2>/dev/null || true
  fi
  rm -f "${REPORT_PATH}"
}
trap cleanup EXIT

echo "[measure] building..."
yarn build

echo "[measure] starting preview server on port ${PORT}..."
yarn preview --port "${PORT}" --strictPort >/tmp/lighthouse-preview.log 2>&1 &
PREVIEW_PID=$!

echo "[measure] waiting for ${URL} to be ready..."
for _ in $(seq 1 30); do
  if curl -s -o /dev/null "${URL}"; then
    break
  fi
  sleep 1
done

if ! curl -s -o /dev/null "${URL}"; then
  echo "[measure] ERROR: preview server did not become ready at ${URL}"
  cat /tmp/lighthouse-preview.log || true
  exit 1
fi

echo "[measure] running Lighthouse against ${URL}..."
npx lighthouse "${URL}" \
  --output=json \
  --output-path="${REPORT_PATH}" \
  --chrome-flags="--headless=new --no-sandbox" \
  --only-categories=performance,accessibility,best-practices,seo \
  --quiet

node "$(dirname "$0")/assert-lighthouse-thresholds.mjs" "${REPORT_PATH}"
