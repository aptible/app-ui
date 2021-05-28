FROM node:14 AS builder

ARG REACT_APP_APTIBLE_AUTH_ROOT_URL=https://auth.aptible.com
ARG REACT_APP_BILLING_ROOT_URL=https://goldenboy.aptible.com
ARG REACT_APP_API_ROOT_URL=https://api.aptible.com
ARG NODE_ENV production

RUN env | grep REACT_APP

ADD package.json /app/
ADD yarn.lock /app/
WORKDIR /app

RUN yarn
ADD . /app
RUN yarn build

FROM nginx:1.13.11 as nginx

ENV BUILD=/app
ENV PORT=80

COPY --from=builder /app/public "$BUILD"

RUN apt-get update && apt-get install -y curl
WORKDIR /app
ADD ./nginx.conf /etc/nginx/nginx.conf
EXPOSE $PORT
