# demo.nself.org Deployment Guide

## Overview

demo.nself.org hosts a live instance of ɳTask connected to the nself web backend.

## Architecture

- **Frontend**: Vercel (ɳTask Next.js app)
- **Backend**: nself on `api.nself.org` (shared with nself.org)
- **DNS**: Cloudflare — `demo.nself.org` → Vercel

## DNS Setup

In Cloudflare, add a CNAME record:
- **Name:** demo
- **Target:** cname.vercel-dns.com
- **Proxy:** Enabled (orange cloud)

## Vercel Setup

1. Create project in Vercel team `unity-dev`
2. Import the `nself-org/tasks` repo
3. Set root directory to `frontend/`
4. Framework: Next.js
5. Add custom domain: `demo.nself.org`

## Environment Variables (set in Vercel)

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_PROVIDER` | `nself` |
| `NEXT_PUBLIC_HASURA_URL` | `https://api.nself.org/v1/graphql` |
| `NEXT_PUBLIC_AUTH_URL` | `https://api.nself.org` |
| `NEXT_PUBLIC_APP_URL` | `https://demo.nself.org` |

## CI/CD

Push to `main` → `.github/workflows/deploy.yml` → Vercel production deploy

## Required GitHub Secrets

| Secret | Where to get |
| --- | --- |
| `VERCEL_TOKEN` | Vercel Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel project settings → General |
| `VERCEL_PROJECT_ID` | Vercel project settings → General |
