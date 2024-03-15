FROM node:18.16-slim AS builder

ARG VITE_APP_URL=https://app-sbx-eabruzzese.aptible-sandbox.com
ARG VITE_AUTH_URL=https://app-68953.on-aptible.com
ARG VITE_BILLING_URL=https://goldenboy-sbx-eabruzzese.aptible-sandbox.com
ARG VITE_API_URL=https://app-68952.on-aptible.com
ARG VITE_LEGACY_DASHBOARD_URL=https://dashboard.aptible.com
ARG VITE_METRIC_TUNNEL_URL=https://metrictunnel-sbx-eabruzzese.aptible-sandbox.com
ARG VITE_ORIGIN=app
ARG VITE_TUNA_ENABLED=false
ARG NODE_ENV=production
ARG VITE_SENTRY_DSN
ARG VITE_STRIPE_PUBLISHABLE_KEY

RUN corepack enable
RUN corepack prepare yarn@stable --activate

ADD package.json /app/
ADD yarn.lock /app/
WORKDIR /app

ADD . /app
RUN yarn install --immutable

RUN env | grep VITE

RUN yarn build

FROM nginx:1.25.3 as nginx

ENV BUILD=/app
ENV PORT=80

COPY --from=builder /app/dist "$BUILD"

RUN apt-get update && apt-get install -y curl
WORKDIR /app
ADD ./nginx.conf /etc/nginx/nginx.conf
EXPOSE $PORT
