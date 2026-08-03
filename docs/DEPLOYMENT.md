# Deployment — carlossanjuanco-client

Runbook for the public site. The host-level procedure for exposing any stack to
the internet lives in `/home/agent/infra/README.md`.

## Shape

One production environment. The site is a static bundle: `vite build` output
served by nginx. Nothing here is stateful — the container holds no data and can
be destroyed at will.

| Container | Tailscale port | Public hostname |
| --------- | -------------- | --------------- |
| `carlossanjuanco-client` | 3004 | `carlossanjuan.co` (apex) |

nginx listens on 8080 inside the container so nothing depends on
privileged-port capability. The tunnel reaches it by container name; no port is
published publicly.

## The apex

`carlossanjuan.co` is the zone apex, served through Cloudflare's CNAME
flattening. Two things about that record matter:

- It replaced an `A` record pointing at Vercel (`76.76.21.21`, unproxied),
  which was returning 404. To revert, delete the tunnel CNAME and recreate that
  `A` record.
- The apex also carries **Google Workspace MX records and SPF TXT records**.
  Those are email and were left untouched. Never bulk-delete records at this
  name.

## Content is baked in at build time

`prebuild` runs `scripts/snapshot-content.mjs`, which fetches every CMS
endpoint and writes `src/shared/content/snapshot/{es,en}.json` into the bundle.

**A content change therefore requires a rebuild, not a restart.** After editing
anything in Strapi:

```bash
./deploy.sh
```

### The silent failure this guards against

If the CMS is unreachable *and* a committed snapshot exists, the script warns
and reuses the old snapshot rather than failing. Left alone, a build during a
CMS outage publishes stale content and exits 0.

`deploy.sh` therefore probes the CMS first and refuses to build when it is
down. Override deliberately if you really want the committed snapshot:

```bash
ALLOW_STALE_CONTENT=1 ./deploy.sh
```

The build log is also scanned for `reusing committed snapshot` and warns if it
appears.

## Media still comes from the CMS at runtime

Only the text content is baked in. `src/shared/api/strapi.ts` builds image URLs
from `VITE_STRAPI_URL`, so `content.carlossanjuan.co` must stay publicly
reachable or images break on a site that otherwise looks fine.

## Deploy

```bash
cd /home/agent/dev/carlossanjuanco/carlossanjuanco-client
./deploy.sh          # build + release
./deploy.sh --logs   # follow logs afterwards
```

## Caching

`nginx.conf` serves hashed assets under `/assets/` with a one-year immutable
cache and marks `index.html` `no-cache`. Getting this backwards is the classic
way to serve a new `index.html` that references deleted asset files, or an old
one that never picks up a deploy.

Cloudflare caches in front of this. After a deploy, purge the zone cache if the
old page persists.

## Rollback

Images are tagged with the git short SHA:

```bash
HOST_PORT=3004 IMAGE_TAG=<previous-sha> docker compose up -d --no-build client
```

Because content is baked into the image, a rollback also reverts the content
snapshot to whatever the CMS held at that build.
