| Field | Value |
| ----- | ----- |
|Repository URL |https://github.com/briangasca/cse134b-hw5|
|Deployed Portfolio URL|https://brilliant-syrniki-646f5b.netlify.app/|
|Component Page URL|https://brilliant-syrniki-646f5b.netlify.app/|

## SSG exercise

The Eleventy exercise is in [`ssg-exercise/`](ssg-exercise/). It builds:

- **Home** (`ssg-exercise/src/index.njk`)
- **About** (`ssg-exercise/src/about.njk`)

Both pages use the same footer include, `ssg-exercise/src/_includes/footer.njk`. The commands to install, build, and preview are in [`ssg-exercise/README.md`](ssg-exercise/README.md).

## Design note: Fact Box

**Visitor goal.** A visitor to the home page wants a fun fact. Read a random fact, browse the ones they've already seen, and choose whether to see where each fact came from.

**Tracing requesting a new fact.**

1. The visitor picks "Random fact" or "Fact of the day" from the **Fact type** select and presses **Get a fact**. The button's click handler calls `loadFact()`
2. `loadFact()` sets the component to loading and calls `fetch()` on `https://uselessfacts.jsph.pl/api/v2/facts/{type}?language=en` with an 8-second timeout from an `AbortController`.
3. The component checks `response.ok`, parses the JSON in its own `try`/`catch`, and validates the fields it uses in `parseFact()`: `text` must be a non-empty string, `source` falls back to "Unknown source", and `permalink` is kept only if it is an `https:` URL.
4. The fact is added to the history and `render()` updates the existing elements in place. The fact text is set with `textContent`, the details line shows the type and source, and the status line and the Previous/Next buttons update.

**What the visitor sees.**

- The status line reads "Loading a random fact…". The **Get a fact** button and the select are disabled, and the fact area has `aria-busy="true"`. On first load, the fact area reads "Fetching your first fact…".
- The new fact appears, and the status line reads, for example, "Fact 3 of 3 · Full view". The status line is a `role="status"` live region, so screen readers announce the change.
- The status line turns the error colour and explains the problem, for example "Couldn't load a fact. The request timed out." (network error, HTTP error, invalid JSON, and missing text each get their own message). Any facts already loaded stay on screen, and a **Try again** button appears. When it succeeds, the error and the button disappear, and keyboard focus moves back to **Get a fact**.
