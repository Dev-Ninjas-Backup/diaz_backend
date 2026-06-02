# Boat Share Link — Open Graph Preview

## The Problem

The Flutter app is a Single Page Application (SPA). When a user shares a boat link on Facebook, Facebook's crawler visits the URL and only sees the generic root HTML — it never runs JavaScript, so it never sees the actual boat data. The result is a blank or generic preview card with just the site name.

Other platforms like WhatsApp or Telegram may sometimes work because they cache older successful scrapes, but Facebook is strict and requires the metadata to be present in the initial HTML response from the server.

---

## The Solution

`GET /share/boat/:id` acts as a smart intermediary that inspects the `User-Agent` header of every incoming request:

```
[ Shared Link: api.floridayachttrader.com/share/boat/:id ]
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
  Social Media Crawler             Real User on Mobile
  Returns OG HTML page             302 Redirect
  with boat name, image,                 │
  price, and description                 ▼
                               share.floridayachttrader.com
                               Firebase intercepts →
                               Flutter app opens on
                               boat detail screen
```

### Crawler request (Facebook, Twitter, WhatsApp, Telegram)

The route fetches the boat from the database and returns a minimal HTML page containing the boat-specific Open Graph (`og:*`) and Twitter Card meta tags. The platform reads those tags and builds a rich preview card.

Detected crawlers (by `User-Agent`):

| User-Agent string | Platform |
|---|---|
| `facebookexternalhit` | Facebook (main crawler) |
| `Facebot` | Facebook (secondary/mobile crawler) |
| `Twitterbot` | Twitter / X |
| `WhatsApp` | WhatsApp |
| `Telegram` | Telegram |

### Real user request

The route issues a `302` redirect to the FYT deep-link domain (`FYT_DEEP_LINK_BASE_URL`). iOS and Android intercept this domain via Firebase Hosting and open the Flutter app directly on the correct boat detail screen.

---

## OG Tags Served to Crawlers

| Tag | Value |
|---|---|
| `og:type` | `website` |
| `og:title` | `{boat.name} \| Florida Yacht Trader` |
| `og:description` | `{year} {make} {model} — {length}ft \| Price: ${price}` |
| `og:image` | Cover image URL (falls back to `/public/default-preview.jpg`) |
| `og:url` | `{BASE_URL}/share/boat/{boatId}` |
| `twitter:card` | `summary_large_image` |

---

## Environment Variables

| Variable | Example value | Purpose |
|---|---|---|
| `BASE_URL` | `https://api.floridayachttrader.com` | Canonical OG URL and default image base |
| `FYT_DEEP_LINK_BASE_URL` | `https://share.floridayachttrader.com` | Deep-link redirect target for real users |

---

## Flutter Integration

The Flutter app must generate share URLs pointing to this backend endpoint — **not** to the Firebase hosting domain directly.

```dart
final String shareUrl = "https://api.floridayachttrader.com/share/boat/${boat.id}";
Share.share('Check out this listing on Florida Yacht Trader: $shareUrl');
```

---

## Forcing Facebook to Refresh Its Cache

Facebook caches link previews for up to 30 days. After deploying changes:

1. Go to the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Paste the boat share URL
3. Click **Debug**
4. Click **Scrape Again**

This clears the cache and forces Facebook to pick up the new Open Graph tags.

---

## File Location

```
src/redirect/share.controller.ts
```
