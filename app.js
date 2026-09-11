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
    const q2 = getRadioValue("q2");
    const q3 = getRadioValue("q3");
    const q4 = getRadioValue("q4");

    const q6 = getRadioValue("q6");

    const q7 = getRadioValue("q7");

    const q8 = getRadioValue("q8");

    const q9 = getRadioValue("q9");

    const q10 = getRadioValue("q10");


    // --------------------------------------------------------
    // CHECKBOX QUESTION
    // --------------------------------------------------------

    const q5 =
        getCheckboxValues("q5");


    // --------------------------------------------------------
    // OTHER
    // --------------------------------------------------------

    const q5Other =
        document.getElementById("q5_other")
            .value
            .trim();


    const q6Other =
        document.getElementById("q6_other")
            .value
            .trim();


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    const requiredAnswers = [

        q1,
        q2,
        q3,
        q4,
        q6,
        q7,
        q8,
        q9,
        q10

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


    if (q5.length === 0) {

        showError(
            "Please select at least one type of waste."
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

        q2: q2,

        q3: q3,

        q4: q4,

        q5: q5,

        q5_other:
            q5Other || null,

        q6: q6,

        q6_other:
            q6Other || null,

        q7: q7,

        q8: q8,

        q9: q9,

        q10: q10

    };


    // --------------------------------------------------------
    // INSERT
    // --------------------------------------------------------

    const {
        error
    } = await supabaseClient
        .from("waste_management_responses")
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
            "Something went wrong while submitting your response. Please try again."
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

const q5OtherInput =
    document.getElementById("q5_other");


const q6OtherInput =
    document.getElementById("q6_other");


// Highlight Other inputs when used

[q5OtherInput, q6OtherInput]
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
