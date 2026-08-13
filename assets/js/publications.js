(() => {

    const app = document.getElementById("publications-app");

    if (!app) {
        return;
    }


    /* ---------------------------------
       Configuration
    ---------------------------------- */

    const USER_ID = app.dataset.zoteroUserId;
    const ZOTERO_URL = app.dataset.zoteroUrl;

    const CATEGORY_ORDER = [
        "Books",
        "Edited Journal Issues",
        "Journal Articles",
        "Book Chapters",
        "Conference Publications",
        "Datasets & Software",
        "Blog Posts",
        "Other Publications"
    ];

    let allItems = [];


    /* ---------------------------------
       Elements
    ---------------------------------- */

    const bibliography =
        document.getElementById("bibliography");

    const status =
        document.getElementById("pub-status");

    const searchInput =
        document.getElementById("pub-search");

    const yearSelect =
        document.getElementById("pub-year");

    const categorySelect =
        document.getElementById("pub-category");

    const resetButton =
        document.getElementById("pub-reset");

    const printButton =
        document.getElementById("pub-print");


    /* ---------------------------------
       Helpers
    ---------------------------------- */

    function escapeHTML(value) {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#039;"
        };

        return String(value ?? "").replace(
            /[&<>"']/g,
            character => characters[character]
        );

    }


    function yearOf(data) {

        const match = String(data?.date || "")
            .match(/\b(?:19|20)\d{2}\b/);

        return match
            ? Number(match[0])
            : 0;

    }


    function creatorName(creator) {

        if (creator.name) {
            return creator.name;
        }

        return [
            creator.lastName,
            creator.firstName
        ]
            .filter(Boolean)
            .join(", ");

    }


    function joinCreators(creators = []) {

        return creators
            .map(creatorName)
            .filter(Boolean)
            .join("; ");

    }


    function creatorsByType(data, creatorType) {

        return (data.creators || [])
            .filter(
                creator =>
                    creator.creatorType === creatorType
            );

    }


    function getTags(data) {

        return (data.tags || [])
            .map(
                tag =>
                    String(tag.tag || "")
                        .trim()
                        .toLowerCase()
            );

    }


    /* ---------------------------------
       Publication status
    ---------------------------------- */

    function publicationStatus(data) {

        const tags = getTags(data);

        if (
            tags.includes(
                "website:in-preparation"
            )
        ) {
            return "In preparation";
        }

        if (
            tags.includes(
                "website:upcoming"
            )
        ) {
            return "Upcoming";
        }

        if (
            tags.includes(
                "website:forthcoming"
            )
        ) {
            return "Forthcoming";
        }

        return "";

    }


    /* ---------------------------------
       Categories
    ---------------------------------- */

    function detectCategory(item) {

        const data = item.data;
        const type = data.itemType;
        const tags = getTags(data);


        /*
         * Special website category:
         * edited journal issues
         */

        if (
            tags.includes(
                "website:edited-journal-issue"
            )
        ) {
            return "Edited Journal Issues";
        }


        /*
         * Books and edited volumes
         */

        if (type === "book") {
            return "Books";
        }


        /*
         * Journal articles
         */

        if (type === "journalArticle") {
            return "Journal Articles";
        }


        /*
         * Book chapters
         */

        if (
            type === "bookSection" ||
            type === "encyclopediaArticle"
        ) {
            return "Book Chapters";
        }


        /*
         * Conference publications
         */

        if (type === "conferencePaper") {
            return "Conference Publications";
        }


        /*
         * Datasets and software
         */

        if (
            type === "dataset" ||
            type === "computerProgram" ||
            type === "software"
        ) {
            return "Datasets & Software";
        }


        /*
         * Blog posts
         */

        if (
            type === "blogPost" ||
            type === "webpage"
        ) {
            return "Blog Posts";
        }


        return "Other Publications";

    }


    /* ---------------------------------
       Publication metadata
    ---------------------------------- */

    function buildVenue(data) {

        const publicationTitle =
            escapeHTML(
                data.publicationTitle || ""
            );

        const bookTitle =
            escapeHTML(
                data.bookTitle || ""
            );

        const proceedingsTitle =
            escapeHTML(
                data.proceedingsTitle ||
                data.conferenceName ||
                ""
            );

        const websiteTitle =
            escapeHTML(
                data.websiteTitle || ""
            );

        const publisher =
            escapeHTML(
                data.publisher || ""
            );

        const place =
            escapeHTML(
                data.place || ""
            );

        const repository =
            escapeHTML(
                data.repository ||
                data.archive ||
                ""
            );

        const volume =
            escapeHTML(
                data.volume || ""
            );

        const issue =
            escapeHTML(
                data.issue || ""
            );

        const pages =
            escapeHTML(
                data.pages || ""
            );

        const series =
            escapeHTML(
                data.series || ""
            );

        const seriesNumber =
            escapeHTML(
                data.seriesNumber || ""
            );

        const version =
            escapeHTML(
                data.versionNumber ||
                data.version ||
                ""
            );

        const editors =
            joinCreators(
                creatorsByType(
                    data,
                    "editor"
                )
            );


        /* Journal articles */

        if (data.itemType === "journalArticle") {

            let venue = "";

            if (publicationTitle) {
                venue +=
                    `<em>${publicationTitle}</em>`;
            }

            if (volume) {
                venue += ` ${volume}`;
            }

            if (issue) {
                venue += `(${issue})`;
            }

            if (pages) {
                venue += `, ${pages}`;
            }

            return venue;

        }


        /* Book chapters */

        if (
            data.itemType === "bookSection" ||
            data.itemType === "encyclopediaArticle"
        ) {

            const parts = [];

            if (bookTitle) {

                let book =
                    `In: <em>${bookTitle}</em>`;

                if (editors) {

                    const editorCount =
                        creatorsByType(
                            data,
                            "editor"
                        ).length;

                    const editorLabel =
                        editorCount > 1
                            ? "eds."
                            : "ed.";

                    book +=
                        ` (${editorLabel} ${escapeHTML(editors)})`;

                }

                parts.push(book);

            }


            const publicationPlace = [
                place,
                publisher
            ]
                .filter(Boolean)
                .join(": ");

            if (publicationPlace) {
                parts.push(publicationPlace);
            }


            if (series) {

                let seriesText = series;

                if (seriesNumber) {
                    seriesText +=
                        ` ${seriesNumber}`;
                }

                parts.push(seriesText);

            }


            if (pages) {
                parts.push(`pp. ${pages}`);
            }

            return parts.join(" — ");

        }


        /* Conference publications */

        if (data.itemType === "conferencePaper") {

            const parts = [];

            if (proceedingsTitle) {

                parts.push(
                    `<em>${proceedingsTitle}</em>`
                );

            }


            const publicationPlace = [
                place,
                publisher
            ]
                .filter(Boolean)
                .join(": ");

            if (publicationPlace) {
                parts.push(publicationPlace);
            }


            if (pages) {
                parts.push(`pp. ${pages}`);
            }

            return parts.join(" — ");

        }


        /* Books */

        if (data.itemType === "book") {

            const parts = [];


            const publicationPlace = [
                place,
                publisher
            ]
                .filter(Boolean)
                .join(": ");

            if (publicationPlace) {
                parts.push(publicationPlace);
            }


            if (series) {

                let seriesText = series;

                if (seriesNumber) {
                    seriesText +=
                        ` ${seriesNumber}`;
                }

                parts.push(seriesText);

            }

            return parts.join(" — ");

        }


        /* Datasets */

        if (data.itemType === "dataset") {

            return [
                repository,
                publisher,
                place
            ]
                .filter(Boolean)
                .join(" — ");

        }


        /* Software */

        if (
            data.itemType === "computerProgram" ||
            data.itemType === "software"
        ) {

            const parts = [];

            if (version) {
                parts.push(`Version ${version}`);
            }

            if (repository) {
                parts.push(repository);
            }

            if (publisher) {
                parts.push(publisher);
            }

            return parts.join(" — ");

        }


        /* Other publication types */

        return [
            publicationTitle,
            websiteTitle,
            publisher,
            place
        ]
            .filter(Boolean)
            .join(", ");

    }


    /* ---------------------------------
       Links
    ---------------------------------- */

    function itemLink(data) {

        if (data.DOI) {

            return {
                url:
                    `https://doi.org/${data.DOI}`,
                label:
                    "DOI"
            };

        }


        if (
            data.url &&
            /^https?:\/\//i.test(data.url)
        ) {

            return {
                url:
                    data.url,
                label:
                    "Link"
            };

        }


        return null;

    }


    /* ---------------------------------
       Rendering
    ---------------------------------- */

    function renderItem(item, category) {

        const data = item.data;

        const year =
            yearOf(data);

        const authors =
            joinCreators(
                creatorsByType(
                    data,
                    "author"
                )
            );

        const editors =
            joinCreators(
                creatorsByType(
                    data,
                    "editor"
                )
            );

        const editorCount =
            creatorsByType(
                data,
                "editor"
            ).length;

        const title =
            escapeHTML(
                data.title ||
                "(Untitled)"
            );

        const venue =
            buildVenue(data);

        const link =
            itemLink(data);

        const statusLabel =
            publicationStatus(data);


        const meta = [];


        /*
         * Authors
         */

        if (authors) {

            meta.push(
                escapeHTML(authors)
            );

        }


        /*
         * Editors of books and journal issues
         */

        if (
            !authors &&
            editors &&
            (
                category === "Books" ||
                category === "Edited Journal Issues"
            )
        ) {

            const editorLabel =
                editorCount > 1
                    ? "eds."
                    : "ed.";

            meta.push(
                `${escapeHTML(editors)} (${editorLabel})`
            );

        }


        /*
         * Venue / publisher / series
         */

        if (venue) {
            meta.push(venue);
        }


        /*
         * Year
         */

        if (year) {
            meta.push(
                String(year)
            );
        }


        /*
         * DOI or URL
         */

        const linkHTML = link
            ? `
                <a
                    class="pub-link"
                    href="${escapeHTML(link.url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${escapeHTML(link.label)}
                </a>
            `
            : "";


        /*
         * Publication status
         */

        const statusHTML =
            statusLabel
                ? `
                    <span class="pub-publication-status">
                        ${escapeHTML(statusLabel)}
                    </span>
                `
                : "";


        return `
            <li class="pub-item">

                <span class="pub-title">
                    ${title}
                    ${statusHTML}
                </span>

                <span class="pub-meta">
                    ${meta.join(" — ")}
                    ${linkHTML}
                </span>

            </li>
        `;

    }


    /* ---------------------------------
       Grouping and sorting
    ---------------------------------- */

    function groupItems(items) {

        const groups = {};


        items.forEach(item => {

            const category =
                detectCategory(item);

            if (!groups[category]) {
                groups[category] = [];
            }

            groups[category].push(item);

        });


        Object.values(groups)
            .forEach(group => {

                group.sort(
                    (a, b) => {

                        const yearDifference =
                            yearOf(b.data) -
                            yearOf(a.data);

                        if (
                            yearDifference !== 0
                        ) {
                            return yearDifference;
                        }

                        return String(
                            a.data.title || ""
                        )
                            .localeCompare(
                                String(
                                    b.data.title ||
                                    ""
                                ),
                                "en"
                            );

                    }
                );

            });


        return groups;

    }


    function render(items) {

        const groups =
            groupItems(items);


        const html =
            CATEGORY_ORDER
                .filter(
                    category =>
                        groups[category] &&
                        groups[category].length
                )
                .map(
                    category => `

                        <section
                            class="pub-section"
                            data-category="${escapeHTML(category)}"
                        >

                            <h2 class="pub-section-title">
                                ${escapeHTML(category)}
                            </h2>

                            <ul class="pub-list">

                                ${groups[category]
                                    .map(
                                        item =>
                                            renderItem(
                                                item,
                                                category
                                            )
                                    )
                                    .join("")}

                            </ul>

                        </section>

                    `
                )
                .join("");


        bibliography.innerHTML =
            html ||
            `
                <p class="pub-empty">
                    No publications found.
                </p>
            `;

    }


    /* ---------------------------------
       Filters
    ---------------------------------- */

    function buildFilters() {

        const years = [
            ...new Set(
                allItems
                    .map(
                        item =>
                            yearOf(
                                item.data
                            )
                    )
                    .filter(Boolean)
            )
        ]
            .sort(
                (a, b) =>
                    b - a
            );


        years.forEach(year => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                String(year);

            option.textContent =
                String(year);

            yearSelect.appendChild(
                option
            );

        });


        const availableCategories =
            new Set(
                allItems.map(
                    detectCategory
                )
            );


        CATEGORY_ORDER
            .filter(
                category =>
                    availableCategories
                        .has(category)
            )
            .forEach(category => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category;

                option.textContent =
                    category;

                categorySelect
                    .appendChild(
                        option
                    );

            });

    }


    function searchableText(item) {

        const data = item.data;

        const tags =
            (data.tags || [])
                .map(
                    tag =>
                        tag.tag || ""
                )
                .join(" ");


        return [
            data.title,
            joinCreators(
                data.creators || []
            ),
            data.publicationTitle,
            data.bookTitle,
            data.proceedingsTitle,
            data.conferenceName,
            data.websiteTitle,
            data.publisher,
            data.place,
            data.repository,
            data.series,
            data.seriesNumber,
            data.DOI,
            data.date,
            publicationStatus(data),
            detectCategory(item),
            tags
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

    }


    function applyFilters() {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();

        const year =
            yearSelect.value;

        const category =
            categorySelect.value;


        const filteredItems =
            allItems.filter(item => {

                if (
                    year &&
                    String(
                        yearOf(
                            item.data
                        )
                    ) !== year
                ) {
                    return false;
                }


                if (
                    category &&
                    detectCategory(item)
                        !== category
                ) {
                    return false;
                }


                if (
                    query &&
                    !searchableText(item)
                        .includes(query)
                ) {
                    return false;
                }


                return true;

            });


        render(filteredItems);

    }


    function resetFilters() {

        searchInput.value = "";
        yearSelect.value = "";
        categorySelect.value = "";

        render(allItems);

    }


    /* ---------------------------------
       Zotero API
    ---------------------------------- */

    async function fetchPublications() {

        const items = [];

        const limit = 100;

        let start = 0;


        while (true) {

            const url =
                new URL(
                    `https://api.zotero.org/users/${USER_ID}/publications/items`
                );


            url.searchParams.set(
                "format",
                "json"
            );

            url.searchParams.set(
                "sort",
                "date"
            );

            url.searchParams.set(
                "direction",
                "desc"
            );

            url.searchParams.set(
                "limit",
                String(limit)
            );

            url.searchParams.set(
                "start",
                String(start)
            );


            const response =
                await fetch(
                    url.toString(),
                    {
                        headers: {
                            "Zotero-API-Version":
                                "3"
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Zotero API returned ${response.status}`
                );

            }


            const batch =
                await response.json();


            items.push(
                ...batch
            );


            if (
                batch.length < limit
            ) {
                break;
            }


            start += limit;

        }


        return items.filter(item => {

            const type =
                item?.data?.itemType;


            return (
                item?.data &&
                type !== "attachment" &&
                type !== "note" &&
                type !== "annotation"
            );

        });

    }


    /* ---------------------------------
       Initialise
    ---------------------------------- */

    async function loadPublications() {

        if (!USER_ID) {

            status.textContent =
                "Zotero User ID is not configured.";

            return;

        }


        try {

            allItems =
                await fetchPublications();

            buildFilters();

            render(allItems);

            status.textContent = "";

        }
        catch (error) {

            console.error(error);


            status.innerHTML = `
                Publications could not be loaded.
                You can view them directly on
                <a
                    href="${escapeHTML(ZOTERO_URL)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Zotero
                </a>.
            `;

        }

    }


    /* ---------------------------------
       Events
    ---------------------------------- */

    searchInput.addEventListener(
        "input",
        applyFilters
    );


    yearSelect.addEventListener(
        "change",
        applyFilters
    );


    categorySelect.addEventListener(
        "change",
        applyFilters
    );


    resetButton.addEventListener(
        "click",
        resetFilters
    );


    printButton.addEventListener(
        "click",
        () => window.print()
    );


    loadPublications();

})();