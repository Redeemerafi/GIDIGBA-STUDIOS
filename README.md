# GIDIGBA STUDIOS

Static single-page website for GIDIGBA STUDIOS.

## Files

- `index.html` — main SPA layout and content.
- `styles.css` — site styling using the brand palette.
- `script.js` — SPA navigation, package selection, custom service flow, upload form, and WhatsApp review.

## How to use

1. Open `index.html` in a browser.
2. Select a package or custom edit service.
3. Complete the upload details section.
4. Review and submit to open WhatsApp with a pre-filled order message.

## Notes

- The site uses the brand colours and content from the provided GIDIGBA STUDIOS reference.
- WhatsApp messages open with the business number `+233 53 431 7611`.
- Images are loaded from ImgBB links provided in the reference.

## Backend support

- A local Express backend is included in `server.js`.
- File uploads are sent to `/api/upload` and forwarded to ImgBB.
- Use `.env` to provide `IMGBB_API_KEY` before running locally.

## Local development

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `IMGBB_API_KEY`.
3. Start the backend and site: `npm run dev`
4. Open `http://localhost:3000` in your browser.

## Vercel deployment

- This repository includes `vercel.json` for static hosting and the upload API route.
- Deploy with Vercel and set `IMGBB_API_KEY` as a project environment variable.
