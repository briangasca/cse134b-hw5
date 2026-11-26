const API_BASE = "https://uselessfacts.jsph.pl/api/v2/facts/";
const REQUEST_TIMEOUT_MS = 8000;

const FACT_TYPES = {
    random: "random fact",
    today: "fact of the day"
};

function safeHttpsUrl(value) {
    if (typeof value !== "string") {
        return null;
    }
    try {
        const url = new URL(value);
        return url.protocol === "https:" ? url.href : null;
    } catch (error) {
        return null;
    }
}

function parseFact(data) {
    if (typeof data?.text !== "string" || data.text.trim() === "") {
        throw new Error("The response didn't include fact text.");
    }
    return {
        id: typeof data.id === "string" ? data.id : null,
        text: data.text.trim(),
        source: typeof data.source === "string" && data.source.trim() !== "" ? data.source.trim() : "Unknown source",
        permalink: safeHttpsUrl(data.permalink)
    };
}

class FactBox extends HTMLElement {
    static get observedAttributes() {
        return ["compact"];
    }

    constructor() {
        super();
        this.facts = [];
        this.index = -1;
        this.loading = false;
        this.error = null;
        this.built = false;
    }

    connectedCallback() {
        if (!this.built) {
            this.build();
            this.built = true;
            this.loadFact();
        }
        this.render();
    }

    attributeChangedCallback(name) {
        if (name === "compact" && this.built) {
            this.render();
        }
    }

    build() {
        this.replaceChildren();

        const heading = document.createElement("h2");
        heading.textContent = "Fact Box";
        this.appendChild(heading);

        const form = document.createElement("div");
        form.className = "fact-request";

        const selectId = `${this.id || "fact-box"}-type`;
        const label = document.createElement("label");
        label.htmlFor = selectId;
        label.textContent = "Fact type";
        form.appendChild(label);

        this.typeSelect = document.createElement("select");
        this.typeSelect.id = selectId;
        for (const [value, text] of Object.entries(FACT_TYPES)) {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = text.charAt(0).toUpperCase() + text.slice(1);
            this.typeSelect.appendChild(option);
        }
        form.appendChild(this.typeSelect);

        this.fetchButton = document.createElement("button");
        this.fetchButton.type = "button";
        this.fetchButton.textContent = "Get a fact";
        this.fetchButton.addEventListener("click", () => this.loadFact());
        form.appendChild(this.fetchButton);

        this.appendChild(form);

        this.article = document.createElement("article");
        this.article.className = "fact-current";

        this.textEl = document.createElement("p");
        this.textEl.className = "fact-text";
        this.article.appendChild(this.textEl);

        this.detailsEl = document.createElement("p");
        this.detailsEl.className = "fact-details";
        this.article.appendChild(this.detailsEl);

        this.appendChild(this.article);

        const nav = document.createElement("div");
        nav.className = "fact-controls";

        this.prevButton = document.createElement("button");
        this.prevButton.type = "button";
        this.prevButton.textContent = "Previous fact";
        this.prevButton.addEventListener("click", () => this.show(this.index - 1));
        nav.appendChild(this.prevButton);

        this.nextButton = document.createElement("button");
        this.nextButton.type = "button";
        this.nextButton.textContent = "Next fact";
        this.nextButton.addEventListener("click", () => this.show(this.index + 1));
        nav.appendChild(this.nextButton);

        this.appendChild(nav);

        this.statusEl = document.createElement("p");
        this.statusEl.className = "fact-status";
        this.statusEl.setAttribute("role", "status");
        this.appendChild(this.statusEl);

        this.retryButton = document.createElement("button");
        this.retryButton.type = "button";
        this.retryButton.className = "fact-retry";
        this.retryButton.textContent = "Try again";
        this.retryButton.hidden = true;
        this.retryButton.addEventListener("click", () => this.loadFact(this.lastType));
        this.appendChild(this.retryButton);
    }

    show(newIndex) {
        if (newIndex < 0 || newIndex >= this.facts.length) {
            return;
        }
        this.index = newIndex;
        this.render();
    }

    async loadFact(type = this.typeSelect.value) {
        if (this.loading) {
            return;
        }
        if (!(type in FACT_TYPES)) {
            type = "random";
        }

        this.retrying = document.activeElement === this.retryButton;
        this.lastType = type;
        this.loading = true;
        this.error = null;
        this.render();

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(`${API_BASE}${type}?language=en`, {
                headers: { Accept: "application/json" },
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`The server responded with HTTP status ${response.status}.`);
            }

            let data;
            try {
                data = await response.json();
            } catch (error) {
                throw new Error("The response wasn't valid JSON.");
            }

            const fact = parseFact(data);
            fact.type = type;
            this.facts.push(fact);
            this.index = this.facts.length - 1;
        } catch (error) {
            if (error.name === "AbortError") {
                this.error = "The request timed out.";
            } else if (error instanceof TypeError) {
                this.error = "Network error. Check your connection.";
            } else {
                this.error = error.message;
            }
        } finally {
            clearTimeout(timer);
            this.loading = false;
            this.render();
            if (this.retrying && this.retryButton.hidden) {
                this.fetchButton.focus();
            }
            this.retrying = false;
        }
    }

    render() {
        const compact = this.hasAttribute("compact");
        const fact = this.facts[this.index];

        this.detailsEl.replaceChildren();
        if (fact) {
            this.textEl.textContent = fact.text;
            this.detailsEl.append(`${FACT_TYPES[fact.type]} · Source: ${fact.source}`);
            if (fact.permalink) {
                this.detailsEl.append(" · ");
                const link = document.createElement("a");
                link.href = fact.permalink;
                link.textContent = "View on Useless Facts";
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                this.detailsEl.appendChild(link);
            }
        } else {
            this.textEl.textContent = this.loading ? "Fetching your first fact…" : "No fact loaded yet. Press “Get a fact”.";
        }
        this.detailsEl.hidden = compact || !fact;

        this.fetchButton.disabled = this.loading;
        this.typeSelect.disabled = this.loading;
        this.prevButton.disabled = this.index <= 0;
        this.nextButton.disabled = this.index >= this.facts.length - 1;
        this.article.setAttribute("aria-busy", String(this.loading));
        this.retryButton.hidden = !(this.error || (this.loading && this.retrying));
        this.retryButton.setAttribute("aria-disabled", String(this.loading));

        const view = compact ? "Compact view (source hidden)" : "Full view";
        const position = fact ? `Fact ${this.index + 1} of ${this.facts.length}` : "No facts loaded";
        let message;
        if (this.loading) {
            message = `Loading a ${FACT_TYPES[this.lastType]}…`;
        } else if (this.error) {
            message = `Couldn't load a fact. ${this.error} ${position} · ${view}`;
        } else {
            message = `${position} · ${view}`;
        }
        this.statusEl.textContent = message;
        this.statusEl.classList.toggle("is-error", Boolean(this.error) && !this.loading);
    }
}

customElements.define("fact-box", FactBox);

const MODE_STORAGE_KEY = "hw5-fact-box-mode";
const MODES = ["expanded", "compact"];
const DEFAULT_MODE = "expanded";

function readSavedMode() {
    try {
        const saved = localStorage.getItem(MODE_STORAGE_KEY);
        return MODES.includes(saved) ? saved : DEFAULT_MODE;
    } catch (error) {
        return DEFAULT_MODE;
    }
}

function saveMode(mode) {
    try {
        localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch (error) {
        console.warn("Couldn't save the Fact Box preference.", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const box = document.querySelector("fact-box");
    const toggle = document.querySelector("#toggle-compact");
    if (!box || !toggle) {
        return;
    }

    function applyMode(mode) {
        box.toggleAttribute("compact", mode === "compact");
        toggle.setAttribute("aria-pressed", String(mode === "compact"));
        toggle.textContent = mode === "compact" ? "Show source details" : "Hide source details";
    }

    toggle.addEventListener("click", () => {
        const mode = box.hasAttribute("compact") ? "expanded" : "compact";
        applyMode(mode);
        saveMode(mode);
    });

    applyMode(readSavedMode());
    toggle.hidden = false;
});
