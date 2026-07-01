# Motion Vault — starter app

A no-build, plain HTML/CSS/JS preset catalog app (like your reference screenshots). No Node.js, no npm install, nothing that will strain a 4GB/i3 machine.

## 1. Open it (no coding needed to see it work)

1. Install **VS Code** (you likely have this already).
2. Install the **Live Server** extension (search it in the Extensions panel — it's ~1MB, very light).
3. Open this folder in VS Code: File → Open Folder → `am-preset-app`.
4. Right-click `index.html` → **"Open with Live Server"**.
5. Your browser opens the app with the 5 sample presets already in it.

That's it — no terminal commands, no build step, no waiting on a slow machine.

## 2. Add your real presets

Open `presets.json` in VS Code. Each preset is one block like this:

```json
{
  "id": "unique-id-no-spaces",
  "title": "Preset Name",
  "author": "Creator Name",
  "category": "video",       // must be: video | shake | text | color
  "thumbnail": "https://link-to-image.jpg",
  "xmlUrl": "https://link-to-your-xml-file",
  "directLink": "https://alight.link/xxxxx"
}
```

Copy/paste a block, edit the values, save. Refresh the browser — done. You don't need to touch any other file to add content.

### Where the links come from
- **thumbnail**: upload a screenshot/preview image anywhere public (GitHub, imgbb, Google Drive with "anyone with link") and paste the direct image URL.
- **xmlUrl**: export the preset's XML from Alight Motion, upload it (GitHub repo works well — use the "raw" link), paste it here.
- **directLink**: inside Alight Motion, use the project's built-in **Share** feature — it generates an `alight.link` URL automatically. Paste that.

Leave any field as `""` if you don't have it yet — the app will just gray out that button instead of breaking.

## 3. Put it online for free (so it's a real website, not just local)

Pick one — both are free, both take under 10 minutes, no terminal required:

**Netlify (easiest):**
1. Go to netlify.com → sign up free.
2. Drag your whole `am-preset-app` folder onto the Netlify dashboard.
3. You get a live URL instantly (e.g. `motion-vault.netlify.app`).

**GitHub Pages:**
1. Create a free GitHub account + a new repository.
2. Upload all these files (GitHub's website lets you drag-and-drop, no git commands needed).
3. Repo Settings → Pages → set source to the main branch → you get a live URL.

## 4. Turn it into an Android app (still free, still no coding)

1. Once your site has a live URL (from step 3), go to **pwabuilder.com**.
2. Paste your URL, click "Start."
3. It scans your `manifest.json` and `sw.js` (already included here) and shows a green checklist.
4. Click **"Package for Stores" → Android** → download the `.apk`/`.aab`.
5. Install the `.apk` directly on your phone to test, or upload the `.aab` to Google Play Console later if you want it listed publicly.

## 5. Later, when you have lots of presets

Editing `presets.json` by hand gets tedious past ~30–40 entries. At that point, swap `presets.json` for a **published Google Sheet** (Google Sheets → Publish to web → CSV/JSON via a free service like sheet.best or opensheet.elk.sh). Only one line changes in `app.js`:

```js
const DATA_SOURCE = "presets.json";   // change this to your sheet's JSON URL
```

Everything else keeps working exactly the same.

## Performance note for your laptop

This project has zero dependencies to install and no compiling — Live Server just serves static files, which uses barely any RAM. If VS Code itself feels heavy, you can also just double-click `index.html` to open it straight in a browser (search won't need a server, though the service worker/PWA features need it running via `http://` — Live Server or Netlify/GitHub Pages handle that).
