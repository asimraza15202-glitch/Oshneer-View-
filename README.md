# Oshneer View Guest House website

## Run
    npm install
    cp .env.example .env     # then fill in SMTP_PASS (Gmail App Password) and ADMIN_TOKEN
    npm start                # http://localhost:3000
Test without sending email: `MAIL_DRY_RUN=1 npm start` (requests print in the terminal).

## Edit content (no rebuild)
Everything lives in `js/config.js`: phones, email, room names/prices, photos, gallery,
social links, map, guest photo/quotes. Replace images in `assets/img/`.

## Before going live
1. Facebook URL: paste it into `social.facebook.url` (icon is hidden while empty).
2. Map: Google Maps > Share > Embed a map, paste the src into `map.embedUrl`; paste your share link into `map.directionsUrl`.
3. Host portraits: set `photo` for each host in `hosts`.
4. Room photos for Room 03 / Premium Room: set `image` in `rooms`.
5. In `index.html` replace `https://www.example.com/` (canonical + og:image) with your real domain.
6. Deploy `server.js` on any Node host (Render, Railway, a VPS). A static-only host cannot send the booking email.
7. Gmail needs 2-Step Verification + an App Password; never commit `.env`.

## Bookings database
Every booking request is saved to `data/bookings.db` (SQLite, Node 22.5+; older Node uses `data/bookings.json`)
BEFORE the email is sent, so nothing is lost if email fails. Unsent ones are retried every 10 minutes.
Emails go to `BOOKING_TO` in `.env` (default razimonthebeat@gmail.com; comma-separate for more).
Download everything: `https://YOUR-SITE/admin/bookings.csv?token=YOUR_ADMIN_TOKEN` (opens in Excel).
Back up the `data/` folder. On free hosts that reset their disk (e.g. Render free), the database is wiped on redeploy,
so use a host with a persistent disk, or download the CSV regularly.
