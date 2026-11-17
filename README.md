# Laboratory Website

Static website (HTML + CSS + vanilla JS, no build step, no framework) built from the
*Laboratory Website Development Brief v1.0*. Hosted on GitHub Pages.

## Structure

```
index.html                  Home
profile.html                Lab Profile
assistants.html             Assistants        (?division=bph)
practicum.html              Practicum         (?subject=rangkaian-listrik | rangkaian-elektronika | sistem-digital)
achievement-training.html   Achievement & Training (?category=achievements | internal-training | external-training)
media.html                  Media             (?category=Training, ?album=<album-id>)
content/                    ← ALL text/data lives here (edit these, not the HTML)
  site.json                 lab name, logo, hero text, contact links
  profile.json              overview, history, location, vision, mission, Head of Laboratory
  assistants.json           divisions + assistant records
  practicum.json            the three practicum subjects + 16-week agendas
  achievements-training.json
  media.json                albums + photos
images/                     put photos here (subfolders per section)
assets/                     css, js, font (Inter, self-hosted), favicon
```

## Editing content (no code needed)

1. Open the repo on GitHub → `content/` → click a file → pencil icon (Edit).
2. Change the text between the quotes. Keep commas and brackets intact.
3. **Commit changes**. The live site updates in about 1 minute.

Rules:
- Any value written as `[LIKE THIS]` or left empty `""` is shown as a grey placeholder.
- To unpublish a record (assistant, achievement, training, album, photo) without deleting it, add `"hidden": true` to it.
- Photos: upload to `images/<section>/` (Add file → Upload files), then reference the path, e.g. `"photo": "images/assistants/budi.jpg"`.
  Keep photos ≤ 1600 px wide and ≤ 300 KB (JPG/WebP). Use the same crop (e.g. 1:1) for all assistant portraits.
- Dates: write `2026-09-15` (shown as "15 September 2026") or `2026-09` (month); any other text is shown as-is.
  ISO dates are also used to sort "latest" items.
- Agenda status values: `done`, `upcoming`, `ongoing`, `postponed`, `cancelled` (leave `""` if not used).
- Assistant `role` values: `head`, `expert`, `staff`. `division` must match an `id` in `divisions`.
- Training `type` values: `internal`, `external`.
- A JSON syntax error breaks that page; paste the file into https://jsonlint.com to check if something stops loading.

## Local preview

`fetch()` does not work from `file://`, so run a tiny server:

```bash
cd lab-site
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)

Repo named `<account>.github.io`, Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
After the first deploy, replace `USERNAME` in `robots.txt` and `sitemap.xml` with the account name,
and set `"siteUrl"` in `content/site.json`.
