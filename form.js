const form = document.querySelector("form");
const nameInput = document.getElementById("name_input");
const emailInput = document.getElementById("email_input");
const commentsInput = document.getElementById("comments_input");

const nameError = document.getElementById("name_error");
const emailError = document.getElementById("email_error");
const commentsError = document.getElementById("comments_error");

const infoArea = document.getElementById("info_area");
const errorArea = document.getElementById("error_area");

form.noValidate = true;
errorArea.hidden = false;
infoArea.hidden = false;

const formErrorsInput = document.createElement("input");
formErrorsInput.type = "hidden";
formErrorsInput.name = "form-errors";
form.appendChild(formErrorsInput);

const WARNING_THRESHOLD = 100;

const form_errors = [];

// checks one field with the Constraint Validation API and returns its message ("" if valid)
function checkField(input, label) {
    
    input.setCustomValidity("");
    const validity = input.validity;
    let message = "";

    if (validity.valueMissing) {
        if (input === emailInput) {
            message = "Please enter your email address, for example name@example.com.";

        } else if (input === commentsInput) {
            message = "Please enter a comment of at least " + input.minLength + " characters.";

        } else {
            message = "Please enter your name.";
            
        }
    } else if (validity.typeMismatch) {
        message = "That email address is not in a valid format. Use the form name@example.com.";

    } else if (validity.tooShort) {
        message = "Your " + label + " is too short. The minimum is " + input.minLength + " characters.";

    }

    input.setCustomValidity(message);
    return message;
}

function showError(input, label, errorLine) {
    const message = checkField(input, label);
    let text = "";

    if (message) {
        text = label + ": " + message;
        input.setAttribute("aria-invalid", "true");
    } else {
        input.setAttribute("aria-invalid", "false");
    }

    if (errorLine.textContent !== text) {
        errorLine.textContent = text;
    }

    errorLine.hidden = text === "";
}


function updateCount() {
    const length = commentsInput.value.length;
    const max = commentsInput.maxLength;
    const remaining = max - length;
    let text = remaining + " of " + max + " characters remaining.";

    infoArea.classList.remove("near-limit", "at-limit");

    if (remaining === 0) {
        text = "Character limit reached: " + max + " of " + max + " characters used.";
        infoArea.classList.add("at-limit");

    } else if (remaining <= WARNING_THRESHOLD) {
        text += " Warning: you are close to the limit.";
        infoArea.classList.add("near-limit");

    } else if (length > 0 && length < commentsInput.minLength) {
        text += " Minimum is " + commentsInput.minLength + " characters.";

    }

    if (infoArea.textContent !== text) {
        infoArea.textContent = text;
    }
}


function watchField(input, label, errorLine) {
    input.addEventListener("input", function () {
        input.dataset.edited = "true";

        if (!errorLine.hidden) {
            showError(input, label, errorLine);

        } else {
            checkField(input, label);

        }
    });

    input.addEventListener("blur", function () {
        if (input.dataset.edited) {
            showError(input, label, errorLine);

        }
    });
}

watchField(nameInput, "Name", nameError);
watchField(emailInput, "Email", emailError);
watchField(commentsInput, "Comments", commentsError);

commentsInput.addEventListener("input", updateCount);

form.addEventListener("submit", function (event) {
    let firstInvalid = null;

    const checks = [
        [nameInput, "Name", nameError],
        [emailInput, "Email", emailError],
        [commentsInput, "Comments", commentsError]
    ];

    checks.forEach(function (check) {
        const input = check[0];
        const label = check[1];
        showError(input, label, check[2]);

        if (!input.validity.valid) {
            // one entry per invalid field per failed attempt
            form_errors.push({
                field: input.name,
                error: input.validationMessage,
                time: new Date().toISOString()
            });

            if (!firstInvalid) {
                firstInvalid = input;
            }
        }
    });

    if (firstInvalid) {
        event.preventDefault();
        firstInvalid.focus();
        return;
    }

    // successful submission
    formErrorsInput.value = JSON.stringify(form_errors);
});

updateCount();
