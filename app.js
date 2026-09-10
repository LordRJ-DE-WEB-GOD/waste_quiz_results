// ======================================================
// WASTE MANAGEMENT ON CAMPUS
// app.js
// ======================================================

// Create Supabase client
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ======================================================
// ELEMENTS
// ======================================================

const surveyForm = document.getElementById("surveyForm");
const submitButton = document.getElementById("submitButton");
const statusMessage = document.getElementById("statusMessage");
const successMessage = document.getElementById("successMessage");


// ======================================================
// SHOW STATUS MESSAGE
// ======================================================

function showStatus(message, type = "") {

    if (!statusMessage) {
        return;
    }

    statusMessage.textContent = message;

    statusMessage.className = "";

    if (type !== "") {
        statusMessage.classList.add(type);
    }
}


// ======================================================
// GET RADIO BUTTON VALUE
// ======================================================

function getRadioValue(questionName) {

    const selected = document.querySelector(
        `input[name="${questionName}"]:checked`
    );

    if (selected) {
        return selected.value;
    }

    return null;
}


// ======================================================
// GET CHECKBOX VALUES
// ======================================================

function getCheckboxValues(questionName) {

    const selected = document.querySelectorAll(
        `input[name="${questionName}"]:checked`
    );

    return Array.from(selected).map(
        checkbox => checkbox.value
    );
}


// ======================================================
// GET OTHER TEXT
// ======================================================

function getOtherValue(inputId) {

    const input = document.getElementById(inputId);

    if (!input) {
        return null;
    }

    const value = input.value.trim();

    return value === "" ? null : value;
}


// ======================================================
// VALIDATE FULL NAME
// ======================================================

function validateFullName() {

    const fullNameInput =
        document.getElementById("fullName");

    if (!fullNameInput) {

        showStatus(
            "Full Name field could not be found.",
            "error"
        );

        return false;
    }

    const fullName =
        fullNameInput.value.trim();


    if (fullName.length < 2) {

        showStatus(
            "Please enter your full name.",
            "error"
        );

        fullNameInput.focus();

        return false;
    }

    return true;
}


// ======================================================
// VALIDATE RADIO QUESTIONS
// ======================================================

function validateRadioQuestions() {

    const questions = [
        "q1",
        "q2",
        "q3",
        "q4",
        "q6",
        "q7",
        "q8",
        "q9",
        "q10",
        "q11",
        "q13",
        "q14",
        "q15",
        "q17",
        "q18",
        "q19",
        "q20"
    ];


    for (const question of questions) {

        const selected = document.querySelector(
            `input[name="${question}"]:checked`
        );


        if (!selected) {

            const number =
                question.replace("q", "");


            showStatus(
                `Please answer question ${number}.`,
                "error"
            );


            const firstOption =
                document.querySelector(
                    `input[name="${question}"]`
                );


            if (firstOption) {

                firstOption.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

            return false;
        }
    }

    return true;
}


// ======================================================
// VALIDATE CHECKBOX QUESTIONS
// ======================================================

function validateCheckboxQuestions() {

    const questions = [
        "q5",
        "q12",
        "q16"
    ];


    for (const question of questions) {

        const selected =
            document.querySelectorAll(
                `input[name="${question}"]:checked`
            );


        if (selected.length === 0) {

            const number =
                question.replace("q", "");


            showStatus(
                `Please answer question ${number}.`,
                "error"
            );


            const firstOption =
                document.querySelector(
                    `input[name="${question}"]`
                );


            if (firstOption) {

                firstOption.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

            return false;
        }
    }

    return true;
}


// ======================================================
// COMPLETE VALIDATION
// ======================================================

function validateSurvey() {

    if (!validateFullName()) {
        return false;
    }


    if (!validateRadioQuestions()) {
        return false;
    }


    if (!validateCheckboxQuestions()) {
        return false;
    }


    return true;
}


// ======================================================
// SUBMIT SURVEY
// ======================================================

surveyForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ----------------------------------------------
        // VALIDATION
        // ----------------------------------------------

        if (!validateSurvey()) {
            return;
        }


        // ----------------------------------------------
        // DISABLE BUTTON
        // ----------------------------------------------

        submitButton.disabled = true;

        submitButton.textContent =
            "Submitting...";


        showStatus(
            "Submitting your response...",
            "info"
        );


        try {

            // ------------------------------------------
            // FULL NAME
            // ------------------------------------------

            const fullName =
                document
                    .getElementById("fullName")
                    .value
                    .trim();


            // ------------------------------------------
            // QUESTION 5
            // ------------------------------------------

            const q5 =
                getCheckboxValues("q5");


            // ------------------------------------------
            // QUESTION 12
            // ------------------------------------------

            const q12 =
                getCheckboxValues("q12");


            // ------------------------------------------
            // QUESTION 16
            // ------------------------------------------

            const q16 =
                getCheckboxValues("q16");


            // ------------------------------------------
            // RESPONSE DATA
            // ------------------------------------------

            const responseData = {

                full_name: fullName,


                // GENERAL QUESTIONS

                q1: getRadioValue("q1"),

                q2: getRadioValue("q2"),

                q3: getRadioValue("q3"),

                q4: getRadioValue("q4"),

                q5: q5,

                q5_other: getOtherValue("q5_other"),

                q6: getRadioValue("q6"),

                q6_other: getOtherValue("q6_other"),

                q7: getRadioValue("q7"),

                q8: getRadioValue("q8"),


                // RECYCLING AND SEPARATION

                q9: getRadioValue("q9"),

                q10: getRadioValue("q10"),

                q11: getRadioValue("q11"),

                q12: q12,

                q12_other: getOtherValue("q12_other"),

                q13: getRadioValue("q13"),


                // BEHAVIOUR AND AWARENESS

                q14: getRadioValue("q14"),

                q15: getRadioValue("q15"),

                q16: q16,

                q16_other: getOtherValue("q16_other"),

                q17: getRadioValue("q17"),

                q18: getRadioValue("q18"),

                q19: getRadioValue("q19"),

                q20: getRadioValue("q20")
            };


            // ------------------------------------------
            // DEBUG
            // ------------------------------------------

            console.log(
                "Survey response:",
                responseData
            );


            // ------------------------------------------
            // SEND TO SUPABASE
            // ------------------------------------------

            const { data, error } =
                await supabaseClient
                    .from(
                        "waste_management_responses"
                    )
                    .insert([responseData]);


            // ------------------------------------------
            // CHECK ERROR
            // ------------------------------------------

            if (error) {

                console.error(
                    "Supabase error:",
                    error
                );

                throw error;
            }


            // ------------------------------------------
            // SUCCESS
            // ------------------------------------------

            console.log(
                "Response submitted successfully."
            );


            showStatus(
                "Survey submitted successfully!",
                "success"
            );


            // Hide form
            surveyForm.style.display = "none";


            // Show success card
            if (successMessage) {

                successMessage.classList.remove(
                    "hidden"
                );

            }


            // Scroll to success message
            if (successMessage) {

                successMessage.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }


        } catch (error) {

            console.error(
                "Error submitting survey:",
                error
            );


            showStatus(
                "Unable to submit your survey. Please try again.",
                "error"
            );


            // Re-enable button
            submitButton.disabled = false;

            submitButton.textContent =
                "Submit Survey";
        }

    }
);


// ======================================================
// OTHER OPTION - QUESTION 5
// ======================================================

function setupCheckboxOther(
    questionName,
    otherInputId
) {

    const checkboxes =
        document.querySelectorAll(
            `input[name="${questionName}"]`
        );


    const otherInput =
        document.getElementById(otherInputId);


    if (!otherInput) {
        return;
    }


    checkboxes.forEach(
        checkbox => {

            checkbox.addEventListener(
                "change",
                function () {

                    if (
                        this.value === "Other" &&
                        this.checked
                    ) {

                        otherInput.style.display =
                            "block";

                        otherInput.focus();

                    }


                    if (
                        this.value === "Other" &&
                        !this.checked
                    ) {

                        otherInput.style.display =
                            "none";

                        otherInput.value = "";
                    }

                }
            );

        }
    );

}


// ======================================================
// OTHER OPTION - QUESTION 6
// ======================================================

function setupRadioOther(
    questionName,
    otherInputId
) {

    const options =
        document.querySelectorAll(
            `input[name="${questionName}"]`
        );


    const otherInput =
        document.getElementById(otherInputId);


    if (!otherInput) {
        return;
    }


    options.forEach(
        option => {

            option.addEventListener(
                "change",
                function () {

                    if (
                        this.value === "Other" &&
                        this.checked
                    ) {

                        otherInput.style.display =
                            "block";

                        otherInput.focus();

                    } else {

                        otherInput.style.display =
                            "none";

                        otherInput.value = "";
                    }

                }
            );

        }
    );

}


// ======================================================
// INITIALISE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupCheckboxOther(
            "q5",
            "q5_other"
        );


        setupCheckboxOther(
            "q12",
            "q12_other"
        );


        setupCheckboxOther(
            "q16",
            "q16_other"
        );


        setupRadioOther(
            "q6",
            "q6_other"
        );

    }
);
