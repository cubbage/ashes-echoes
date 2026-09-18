# Ayesha Interview Prep Dashboard

A quiet, local-first interview practice workspace for Ayesha. It starts with confirmed CV and Caprae/SDR preparation material, and it does not send dashboard data to a server.

## Run locally

1. Install dependencies: `npm install`
2. Start the app: `npm run dev`
3. Open the local address Vite prints (normally `http://localhost:5173`).

## How the ChatGPT bridge works

1. Open **ChatGPT bridge**, paste the job material, and select **Copy complete ChatGPT prompt**.
2. Paste it into a new ChatGPT conversation on the free tier.
3. Paste ChatGPT's JSON reply into the dashboard, review the counts, then import it.

The generated prompt includes the dashboard schema, Ayesha's selected target, approved evidence cards, and instructions to mark unverified research rather than state it as fact. It also links to the public [agent context page](/agent-context.html), which gives ChatGPT durable instructions and suggested future-bridge questions without putting the entire dashboard into every handoff. ChatGPT has no ongoing connection to this app; every handoff is a deliberate copy/paste.

## Backup and deployment

Use **Backups → Download backup** after meaningful work and before using a second device. Browser storage is device- and browser-specific.

For free hosting, put this project in a **private** repository under `cubbage`, then connect it to Cloudflare Pages. Configure build command `npm run build` and output directory `dist`. The deployment is a static app; do not commit exported backups or private material. A private GitHub repository controls source access but does not by itself password-protect the published page, so exported local data remains the privacy boundary.
