# The Feed

A simple 4-section site: **The Vault**, **The Tea**, **Hall of Fame**, **Notice Board**.
No build tools, no backend — just static files.

## How to put it on GitHub Pages

1. Create a new repository on GitHub (e.g. `the-feed`).
2. Upload these 4 files to it: `index.html`, `style.css`, `app.js`, `data.js`.
3. Go to the repo's **Settings → Pages**.
4. Under "Build and deployment", set **Source: Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
5. Wait a minute, then your site is live at `https://<your-username>.github.io/<repo-name>/`.

## How to add or edit content

Everything lives in **`data.js`**. You don't need to touch `index.html`, `style.css`, or `app.js` again.

- Open `data.js`.
- Copy one of the existing `{ ... }` entry blocks inside the section you want.
- Change the text inside the quotes.
- Save the file, then commit and push (or edit directly on GitHub.com and commit — GitHub lets you edit files right in the browser).
- Refresh the live site — the new entry is there for everyone who visits.

There's also a "+ Add" button on the live site itself: it opens a form and generates the exact code block to paste into `data.js`. It can't publish for you (a static site has no way to save changes on its own), but it saves you from writing the JSON by hand.

## A note on "The Tea" and "Hall of Fame"

These sections are seeded with placeholder examples only — no real names. Before you fill them in with real stuff about real people:

- Anything posted here is public on the internet, permanently, with no login wall.
- Naming someone in a "controversy" or "incident" they didn't agree to have posted can cause real harm, and can count as harassment or bullying even if it's meant as a joke.
- A safer default: skip full names, get an okay from the person before posting about them specifically, and keep "Hall of Fame" shoutouts to things people would be flattered by, not embarrassed by.

## Customizing the look

- Site title/tagline: top of `data.js`.
- Section labels/descriptions: inside each section object in `data.js`.
- Colors: CSS variables at the top of `style.css` (`--vault`, `--tea`, `--fame`, `--notice`).
