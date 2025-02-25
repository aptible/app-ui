FROM node:18.16-slim AS builder

ARG VITE_APP_URL=https://app.aptible.com
ARG VITE_AUTH_URL=https://auth.aptible.com
ARG VITE_BILLING_URL=https://goldenboy.aptible.com
ARG VITE_API_URL=https://api.aptible.com
ARG VITE_LEGACY_DASHBOARD_URL=https://dashboard.aptible.com
ARG VITE_METRIC_TUNNEL_URL=https://metrictunnel.aptible.com
ARG VITE_PORTAL_URL=https://portal.aptible.com
ARG VITE_APTIBLE_AI_URL=wss://app-86559.on-aptible.com
ARG VITE_ORIGIN=app
ARG VITE_TUNA_ENABLED=false
ARG NODE_ENV=production
ARG SENTRY_ORG=aptible
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN
ARG VITE_SENTRY_DSN
ARG VITE_MINTLIFY_CHAT_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_FEATURE_BETA_ORG_IDS=df0ee681-9e02-4c28-8916-3b215d539b08
ARG VITE_TOKEN_HEADER_ORG_IDS=df0ee681-9e02-4c28-8916-3b215d539b08

RUN corepack enable
RUN corepack prepare yarn@stable --activate

ADD package.json /app/
ADD yarn.lock /app/
WORKDIR /app

ADD . /app
RUN yarn install --immutable

RUN env | grep VITE

RUN yarn build

FROM nginx:1.27.4-alpine3.21-slim as nginx

ENV BUILD=/app
ENV PORT=80

COPY --from=builder /app/dist "$BUILD"

RUN apt-get update && apt-get install -y curl
WORKDIR /app
ADD ./nginx.conf /etc/nginx/nginx.conf
EXPOSE $PORT
