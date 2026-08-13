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
        "Edited Volumes & Issues",
        "Articles & Chapters",
        "Conference Publications",
        "Datasets",
        "Blog Posts",
        "Other Publications"
    ];

    let allItems = [];


    /* ---------------------------------
       Elements
    ---------------------------------- */

    const bibliography = document.getElementById("bibliography");
    const status = document.getElementById("pub-status");

    const searchInput = document.getElementById("pub-search");
    const yearSelect = document.getElementById("pub-year");
    const categorySelect = document.getElementById("pub-category");

    const resetButton = document.getElementById("pub-reset");
    const printButton = document.getElementById("pub-print");


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

        return match ? Number(match[0]) : 0;

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
            .filter(creator => creator.creatorType === creatorType);

    }


    function hasCreatorType(data, creatorType) {

        return creatorsByType(data, creatorType).length > 0;

    }


    /* ---------------------------------
       Categories
    ---------------------------------- */

    function detectCategory(item) {

        const data = item.data;
        const type = data.itemType;

        if (type === "book") {

            if (
                hasCreatorType(data, "editor") &&
                !hasCreatorType(data, "author")
            ) {
                return "Edited Volumes & Issues";
            }

            return "Books";

        }

        if (
            type === "journalArticle" ||
            type === "bookSection" ||
            type === "encyclopediaArticle"
        ) {
            return "Articles & Chapters";
        }

        if (type === "conferencePaper") {
            return "Conference Publications";
        }

        if (type === "dataset") {
            return "Datasets";
        }

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

        const publicationTitle = escapeHTML(
            data.publicationTitle || ""
        );

        const bookTitle = escapeHTML(
            data.bookTitle || ""
        );

        const proceedingsTitle = escapeHTML(
            data.proceedingsTitle ||
            data.conferenceName ||
            ""
        );

        const websiteTitle = escapeHTML(
            data.websiteTitle || ""
        );

        const publisher = escapeHTML(
            data.publisher || ""
        );

        const place = escapeHTML(
            data.place || ""
        );

        const repository = escapeHTML(
            data.repository ||
            data.archive ||
            ""
        );

        const volume = escapeHTML(
            data.volume || ""
        );

        const issue = escapeHTML(
            data.issue || ""
        );

        const pages = escapeHTML(
            data.pages || ""
        );

        const editors = joinCreators(
            creatorsByType(data, "editor")
        );


        if (data.itemType === "journalArticle") {

            let venue = "";

            if (publicationTitle) {
                venue += `<em>${publicationTitle}</em>`;
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


        if (data.itemType === "bookSection") {

            const parts = [];

            if (bookTitle) {

                let book = `In: <em>${bookTitle}</em>`;

                if (editors) {
                    book += ` (ed. ${escapeHTML(editors)})`;
                }

                parts.push(book);

            }

            const publicationPlace = [
                publisher,
                place
            ]
                .filter(Boolean)
                .join(", ");

            if (publicationPlace) {
                parts.push(publicationPlace);
            }

            if (pages) {
                parts.push(`pp. ${pages}`);
            }

            return parts.join(" — ");

        }


        if (data.itemType === "conferencePaper") {

            const parts = [];

            if (proceedingsTitle) {
                parts.push(`<em>${proceedingsTitle}</em>`);
            }

            const publicationPlace = [
                publisher,
                place
            ]
                .filter(Boolean)
                .join(", ");

            if (publicationPlace) {
                parts.push(publicationPlace);
            }

            if (pages) {
                parts.push(`pp. ${pages}`);
            }

            return parts.join(" — ");

        }


        if (data.itemType === "book") {

            return [
                publisher,
                place
            ]
                .filter(Boolean)
                .join(", ");

        }


        if (data.itemType === "dataset") {

            return [
                repository,
                publisher,
                place
            ]
                .filter(Boolean)
                .join(", ");

        }


        return [
            publicationTitle,
            websiteTitle,
            publisher,
            place
        ]
            .filter(Boolean)
            .join(", ");

    }


    function itemLink(data) {

        if (data.DOI) {

            return {
                url: `https://doi.org/${data.DOI}`,
                label: "DOI"
            };

        }

        if (
            data.url &&
            /^https?:\/\//i.test(data.url)
        ) {

            return {
                url: data.url,
                label: "Link"
            };

        }

        return null;

    }


    /* ---------------------------------
       Rendering
    ---------------------------------- */

    function renderItem(item, category) {

        const data = item.data;

        const year = yearOf(data);

        const authors = joinCreators(
            creatorsByType(data, "author")
        );

        const editors = joinCreators(
            creatorsByType(data, "editor")
        );

        const title = escapeHTML(
            data.title || "(Untitled)"
        );

        const venue = buildVenue(data);
        const link = itemLink(data);

        let titleHTML = title;

        if (
            category === "Edited Volumes & Issues" &&
            editors
        ) {
            titleHTML +=
                ` <span class="pub-editors">(ed. ${escapeHTML(editors)})</span>`;
        }


        const meta = [];

        if (authors) {
            meta.push(escapeHTML(authors));
        }

        if (venue) {
            meta.push(venue);
        }

        if (year) {
            meta.push(String(year));
        }


        const linkHTML = link
            ? `
                <a
                    class="pub-link"
                    href="${escapeHTML(link.url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${link.label}
                </a>
            `
            : "";


        return `
            <li class="pub-item">

                <span class="pub-title">
                    ${titleHTML}
                </span>

                <span class="pub-meta">
                    ${meta.join(" — ")}
                    ${linkHTML}
                </span>

            </li>
        `;

    }


    function groupItems(items) {

        const groups = {};

        items.forEach(item => {

            const category = detectCategory(item);

            if (!groups[category]) {
                groups[category] = [];
            }

            groups[category].push(item);

        });


        Object.values(groups).forEach(group => {

            group.sort((a, b) => {

                const yearDifference =
                    yearOf(b.data) - yearOf(a.data);

                if (yearDifference !== 0) {
                    return yearDifference;
                }

                return String(a.data.title || "")
                    .localeCompare(
                        String(b.data.title || ""),
                        "en"
                    );

            });

        });

        return groups;

    }


    function render(items) {

        const groups = groupItems(items);

        const html = CATEGORY_ORDER
            .filter(
                category =>
                    groups[category] &&
                    groups[category].length
            )
            .map(category => `

                <section
                    class="pub-section"
                    data-category="${escapeHTML(category)}"
                >

                    <h2 class="pub-section-title">
                        ${escapeHTML(category)}
                    </h2>

                    <ul class="pub-list">

                        ${groups[category]
                            .map(item =>
                                renderItem(item, category)
                            )
                            .join("")}

                    </ul>

                </section>

            `)
            .join("");


        bibliography.innerHTML = html ||
            `<p class="pub-empty">No publications found.</p>`;

    }


    /* ---------------------------------
       Filters
    ---------------------------------- */

    function buildFilters() {

        const years = [
            ...new Set(
                allItems
                    .map(item => yearOf(item.data))
                    .filter(Boolean)
            )
        ].sort((a, b) => b - a);


        years.forEach(year => {

            const option =
                document.createElement("option");

            option.value = String(year);
            option.textContent = String(year);

            yearSelect.appendChild(option);

        });


        const availableCategories = new Set(
            allItems.map(detectCategory)
        );


        CATEGORY_ORDER
            .filter(category =>
                availableCategories.has(category)
            )
            .forEach(category => {

                const option =
                    document.createElement("option");

                option.value = category;
                option.textContent = category;

                categorySelect.appendChild(option);

            });

    }


    function searchableText(item) {

        const data = item.data;

        return [
            data.title,
            joinCreators(data.creators || []),
            data.publicationTitle,
            data.bookTitle,
            data.proceedingsTitle,
            data.conferenceName,
            data.websiteTitle,
            data.publisher,
            data.place,
            data.DOI,
            data.date
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


        const filteredItems = allItems.filter(item => {

            if (
                year &&
                String(yearOf(item.data)) !== year
            ) {
                return false;
            }

            if (
                category &&
                detectCategory(item) !== category
            ) {
                return false;
            }

            if (
                query &&
                !searchableText(item).includes(query)
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

            url.searchParams.set("format", "json");
            url.searchParams.set("sort", "date");
            url.searchParams.set("direction", "desc");
            url.searchParams.set("limit", String(limit));
            url.searchParams.set("start", String(start));


            const response = await fetch(
                url.toString(),
                {
                    headers: {
                        "Zotero-API-Version": "3"
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    `Zotero API returned ${response.status}`
                );

            }


            const batch = await response.json();

            items.push(...batch);


            if (batch.length < limit) {
                break;
            }

            start += limit;

        }


        return items.filter(item => {

            const type = item?.data?.itemType;

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

            allItems = await fetchPublications();

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
                >Zotero</a>.
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