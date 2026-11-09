# One immutable multi-platform index per base; update deliberately with regression tests.
ARG NODE_IMAGE=node:24.22.2-bookworm-slim@sha256:01d566e8d94d8c619591d78652babfccd3c6992a3dffa9ed5ab39e11cf6c70e9
ARG CADDY_IMAGE=caddy:2.10.2-alpine@sha256:4c6e91c6ed0e2fa03efd5b44747b625fec79bc9cd06ac5235a779726618e530d
FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} AS tooling
WORKDIR /source
ENV HUSKY=0
RUN npm install --global pnpm@11.25.0

FROM tooling AS production-deps
ARG TARGETARCH
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
# Select target-specific optional prebuilt bindings without executing them on the builder.
# Better Auth's optional peers currently bring Vite bindings into this locked graph.
RUN case "$TARGETARCH" in amd64) cpu=x64 ;; arm64) cpu=arm64 ;; *) exit 1 ;; esac && \
    printf '\nsupportedArchitectures:\n  os: [linux]\n  cpu: [%s]\n  libc: [glibc]\n' "$cpu" >> pnpm-workspace.yaml && \
    pnpm install --prod --frozen-lockfile --ignore-scripts
RUN mkdir -p /data && chown 1000:1000 /data

FROM tooling AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY pocs/auth/package.json pocs/auth/package.json
RUN pnpm install --frozen-lockfile
COPY apps apps
COPY packages packages
RUN pnpm --filter @kafofo/contracts build && pnpm --filter @kafofo/api build && pnpm --filter @kafofo/web build

FROM ${NODE_IMAGE} AS api
ARG SOURCE_COMMIT
ARG APP_VERSION
LABEL org.opencontainers.image.revision=${SOURCE_COMMIT} org.opencontainers.image.version=${APP_VERSION}
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4304
WORKDIR /app/apps/api
COPY --from=production-deps /source/node_modules /app/node_modules
COPY --from=production-deps /source/apps/api/node_modules ./node_modules
COPY --from=production-deps /source/packages/contracts /app/packages/contracts
COPY --from=build /source/packages/contracts/dist /app/packages/contracts/dist
COPY --from=build /source/apps/api/package.json ./package.json
COPY --from=build /source/apps/api/dist ./dist
COPY --from=build /source/apps/api/drizzle ./drizzle
COPY --chown=node:node deploy/entrypoint.mjs deploy/logs.mjs ./
COPY --from=production-deps --chown=node:node /data /var/lib/kafofo
USER node
ENTRYPOINT ["node", "entrypoint.mjs"]
CMD ["node", "dist/server.js"]

FROM ${CADDY_IMAGE} AS web
ARG SOURCE_COMMIT
ARG APP_VERSION
LABEL org.opencontainers.image.revision=${SOURCE_COMMIT} org.opencontainers.image.version=${APP_VERSION}
COPY --from=build /source/apps/web/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
