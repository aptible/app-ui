<br>
<img src="https://user-images.githubusercontent.com/4295811/226700092-ffbd0c01-dba1-4880-8b77-a4d26e6228f0.svg"  width="64">

# app-ui

Aptible's PaaS automates the work of provisioning, managing, and scaling infrastructure, so you can focus on what matters: your product.

## sites

- `prod` https://nextgen.aptible.com
- `staging` https://cloud-ui-main.aptible-staging.com

## install

- node `v18.15.x`
- yarn `v2+`

```bash
yarn
```

## environment variables

```bash
export VITE_AUTH_URL="http://localhost:4000"
export VITE_API_URL="http://localhost:4001"
export VITE_BILLING_URL="http:localhost:4005"
export VITE_SENTRY_DSN="" # populate this as needed for error reporting, optional
export VITE_LEGACY_DASHBOARD_URL="https://localhost:4200"
export VITE_ORIGIN="nextgen" # switch this value to app to test currently active user flows
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

This will deploy two apps:

* `app-sbx-main.aptible-sandbox.com` - our critical path for what is currently active on Aptible
* `nextgen-sbx-main.aptible-sandbox.com` - our planned changes that include cut-over functionality from existing frontend apps

### prod

1. Create a github release
2. Deployment paths for above apps:
    * Deployments to `app.aptible.com` will only fire with a `v` semver prefix.
    * Deployments to `nextgen.aptible.com` will fire on ANY release with a fixed tag.