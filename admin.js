// ============================================================
// WASTE MANAGEMENT SURVEY - ADMIN DASHBOARD
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

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

const logoutButton = document.getElementById("logoutButton");

const totalResponses = document.getElementById("totalResponses");
const enoughBinsPercentage = document.getElementById("enoughBinsPercentage");
const cleanlinessPercentage = document.getElementById("cleanlinessPercentage");

const searchInput = document.getElementById("searchInput");
const refreshButton = document.getElementById("refreshButton");
const exportButton = document.getElementById("exportButton");

const responsesTableBody = document.getElementById("responsesTableBody");
const responseCount = document.getElementById("responseCount");
const emptyMessage = document.getElementById("emptyMessage");

const answersModal = document.getElementById("answersModal");
const closeModal = document.getElementById("closeModal");
const modalName = document.getElementById("modalName");
const modalDate = document.getElementById("modalDate");
const answersContainer = document.getElementById("answersContainer");


// ------------------------------------------------------------
// QUESTIONS
// ------------------------------------------------------------

const questions = {

    q1: "How would you rate the current waste management on campus?",

    q2: "Do you think there are enough dustbins on campus?",

    q3: "Are the dustbins placed in convenient locations?",

    q4: "How often do you see litter around campus?",

    q5: "What types of waste do you commonly see on campus?",

    q6: "Which areas of campus have the most waste or litter?",

    q7: "Do you think the campus is cleaned regularly?",

    q8: "Are the dustbins emptied frequently enough?",

    q9: "Are there separate bins for different types of waste?",

    q10: "Do you know how to separate recyclable waste from general waste?",

    q11: "Do you think students and staff make proper use of recycling bins?",

    q12: "What prevents people from recycling on campus?",

    q13: "Would you be willing to separate your waste if more recycling bins were provided?",

    q14: "Do you think students are aware of proper waste-disposal practices?",

    q15: "Do you think lecturers and staff set a good example when disposing of waste?",

    q16: "What do you think are the main causes of littering on campus?",

    q17: "Do you think people litter because there are not enough bins?",

    q18: "Should the university provide more education about waste management?",

    q19: "How satisfied are you with the cleanliness of the campus?",

    q20: "Do you think there are enough waste bins across campus?"
};


// ------------------------------------------------------------
// VARIABLES
// ------------------------------------------------------------

let allResponses = [];


// ------------------------------------------------------------
// PAGE START
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (session) {

        showDashboard();

        await loadResponses();

    } else {

        showLogin();

    }

});


// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;


    loginButton.disabled = true;

    loginButton.textContent = "Logging in...";

    loginMessage.textContent = "";


    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });


    if (error) {

        loginMessage.textContent =
            "Login failed: " + error.message;

        loginButton.disabled = false;

        loginButton.textContent = "Login";

        return;

    }


    if (data.session) {

        showDashboard();

        await loadResponses();

    }


    loginButton.disabled = false;

    loginButton.textContent = "Login";

});


// ------------------------------------------------------------
// LOGOUT
// ------------------------------------------------------------

logoutButton.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    allResponses = [];

    showLogin();

});


// ------------------------------------------------------------
// SHOW LOGIN
// ------------------------------------------------------------

function showLogin() {

    loginSection.classList.remove("hidden");

    dashboardSection.classList.add("hidden");

}


// ------------------------------------------------------------
// SHOW DASHBOARD
// ------------------------------------------------------------

function showDashboard() {

    loginSection.classList.add("hidden");

    dashboardSection.classList.remove("hidden");

}


// ------------------------------------------------------------
// LOAD RESPONSES
// ------------------------------------------------------------

async function loadResponses() {

    responsesTableBody.innerHTML = "";

    responseCount.textContent = "Loading...";


    const {
        data,
        error
    } = await supabaseClient
        .from("waste_management_responses")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        alert(
            "Could not load responses.\n\n" +
            error.message
        );

        return;

    }


    allResponses = data || [];


    updateStatistics(allResponses);

    displayResponses(allResponses);

}


// ------------------------------------------------------------
// DISPLAY RESPONSES
// ------------------------------------------------------------

function displayResponses(responses) {

    responsesTableBody.innerHTML = "";


    responseCount.textContent =
        `${responses.length} response${responses.length === 1 ? "" : "s"}`;


    if (responses.length === 0) {

        emptyMessage.classList.remove("hidden");

        return;

    }


    emptyMessage.classList.add("hidden");


    responses.forEach((response, index) => {

        const row = document.createElement("tr");


        const numberCell = document.createElement("td");

        numberCell.textContent = index + 1;


        const nameCell = document.createElement("td");

        nameCell.className = "name-cell";

        nameCell.textContent =
            response.full_name || "No name";


        const dateCell = document.createElement("td");

        dateCell.className = "date-cell";

        dateCell.textContent =
            formatDate(response.created_at);


        const actionCell = document.createElement("td");

        const button = document.createElement("button");

        button.className = "answers-btn";

        button.textContent = "View Answers";


        button.addEventListener("click", () => {

            openAnswers(response);

        });


        actionCell.appendChild(button);


        row.appendChild(numberCell);

        row.appendChild(nameCell);

        row.appendChild(dateCell);

        row.appendChild(actionCell);


        responsesTableBody.appendChild(row);

    });

}


// ------------------------------------------------------------
// STATISTICS
// ------------------------------------------------------------

function updateStatistics(responses) {

    const total = responses.length;


    totalResponses.textContent = total;


    if (total === 0) {

        enoughBinsPercentage.textContent = "0%";

        cleanlinessPercentage.textContent = "0%";

        return;

    }


    // Q2 - enough dustbins

    const q2Yes = responses.filter(
        response =>
            response.q2 === "Yes"
    ).length;


    const q2Percentage =
        Math.round((q2Yes / total) * 100);


    enoughBinsPercentage.textContent =
        q2Percentage + "%";


    // Q19 - satisfied or very satisfied

    const satisfied = responses.filter(
        response =>
            response.q19 === "Satisfied" ||
            response.q19 === "Very satisfied"
    ).length;


    const satisfiedPercentage =
        Math.round((satisfied / total) * 100);


    cleanlinessPercentage.textContent =
        satisfiedPercentage + "%";

}


// ------------------------------------------------------------
// SEARCH
// ------------------------------------------------------------

searchInput.addEventListener("input", () => {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!searchTerm) {

        displayResponses(allResponses);

        return;

    }


    const filteredResponses =
        allResponses.filter(response => {

            const name =
                response.full_name || "";


            return name
                .toLowerCase()
                .includes(searchTerm);

        });


    displayResponses(filteredResponses);

});


// ------------------------------------------------------------
// REFRESH
// ------------------------------------------------------------

refreshButton.addEventListener("click", async () => {

    refreshButton.disabled = true;

    refreshButton.textContent = "Refreshing...";


    await loadResponses();


    refreshButton.disabled = false;

    refreshButton.textContent = "Refresh";

});


// ------------------------------------------------------------
// OPEN ANSWERS
// ------------------------------------------------------------

function openAnswers(response) {

    modalName.textContent =
        response.full_name || "Unnamed Response";


    modalDate.textContent =
        "Submitted: " +
        formatDate(response.created_at);


    answersContainer.innerHTML = "";


    for (let i = 1; i <= 20; i++) {

        const key = "q" + i;

        let answer = response[key];


        if (Array.isArray(answer)) {

            answer = answer.join(", ");

        }


        if (
            answer === null ||
            answer === undefined ||
            answer === ""
        ) {

            answer = "No answer";

        }


        const answerDiv =
            document.createElement("div");


        answerDiv.className = "answer";


        const question =
            document.createElement("strong");


        question.textContent =
            i + ". " + questions[key];


        const answerText =
            document.createElement("span");


        answerText.textContent =
            answer;


        answerDiv.appendChild(question);

        answerDiv.appendChild(answerText);


        answersContainer.appendChild(answerDiv);


        // OTHER ANSWERS

        if (key === "q5") {

            addOtherAnswer(
                response.q5_other,
                "Other waste type"
            );

        }


        if (key === "q6") {

            addOtherAnswer(
                response.q6_other,
                "Other campus area"
            );

        }


        if (key === "q12") {

            addOtherAnswer(
                response.q12_other,
                "Other recycling barrier"
            );

        }


        if (key === "q16") {

            addOtherAnswer(
                response.q16_other,
                "Other cause of littering"
            );

        }

    }


    answersModal.classList.remove("hidden");

}


// ------------------------------------------------------------
// ADD OTHER ANSWER
// ------------------------------------------------------------

function addOtherAnswer(value, label) {

    if (!value) {

        return;

    }


    const div =
        document.createElement("div");


    div.className = "answer";


    const strong =
        document.createElement("strong");


    strong.textContent = label;


    const span =
        document.createElement("span");


    span.textContent = value;


    div.appendChild(strong);

    div.appendChild(span);


    answersContainer.appendChild(div);

}


// ------------------------------------------------------------
// CLOSE MODAL
// ------------------------------------------------------------

closeModal.addEventListener("click", () => {

    answersModal.classList.add("hidden");

});


answersModal.addEventListener("click", (event) => {

    if (event.target === answersModal) {

        answersModal.classList.add("hidden");

    }

});


// ------------------------------------------------------------
// FORMAT DATE
// ------------------------------------------------------------

function formatDate(dateString) {

    if (!dateString) {

        return "Unknown";

    }


    const date =
        new Date(dateString);


    return date.toLocaleString(
        "en-ZA",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// ------------------------------------------------------------
// CSV EXPORT
// ------------------------------------------------------------

exportButton.addEventListener("click", () => {

    if (allResponses.length === 0) {

        alert("There are no responses to export.");

        return;

    }


    const headers = [

        "Full Name",

        "Date",

        "Q1",
        "Q2",
        "Q3",
        "Q4",
        "Q5",
        "Q5 Other",
        "Q6",
        "Q6 Other",
        "Q7",
        "Q8",
        "Q9",
        "Q10",
        "Q11",
        "Q12",
        "Q12 Other",
        "Q13",
        "Q14",
        "Q15",
        "Q16",
        "Q16 Other",
        "Q17",
        "Q18",
        "Q19",
        "Q20"

    ];


    const rows = allResponses.map(response => [

        response.full_name,

        response.created_at,

        response.q1,

        response.q2,

        response.q3,

        response.q4,

        formatArray(response.q5),

        response.q5_other,

        response.q6,

        response.q6_other,

        response.q7,

        response.q8,

        response.q9,

        response.q10,

        response.q11,

        formatArray(response.q12),

        response.q12_other,

        response.q13,

        response.q14,

        response.q15,

        formatArray(response.q16),

        response.q16_other,

        response.q17,

        response.q18,

        response.q19,

        response.q20

    ]);


    let csv =
        headers.map(csvEscape).join(",") +
        "\n";


    rows.forEach(row => {

        csv +=
            row.map(csvEscape).join(",") +
            "\n";

    });


    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "waste-management-survey-responses.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

});


// ------------------------------------------------------------
// FORMAT ARRAY
// ------------------------------------------------------------

function formatArray(value) {

    if (Array.isArray(value)) {

        return value.join("; ");

    }


    return value || "";

}


// ------------------------------------------------------------
// CSV ESCAPE
// ------------------------------------------------------------

function csvEscape(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return '""';

    }


    const text =
        String(value)
            .replace(/"/g, '""');


    return `"${text}"`;

}
