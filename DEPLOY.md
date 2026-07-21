# Deploying to a self-hosted VPS (e.g. Sakura VPS)

This app has no Vercel-specific dependencies — it's a standard Next.js app that runs anywhere
Node.js runs. This guide assumes an Ubuntu 22.04/24.04 VPS with root or sudo access and a domain
name already pointed at the server's IP address (an A/AAAA record). Commands are for Ubuntu/Debian;
substitute your package manager on other distros (Sakura VPS also offers Rocky Linux/AlmaLinux —
use `dnf` instead of `apt` there).

Database (Neon) and email (Resend) are unaffected by where the app is hosted — no changes needed
there.

## 1. Server prerequisites

SSH into the VPS, then:

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 22 LTS (Next.js 16 requires Node >= 20.9)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# PM2, to keep the app running and restart it on crash/reboot
sudo npm install -g pm2

# certbot, for a free Let's Encrypt SSL certificate
sudo apt install -y certbot python3-certbot-nginx
```

## 2. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # opens 80 + 443
sudo ufw enable
```

If Sakura's control panel has its own packet filter, also open 80/443 there — the VPS-level
firewall alone won't be enough if Sakura's edge filter blocks it.

## 3. Get the code onto the server

The repository is private, so the VPS needs its own credentials to clone it — generate a key
**on the VPS** (don't reuse a key from your laptop) and register it as a read-only [deploy
key](https://github.com/hisashimurakami1022/IWSO2027/settings/keys) on the GitHub repo:

```bash
ssh-keygen -t ed25519 -C "iwso-vps" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Copy the printed public key, then on GitHub go to the repo → **Settings → Deploy keys → Add deploy
key**, paste it in, and leave "Allow write access" unchecked (read-only is enough for deployment).

Then:

```bash
ssh -T git@github.com   # first connection: type "yes" to trust GitHub's host key
sudo mkdir -p /var/www/iwso
sudo chown $USER:$USER /var/www/iwso
git clone git@github.com:hisashimurakami1022/IWSO2027.git /var/www/iwso
cd /var/www/iwso
```

For updates later, `git pull` in this directory and re-run steps 4 and 6.

## 4. Install and build

```bash
npm install   # also runs `prisma generate` via postinstall
cp .env.example .env
nano .env   # fill in real values — see below
npm run build
```

### Low-memory VPS (≤1GB RAM)

On a ~1GB-RAM plan (a common Sakura VPS entry tier), `next build` can crash with `JavaScript heap
out of memory`, because V8 sizes its default heap based on physical RAM and doesn't account for
swap. Two things fix this:

1. Add swap if you don't already have a few GB of it:
   ```bash
   sudo fallocate -l 3G /swapfile2
   sudo chmod 600 /swapfile2
   sudo mkswap /swapfile2
   sudo swapon /swapfile2
   echo '/swapfile2 none swap sw 0 0' | sudo tee -a /etc/fstab
   ```
2. The `build` script already sets `NODE_OPTIONS=--max-old-space-size=3072` (via `cross-env`) so
   V8 is explicitly allowed to grow into that swap — this is already handled, just make sure step
   1's swap is in place first.

### `.env` values for production

- `DATABASE_URL` — your Neon connection string (same one used in development).
- `AUTH_SECRET` — generate a fresh one for production, don't reuse the dev value:
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `AUTH_URL` / `NEXT_PUBLIC_APP_URL` — `https://your-domain.example`
- `AUTH_RESEND_KEY` / `EMAIL_FROM` — your Resend API key and a verified sending address
  (see the main README for the Resend domain-verification note).

## 5. Apply database migrations and seed

Only needed once (or after schema changes):

```bash
npx prisma migrate deploy
npx prisma db seed   # only on first deploy — edit prisma/seed.ts first if the chair email should differ
```

## 6. Start the app with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # prints a command to run once so PM2 restarts the app after a server reboot — run it
```

Check it's up: `curl http://127.0.0.1:3000` should return HTML, and `pm2 logs iwso-submission-system`
should show `Ready` with no errors.

## 7. nginx + SSL

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/iwso
sudo nano /etc/nginx/sites-available/iwso   # replace your-domain.example
sudo ln -s /etc/nginx/sites-available/iwso /etc/nginx/sites-enabled/
sudo nginx -t   # check syntax
sudo systemctl reload nginx

sudo certbot --nginx -d your-domain.example
```

Certbot will edit the nginx config to add the SSL certificate paths and set up auto-renewal.
Visit `https://your-domain.example` to confirm it's live.

## 8. Redeploying after changes

```bash
cd /var/www/iwso
git pull
npm install
npx prisma migrate deploy   # only if the schema changed
npm run build
pm2 restart iwso-submission-system
```

## Notes

- `ecosystem.config.js` runs a single instance in fork mode, which is enough for this
  conference's scale (100-500 submissions). If you ever need multiple instances behind nginx
  load balancing, see the "Multi-Server Deployments" section of the Next.js self-hosting docs —
  it requires a shared `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` across instances.
- PM2 log files default to `~/.pm2/logs/`; use `pm2 logs` to tail them live.
- To view Prisma data directly on the server, run `npx prisma studio` and either port-forward over
  SSH (`ssh -L 5555:localhost:5555 user@server`) or temporarily open the port — don't expose
  Prisma Studio to the public internet.
