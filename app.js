// ============================================================
// ECOPULSE
// CAMPUS WASTE MANAGEMENT SURVEY
// ============================================================


// ------------------------------------------------------------
// SUPABASE
// ------------------------------------------------------------

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ------------------------------------------------------------
// ELEMENTS
// ------------------------------------------------------------

const surveyForm =
    document.getElementById("surveyForm");

const fullName =
    document.getElementById("fullName");

const submitButton =
    document.getElementById("submitButton");

const statusMessage =
    document.getElementById("statusMessage");

const successMessage =
    document.getElementById("successMessage");


// ------------------------------------------------------------
// FORM SUBMISSION
// ------------------------------------------------------------

surveyForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    statusMessage.textContent =
        "Submitting your response...";

    statusMessage.className =
        "loading";


    submitButton.disabled = true;


    // --------------------------------------------------------
    // NAME
    // --------------------------------------------------------

    const name =
        fullName.value.trim();


    if (name.length < 2) {

        showError(
            "Please enter your full name."
        );

        submitButton.disabled = false;

        return;

    }


    // --------------------------------------------------------
    // RADIO QUESTIONS
    // --------------------------------------------------------

    const q1 = getRadioValue("q1");
    const q4 = getRadioValue("q4");

    const q18 = getRadioValue("q18");


    // --------------------------------------------------------
    // CHECKBOX QUESTIONS
    // --------------------------------------------------------

    const q12 =
        getCheckboxValues("q12");

    const q16 =
        getCheckboxValues("q16");


    // --------------------------------------------------------
    // OTHER
    // --------------------------------------------------------

    const q12Other =
        document.getElementById("q12_other")
            .value
            .trim();


    const q16Other =
        document.getElementById("q16_other")
            .value
            .trim();


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    const requiredAnswers = [

        q1,
        q4,
        q18

    ];


    if (
        requiredAnswers.some(
            answer => !answer
        )
    ) {

        showError(
            "Please answer all required questions."
        );

        submitButton.disabled = false;

        return;

    }


    if (
        q12.length === 0 &&
        !q12Other
    ) {

        showError(
            "Please select at least one option for question 3, or specify your own."
        );

        submitButton.disabled = false;

        return;

    }


    if (
        q16.length === 0 &&
        !q16Other
    ) {

        showError(
            "Please select at least one option for question 4, or specify your own."
        );

        submitButton.disabled = false;

        return;

    }


    // --------------------------------------------------------
    // DATABASE OBJECT
    // --------------------------------------------------------

    const responseData = {

        full_name: name,

        q1: q1,

        q4: q4,

        q12: q12,

        q12_other:
            q12Other || null,

        q16: q16,

        q16_other:
            q16Other || null,

        q18: q18

    };


    // --------------------------------------------------------
    // INSERT
    // --------------------------------------------------------

    const {
        error
    } = await supabaseClient
        .from(TABLE_NAME)
        .insert([responseData]);


    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    if (error) {

        console.error(
            "Supabase error:",
            error
        );


        showError(
            "Could not submit: " + error.message
        );


        submitButton.disabled = false;

        return;

    }


    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    surveyForm.classList.add("hidden");

    successMessage.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// ------------------------------------------------------------
// GET RADIO VALUE
// ------------------------------------------------------------

function getRadioValue(name) {

    const selected =
        document.querySelector(
            `input[name="${name}"]:checked`
        );


    return selected
        ? selected.value
        : "";

}


// ------------------------------------------------------------
// GET CHECKBOX VALUES
// ------------------------------------------------------------

function getCheckboxValues(name) {

    const selected =
        document.querySelectorAll(
            `input[name="${name}"]:checked`
        );


    return Array.from(selected)
        .map(input => input.value);

}


// ------------------------------------------------------------
// ERROR
// ------------------------------------------------------------

function showError(message) {

    statusMessage.textContent =
        message;

    statusMessage.className =
        "error";

}


// ------------------------------------------------------------
// OTHER INPUT HANDLING
// ------------------------------------------------------------

const q12OtherInput =
    document.getElementById("q12_other");


const q16OtherInput =
    document.getElementById("q16_other");


// Highlight Other inputs when used

[q12OtherInput, q16OtherInput]
    .forEach(input => {

        input.addEventListener(
            "focus",
            () => {

                input.classList.add(
                    "active"
                );

            }
        );


        input.addEventListener(
            "blur",
            () => {

                if (!input.value.trim()) {

                    input.classList.remove(
                        "active"
                    );

                }

            }
        );

    });
