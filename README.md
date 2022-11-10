# cloud-ui

Aptible's *new* customer dashboard. It allows users to manage organizations,
access controls, and ops.

## sites

- `prod` https://nextgen.aptible.com
- `staging` https://cloud-ui-main.aptible-staging.com

## install

- node `v16.14.2`

```bash
yarn
```

## environment variables

```bash
export VITE_AUTH_URL="http://localhost:4000"
export VITE_API_URL="http://localhost:4001"
export VITE_BILLING_URL="http:localhost:4005"
```

### .env

Copy `.env.example` to `.env.local`

## dev server

```bash
yarn dev
```

open browser to http://localhost:4200

## test

```bash
yarn test
```

## continuous deployment

### staging

Once merged to `main` we deploy to `staging` 

### prod

Create a github release
