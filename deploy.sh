#!/usr/bin/env bash
#
# carlossanjuanco-client deployment driver (production only).
#
#   ./deploy.sh          build + release
#   ./deploy.sh --logs   follow logs after a successful release
#
# The CMS content is snapshotted into the bundle at BUILD time, so run this
# again after every content change. The build aborts if the CMS is unreachable
# rather than silently shipping the previous snapshot.

set -euo pipefail

cd "$(dirname "$0")"

FOLLOW_LOGS="${1:-}"

HOST_PORT=3004
CONTAINER="carlossanjuanco-client"
VITE_STRAPI_URL="${VITE_STRAPI_URL:-https://content.carlossanjuan.co}"

# The snapshot script degrades silently: unreachable CMS + committed snapshot
# means it warns and reuses stale content. Fail here instead, where it is
# visible, unless explicitly overridden.
if [[ "${ALLOW_STALE_CONTENT:-0}" != "1" ]]; then
  if ! curl -fsS -m 15 -o /dev/null "${VITE_STRAPI_URL}/api/site-setting"; then
    echo "error: CMS unreachable at ${VITE_STRAPI_URL}" >&2
    echo "       The build would silently ship the last committed snapshot." >&2
    echo "       Fix the CMS, or re-run with ALLOW_STALE_CONTENT=1 to accept it." >&2
    exit 1
  fi
fi

BIND_ADDR="$(tailscale ip -4 2>/dev/null || echo 127.0.0.1)"

docker network inspect edge >/dev/null 2>&1 || docker network create edge

export HOST_PORT BIND_ADDR VITE_STRAPI_URL
export IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD 2>/dev/null || echo local)}"

echo "==> building ${CONTAINER}:${IMAGE_TAG} against ${VITE_STRAPI_URL}"
BUILD_LOG="$(mktemp)"
trap 'rm -f "$BUILD_LOG"' EXIT
if ! docker compose build --progress plain > "$BUILD_LOG" 2>&1; then
  tail -40 "$BUILD_LOG" >&2
  echo "error: build failed" >&2
  exit 1
fi
if grep -q "reusing committed snapshot" "$BUILD_LOG"; then
  echo "warning: the build reused a committed snapshot — content may be stale." >&2
  grep "reusing committed snapshot" "$BUILD_LOG" >&2
fi

echo "==> releasing ${CONTAINER} on ${BIND_ADDR}:${HOST_PORT}"
docker compose up -d --remove-orphans

echo "==> waiting for health"
for _ in $(seq 1 30); do
  status="$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo missing)"
  case "$status" in
    healthy)
      echo "==> ${CONTAINER} is healthy"
      [[ "$FOLLOW_LOGS" == "--logs" ]] && exec docker compose logs -f client
      exit 0
      ;;
    unhealthy)
      echo "error: ${CONTAINER} reported unhealthy" >&2
      docker compose logs --tail 50 client >&2
      exit 1
      ;;
  esac
  sleep 2
done

echo "error: ${CONTAINER} did not become healthy within 60s" >&2
docker compose logs --tail 50 client >&2
exit 1
