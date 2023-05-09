FROM node:18.15-slim AS builder

ARG VITE_AUTH_URL=https://auth.aptible.com
ARG VITE_BILLING_URL=https://goldenboy.aptible.com
ARG VITE_API_URL=https://api.aptible.com
ARG VITE_LEGACY_DASHBOARD_URL=https://dashboard.aptible.com
ARG VITE_ORIGIN=app
ARG VITE_SENTRY_DSN
ARG VITE_TUNA_ENABLED=false
ARG NODE_ENV=production

RUN corepack enable
RUN corepack prepare yarn@stable --activate

ADD package.json /app/
ADD yarn.lock /app/
WORKDIR /app

ADD . /app
RUN yarn install --immutable

RUN env | grep VITE

RUN yarn build

FROM nginx:1.24.0 as nginx

ENV BUILD=/app
ENV PORT=80

COPY --from=builder /app/dist "$BUILD"

RUN apt-get update && apt-get install -y curl
WORKDIR /app
ADD ./nginx.conf /etc/nginx/nginx.conf
EXPOSE $PORT
