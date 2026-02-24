# PRS Stage Builder — Azure App Service Deployment Guide
### Python / Flask / Gunicorn — v1.5.0

This document covers deploying the **Python/Flask version** of the PRS Stage Builder to Azure App Service. For the standalone HTML version see `README.md` in the root of the project.

---

## Why a Python Version?

The Python deployment protects the application source code from casual downloading. When served through Flask:

- **No static asset endpoints exist.** There is no `/static/app.js` or `/static/style.css` to `curl` or `wget`. Every request to the server returns a single fully-rendered HTML response with CSS and JavaScript inlined.
- **Security headers are set on every response:** `no-store` cache control, `noindex` robots meta, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`.
- **Optional Basic Auth** gates the entire app behind a username/password set as Azure environment variables — no credentials in code.
- **404 on all unrecognised paths** — no directory listing, no file enumeration.

> **Note:** Browser DevTools will always be able to view the rendered HTML source — that is a fundamental property of any web browser and cannot be prevented. This approach stops casual file downloads and search engine indexing, not determined reverse engineering.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Azure CLI | 2.x | `az --version` to verify |
| Python | 3.11 or 3.12 | Must match the Azure runtime you select |
| Git | Any | For Git-based deployment |
| Azure subscription | Active | Free tier works for testing |

---

## File Structure

```
prs-azure/
├── app.py               ← Flask application (routes, auth, security headers)
├── requirements.txt     ← Flask + Gunicorn (pinned versions)
├── startup.txt          ← Gunicorn startup command for Azure Linux App Service
├── web.config           ← IIS config for Azure Windows App Service (optional)
├── deploy.sh            ← Kudu custom deployment script
├── .deployment          ← Tells Kudu to run deploy.sh
├── .gitignore
├── README_AZURE.md      ← This file
└── templates/
    └── app.html         ← Complete app: HTML + inlined CSS + inlined JS
                            (generated from index-mono.html — do not edit directly)
```

---

## Deployment: Step-by-Step

### Step 1 — Create the App Service

```bash
# Log in
az login

# Create a resource group (skip if you have one)
az group create \
  --name prs-builder-rg \
  --location eastus

# Create an App Service Plan (B1 = ~$13/month, F1 = free tier)
az appservice plan create \
  --name prs-builder-plan \
  --resource-group prs-builder-rg \
  --sku B1 \
  --is-linux

# Create the Web App
# Replace <YOUR-APP-NAME> with a globally unique name (becomes <name>.azurewebsites.net)
az webapp create \
  --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg \
  --plan prs-builder-plan \
  --runtime "PYTHON:3.12"
```

### Step 2 — Configure the Startup Command

```bash
az webapp config set \
  --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg \
  --startup-file "gunicorn --bind=0.0.0.0:8000 --timeout=120 --workers=2 --threads=4 --worker-class=gthread app:app"
```

Alternatively, paste the contents of `startup.txt` into:
**Azure Portal → App Service → Configuration → General Settings → Startup Command**

### Step 3 — Set Application Settings (Optional Auth)

To enable Basic Auth, set these in Azure Portal:
**App Service → Configuration → Application Settings → + New application setting**

| Name | Value |
|---|---|
| `BASIC_AUTH_USER` | `your-chosen-username` |
| `BASIC_AUTH_PASSWORD` | `a-strong-password` |

Leave both unset to run without authentication (useful for internal tools behind a VPN).

```bash
# Or set via CLI:
az webapp config appsettings set \
  --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg \
  --settings BASIC_AUTH_USER="admin" BASIC_AUTH_PASSWORD="your-strong-password"
```

### Step 4 — Deploy the Code

**Option A: ZIP Deploy (simplest, no Git required)**

```bash
# From inside the prs-azure/ directory:
zip -r deploy.zip . -x "*.git*" -x "__pycache__/*" -x "*.pyc" -x "venv/*"

az webapp deployment source config-zip \
  --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg \
  --src deploy.zip
```

**Option B: Git Deploy**

```bash
# From inside the prs-azure/ directory:
git init
git add .
git commit -m "Initial deployment"

# Get the Git URL from Azure
az webapp deployment source config-local-git \
  --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg

# The command outputs a Git URL — add it as remote and push
git remote add azure <GIT-URL-FROM-ABOVE>
git push azure main
```

**Option C: GitHub Actions (CI/CD)**

1. Push `prs-azure/` to a GitHub repository
2. In Azure Portal: **App Service → Deployment Center → GitHub**
3. Authorise GitHub, select your repo and branch
4. Azure creates a GitHub Actions workflow automatically
5. Every push to `main` triggers a deployment

### Step 5 — Verify

```bash
# Check the app is running
curl https://<YOUR-APP-NAME>.azurewebsites.net/health
# Expected: {"status": "ok", "version": "1.5.0"}

# Open in browser
az webapp browse --name <YOUR-APP-NAME> --resource-group prs-builder-rg
```

---

## Custom Domain (Optional)

```bash
# Add a custom domain
az webapp config hostname add \
  --webapp-name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg \
  --hostname yourdomain.com

# Enable managed TLS certificate (free)
az webapp config ssl create \
  --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg \
  --hostname yourdomain.com

az webapp config ssl bind \
  --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg \
  --certificate-thumbprint <THUMBPRINT-FROM-ABOVE> \
  --ssl-type SNI
```

---

## Updating the App

When the HTML source (`index-mono.html`) is updated, regenerate `templates/app.html`:

```python
# Run this from the project root (where index-mono.html lives)
python3 build_template.py
```

Then redeploy using whichever method you chose in Step 4.

---

## Monitoring & Logs

```bash
# Stream live logs
az webapp log tail \
  --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg

# Download log archive
az webapp log download \
  --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg \
  --log-file logs.zip
```

In the Azure Portal, **Application Insights** can be enabled for free to get request counts, response times, and error tracking without any code changes.

---

## Scaling

The B1 plan (1 core, 1.75GB RAM) handles dozens of concurrent users easily since the app is stateless — each request just renders a template and returns it. To scale:

```bash
# Scale up (larger instance)
az appservice plan update \
  --name prs-builder-plan \
  --resource-group prs-builder-rg \
  --sku P1V3

# Scale out (more instances)
az webapp scale \
  --name <YOUR-APP-NAME> \
  --resource-group prs-builder-rg \
  --instance-count 3
```

---

## Teardown

```bash
# Delete everything (stops all billing)
az group delete --name prs-builder-rg --yes --no-wait
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| 503 on first load | Gunicorn not starting | Check startup command in Configuration → General Settings |
| `ModuleNotFoundError: flask` | requirements.txt not installed | Verify deploy.sh ran; check Kudu logs at `<app>.scm.azurewebsites.net` |
| 401 on every request | Auth configured but wrong credentials | Check `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` in App Settings |
| Blank page, JS errors | Template not regenerated after source update | Re-run `build_template.py` and redeploy |
| Slow cold start | Free F1 tier spins down after inactivity | Upgrade to B1 or enable **Always On** in Configuration → General Settings |

**Kudu console** (advanced diagnostics):
Navigate to `https://<YOUR-APP-NAME>.scm.azurewebsites.net` → Bash console to inspect the deployed files, run pip manually, and check error logs.

