# reploy-ui

Aptible's *new* customer dashboard. It allows users to manage organizations,
access controls, and ops.

## install

- node `v16.14.2`

```bash
yarn
```

# environment variables

```bash
export VITE_AUTH_URL="http://localhost:4000"
export VITE_API_URL="http://localhost:4001"
export VITE_BILLING_URL="http:localhost:4005"
```

# dev server

```bash
yarn dev
```

open browser to http://localhost:4200

## test

```bash
yarn test
```

## continuous deployment

Once merging to `main` we deploy to https://reploy-test.aptible-sandbox.com
