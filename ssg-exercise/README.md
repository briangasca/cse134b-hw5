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

Build and preview locally:

```bash
npm start
```

Then open both pages:

- Home: <http://localhost:8080/>
- About: <http://localhost:8080/about/>

## Checking the shared footer

1. Edit `src/_includes/footer.njk`, e.g. change the text after "Computer Science, UC San Diego".
2. With `npm start` running, Eleventy rebuilds automatically
3. Refresh Home and About. Both show the new footer.
