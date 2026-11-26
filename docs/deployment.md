# Deployment

How to put the AfraaWorld invoice app on a live server. Pick the option that matches your hosting:

| Option | Use it when | Effort |
|---|---|---|
| [A. Shared hosting with SSH](#a-shared-hosting-with-ssh) | Hostinger Premium/Business, cPanel hosts with Terminal | Low |
| [B. Shared hosting without SSH](#b-shared-hosting-without-ssh) | Only File Manager / FTP is available | Medium |
| [C. VPS](#c-vps-ubuntu--nginx) | You have your own Ubuntu server (Hostinger VPS, DigitalOcean, etc.) | Medium |
| [D. Managed Laravel platforms](#d-managed-laravel-platforms) | Laravel Forge, Laravel Cloud, Ploi | Low, paid |

Every option shares the same [requirements](#1-requirements), [production `.env`](#2-production-env)
and [first-run steps](#3-first-run-steps). Read those first.

The examples use `invoice.afraaworld.com`. Replace it with your own domain or subdomain.

---

## 1. Requirements

- **PHP 8.3 or newer.** Laravel 13 will not run on older versions.
- **PHP extensions:** `ctype`, `curl`, `dom`, `fileinfo`, `filter`, `gd`, `mbstring`, `openssl`,
  `pdo_mysql`, `session`, `tokenizer`, `xml`. `dom`, `mbstring` and `gd` are needed for PDF
  invoices; `fileinfo` is needed for the company logo.
- **MySQL 8 / MariaDB 10.6+.** SQLite works too, but MySQL is recommended on a live server.
- **Composer 2.**
- **Node.js 20+**, only where you build the front end. Shared hosting has no Node, so you build on
  your own PC and upload the result (see [Building the front end](#building-the-front-end)).
- **HTTPS.** Passkeys and secure session cookies do not work over plain `http`.

### What is not in Git

These are in `.gitignore`, so a `git clone` on the server will not have them:

| Path | How it gets to the server |
|---|---|
| `vendor/` | `composer install` on the server (or upload it, Option B) |
| `public/build/` | `npm run build`, then upload it |
| `.env` | Create it on the server, never commit it |
| `public/storage` | `php artisan storage:link` |

> **Never upload `public/hot`.** It exists only while `npm run dev` is running. If it is on the
> server, the site tries to load scripts from your PC and shows a blank page.

### Building the front end

```bash
npm ci
npm run build
```

This creates `public/build/`. Two things to know:

- The build also runs `php artisan wayfinder:generate` (the Wayfinder Vite plugin), so the machine
  you build on needs PHP and `composer install` done.
- `VITE_APP_NAME` (the browser tab title) is baked into the build. Make sure `APP_NAME` in the
  `.env` of the machine you build on matches the live site, otherwise rebuild.

---

## 2. Production `.env`

Start from `.env.example` and change these values. Everything not listed can stay as it is.

```env
APP_NAME=AfraaWorld
APP_ENV=production
APP_DEBUG=false
APP_URL=https://invoice.afraaworld.com
APP_TIMEZONE=Asia/Dhaka

LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

SESSION_DRIVER=database
SESSION_DOMAIN=invoice.afraaworld.com
SESSION_SECURE_COOKIE=true

MAIL_MAILER=smtp
MAIL_SCHEME=smtps
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=noreply@afraaworld.com
MAIL_PASSWORD=your_mailbox_password
MAIL_FROM_ADDRESS="noreply@afraaworld.com"
MAIL_FROM_NAME="${APP_NAME}"

# Only while creating the admin account, then remove (see First-run steps)
ADMIN_NAME="Your Name"
ADMIN_EMAIL=you@afraaworld.com
ADMIN_PASSWORD="a-strong-password"
```

Notes on the important values:

- **`APP_DEBUG=false`** always on a live site. With `true`, error pages show your `.env` values,
  including the database password.
- **`APP_URL`** must be exactly the address people type, with `https://` and no trailing slash.
  Passkeys take their domain from it (`config/fortify.php`). If you use `www.`, pick either
  `www.example.com` or `example.com` and redirect the other one to it.
- **`APP_TIMEZONE=Asia/Dhaka`** controls when invoices become overdue and what "paid this month"
  means on the dashboard. Set it **before** entering real data: changing it later does not convert
  existing timestamps.
- **`SESSION_DOMAIN`** is the host name only, no `https://`.
- **Mail** is used for password reset emails. The values above are for a Hostinger mailbox; other
  hosts give their own SMTP host and port. If mail is not set up yet, `MAIL_MAILER=log` writes
  emails to `storage/logs/laravel.log` instead of sending them.
- **`QUEUE_CONNECTION=database`** can stay. The app does not queue any jobs today, so no queue
  worker is needed.

---

## 3. First-run steps

Run these once, from the project folder on the server, after the code and `.env` are in place.
Option B explains how to run them without SSH.

```bash
php artisan key:generate                                  # sets APP_KEY in .env
php artisan migrate --force                               # creates the tables
php artisan config:clear                                  # so the seeder sees the ADMIN_* values
php artisan db:seed --class=AdminUserSeeder --force       # creates the admin account
php artisan storage:link                                  # makes the uploaded logo public
```

Then:

1. **Remove `ADMIN_PASSWORD` from `.env`** so the password does not stay on the server.
2. Cache everything for speed:
   ```bash
   php artisan optimize
   ```
3. Log in at your `APP_URL`, go to **Settings**, and turn on **2FA** or add a **passkey**.
4. Fill in **Settings → Company** (name, address, logo). These appear on every invoice.

About the admin seeder (`database/seeders/AdminUserSeeder.php`):

- It creates the admin, or **updates** the existing one with the same email. Running it again
  resets that admin's password to `ADMIN_PASSWORD`. It is also how to recover a forgotten admin
  password.
- To add a second admin, set a different `ADMIN_EMAIL` and run it again.
- `php artisan db:seed` (without `--class`) runs this seeder too, so don't run it casually.
- Passkeys registered on `localhost` do not work on the live domain. Register them again.

> **Never run `migrate:fresh`, `migrate:refresh` or `migrate:reset` on the live server.** They
> delete all clients, invoices and payments.

---

## A. Shared hosting with SSH

Hostinger Premium/Business and most cPanel hosts. The steps use Hostinger's folder layout
(`~/domains/<domain>/public_html`). On cPanel the web folder is `~/public_html` and subdomains
usually get their own folder in your home directory.

### A1. Prepare the hosting panel

1. **PHP version:** set PHP 8.3+ for the domain (Hostinger: *Advanced → PHP Configuration*;
   cPanel: *MultiPHP Manager*). Check the extensions listed in [Requirements](#1-requirements) are
   enabled.
2. **Subdomain** (if you use one): create it, for example `invoice`.
3. **Database:** create a MySQL database and user, and give the user all privileges on it. Note the
   full names, which usually have a prefix like `u123456789_`.
4. **SSH:** enable it and note host, port (Hostinger uses `65002`) and username.
5. **SSL:** install the free certificate for the domain or subdomain.
6. **Mailbox:** create `noreply@yourdomain` if you want password reset emails to work.

### A2. Get the code onto the server

```bash
ssh -p 65002 u123456789@your-server-ip
cd ~/domains/afraaworld.com
git clone https://github.com/sumonislam-dev/afraaworld-invoice.git invoice-app
cd invoice-app
composer install --no-dev --optimize-autoloader
```

The app goes in a folder **outside** `public_html`, so `.env`, logs and source code can never be
downloaded from a browser. If the repository is private, Git asks for a login: use your GitHub
username and a personal access token as the password.

### A3. Upload the front end

Build on your PC ([Building the front end](#building-the-front-end)), then upload the
`public/build/` folder to `invoice-app/public/build/` on the server, with the panel's File Manager
(upload a zip, then extract) or with FTP.

### A4. Point the web folder at Laravel's `public` folder

Only `invoice-app/public` may be reachable from the web. Choose one way:

**Symlink (Hostinger, most hosts):**

```bash
# Subdomain
rm -rf ~/domains/afraaworld.com/public_html/invoice
ln -s ~/domains/afraaworld.com/invoice-app/public ~/domains/afraaworld.com/public_html/invoice

# Or the main domain
mv ~/domains/afraaworld.com/public_html ~/domains/afraaworld.com/public_html_old
ln -s ~/domains/afraaworld.com/invoice-app/public ~/domains/afraaworld.com/public_html
```

**Document root setting (cPanel):** in *Domains*, set the domain's or subdomain's document root to
`invoice-app/public`. No symlink needed.

If neither works, ask the host's support to set the document root to the `public` folder. Do not
put the whole project inside `public_html`.

### A5. `.env` and first run

```bash
cp .env.example .env
nano .env        # fill in the values from section 2
```

Then follow [First-run steps](#3-first-run-steps).

### A6. File permissions

Usually correct already on shared hosting. If you see "Permission denied" errors in the browser:

```bash
chmod -R 775 storage bootstrap/cache
```

---

## B. Shared hosting without SSH

For plans with only File Manager / FTP (for example Hostinger Single). It works, but every update
means uploading files by hand. If you can, upgrade to a plan with SSH.

### B1. Build a complete package on your PC

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

Zip the whole project **except** `node_modules/`, `.git/`, `.env`, `public/hot` and
`public/storage`. The zip must include `vendor/` and `public/build/`.

After zipping, run `composer install` again locally to get your dev tools back.

### B2. Upload and set up folders

1. Prepare the panel as in [A1](#a1-prepare-the-hosting-panel).
2. Upload the zip to a folder **next to** `public_html` (for example
   `domains/afraaworld.com/invoice-app`) and extract it.
3. Point the web folder at `invoice-app/public`. Without SSH you can't create a symlink yourself,
   so set the document root in the panel or ask support. As a last resort, see
   [B5](#b5-if-the-document-root-cannot-be-changed).
4. In File Manager, copy `.env.example` to `.env` and edit it with the values from
   [section 2](#2-production-env). For `APP_KEY`, run `php artisan key:generate --show` on your PC
   and paste the value it prints.

### B3. Run artisan commands with a cron job

Most hosts let you add cron jobs from the panel, and a cron job can run artisan once:

1. Add a cron job that runs every minute:
   ```
   cd /home/u123456789/domains/afraaworld.com/invoice-app && php artisan migrate --force >> storage/logs/cron.log 2>&1
   ```
2. Wait a minute, check `storage/logs/cron.log` in File Manager, then **delete the cron job**.
3. Repeat for each command in [First-run steps](#3-first-run-steps) (`config:clear`,
   `db:seed --class=AdminUserSeeder --force`, `storage:link`, `optimize`).

Some hosts need the full PHP path instead of `php`, for example
`/usr/bin/php8.3` or `/opt/alt/php83/usr/bin/php`. The panel's cron page usually shows it.

### B4. Updating without SSH

1. Build a new package (B1), upload and extract it over the old files. Do not overwrite `.env` or
   `storage/`.
2. Run `migrate --force` and `optimize` with a one-time cron job (B3).

### B5. If the document root cannot be changed

Put the project in `public_html/invoice-app` and add this `public_html/.htaccess`:

```apache
RewriteEngine On
RewriteRule ^(.*)$ invoice-app/public/$1 [L]
```

Then confirm in a browser that `https://yourdomain/invoice-app/.env` does **not** download. If it
does, stop and ask the host to change the document root instead: your database password would be
public.

---

## C. VPS (Ubuntu + Nginx)

For a server you control, tested layout: Ubuntu 24.04, Nginx, PHP-FPM 8.3, MySQL 8.

### C1. Install the software

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server git unzip \
  php8.3-fpm php8.3-cli php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl \
  php8.3-gd php8.3-zip php8.3-bcmath php8.3-intl

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Node.js 22 (to build the front end on the server)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

If PHP 8.3 is not in your Ubuntu version's packages, add the `ppa:ondrej/php` repository first.

### C2. Database

```bash
sudo mysql
```

```sql
CREATE DATABASE invoice_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'invoice_app'@'localhost' IDENTIFIED BY 'a-strong-password';
GRANT ALL PRIVILEGES ON invoice_app.* TO 'invoice_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### C3. Code

```bash
sudo mkdir -p /var/www/invoice-app
sudo chown $USER:www-data /var/www/invoice-app
git clone https://github.com/sumonislam-dev/afraaworld-invoice.git /var/www/invoice-app
cd /var/www/invoice-app

composer install --no-dev --optimize-autoloader
cp .env.example .env
nano .env                     # values from section 2, DB_* from C2
npm ci && npm run build

sudo chown -R $USER:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

Then follow [First-run steps](#3-first-run-steps).

### C4. Nginx

`/etc/nginx/sites-available/invoice-app`:

```nginx
server {
    listen 80;
    server_name invoice.afraaworld.com;
    root /var/www/invoice-app/public;

    index index.php;
    charset utf-8;
    client_max_body_size 10M;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ ^/index\.php(/|$) {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/invoice-app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### C5. HTTPS and firewall

Point the domain's DNS `A` record at the server's IP first, then:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d invoice.afraaworld.com

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Certbot renews the certificate automatically.

### C6. Deploy script for updates

Save as `/var/www/invoice-app/deploy.sh` (it is not in the repository) and run it after each push:

```bash
#!/usr/bin/env bash
set -e
cd /var/www/invoice-app

php artisan down
git pull --ff-only
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan optimize
sudo systemctl reload php8.3-fpm
php artisan up
```

```bash
chmod +x deploy.sh
```

---

## D. Managed Laravel platforms

Laravel Forge, Ploi and similar services set up a VPS for you (Nginx, PHP, MySQL, SSL, deploy
script). Laravel Cloud hosts the app without a server to manage. They cost a monthly fee on top of
the server.

What to set for this app:

- **Repository:** `sumonislam-dev/afraaworld-invoice`, branch `main`.
- **Web directory:** `/public`.
- **PHP:** 8.3 or newer.
- **Environment:** the values from [section 2](#2-production-env). The platform usually fills in
  the `DB_*` values for a database it creates.
- **Deploy script:** include `npm ci && npm run build` (the default scripts sometimes skip it) and
  `php artisan migrate --force`.
- **Storage:** run `php artisan storage:link` once. On Laravel Cloud, files on local disk may not
  survive redeploys; check their docs on persistent storage for the company logo.
- **First-run steps:** run the seeder from [section 3](#3-first-run-steps) once from the
  platform's command runner.

The repository has no Dockerfile. Laravel Sail (in `require-dev`) is for local development only and
is not a production setup.

---

## 4. Updating a live site

Back up the database first (see [Backups](#5-backups)). Then:

| Option | Steps |
|---|---|
| A (SSH) | Build on your PC and upload `public/build/`, then on the server: `git pull`, `composer install --no-dev --optimize-autoloader`, `php artisan migrate --force`, `php artisan optimize` |
| B (no SSH) | See [B4](#b4-updating-without-ssh) |
| C (VPS) | `./deploy.sh` |
| D (managed) | Push to `main`, or click Deploy |

If something breaks after an update: `php artisan optimize:clear` clears every cache, which fixes
most problems caused by an old cached config or route.

---

## 5. Backups

The database holds all clients, invoices and payments. Losing it is the worst thing that can
happen to this app.

- **Shared hosting:** turn on the host's automatic backups, and also export the database from
  phpMyAdmin (*Export → Quick → SQL*) regularly, for example monthly, and keep a copy off the
  server.
- **VPS:** a nightly cron job:
  ```bash
  mkdir -p ~/backups
  crontab -e
  ```
  ```
  0 2 * * * mysqldump --single-transaction -u invoice_app -p'a-strong-password' invoice_app | gzip > ~/backups/invoice-$(date +\%F).sql.gz && find ~/backups -name 'invoice-*.sql.gz' -mtime +30 -delete
  ```
  Copy the files off the server from time to time.
- Also back up **`.env`** (it has `APP_KEY`) and **`storage/app/public`** (the company logo).
  Without the original `APP_KEY`, existing 2FA secrets can't be decrypted and users must set 2FA
  up again.

Test a restore at least once.

---

## 6. Security checklist

- [ ] `APP_ENV=production` and `APP_DEBUG=false`
- [ ] The web root is `public/`, not the project folder. `https://yourdomain/.env` returns 404.
- [ ] HTTPS works, and `http://` redirects to `https://`
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] `ADMIN_PASSWORD` removed from `.env` after seeding
- [ ] Admin has 2FA or a passkey turned on
- [ ] Database user has access to this app's database only
- [ ] `public/hot` does not exist on the server
- [ ] Database backups are running and a restore has been tested

---

## 7. Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| **500 Server Error** | Read `storage/logs/laravel.log`. Common causes: wrong `DB_*` values, empty `APP_KEY`, PHP older than 8.3, or `storage/` not writable. |
| **Blank white page** | `public/build/` is missing (upload it), or `public/hot` was uploaded (delete it). |
| **Page title shows "Laravel"** | The front end was built with a different `APP_NAME`. Fix `.env` on the build machine and rebuild. |
| **`.env` changes have no effect** | The config is cached. Run `php artisan config:clear`, then `php artisan optimize`. |
| **Logo missing on pages** | Run `php artisan storage:link`. |
| **Logo missing in PDF** | The `gd` or `fileinfo` PHP extension is off. Enable it in the PHP settings. |
| **419 Page Expired on login** | `SESSION_DOMAIN` doesn't match the address, or the site is opened on `http` while `SESSION_SECURE_COOKIE=true`. |
| **Passkey login fails** | `APP_URL` doesn't match the address in the browser exactly (`www` vs no `www`, `http` vs `https`). Passkeys from `localhost` must be registered again. |
| **Overdue dates are off by a few hours** | `APP_TIMEZONE` is not `Asia/Dhaka`. Set it, then `php artisan config:cache`. |
| **Password reset email never arrives** | Check the `MAIL_*` values. With `MAIL_MAILER=log`, emails go to `storage/logs/laravel.log`. |
| **"Permission denied" in the log** | Run `chmod -R 775 storage bootstrap/cache` (on a VPS also `chown -R $USER:www-data` on those folders). |
| **404 on every page except the home page** | Apache `mod_rewrite` / `.htaccess` is not active, or on Nginx the `try_files` line is missing. |
