# Build context is the repo root (see docker-compose.yml: `context: .`).
FROM node:20-alpine AS build
WORKDIR /src

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Baked into the static bundle at build time — env vars set at *container run* time have no
# effect on a SPA's already-built JS, so these must be build args, not runtime env vars.
# VITE_API_BASE_URL must be a full absolute origin (e.g. https://app.example.com), not a bare
# path like "/api" — src/lib/api/client.ts resolves request paths against it via `new URL(path,
# API_BASE_URL)`, which throws unless the base is absolute. Since nginx.conf proxies /api and
# /health back to the api container, this is normally just the site's own public origin (see
# PUBLIC_ORIGIN in .env.example) — the browser never leaves that origin at all.
ARG VITE_API_BASE_URL
ARG VITE_BASE_PATH=/
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html

EXPOSE 80
