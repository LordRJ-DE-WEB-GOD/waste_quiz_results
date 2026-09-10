// ============================================
// WASTE MANAGEMENT ON CAMPUS - app.js
// ============================================

// Make sure Supabase has been loaded
if (typeof SUPABASE_URL === "undefined" || typeof SUPABASE_ANON_KEY === "undefined") {
    console.error("Supabase configuration is missing.");
    alert("Supabase configuration is missing. Please check config.js.");
}

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ============================================
// FORM ELEMENTS
// ============================================

const surveyForm = document.getElementById("surveyForm");
const submitButton = document.getElementById("submitButton");
const message = document.getElementById("message");


// ============================================
// SHOW MESSAGE
// ============================================

function showMessage(text, type) {
    if (!message) return;

    message.textContent = text;
    message.className = "message " + type;

    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// ============================================
// GET RADIO VALUE
// ============================================

function getRadioValue(name) {
    const selected = document.querySelector(
        `input[name="${name}"]:checked`
    );

    return selected ? selected.value : null;
}


// ============================================
// GET CHECKBOX VALUES
// ============================================

function getCheckboxValues(name) {
    const checked = document.querySelectorAll(
        `input[name="${name}"]:checked`
    );

    return Array.from(checked).map(item => item.value);
}


// ============================================
// GET OTHER TEXT VALUE
// ============================================

function getOtherValue(id) {
    const element = document.getElementById(id);

    if (!element) {
        return null;
    }

    const value = element.value.trim();

    return value === "" ? null : value;
}


// ============================================
// VALIDATE FULL NAME
// ============================================

function validateFullName() {
    const fullNameElement = document.getElementById("full_name");

    if (!fullNameElement) {
        showMessage(
            "Full Name field is missing from the survey.",
            "error"
        );

        return false;
    }

    const fullName = fullNameElement.value.trim();

    if (fullName.length < 2) {
        showMessage(
            "Please enter your full name.",
            "error"
        );

        fullNameElement.focus();

        return false;
    }

    return true;
}


// ============================================
// CHECK REQUIRED QUESTIONS
// ============================================

function validateSurvey() {

    // Full Name
    if (!validateFullName()) {
        return false;
    }


    // Questions that use radio buttons
    const radioQuestions = [
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


    for (const question of radioQuestions) {

        const selected = document.querySelector(
            `input[name="${question}"]:checked`
        );

        if (!selected) {

            showMessage(
                `Please answer question ${question.substring(1)}.`,
                "error"
            );

            const firstOption = document.querySelector(
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


    // Questions using checkboxes
    const checkboxQuestions = [
        "q5",
        "q12",
        "q16"
    ];


    for (const question of checkboxQuestions) {

        const selected = document.querySelectorAll(
            `input[name="${question}"]:checked`
        );

        if (selected.length === 0) {

            showMessage(
                `Please answer question ${question.substring(1)}.`,
                "error"
            );

            const firstOption = document.querySelector(
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


// ============================================
// SUBMIT SURVEY
// ============================================

if (surveyForm) {

    surveyForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        // Validate
        if (!validateSurvey()) {
            return;
        }


        // Prevent double submission
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }


        showMessage(
            "Submitting your survey...",
            "info"
        );


        try {

            // ========================================
            // FULL NAME
            // ========================================

            const fullName =
                document.getElementById("full_name").value.trim();


            // ========================================
            // QUESTION 5
            // ========================================

            const q5 = getCheckboxValues("q5");


            // ========================================
            // QUESTION 12
            // ========================================

            const q12 = getCheckboxValues("q12");


            // ========================================
            // QUESTION 16
            // ========================================

            const q16 = getCheckboxValues("q16");


            // ========================================
            // CREATE RESPONSE OBJECT
            // ========================================

            const responseData = {

                // Person's name
                full_name: fullName,


                // General Questions
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


                // Recycling and Separation
                q9: getRadioValue("q9"),

                q10: getRadioValue("q10"),

                q11: getRadioValue("q11"),

                q12: q12,

                q12_other: getOtherValue("q12_other"),

                q13: getRadioValue("q13"),


                // Behaviour and Awareness
                q14: getRadioValue("q14"),

                q15: getRadioValue("q15"),

                q16: q16,

                q16_other: getOtherValue("q16_other"),

                q17: getRadioValue("q17"),

                q18: getRadioValue("q18"),

                q19: getRadioValue("q19"),

                q20: getRadioValue("q20")
            };


            console.log(
                "Submitting response:",
                responseData
            );


            // ========================================
            // SEND TO SUPABASE
            // ========================================

            const { data, error } = await supabaseClient
                .from("waste_management_responses")
                .insert([responseData])
                .select();


            // ========================================
            // HANDLE SUPABASE ERROR
            // ========================================

            if (error) {

                console.error(
                    "Supabase error:",
                    error
                );

                throw error;
            }


            // ========================================
            // SUCCESS
            // ========================================

            console.log(
                "Survey submitted successfully:",
                data
            );


            showMessage(
                "✅ Thank you! Your survey has been submitted successfully.",
                "success"
            );


            // Clear form
            surveyForm.reset();


            // Scroll to top
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


        } catch (error) {

            console.error(
                "Submission error:",
                error
            );


            let errorMessage =
                "Something went wrong while submitting your survey.";


            // More useful error messages
            if (error && error.message) {

                errorMessage =
                    "Submission failed: " +
                    error.message;
            }


            showMessage(
                errorMessage,
                "error"
            );


        } finally {

            // Re-enable button
            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Submit Survey";
            }
        }

    });

}


// ============================================
// OTHER OPTION HANDLING
// ============================================

// Question 5
function setupOtherOption(
    checkboxName,
    otherInputId
) {

    const checkboxes =
        document.querySelectorAll(
            `input[name="${checkboxName}"]`
        );

    const otherInput =
        document.getElementById(otherInputId);


    if (!otherInput) {
        return;
    }


    checkboxes.forEach(checkbox => {

        checkbox.addEventListener(
            "change",
            function () {

                if (
                    this.value.toLowerCase() === "other" &&
                    this.checked
                ) {

                    otherInput.style.display =
                        "block";

                    otherInput.focus();

                } else if (
                    this.value.toLowerCase() === "other" &&
                    !this.checked
                ) {

                    otherInput.style.display =
                        "none";

                    otherInput.value = "";
                }

            }
        );

    });

}


// ============================================
// INITIALISE OTHER FIELDS
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupOtherOption(
            "q5",
            "q5_other"
        );

        setupOtherOption(
            "q12",
            "q12_other"
        );

        setupOtherOption(
            "q16",
            "q16_other"
        );


        // Q6 Other
        const q6Options =
            document.querySelectorAll(
                'input[name="q6"]'
            );

        const q6Other =
            document.getElementById("q6_other");


        if (q6Other) {

            q6Options.forEach(option => {

                option.addEventListener(
                    "change",
                    function () {

                        if (
                            this.value.toLowerCase() === "other"
                            && this.checked
                        ) {

                            q6Other.style.display =
                                "block";

                            q6Other.focus();

                        } else {

                            q6Other.style.display =
                                "none";

                            q6Other.value = "";
                        }

                    }
                );

            });

        }

    }
);
