<img src="https://user-images.githubusercontent.com/4295811/226700092-ffbd0c01-dba1-4880-8b77-a4d26e6228f0.svg"  width="64">

# `app-ui`

Aptible's PaaS automates the work of provisioning, managing, and scaling infrastructure, so you can focus on what matters: your product.

<img src="https://github.com/aptible/app-ui/assets/4295811/20eaa0a8-a537-4549-84d2-0a4f10152363" style="max-width: 100%;">

## Getting Started

**1. Install Node and Yarn**

Requirements:

- node `v18.15.x`
- yarn `v3.6.3`

**2. Yarn setup**


```bash
corepack enable
yarn set version 3.6.3
```

[See official instructions](https://yarnpkg.com/getting-started/install)

**3. Create `.env` file with environment variables**

Add file to the root of `app-ui` with these variables:

Production APIs:

```bash
VITE_APP_URL="http://localhost:4200"

VITE_AUTH_URL="https://auth.aptible.com"
VITE_API_URL="https://api.aptible.com"
VITE_BILLING_URL="https://goldenboy.aptible.com"
VITE_LEGACY_DASHBOARD_URL="https://dashboard.aptible.com"
VITE_METRIC_TUNNEL_URL="https://metrictunnel-nextgen.aptible.com"
VITE_PORTAL_URL="https://portal.aptible.com"
```

Staging APIs:

```bash
VITE_APP_URL="http://localhost:4200"

VITE_AUTH_URL="https://auth-sbx-main.aptible-sandbox.com"
VITE_API_URL="https://api-sbx-main.aptible-sandbox.com"
VITE_BILLING_URL="https://goldenboy-sbx-main.aptible-sandbox.com"
VITE_LEGACY_DASHBOARD_URL="https://dashboard-sbx-main.aptible-sandbox.com"
VITE_METRIC_TUNNEL_URL="https://metrictunnel-sbx-main.aptible-sandbox.com"
VITE_PORTAL_URL="https://portal-sbx-main.aptible-sandbox.com"
```

**4. Run Start Commands**

```bash
yarn
```

```bash
yarn start
```

**5. All done! Go to http://localhost:4200**
The web app will live update after committing changes.

## Troubleshooting

**Why does my pull request keep failing tests?**

Lint codebase

```bash
yarn lint
```

Automatically fix issues

```bash
yarn fmt
```

## Sites

- [prod](https://app.aptible.com)
- [staging](https://app-sbx-main.aptible-sandbox.com)

## Continuous Deployment

### Staging

Once merged to `main` we deploy to `staging` 

This will deploy two apps:

* `app-sbx-main.aptible-sandbox.com` - our critical path for what is currently active on Aptible

### Production

1. Create a github release
2. Deployment paths for above apps:
    * Deployments to `app.aptible.com` will only fire with a `v` semver prefix.
