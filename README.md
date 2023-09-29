<br>
<img src="https://user-images.githubusercontent.com/4295811/226700092-ffbd0c01-dba1-4880-8b77-a4d26e6228f0.svg"  width="64">

# app-ui

Aptible's PaaS automates the work of provisioning, managing, and scaling infrastructure, so you can focus on what matters: your product.

<img src="https://user-images.githubusercontent.com/4295811/248316533-f285fc02-3669-4d6f-96fe-fb854d148407.png"  style="max-width: 100%;">

## Getting Started

**1. Install Node and Yarn**
<br>app-ui requires node `v18.15.x` and yarn `v2+` or later.

**2. Create `.env` file with environment variables**
<br>Add file to the root of app-ui with these variables:
```bash
VITE_AUTH_URL="https://auth.aptible.com"
VITE_API_URL="https://api.aptible.com"
VITE_BILLING_URL="https://goldenboy.aptible.com"
```
Environment variables point to which API/Auth to use. You can optionally swap them with `*sbx-main` URLs.
<br>Here's an example:
```bash
VITE_APP_URL="http://localhost:4200"
VITE_AUTH_URL="http://localhost:4000"
VITE_API_URL="http://localhost:4001"
VITE_BILLING_URL="http:localhost:4005"
VITE_LEGACY_DASHBOARD_URL="http://localhost:4200"
VITE_METRIC_TUNNEL_URL="http://localhost:4006"
VITE_SENTRY_DSN=""
VITE_TUNA_ENABLED="false"
```

**3. Run Start Commands**
```bash
cd app-ui
```
```bash
yarn set version berry
```
```bash
yarn
```
```bash
yarn start
```

**4. All done! Go to http://localhost:4200**
<br>The web app will live update after committing changes.

## Troubleshooting

**Yarn commands are not working**

Re-run the yarn command to add dependencies

```bash
yarn
```

**After running `yarn start`, I'm stuck on a blank page that says loading...**

Unset your environment variables in terminal, by running the following commands:

```bash
cd app-ui
```
```bash
unset VITE_AUTH_URL
unset VITE API URL
unset VITE_BILLING URL
```
Then re-run `yarn start` and the site should load.

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

- `prod` https://app.aptible.com
- `staging` https://app-sbx-main.aptible-sandbox.com

## Continuous Deployment

### Staging

Once merged to `main` we deploy to `staging` 

This will deploy two apps:

* `app-sbx-main.aptible-sandbox.com` - our critical path for what is currently active on Aptible

### Production

1. Create a github release
2. Deployment paths for above apps:
    * Deployments to `app.aptible.com` will only fire with a `v` semver prefix.
