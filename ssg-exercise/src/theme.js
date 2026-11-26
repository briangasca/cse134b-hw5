(function () {
    const STORAGE_KEY = "theme";
    let theme = "dark";

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark") {
            theme = saved;
        }
    } catch (error) {
        // storage unavailable
    }

    function applyTheme() {
        if (theme === "light") {
            document.documentElement.classList.add("light");
        } else {
            document.documentElement.classList.remove("light");
        }
    }

    applyTheme();

    document.addEventListener("DOMContentLoaded", function () {
        const header = document.querySelector("body > header");
        if (!header) {
            return;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "theme-toggle";
        header.appendChild(button);

        function updateLabel() {
            if (theme === "light") {
                button.textContent = "Switch to dark theme";

            } else {
                button.textContent = "Switch to light theme";

            }
        }

        updateLabel();

        button.addEventListener("click", function () {
            if (theme === "light") {
                theme = "dark";
            } else {
                theme = "light";
            }

            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (document.startViewTransition && !reduceMotion) {

                document.startViewTransition(function () {

                    applyTheme();
                    updateLabel();

                });
            } else {
                applyTheme();
                updateLabel();

            }

            try {
                localStorage.setItem(STORAGE_KEY, theme);
            } catch (error) {
                // storage unavailable
            }
        });
    });
})();
