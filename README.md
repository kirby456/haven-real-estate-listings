# Haven

A mobile-first, installable PWA for real estate agents to browse their listings.

## Run locally

Serve this folder from a local web server (for example, the **Live Server** extension in VS Code), then open the local URL in a browser. The service worker and install prompt require a secure context: HTTPS, or `localhost`.

## Deploy to GitHub Pages

Every push to `main` automatically publishes the site using GitHub Pages. After the first deployment, visit the repository's **Settings → Pages** to find its URL.

Open the HTTPS site on Android in Chrome, tap **Install app** or **Add to Home screen**, and confirm. On iPhone, open the site in Safari, tap **Share**, then **Add to Home Screen**.

## Link this folder to GitHub

With Git installed, open a terminal in this folder and run:

```powershell
git init -b main
git add .
git commit -m "Add Haven mobile listings PWA"
git remote add origin https://github.com/kirby456/haven-real-estate-listings.git
git push -u origin main
```

Sign in to GitHub if Git Credential Manager prompts you.

## Demo data

The initial properties are sample listings. New listings and saved-home changes are stored in that browser on that device. This version does not connect to a brokerage, MLS, or shared account, so it does not sync listing data between devices.
