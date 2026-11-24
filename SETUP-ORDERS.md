# Orders admin — one-time setup (5 minutes)

Everything is built and the database is ready. Three small steps connect it to you.

## 1. Create your staff account
Open **https://gidigba-studios.vercel.app/admin.html**
Click **"Create your staff account"**, enter your email and a password (8+ characters).

You'll get one email from Supabase titled *Confirm your email address* — click the link,
then sign in on the same page.

## 2. Tell the database you're staff
In Supabase → **SQL Editor**, run this with **your** email:

```sql
insert into public.admins (email) values ('your-email@example.com')
  on conflict do nothing;
```

Until this is done, signing in works but the order list stays empty — that is the
security working, not a bug.

## 3. That's it
Reload `/admin.html`. Orders from the website appear as clients send them.

---

## Photos in the message

The message used to list file names — nothing to tap. Now each photo is uploaded
before the message opens, and the message carries a real link per photo:

```
*PHOTOS*
1. Selfie
https://…/client-photos/GS-261124-TJWG/9f2c….webp
2. Full body
https://…/client-photos/GS-261124-TJWG/7b41….webp
```

These open straight in WhatsApp, so you can see the photo and save it without asking
the client to re-send. The same photos appear as thumbnails on the order card in the
admin page — tap one to open it full size, then hold to save.

If a slow connection stops an upload, that line says "not uploaded — ask the client to
send it" rather than showing a dead link, and the order still goes through.

**On the photo privacy:** the bucket cannot be listed, so nobody can browse other
clients' photos. Each file sits at a random address only that client's message contains.
Deleting photos is blocked except for a signed-in admin.

## What each client sends

From now on the booking form asks for **name** and **WhatsApp number**, both required.
Every order gets a number like `GS-261124-A3KP`, which appears:

- on the review screen before they send
- in the WhatsApp message they send you, twice
- on the admin page, against their order

## Where things live

| File | What it does |
|---|---|
| `admin.html` + `js/admin.js` | the orders page |
| `js/db.js` | talks to Supabase |
| `js/db-config.js` | project URL + publishable key |
| `supabase/schema.sql` | the tables (already applied) |

## Safety

- The key in `db-config.js` is the **publishable** key. It can create an order and
  nothing else. The secret key is never in the website.
- Anyone can read the page's source; nobody can read your orders without signing in.
  Tested: an anonymous request for the order list returns an empty array.
- `admin.html` is blocked in `robots.txt` so it never appears in Google.
- Adding a second staff member later is one line: another `insert into public.admins`.

## If something looks wrong

- **Sign-in says "Wrong email or password"** — account not created yet, or the email
  link wasn't clicked.
- **Signed in but no orders** — step 2 hasn't been run for your email.
- **Orders not appearing at all** — check in Supabase → Table Editor → `orders`.
  If they're there, the issue is permissions (step 2). If not, the client's send failed
  and their phone is holding it to retry.
