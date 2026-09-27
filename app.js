/*
    AI DOCUMENT MANAGEMENT
    APPLICATION ENGINE
*/


let documents = [];

let selectedFile = null;


/* ================================
   START APPLICATION
================================ */

document.addEventListener(
    "DOMContentLoaded",
    initApp
);


async function initApp() {

    try {

        await openDatabase();

        documents =
            await dbGetAllDocuments();

        setupNavigation();

        setupButtons();

        setupSearch();

        setupUpload();

        setupAI();

        renderAll();

    }

    catch (error) {

        console.error(error);

        showToast(
            "Database gagal dibuka.",
            "error"
        );

    }

}


/* ================================
   NAVIGATION
================================ */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(".menu-btn");

    buttons.forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                const page =
                    button.dataset.page;

                openPage(page);

            }
        );

    });

}


function openPage(page) {

    document
        .querySelectorAll(".menu-btn")
        .forEach(function(button) {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    document
        .querySelectorAll(".page")
        .forEach(function(section) {

            section.classList.remove("active");

        });


    const target =
        document.getElementById(
            "page-" + page
        );

    if (target) {
        target.classList.add("active");
    }


    const titles = {

        dashboard: [
            "Dashboard",
            "Pusat pengelolaan dokumen bisnis"
        ],

        documents: [
            "Dokumen",
            "Kelola seluruh dokumen bisnis"
        ],

        ai: [
            "AI Assistant",
            "Analisis dan tanya dokumen"
        ],

        reminder: [
            "Pengingat",
            "Tanggal penting dokumen"
        ],

        backup: [
            "Backup & Data",
            "Kelola keamanan data lokal"
        ]

    };


    if (titles[page]) {

        document.getElementById(
            "pageTitle"
        ).textContent = titles[page][0];

        document.getElementById(
            "pageSubtitle"
        ).textContent = titles[page][1];

    }


    if (page === "documents") {
        renderDocuments();
    }

    if (page === "ai") {
        renderAISelect();
    }

    if (page === "reminder") {
        renderReminders();
    }

}


/* ================================
   BUTTON SETUP
================================ */

function setupButtons() {

    document
        .getElementById("quickUploadBtn")
        .addEventListener(
            "click",
            openUploadModal
        );


    document
        .getElementById("welcomeUploadBtn")
        .addEventListener(
            "click",
            openUploadModal
        );


    document
        .getElementById("uploadDocumentBtn")
        .addEventListener(
            "click",
            openUploadModal
        );


    document
        .getElementById("viewAllBtn")
        .addEventListener(
            "click",
            function() {
                openPage("documents");
            }
        );


    document
        .getElementById("backupBtn")
        .addEventListener(
            "click",
            backupData
        );


    document
        .getElementById("restoreBtn")
        .addEventListener(
            "click",
            function() {

                document
                    .getElementById("restoreInput")
                    .click();

            }
        );


    document
        .getElementById("restoreInput")
        .addEventListener(
            "change",
            restoreData
        );


    document
        .getElementById("exportCsvBtn")
        .addEventListener(
            "click",
            exportCSV
        );


    document
        .getElementById("resetBtn")
        .addEventListener(
            "click",
            resetData
        );


    document
        .querySelectorAll(
            "[data-close]"
        )
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    closeModal(
                        button.dataset.close
                    );

                }
            );

        });


    document
        .getElementById("uploadModal")
        .addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    document.getElementById(
                        "uploadModal"
                    )
                ) {

                    closeModal("uploadModal");

                }

            }
        );


    document
        .getElementById("detailModal")
        .addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    document.getElementById(
                        "detailModal"
                    )
                ) {

                    closeModal("detailModal");

                }

            }
        );

}


/* ================================
   SEARCH
================================ */

function setupSearch() {

    document
        .getElementById("searchInput")
        .addEventListener(
            "input",
            renderDocuments
        );


    document
        .getElementById("categoryFilter")
        .addEventListener(
            "change",
            renderDocuments
        );


    document
        .getElementById("sortDocuments")
        .addEventListener(
            "change",
            renderDocuments
        );

}


/* ================================
   UPLOAD
================================ */

function setupUpload() {

    const fileInput =
        document.getElementById(
            "documentFile"
        );

    const fileDrop =
        document.getElementById(
            "fileDrop"
        );


    fileInput.addEventListener(
        "change",
        async function() {

            if (!fileInput.files.length) {
                return;
            }

            selectedFile =
                fileInput.files[0];

            document.getElementById(
                "selectedFileName"
            ).textContent =
                "File dipilih: " +
                selectedFile.name;


            const nameInput =
                document.getElementById(
                    "documentName"
                );

            if (!nameInput.value) {

                nameInput.value =
                    selectedFile.name
                        .replace(/\.[^/.]+$/, "");

            }


            const category =
                detectCategoryFromName(
                    selectedFile.name
                );

            document.getElementById(
                "documentCategory"
            ).value = category;


            const extractedText =
                await extractTextFromFile(
                    selectedFile
                );


            if (extractedText) {

                document.getElementById(
                    "documentText"
                ).value =
                    extractedText;

            }

        }
    );


    fileDrop.addEventListener(
        "click",
        function() {
            fileInput.click();
        }
    );


    document
        .getElementById("documentForm")
        .addEventListener(
            "submit",
            saveDocument
        );

}


/* ================================
   OPEN UPLOAD
================================ */

function openUploadModal() {

    selectedFile = null;

    document
        .getElementById("documentForm")
        .reset();

    document
        .getElementById("selectedFileName")
        .textContent = "";


    document
        .getElementById("uploadModal")
        .classList.add("show");

}


/* ================================
   SAVE DOCUMENT
================================ */

async function saveDocument(event) {

    event.preventDefault();


    const fileInput =
        document.getElementById(
            "documentFile"
        );


    if (
        !selectedFile &&
        !fileInput.files.length
    ) {

        showToast(
            "Pilih file dokumen terlebih dahulu.",
            "error"
        );

        return;

    }


    if (!selectedFile) {
        selectedFile = fileInput.files[0];
    }


    const documentData = {

        name:
            document.getElementById(
                "documentName"
            ).value.trim(),

        category:
            document.getElementById(
                "documentCategory"
            ).value,

        documentDate:
            document.getElementById(
                "documentDate"
            ).value,

        reminderDate:
            document.getElementById(
                "documentReminder"
            ).value,

        description:
            document.getElementById(
                "documentDescription"
            ).value.trim(),

        text:
            document.getElementById(
                "documentText"
            ).value.trim(),

        fileName:
            selectedFile.name,

        fileType:
            selectedFile.type,

        fileSize:
            selectedFile.size,

        file:
            selectedFile,

        createdAt:
            new Date().toISOString()

    };


    try {

        await dbAddDocument(
            documentData
        );

        documents =
            await dbGetAllDocuments();


        closeModal("uploadModal");

        renderAll();


        showToast(
            "Dokumen berhasil disimpan.",
            "success"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Dokumen gagal disimpan.",
            "error"
        );

    }

}


/* ================================
   RENDER ALL
================================ */

function renderAll() {

    renderDashboard();

    renderDocuments();

    renderAISelect();

    renderReminders();

}


/* ================================
   DASHBOARD
================================ */

function renderDashboard() {

    document.getElementById(
        "statTotal"
    ).textContent =
        documents.length;


    document.getElementById(
        "statInvoice"
    ).textContent =
        documents.filter(
            d => d.category === "Invoice"
        ).length;


    document.getElementById(
        "statContract"
    ).textContent =
        documents.filter(
            d => d.category === "Kontrak"
        ).length;


    document.getElementById(
        "statReminder"
    ).textContent =
        documents.filter(
            d => d.reminderDate
        ).length;


    const recent =
        [...documents]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 5);


    const container =
        document.getElementById(
            "recentDocuments"
        );


    if (!recent.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📄</div>
                <p>Belum ada dokumen.</p>
            </div>
        `;

    }

    else {

        container.innerHTML =
            recent.map(
                documentRowHTML
            ).join("");

    }


    renderDashboardReminders();

}


/* ================================
   DOCUMENT ROW
================================ */

function documentRowHTML(documentData) {

    return `
        <div class="document-row">

            <div class="document-info">

                <div class="file-icon">
                    ${getFileIcon(documentData.fileName)}
                </div>

                <div>

                    <div class="document-name">
                        ${escapeHTML(documentData.name)}
                    </div>

                    <div class="document-meta">
                        ${escapeHTML(documentData.fileName)}
                        •
                        ${formatDateTime(documentData.createdAt)}
                    </div>

                </div>

            </div>

            <span class="badge">
                ${escapeHTML(documentData.category)}
            </span>

        </div>
    `;

}


/* ================================
   DOCUMENTS
================================ */

function renderDocuments() {

    const keyword =
        document.getElementById(
            "searchInput"
        ).value;

    const category =
        document.getElementById(
            "categoryFilter"
        ).value;

    const sort =
        document.getElementById(
            "sortDocuments"
        ).value;


    const filtered =
        searchDocuments(
            documents,
            keyword,
            category,
            sort
        );


    document.getElementById(
        "documentCount"
    ).textContent =
        filtered.length +
        " dokumen";


    const container =
        document.getElementById(
            "documentsContainer"
        );


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <div>📂</div>
                <p>
                    ${
                        documents.length
                            ? "Dokumen tidak ditemukan."
                            : "Belum ada dokumen."
                    }
                </p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        filtered
            .map(documentCardHTML)
            .join("");

}


/* ================================
   DOCUMENT CARD
================================ */

function documentCardHTML(documentData) {

    return `
        <div class="document-card">

            <div class="document-card-top">

                <div class="document-card-icon">
                    ${getFileIcon(documentData.fileName)}
                </div>

                <span class="badge">
                    ${escapeHTML(documentData.category)}
                </span>

            </div>

            <h4>
                ${escapeHTML(documentData.name)}
            </h4>

            <p>
                ${escapeHTML(documentData.fileName)}
            </p>

            <p>
                Ukuran: ${formatFileSize(documentData.fileSize)}
            </p>

            <p>
                Ditambahkan:
                ${formatDate(documentData.createdAt)}
            </p>

            <div class="document-card-actions">

                <button
                    onclick="viewDocument(${documentData.id})"
                >
                    👁️ Lihat
                </button>

                <button
                    onclick="downloadDocument(${documentData.id})"
                >
                    ⬇️ Download
                </button>

                <button
                    onclick="deleteDocument(${documentData.id})"
                >
                    🗑️ Hapus
                </button>

            </div>

        </div>
    `;

}


/* ================================
   VIEW DOCUMENT
================================ */

async function viewDocument(id) {

    const documentData =
        documents.find(
            d => Number(d.id) === Number(id)
        );


    if (!documentData) {
        return;
    }


    document.getElementById(
        "detailTitle"
    ).textContent =
        documentData.name;


    document.getElementById(
        "detailSubtitle"
    ).textContent =
        documentData.fileName;


    const analysis =
        analyzeDocument(
            documentData
        );


    document.getElementById(
        "detailContent"
    ).innerHTML = `

        <div class="detail-grid">

            <div class="detail-item">
                <span>Nama</span>
                <strong>
                    ${escapeHTML(documentData.name)}
                </strong>
            </div>

            <div class="detail-item">
                <span>Kategori</span>
                <strong>
                    ${escapeHTML(documentData.category)}
                </strong>
            </div>

            <div class="detail-item">
                <span>Tanggal Dokumen</span>
                <strong>
                    ${formatDate(documentData.documentDate)}
                </strong>
            </div>

            <div class="detail-item">
                <span>Tanggal Pengingat</span>
                <strong>
                    ${formatDate(documentData.reminderDate)}
                </strong>
            </div>

            <div class="detail-item">
                <span>Ukuran</span>
                <strong>
                    ${formatFileSize(documentData.fileSize)}
                </strong>
            </div>

            <div class="detail-item">
                <span>Ditambahkan</span>
                <strong>
                    ${formatDateTime(documentData.createdAt)}
                </strong>
            </div>

        </div>


        <div class="detail-description">

            <strong>Deskripsi</strong>

            <br><br>

            ${
                escapeHTML(
                    documentData.description ||
                    "Tidak ada deskripsi."
                )
            }

        </div>


        <div class="detail-description">

            <strong>Ringkasan AI</strong>

            <br><br>

            ${escapeHTML(analysis.summary)}

        </div>


        <div class="detail-actions">

            <button
                class="primary-btn"
                onclick="downloadDocument(${documentData.id})"
            >
                ⬇️ Download
            </button>

            <button
                class="secondary-btn"
                onclick="openAIForDocument(${documentData.id})"
            >
                🤖 Analisis AI
            </button>

        </div>

    `;


    document
        .getElementById("detailModal")
        .classList.add("show");

}


/* ================================
   DOWNLOAD DOCUMENT
================================ */

async function downloadDocument(id) {

    const documentData =
        documents.find(
            d => Number(d.id) === Number(id)
        );


    if (!documentData) {
        return;
    }


    if (!documentData.file) {

        showToast(
            "File tidak tersedia.",
            "error"
        );

        return;

    }


    downloadBlob(
        documentData.file,
        documentData.fileName
    );

}


/* ================================
   DELETE
================================ */

async function deleteDocument(id) {

    const documentData =
        documents.find(
            d => Number(d.id) === Number(id)
        );


    if (!documentData) {
        return;
    }


    const confirmed =
        confirm(
            'Hapus dokumen "' +
            documentData.name +
            '"?'
        );


    if (!confirmed) {
        return;
    }


    try {

        await dbDeleteDocument(id);

        documents =
            await dbGetAllDocuments();

        renderAll();

        showToast(
            "Dokumen berhasil dihapus.",
            "success"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Gagal menghapus dokumen.",
            "error"
        );

    }

}


/* ================================
   AI SETUP
================================ */

function setupAI() {

    document
        .getElementById("askAiBtn")
        .addEventListener(
            "click",
            askAI
        );


    document
        .getElementById("aiQuestion")
        .addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter") {
                    askAI();
                }

            }
        );


    document
        .getElementById("aiDocumentSelect")
        .addEventListener(
            "change",
            function() {

                updateAIAnalysis(
                    this.value
                );

            }
        );


    document
        .querySelectorAll(
            ".quick-questions button"
        )
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    document.getElementById(
                        "aiQuestion"
                    ).value =
                        button.dataset.question;

                    askAI();

                }
            );

        });

}


/* ================================
   AI SELECT
================================ */

function renderAISelect() {

    const select =
        document.getElementById(
            "aiDocumentSelect"
        );


    const currentValue =
        select.value;


    select.innerHTML =
        `<option value="">Pilih dokumen...</option>` +
        documents
            .slice()
            .sort(
                (a, b) =>
                    String(a.name)
                        .localeCompare(
                            String(b.name),
                            "id"
                        )
            )
            .map(function(documentData) {

                return `
                    <option value="${documentData.id}">
                        ${escapeHTML(documentData.name)}
                    </option>
                `;

            })
            .join("");


    if (
        documents.some(
            d =>
                String(d.id) ===
                String(currentValue)
        )
    ) {

        select.value =
            currentValue;

    }

}


/* ================================
   AI ANALYSIS
================================ */

function updateAIAnalysis(id) {

    const container =
        document.getElementById(
            "aiAnalysis"
        );


    const documentData =
        documents.find(
            d =>
                String(d.id) ===
                String(id)
        );


    if (!documentData) {

        container.innerHTML = `
            <div class="empty-state">
                <div>🤖</div>
                <p>Pilih dokumen untuk melihat analisis.</p>
            </div>
        `;

        return;

    }


    const analysis =
        analyzeDocument(
            documentData
        );


    container.innerHTML = `

        <div class="analysis-item">
            <span>Nama Dokumen</span>
            <strong>
                ${escapeHTML(documentData.name)}
            </strong>
        </div>

        <div class="analysis-item">
            <span>Kategori</span>
            <strong>
                ${escapeHTML(analysis.detectedCategory)}
            </strong>
        </div>

        <div class="analysis-item">
            <span>Jumlah Kata</span>
            <strong>
                ${analysis.wordCount}
            </strong>
        </div>

        <div class="analysis-item">
            <span>Nominal Terdeteksi</span>
            <strong>
                ${
                    analysis.money.length
                        ? escapeHTML(
                            analysis.money.join(", ")
                          )
                        : "Tidak ditemukan"
                }
            </strong>
        </div>

        <div class="analysis-item">
            <span>Tanggal Terdeteksi</span>
            <strong>
                ${
                    analysis.dates.length
                        ? escapeHTML(
                            analysis.dates.join(", ")
                          )
                        : "Tidak ditemukan"
                }
            </strong>
        </div>

        <div class="analysis-item">
            <span>Email</span>
            <strong>
                ${
                    analysis.emails.length
                        ? escapeHTML(
                            analysis.emails.join(", ")
                          )
                        : "Tidak ditemukan"
                }
            </strong>
        </div>

        <div class="analysis-item">
            <span>Telepon</span>
            <strong>
                ${
                    analysis.phones.length
                        ? escapeHTML(
                            analysis.phones.join(", ")
                          )
                        : "Tidak ditemukan"
                }
            </strong>
        </div>

        <div class="analysis-item">
            <span>Ringkasan</span>
            <strong>
                ${escapeHTML(analysis.summary)}
            </strong>
        </div>

    `;

}


/* ================================
   ASK AI
================================ */

function askAI() {

    const select =
        document.getElementById(
            "aiDocumentSelect"
        );


    const questionInput =
        document.getElementById(
            "aiQuestion"
        );


    const question =
        questionInput.value.trim();


    if (!select.value) {

        showToast(
            "Pilih dokumen terlebih dahulu.",
            "error"
        );

        return;

    }


    if (!question) {
        return;
    }


    const documentData =
        documents.find(
            d =>
                String(d.id) ===
                String(select.value)
        );


    if (!documentData) {
        return;
    }


    addChatMessage(
        question,
        "user"
    );


    const answer =
        answerDocumentQuestion(
            documentData,
            question
        );


    setTimeout(
        function() {

            addChatMessage(
                answer,
                "ai"
            );

        },
        250
    );


    questionInput.value = "";

    updateAIAnalysis(
        documentData.id
    );

}


/* ================================
   CHAT MESSAGE
================================ */

function addChatMessage(
    message,
    type
) {

    const container =
        document.getElementById(
            "chatMessages"
        );


    const div =
        document.createElement("div");


    div.className =
        "chat-message " +
        (
            type === "user"
                ? "user-message"
                : "ai-message"
        );


    div.innerHTML = `

        <div class="chat-avatar">
            ${type === "user" ? "👤" : "🤖"}
        </div>

        <div>
            ${escapeHTML(message)}
        </div>

    `;


    container.appendChild(div);

    container.scrollTop =
        container.scrollHeight;

}


/* ================================
   OPEN AI DOCUMENT
================================ */

function openAIForDocument(id) {

    closeModal("detailModal");

    openPage("ai");

    document.getElementById(
        "aiDocumentSelect"
    ).value = id;

    updateAIAnalysis(id);

}


/* ================================
   REMINDERS
================================ */

function getReminders() {

    return documents
        .filter(
            d => d.reminderDate
        )
        .sort(
            (a, b) =>
                new Date(a.reminderDate) -
                new Date(b.reminderDate)
        );

}


function renderReminders() {

    const container =
        document.getElementById(
            "remindersContainer"
        );


    const reminders =
        getReminders();


    if (!reminders.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>⏰</div>
                <p>Belum ada pengingat dokumen.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        reminders
            .map(reminderHTML)
            .join("");

}


function reminderHTML(documentData) {

    const days =
        getDaysDifference(
            documentData.reminderDate
        );


    let label = "";


    if (days < 0) {
        label =
            "Sudah lewat " +
            Math.abs(days) +
            " hari";
    }

    else if (days === 0) {
        label = "Hari ini";
    }

    else if (days === 1) {
        label = "Besok";
    }

    else {
        label =
            days +
            " hari lagi";
    }


    return `

        <div class="reminder-card">

            <div>

                <strong>
                    ${escapeHTML(documentData.name)}
                </strong>

                <div class="document-meta">
                    ${escapeHTML(documentData.category)}
                    •
                    ${escapeHTML(documentData.fileName)}
                </div>

            </div>

            <div class="reminder-date">

                ${formatDate(documentData.reminderDate)}

                <br>

                ${label}

            </div>

        </div>

    `;

}


function renderDashboardReminders() {

    const container =
        document.getElementById(
            "dashboardReminders"
        );


    const reminders =
        getReminders().slice(0, 5);


    if (!reminders.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>✓</div>
                <p>Tidak ada pengingat.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        reminders
            .map(reminderHTML)
            .join("");

}


/* ================================
   BACKUP
================================ */

async function backupData() {

    try {

        const data =
            await dbGetAllDocuments();


        const backup = {

            app:
                "AI DOCUMENT MANAGEMENT",

            version:
                1,

            exportedAt:
                new Date().toISOString(),

            documents:
                data

        };


        const json =
            JSON.stringify(
                backup,
                function(key, value) {

                    if (key === "file") {

                        return null;

                    }

                    return value;

                },
                2
            );


        downloadText(
            json,
            "ai-document-backup-" +
            new Date()
                .toISOString()
                .slice(0, 10) +
            ".json",
            "application/json"
        );


        showToast(
            "Backup berhasil dibuat.",
            "success"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Backup gagal.",
            "error"
        );

    }

}


/* ================================
   RESTORE
================================ */

async function restoreData(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    try {

        const text =
            await file.text();


        const backup =
            JSON.parse(text);


        if (
            !backup ||
            !Array.isArray(
                backup.documents
            )
        ) {

            throw new Error(
                "Format backup tidak valid."
            );

        }


        const confirmed =
            confirm(
                "Restore akan mengganti data saat ini. Lanjutkan?"
            );


        if (!confirmed) {
            return;
        }


        await dbReplaceDocuments(
            backup.documents
        );


        documents =
            await dbGetAllDocuments();


        renderAll();


        showToast(
            "Data berhasil direstore.",
            "success"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "File backup tidak valid.",
            "error"
        );

    }

    finally {

        event.target.value = "";

    }

}


/* ================================
   EXPORT CSV
================================ */

function exportCSV() {

    if (!documents.length) {

        showToast(
            "Belum ada dokumen untuk diexport.",
            "error"
        );

        return;

    }


    const header = [

        "ID",
        "Nama Dokumen",
        "Kategori",
        "Nama File",
        "Tanggal Dokumen",
        "Tanggal Pengingat",
        "Deskripsi",
        "Ukuran",
        "Tanggal Ditambahkan"

    ];


    const rows =
        documents.map(
            function(documentData) {

                return [

                    documentData.id,

                    documentData.name,

                    documentData.category,

                    documentData.fileName,

                    documentData.documentDate,

                    documentData.reminderDate,

                    documentData.description,

                    formatFileSize(
                        documentData.fileSize
                    ),

                    formatDateTime(
                        documentData.createdAt
                    )

                ]
                    .map(csvEscape)
                    .join(",");

            }
        );


    const csv =
        "\uFEFF" +
        header
            .map(csvEscape)
            .join(",") +
        "\n" +
        rows.join("\n");


    downloadText(
        csv,
        "ai-document-export.csv",
        "text/csv;charset=utf-8"
    );


    showToast(
        "CSV berhasil diexport.",
        "success"
    );

}


/* ================================
   RESET
================================ */

async function resetData() {

    const confirmed =
        confirm(
            "PERINGATAN!\n\n" +
            "Semua dokumen dan data akan dihapus permanen dari database lokal.\n\n" +
            "Lanjutkan?"
        );


    if (!confirmed) {
        return;
    }


    const secondConfirm =
        confirm(
            "Yakin ingin menghapus SEMUA DATA?"
        );


    if (!secondConfirm) {
        return;
    }


    try {

        await dbClearDocuments();

        documents = [];

        renderAll();

        showToast(
            "Semua data berhasil dihapus.",
            "success"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Reset data gagal.",
            "error"
        );

    }

}


/* ================================
   MODAL
================================ */

function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.remove("show");
    }

}


/* ================================
   TOAST
================================ */

function showToast(
    message,
    type = ""
) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    const toast =
        document.createElement("div");


    toast.className =
        "toast " + type;


    toast.textContent =
        message;


    container.appendChild(toast);


    setTimeout(
        function() {

            toast.remove();

        },
        3000
    );

}