// PM2 process manager config for self-hosting (e.g. Sakura VPS).
// See DEPLOY.md for full setup instructions.
//
// Usage:
//   pm2 start ecosystem.config.js
//   pm2 save
//   pm2 startup   (follow the printed instructions once, so PM2 survives reboots)

module.exports = {
  apps: [
    {
      name: "iwso-submission-system",
      script: "node_modules/next/dist/bin/next",
      // Port 3001: pick a port that isn't already used by another app on the
      // same VPS (check with `pm2 status` / `sudo ss -ltnp` before deploying).
      args: "start -p 3001",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "512M",
      autorestart: true,
    },
  ],
};
