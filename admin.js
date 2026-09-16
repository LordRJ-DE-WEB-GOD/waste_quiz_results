// ============================================================
// ECOPULSE
// CAMPUS WASTE MANAGEMENT SURVEY
// ADMIN DASHBOARD
// ============================================================


// ============================================================
// SUPABASE CONNECTION
// ============================================================

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ============================================================
// PAGE ELEMENTS
// ============================================================

const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const logoutButton =
    document.getElementById("logoutButton");

const totalResponses =
    document.getElementById("totalResponses");

const poorRatingPercentage =
    document.getElementById("poorRatingPercentage");

const educationAgreePercentage =
    document.getElementById("educationAgreePercentage");

const searchInput =
    document.getElementById("searchInput");

const refreshButton =
    document.getElementById("refreshButton");

const exportButton =
    document.getElementById("exportButton");

const responsesTableBody =
    document.getElementById("responsesTableBody");

const responseCount =
    document.getElementById("responseCount");

const emptyMessage =
    document.getElementById("emptyMessage");

const answersModal =
    document.getElementById("answersModal");

const closeModal =
    document.getElementById("closeModal");

const modalName =
    document.getElementById("modalName");

const modalDate =
    document.getElementById("modalDate");

const answersContainer =
    document.getElementById("answersContainer");


// ============================================================
// THE 5 QUESTIONS
// ============================================================

const questions = {

    q1:
        "How would you rate the current waste management on campus?",

    q4:
        "How often do you see litter around campus?",

    q12:
        "What prevents people from recycling on campus?",

    q16:
        "What do you think are the main causes of littering on campus?",

    q18:
        "Should the university provide more education about waste management?"

};


// Order the questions are shown in (modal + CSV)

const questionOrder = [
    "q1",
    "q4",
    "q12",
    "q16",
    "q18"
];


// ============================================================
// RESPONSE STORAGE
// ============================================================

let allResponses = [];


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await checkSession();

    }
);


// ============================================================
// CHECK LOGIN SESSION
// ============================================================

async function checkSession() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            "Session error:",
            error
        );

        showLogin();

        return;

    }


    if (data.session) {

        showDashboard();

        await loadResponses();

    } else {

        showLogin();

    }

}


// ============================================================
// LOGIN
// ============================================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        if (!email || !password) {

            loginMessage.textContent =
                "Please enter your email and password.";

            return;

        }


        loginButton.disabled = true;

        loginButton.textContent =
            "Logging in...";

        loginMessage.textContent = "";


        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            console.error(
                "Login error:",
                error
            );


            loginMessage.textContent =
                "Login failed. Check your email and password.";


            loginButton.disabled = false;

            loginButton.textContent =
                "Login";

            return;

        }


        if (data.session) {

            showDashboard();

            await loadResponses();

        }


        loginButton.disabled = false;

        loginButton.textContent =
            "Login";

    }
);


// ============================================================
// LOGOUT
// ============================================================

logoutButton.addEventListener(
    "click",
    async () => {

        logoutButton.disabled = true;

        logoutButton.textContent =
            "Logging out...";


        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );

        }


        allResponses = [];

        showLogin();


        logoutButton.disabled = false;

        logoutButton.textContent =
            "Logout";

    }
);


// ============================================================
// SHOW LOGIN
// ============================================================

function showLogin() {

    loginSection.classList.remove(
        "hidden"
    );

    dashboardSection.classList.add(
        "hidden"
    );

}


// ============================================================
// SHOW DASHBOARD
// ============================================================

function showDashboard() {

    loginSection.classList.add(
        "hidden"
    );

    dashboardSection.classList.remove(
        "hidden"
    );

}


// ============================================================
// LOAD SURVEY RESPONSES
// ============================================================

async function loadResponses() {

    responseCount.textContent =
        "Loading responses...";


    responsesTableBody.innerHTML = "";


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                TABLE_NAME
            )
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Database error:",
            error
        );


        responseCount.textContent =
            "Unable to load responses";


        alert(
            "Could not load survey responses.\n\n" +
            error.message
        );


        return;

    }


    allResponses =
        data || [];


    updateStatistics(
        allResponses
    );


    displayResponses(
        allResponses
    );

}


// ============================================================
// DISPLAY RESPONSES
// ============================================================

function displayResponses(
    responses
) {

    responsesTableBody.innerHTML = "";


    responseCount.textContent =
        `${responses.length} response${
            responses.length === 1
                ? ""
                : "s"
        }`;


    if (responses.length === 0) {

        emptyMessage.classList.remove(
            "hidden"
        );

        return;

    }


    emptyMessage.classList.add(
        "hidden"
    );


    responses.forEach(
        (response, index) => {

            const row =
                document.createElement(
                    "tr"
                );


            // NUMBER

            const numberCell =
                document.createElement(
                    "td"
                );

            numberCell.textContent =
                index + 1;


            // NAME

            const nameCell =
                document.createElement(
                    "td"
                );

            nameCell.className =
                "name-cell";

            nameCell.textContent =
                response.full_name ||
                "No name";


            // DATE

            const dateCell =
                document.createElement(
                    "td"
                );

            dateCell.className =
                "date-cell";

            dateCell.textContent =
                formatDate(
                    response.created_at
                );


            // BUTTON

            const actionCell =
                document.createElement(
                    "td"
                );


            const viewButton =
                document.createElement(
                    "button"
                );


            viewButton.className =
                "answers-btn";

            viewButton.textContent =
                "View Answers";


            viewButton.addEventListener(
                "click",
                () => {

                    openAnswers(
                        response
                    );

                }
            );


            actionCell.appendChild(
                viewButton
            );


            // ADD CELLS

            row.appendChild(
                numberCell
            );

            row.appendChild(
                nameCell
            );

            row.appendChild(
                dateCell
            );

            row.appendChild(
                actionCell
            );


            responsesTableBody.appendChild(
                row
            );

        }
    );

}


// ============================================================
// UPDATE STATISTICS
// ============================================================

function updateStatistics(
    responses
) {

    const total =
        responses.length;


    // TOTAL

    totalResponses.textContent =
        total;


    if (total === 0) {

        poorRatingPercentage.textContent =
            "0%";

        educationAgreePercentage.textContent =
            "0%";

        return;

    }


    // ========================================================
    // Q1 — rated waste management poorly
    // ========================================================

    const poorAnswers =
        responses.filter(
            response =>

                response.q1 ===
                    "Poor"

                ||

                response.q1 ===
                    "Very poor"
        ).length;


    const poorPercentage =
        Math.round(
            (
                poorAnswers /
                total
            ) * 100
        );


    poorRatingPercentage.textContent =
        poorPercentage + "%";


    // ========================================================
    // Q18 — wants more education
    // ========================================================

    const agreeAnswers =
        responses.filter(
            response =>

                response.q18 ===
                    "Agree"

                ||

                response.q18 ===
                    "Strongly agree"
        ).length;


    const agreePercentage =
        Math.round(
            (
                agreeAnswers /
                total
            ) * 100
        );


    educationAgreePercentage.textContent =
        agreePercentage + "%";

}


// ============================================================
// SEARCH BY NAME
// ============================================================

searchInput.addEventListener(
    "input",
    () => {

        const searchTerm =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!searchTerm) {

            displayResponses(
                allResponses
            );

            return;

        }


        const filtered =
            allResponses.filter(
                response => {

                    const name =
                        response.full_name ||
                        "";


                    return name
                        .toLowerCase()
                        .includes(
                            searchTerm
                        );

                }
            );


        displayResponses(
            filtered
        );

    }
);


// ============================================================
// REFRESH
// ============================================================

refreshButton.addEventListener(
    "click",
    async () => {

        refreshButton.disabled = true;

        refreshButton.textContent =
            "Refreshing...";


        await loadResponses();


        refreshButton.disabled = false;

        refreshButton.textContent =
            "Refresh";

    }
);


// ============================================================
// OPEN RESPONSE
// ============================================================

function openAnswers(
    response
) {

    modalName.textContent =
        response.full_name ||
        "Unnamed Response";


    modalDate.textContent =
        "Submitted: " +
        formatDate(
            response.created_at
        );


    answersContainer.innerHTML = "";


    questionOrder.forEach(
        (key, index) => {

            let answer =
                response[key];


            // ARRAY ANSWERS

            if (
                Array.isArray(answer)
            ) {

                answer =
                    answer.join(
                        ", "
                    );

            }


            // EMPTY ANSWER

            if (
                answer === null ||
                answer === undefined ||
                answer === ""
            ) {

                answer =
                    "No answer";

            }


            // ANSWER CONTAINER

            const answerDiv =
                document.createElement(
                    "div"
                );

            answerDiv.className =
                "answer";


            // QUESTION

            const question =
                document.createElement(
                    "strong"
                );


            question.textContent =
                `${index + 1}. ${questions[key]}`;


            // ANSWER TEXT

            const answerText =
                document.createElement(
                    "span"
                );


            answerText.textContent =
                answer;


            answerDiv.appendChild(
                question
            );

            answerDiv.appendChild(
                answerText
            );


            answersContainer.appendChild(
                answerDiv
            );


            // OTHER ANSWERS

            if (key === "q12") {

                addOtherAnswer(
                    response.q12_other,
                    "Other recycling barrier"
                );

            }


            if (key === "q16") {

                addOtherAnswer(
                    response.q16_other,
                    "Other littering cause"
                );

            }

        }
    );


    answersModal.classList.remove(
        "hidden"
    );

}


// ============================================================
// OTHER ANSWER
// ============================================================

function addOtherAnswer(
    value,
    label
) {

    if (!value) {

        return;

    }


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "answer";


    const strong =
        document.createElement(
            "strong"
        );


    strong.textContent =
        label;


    const span =
        document.createElement(
            "span"
        );


    span.textContent =
        value;


    div.appendChild(
        strong
    );

    div.appendChild(
        span
    );


    answersContainer.appendChild(
        div
    );

}


// ============================================================
// CLOSE MODAL
// ============================================================

closeModal.addEventListener(
    "click",
    () => {

        answersModal.classList.add(
            "hidden"
        );

    }
);


answersModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            answersModal
        ) {

            answersModal.classList.add(
                "hidden"
            );

        }

    }
);


// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "Unknown";

    }


    const date =
        new Date(
            dateString
        );


    return date.toLocaleString(
        "en-ZA",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// ============================================================
// EXPORT CSV
// ============================================================

exportButton.addEventListener(
    "click",
    () => {

        if (
            allResponses.length === 0
        ) {

            alert(
                "There are no responses to export."
            );

            return;

        }


        const headers = [

            "Full Name",

            "Date",

            "Q1",

            "Q4",

            "Q12",

            "Q12 Other",

            "Q16",

            "Q16 Other",

            "Q18"

        ];


        const rows =
            allResponses.map(
                response => [

                    response.full_name,

                    response.created_at,

                    response.q1,

                    response.q4,

                    formatArray(
                        response.q12
                    ),

                    response.q12_other,

                    formatArray(
                        response.q16
                    ),

                    response.q16_other,

                    response.q18

                ]
            );


        let csv =
            headers
                .map(csvEscape)
                .join(",") +
            "\n";


        rows.forEach(
            row => {

                csv +=
                    row
                        .map(csvEscape)
                        .join(",") +
                    "\n";

            }
        );


        // CREATE FILE

        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "ecopulse-campus-waste-survey.csv";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );

    }
);


// ============================================================
// ARRAY FORMAT
// ============================================================

function formatArray(
    value
) {

    if (
        Array.isArray(value)
    ) {

        return value.join(
            "; "
        );

    }


    return value || "";

}


// ============================================================
// CSV ESCAPE
// ============================================================

function csvEscape(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return '""';

    }


    const text =
        String(value)
            .replace(
                /"/g,
                '""'
            );


    return `"${text}"`;

}
