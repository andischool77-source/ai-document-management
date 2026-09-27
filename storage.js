/*
    AI DOCUMENT MANAGEMENT
    STORAGE & UTILITY ENGINE
*/


/* ================================
   FORMAT DATE
================================ */

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* ================================
   FORMAT DATETIME
================================ */

function formatDateTime(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    return date.toLocaleString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ================================
   FILE ICON
================================ */

function getFileIcon(fileName) {

    const name = String(fileName || "").toLowerCase();

    if (name.endsWith(".pdf")) {
        return "📕";
    }

    if (
        name.endsWith(".doc") ||
        name.endsWith(".docx")
    ) {
        return "📘";
    }

    if (
        name.endsWith(".xls") ||
        name.endsWith(".xlsx") ||
        name.endsWith(".csv")
    ) {
        return "📗";
    }

    if (
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".webp")
    ) {
        return "🖼️";
    }

    if (
        name.endsWith(".txt") ||
        name.endsWith(".md")
    ) {
        return "📝";
    }

    return "📄";

}


/* ================================
   FILE SIZE
================================ */

function formatFileSize(bytes) {

    if (!bytes) {
        return "0 KB";
    }

    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    if (bytes < 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    return (
        bytes / (1024 * 1024 * 1024)
    ).toFixed(1) + " GB";

}


/* ================================
   ESCAPE HTML
================================ */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ================================
   CSV ESCAPE
================================ */

function csvEscape(value) {

    const text = String(
        value === undefined || value === null
            ? ""
            : value
    );

    return '"' +
        text.replaceAll('"', '""') +
        '"';

}


/* ================================
   DOWNLOAD BLOB
================================ */

function downloadBlob(blob, fileName) {

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(function() {
        URL.revokeObjectURL(url);
    }, 1000);

}


/* ================================
   DOWNLOAD TEXT
================================ */

function downloadText(
    text,
    fileName,
    mimeType = "text/plain;charset=utf-8"
) {

    const blob = new Blob(
        [text],
        {
            type: mimeType
        }
    );

    downloadBlob(blob, fileName);

}


/* ================================
   GET DAYS DIFFERENCE
================================ */

function getDaysDifference(dateString) {

    if (!dateString) {
        return null;
    }

    const target = new Date(
        dateString + "T00:00:00"
    );

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return Math.ceil(
        (target - today) /
        (1000 * 60 * 60 * 24)
    );

}


/* ================================
   TEXT EXTRACTION
================================ */

async function extractTextFromFile(file) {

    if (!file) {
        return "";
    }

    const type = file.type || "";
    const name = file.name.toLowerCase();

    if (
        type.startsWith("text/") ||
        name.endsWith(".txt") ||
        name.endsWith(".csv") ||
        name.endsWith(".md")
    ) {

        try {
            return await file.text();
        } catch (error) {
            return "";
        }

    }

    return "";

}


/* ================================
   SEARCH DOCUMENTS
================================ */

function searchDocuments(
    documents,
    keyword,
    category,
    sortType
) {

    let result = [...documents];

    const search = String(
        keyword || ""
    ).trim().toLowerCase();

    if (search) {

        result = result.filter(function(document) {

            const searchable = [
                document.name,
                document.category,
                document.description,
                document.text,
                document.fileName
            ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(search);

        });

    }

    if (category) {

        result = result.filter(function(document) {

            return document.category === category;

        });

    }

    result.sort(function(a, b) {

        if (sortType === "oldest") {

            return new Date(a.createdAt) -
                   new Date(b.createdAt);

        }

        if (sortType === "name") {

            return String(a.name).localeCompare(
                String(b.name),
                "id"
            );

        }

        if (sortType === "name-desc") {

            return String(b.name).localeCompare(
                String(a.name),
                "id"
            );

        }

        return new Date(b.createdAt) -
               new Date(a.createdAt);

    });

    return result;

}


/* ================================
   ANALYZE DOCUMENT
================================ */

function analyzeDocument(documentData) {

    const text = [
        documentData.name,
        documentData.description,
        documentData.text
    ]
        .filter(Boolean)
        .join("\n");

    const lower = text.toLowerCase();


    /* NOMINAL */

    const moneyMatches = text.match(
        /(?:rp\.?\s*)?[\d.]+(?:,\d+)?(?:\s*(?:ribu|juta|miliar))?/gi
    ) || [];


    /* DATE */

    const dateMatches = text.match(
        /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g
    ) || [];


    /* EMAIL */

    const emailMatches = text.match(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
    ) || [];


    /* PHONE */

    const phoneMatches = text.match(
        /(?:\+62|62|0)[\s.-]?\d{2,4}[\s.-]?\d{3,4}[\s.-]?\d{3,5}/g
    ) || [];


    /* WORD COUNT */

    const words = text
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    /* CATEGORY DETECTION */

    let detectedCategory =
        documentData.category || "Lainnya";

    if (
        lower.includes("invoice") ||
        lower.includes("faktur") ||
        lower.includes("tagihan")
    ) {
        detectedCategory = "Invoice";
    }

    else if (
        lower.includes("kontrak") ||
        lower.includes("perjanjian")
    ) {
        detectedCategory = "Kontrak";
    }

    else if (
        lower.includes("laporan") ||
        lower.includes("report")
    ) {
        detectedCategory = "Laporan";
    }

    else if (
        lower.includes("surat")
    ) {
        detectedCategory = "Surat";
    }


    /* SUMMARY */

    let summary = "";

    const cleanText = text
        .replace(/\s+/g, " ")
        .trim();

    if (cleanText) {

        const sentences = cleanText
            .split(/[.!?]+/)
            .map(function(sentence) {
                return sentence.trim();
            })
            .filter(Boolean);

        summary = sentences
            .slice(0, 3)
            .join(". ");

        if (summary.length > 400) {
            summary =
                summary.substring(0, 400) +
                "...";
        }

    } else {

        summary =
            "Belum terdapat teks yang dapat dianalisis.";

    }


    return {

        detectedCategory,

        money: [
            ...new Set(moneyMatches)
        ],

        dates: [
            ...new Set(dateMatches)
        ],

        emails: [
            ...new Set(emailMatches)
        ],

        phones: [
            ...new Set(phoneMatches)
        ],

        wordCount: words.length,

        summary

    };

}


/* ================================
   AI QUESTION ANSWER
================================ */

function answerDocumentQuestion(
    documentData,
    question
) {

    const q = String(
        question || ""
    ).toLowerCase();

    const analysis =
        analyzeDocument(documentData);


    /* SUMMARY */

    if (
        q.includes("ringkas") ||
        q.includes("summary") ||
        q.includes("rangkum")
    ) {

        return analysis.summary;

    }


    /* NOMINAL */

    if (
        q.includes("nominal") ||
        q.includes("harga") ||
        q.includes("total") ||
        q.includes("jumlah uang") ||
        q.includes("berapa")
    ) {

        if (analysis.money.length) {

            return (
                "Nominal yang terdeteksi: " +
                analysis.money.join(", ")
            );

        }

    }


    /* DATE */

    if (
        q.includes("tanggal") ||
        q.includes("jatuh tempo") ||
        q.includes("berakhir") ||
        q.includes("kapan")
    ) {

        const dates = [
            ...analysis.dates
        ];

        if (documentData.documentDate) {
            dates.unshift(
                formatDate(documentData.documentDate)
            );
        }

        if (documentData.reminderDate) {
            dates.push(
                formatDate(documentData.reminderDate)
            );
        }

        if (dates.length) {

            return (
                "Tanggal yang tersedia: " +
                [...new Set(dates)].join(", ")
            );

        }

    }


    /* PARTY */

    if (
        q.includes("pihak") ||
        q.includes("siapa") ||
        q.includes("perusahaan")
    ) {

        const text = documentData.text || "";

        const partyLines = text
            .split(/\n/)
            .filter(function(line) {

                const l = line.toLowerCase();

                return (
                    l.includes("pt ") ||
                    l.includes("cv ") ||
                    l.includes("nama:") ||
                    l.includes("pihak:")
                );

            })
            .slice(0, 5);

        if (partyLines.length) {

            return (
                "Informasi pihak yang ditemukan:\n" +
                partyLines.join("\n")
            );

        }

    }


    /* CONTACT */

    if (
        q.includes("email") ||
        q.includes("kontak") ||
        q.includes("telepon") ||
        q.includes("nomor")
    ) {

        const results = [
            ...analysis.emails,
            ...analysis.phones
        ];

        if (results.length) {

            return (
                "Kontak yang ditemukan: " +
                results.join(", ")
            );

        }

    }


    /* DEFAULT */

    if (documentData.text) {

        const searchWords = q
            .replace(/[^\w\s]/g, " ")
            .split(/\s+/)
            .filter(function(word) {
                return word.length > 3;
            });

        const sentences = documentData.text
            .split(/[.!?\n]+/)
            .map(function(sentence) {
                return sentence.trim();
            })
            .filter(Boolean);

        const matches = sentences
            .filter(function(sentence) {

                const lowerSentence =
                    sentence.toLowerCase();

                return searchWords.some(
                    function(word) {
                        return lowerSentence.includes(word);
                    }
                );

            })
            .slice(0, 3);

        if (matches.length) {

            return matches.join(". ");

        }

    }


    return (
        "Informasi tersebut belum dapat ditemukan " +
        "dari data dokumen yang tersedia."
    );

}


/* ================================
   AUTO CATEGORY
================================ */

function detectCategoryFromName(name) {

    const value = String(name || "")
        .toLowerCase();

    if (
        value.includes("invoice") ||
        value.includes("faktur") ||
        value.includes("tagihan")
    ) {
        return "Invoice";
    }

    if (
        value.includes("kontrak") ||
        value.includes("perjanjian")
    ) {
        return "Kontrak";
    }

    if (
        value.includes("laporan") ||
        value.includes("report")
    ) {
        return "Laporan";
    }

    if (value.includes("surat")) {
        return "Surat";
    }

    if (
        value.includes("karyawan") ||
        value.includes("pegawai")
    ) {
        return "Karyawan";
    }

    if (
        value.includes("pelanggan") ||
        value.includes("customer")
    ) {
        return "Pelanggan";
    }

    if (
        value.includes("pembelian") ||
        value.includes("purchase")
    ) {
        return "Pembelian";
    }

    if (
        value.includes("penjualan") ||
        value.includes("sales")
    ) {
        return "Penjualan";
    }

    if (
        value.includes("keuangan") ||
        value.includes("finance")
    ) {
        return "Keuangan";
    }

    return "Lainnya";

}