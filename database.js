/*
    AI DOCUMENT MANAGEMENT
    DATABASE ENGINE

    Menggunakan IndexedDB.
*/

const DB_NAME = "AIDocumentManagementDB";
const DB_VERSION = 1;

const STORE_DOCUMENTS = "documents";

let dbInstance = null;


/* ================================
   OPEN DATABASE
================================ */

function openDatabase() {

    return new Promise((resolve, reject) => {

        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function(event) {

            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {

                const store = db.createObjectStore(
                    STORE_DOCUMENTS,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

                store.createIndex(
                    "name",
                    "name",
                    { unique: false }
                );

                store.createIndex(
                    "category",
                    "category",
                    { unique: false }
                );

                store.createIndex(
                    "documentDate",
                    "documentDate",
                    { unique: false }
                );

                store.createIndex(
                    "createdAt",
                    "createdAt",
                    { unique: false }
                );
            }
        };

        request.onsuccess = function(event) {

            dbInstance = event.target.result;

            dbInstance.onclose = function() {
                dbInstance = null;
            };

            resolve(dbInstance);
        };

        request.onerror = function() {
            reject(request.error);
        };

    });

}


/* ================================
   ADD DOCUMENT
================================ */

async function dbAddDocument(documentData) {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            STORE_DOCUMENTS,
            "readwrite"
        );

        const store = transaction.objectStore(
            STORE_DOCUMENTS
        );

        const request = store.add(documentData);

        request.onsuccess = function() {
            resolve(request.result);
        };

        request.onerror = function() {
            reject(request.error);
        };

    });

}


/* ================================
   GET ALL
================================ */

async function dbGetAllDocuments() {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            STORE_DOCUMENTS,
            "readonly"
        );

        const store = transaction.objectStore(
            STORE_DOCUMENTS
        );

        const request = store.getAll();

        request.onsuccess = function() {
            resolve(request.result || []);
        };

        request.onerror = function() {
            reject(request.error);
        };

    });

}


/* ================================
   GET ONE
================================ */

async function dbGetDocument(id) {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            STORE_DOCUMENTS,
            "readonly"
        );

        const store = transaction.objectStore(
            STORE_DOCUMENTS
        );

        const request = store.get(Number(id));

        request.onsuccess = function() {
            resolve(request.result);
        };

        request.onerror = function() {
            reject(request.error);
        };

    });

}


/* ================================
   UPDATE
================================ */

async function dbUpdateDocument(documentData) {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            STORE_DOCUMENTS,
            "readwrite"
        );

        const store = transaction.objectStore(
            STORE_DOCUMENTS
        );

        const request = store.put(documentData);

        request.onsuccess = function() {
            resolve(true);
        };

        request.onerror = function() {
            reject(request.error);
        };

    });

}


/* ================================
   DELETE
================================ */

async function dbDeleteDocument(id) {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            STORE_DOCUMENTS,
            "readwrite"
        );

        const store = transaction.objectStore(
            STORE_DOCUMENTS
        );

        const request = store.delete(Number(id));

        request.onsuccess = function() {
            resolve(true);
        };

        request.onerror = function() {
            reject(request.error);
        };

    });

}


/* ================================
   CLEAR DATABASE
================================ */

async function dbClearDocuments() {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            STORE_DOCUMENTS,
            "readwrite"
        );

        const store = transaction.objectStore(
            STORE_DOCUMENTS
        );

        const request = store.clear();

        request.onsuccess = function() {
            resolve(true);
        };

        request.onerror = function() {
            reject(request.error);
        };

    });

}


/* ================================
   REPLACE ALL DATA
================================ */

async function dbReplaceDocuments(documents) {

    const db = await openDatabase();

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            STORE_DOCUMENTS,
            "readwrite"
        );

        const store = transaction.objectStore(
            STORE_DOCUMENTS
        );

        const clearRequest = store.clear();

        clearRequest.onsuccess = function() {

            documents.forEach(function(documentData) {

                store.put(documentData);

            });

        };

        transaction.oncomplete = function() {
            resolve(true);
        };

        transaction.onerror = function() {
            reject(transaction.error);
        };

    });

}