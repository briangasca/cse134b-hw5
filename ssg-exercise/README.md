# SSG Exercise (Eleventy)

Two pages from my portfolio, Home and About, built with [Eleventy](https://www.11ty.dev/) and Nunjucks templates. Both pages share one footer.

## Project layout

| Path | Purpose |
| ---- | ------- |
| `src/index.njk` | Home page content |
| `src/about.njk` | About page content |
| `src/_includes/layouts/base.njk` | Layout both pages use (head, header, nav) |
| `src/_includes/footer.njk` | **Shared footer**, included once by the layout |
| `src/styles/`, `src/icons/`, `src/*.js`, `src/*.jpg`, `src/*.pdf` | Styles, scripts, and assets copied to the output as-is |
| `eleventy.config.js` | Eleventy config (input `src/`, output `_site/`, passthrough copies) |

## Commands

Run these from inside `ssg-exercise/`.

Install dependencies:

```bash
npm install
```

Build the site into `_site/`:

```bash
npm run build
```

Build and preview locally with live reload:

```bash
npm start
```

Then open both pages:

- Home: <http://localhost:8080/>
- About: <http://localhost:8080/about/>

## Checking the shared footer

1. Edit `src/_includes/footer.njk`, e.g. change the text after "Computer Science, UC San Diego".
2. With `npm start` running, Eleventy rebuilds automatically (or run `npm run build` again).
3. Refresh Home and About. Both show the new footer.
