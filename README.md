# Haven

A mobile-first, installable PWA for real estate agents to browse their listings.

## Run locally

Serve this folder from a local web server (for example, the **Live Server** extension in VS Code), then open the local URL in a browser. The service worker and install prompt require a secure context: HTTPS, or `localhost`.

## Deploy to GitHub Pages

Every push to `main` automatically publishes the site using GitHub Pages: [Open Haven](https://kirby456.github.io/haven-real-estate-listings/).

Open the HTTPS site on Android in Chrome, tap **Install app** or **Add to Home screen**, and confirm. On iPhone, open the site in Safari, tap **Share**, then **Add to Home Screen**.

## Publish changes

This folder is connected to the [GitHub repository](https://github.com/kirby456/haven-real-estate-listings). After changing the app, open a terminal here and run:

```powershell
git add .
git commit -m "Describe your changes"
git push
```

To set up another copy, clone the repository:

```powershell
git clone https://github.com/kirby456/haven-real-estate-listings.git
```

## Demo data

The initial properties are sample listings. New listings and saved-home changes are stored in that browser on that device. This version does not connect to a brokerage, MLS, or shared account, so it does not sync listing data between devices.
