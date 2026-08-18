# syntax=docker/dockerfile:1

# ---- Stage 1: build the SPA ------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

COPY . .

# `prebuild` snapshots the CMS content into the bundle. Point it at the public
# content URL so the build ships fresh copy.
#
# Note the failure mode: if the CMS is unreachable and a committed snapshot
# exists, the script WARNS and reuses the old snapshot instead of failing. A
# build during a CMS outage therefore publishes stale content silently — check
# the build log for "reusing committed snapshot".
ARG VITE_STRAPI_URL=https://content.carlossanjuan.co
ENV VITE_STRAPI_URL=${VITE_STRAPI_URL}
RUN yarn build

# ---- Stage 2: serve --------------------------------------------------------
FROM nginx:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Port 8080, not 80, so nothing here ever depends on privileged-port
# capability. Only the tunnel reaches this container, and it does so by name.
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
