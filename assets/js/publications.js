(() => {

    const app = document.getElementById("publications-app");

    if (!app) {
        return;
    }


    /* ---------------------------------
       Configuration
    ---------------------------------- */

    const USER_ID =
        app.dataset.zoteroUserId;

    const ZOTERO_URL =
        app.dataset.zoteroUrl;


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


    const WEBSITE_TAGS = {
        upcoming:
            "website:upcoming",

        inPreparation:
            "website:in-preparation",

        forthcoming:
            "website:forthcoming",

        editedJournalIssue:
            "website:edited-journal-issue"
    };


    let allItems = [];


    let websiteTagKeys = {
        upcoming: new Set(),
        inPreparation: new Set(),
        forthcoming: new Set(),
        editedJournalIssue: new Set()
    };


    /* ---------------------------------
       Elements
    ---------------------------------- */

    const bibliography =
        document.getElementById(
            "bibliography"
        );

    const status =
        document.getElementById(
            "pub-status"
        );

    const searchInput =
        document.getElementById(
            "pub-search"
        );

    const yearSelect =
        document.getElementById(
            "pub-year"
        );

    const categorySelect =
        document.getElementById(
            "pub-category"
        );

    const resetButton =
        document.getElementById(
            "pub-reset"
        );

    const printButton =
        document.getElementById(
            "pub-print"
        );


    /* ---------------------------------
       General helpers
    ---------------------------------- */

    function escapeHTML(value) {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#039;"
        };


        return String(value ?? "")
            .replace(
                /[&<>"']/g,
                character =>
                    characters[character]
            );

    }


    function yearOf(data) {

        const match =
            String(
                data?.date || ""
            )
                .match(
                    /\b(?:19|20)\d{2}\b/
                );


        return match
            ? Number(match[0])
            : 0;

    }


    function creatorName(creator) {

        if (creator.name) {

            return creator.name;

        }


        return [
            creator.firstName,
            creator.lastName
        ]
            .filter(Boolean)
            .join(" ");

    }


    function creatorNameChicago(
        creator,
        invert = false
    ) {

        if (creator.name) {

            return escapeHTML(
                creator.name
            );

        }


        const firstName =
            String(
                creator.firstName || ""
            )
                .trim();


        const lastName =
            String(
                creator.lastName || ""
            )
                .trim();


        if (
            invert &&
            lastName
        ) {

            return escapeHTML(
                [
                    lastName,
                    firstName
                ]
                    .filter(Boolean)
                    .join(", ")
            );

        }


        return escapeHTML(
            [
                firstName,
                lastName
            ]
                .filter(Boolean)
                .join(" ")
        );

    }


    function joinCreators(
        creators = []
    ) {

        return creators
            .map(
                creatorName
            )
            .filter(Boolean)
            .join("; ");

    }


    function creatorsByType(
        data,
        creatorType
    ) {

        return (
            data.creators || []
        )
            .filter(
                creator =>
                    creator.creatorType ===
                    creatorType
            );

    }


    function formatChicagoCreators(
        creators = []
    ) {

        const validCreators =
            creators.filter(
                creator =>
                    creator &&
                    (
                        creator.name ||
                        creator.firstName ||
                        creator.lastName
                    )
            );


        if (
            !validCreators.length
        ) {

            return "";

        }


        /*
         * Chicago 18:
         *
         * Up to six creators are listed.
         * With more than six creators,
         * the first three are followed
         * by "et al."
         */

        const displayedCreators =
            validCreators.length > 6
                ? validCreators.slice(
                    0,
                    3
                )
                : validCreators;


        const names =
            displayedCreators.map(
                (
                    creator,
                    index
                ) =>
                    creatorNameChicago(
                        creator,
                        index === 0
                    )
            );


        if (
            validCreators.length > 6
        ) {

            return `${
                names.join(", ")
            }, et al.`;

        }


        if (
            names.length === 1
        ) {

            return names[0];

        }


        if (
            names.length === 2
        ) {

            return `${
                names[0]
            }, and ${
                names[1]
            }`;

        }


        return `${
            names
                .slice(
                    0,
                    -1
                )
                .join(", ")
        }, and ${
            names[
                names.length - 1
            ]
        }`;

    }


    function formatNaturalCreators(
        creators = []
    ) {

        const validCreators =
            creators.filter(
                creator =>
                    creator &&
                    (
                        creator.name ||
                        creator.firstName ||
                        creator.lastName
                    )
            );


        if (
            !validCreators.length
        ) {

            return "";

        }


        const displayedCreators =
            validCreators.length > 6
                ? validCreators.slice(
                    0,
                    3
                )
                : validCreators;


        const names =
            displayedCreators.map(
                creator =>
                    creatorNameChicago(
                        creator,
                        false
                    )
            );


        if (
            validCreators.length > 6
        ) {

            return `${
                names.join(", ")
            }, et al.`;

        }


        if (
            names.length === 1
        ) {

            return names[0];

        }


        if (
            names.length === 2
        ) {

            return `${
                names[0]
            } and ${
                names[1]
            }`;

        }


        return `${
            names
                .slice(
                    0,
                    -1
                )
                .join(", ")
        }, and ${
            names[
                names.length - 1
            ]
        }`;

    }


    function ensurePeriod(
        value
    ) {

        const text =
            String(
                value || ""
            )
                .trim();


        if (!text) {

            return "";

        }


        return /[.!?]$/.test(
            text
        )
            ? text
            : `${text}.`;

    }


    function stripFinalPunctuation(
        value
    ) {

        return String(
            value || ""
        )
            .trim()
            .replace(
                /[.!?]+$/,
                ""
            );

    }


    function getTags(data) {

        return (
            data.tags || []
        )
            .map(
                tag =>
                    String(
                        tag.tag || ""
                    )
                        .trim()
                        .toLowerCase()
            );

    }


    function itemKey(item) {

        return (
            item.key ||
            item.data?.key ||
            ""
        );

    }


    function hasWebsiteTag(
        item,
        tagName
    ) {

        const directTags =
            getTags(
                item.data
            );


        if (
            directTags.includes(
                WEBSITE_TAGS[
                    tagName
                ]
            )
        ) {

            return true;

        }


        const key =
            itemKey(item);


        return Boolean(
            key &&
            websiteTagKeys[
                tagName
            ] &&
            websiteTagKeys[
                tagName
            ]
                .has(key)
        );

    }


    /* ---------------------------------
       Publication status
    ---------------------------------- */

    function publicationStatus(
        item
    ) {

        if (
            hasWebsiteTag(
                item,
                "inPreparation"
            )
        ) {

            return {
                label:
                    "In Preparation",

                className:
                    "in-preparation"
            };

        }


        if (
            hasWebsiteTag(
                item,
                "upcoming"
            )
        ) {

            return {
                label:
                    "Upcoming",

                className:
                    "upcoming"
            };

        }


        if (
            hasWebsiteTag(
                item,
                "forthcoming"
            )
        ) {

            return {
                label:
                    "Forthcoming",

                className:
                    "forthcoming"
            };

        }


        return null;

    }


    function statusHTML(item) {

        const publicationStatusData =
            publicationStatus(
                item
            );


        if (
            !publicationStatusData
        ) {

            return "";

        }


        return `
            <span
                class="pub-publication-status pub-publication-status-${escapeHTML(
                    publicationStatusData
                        .className
                )}"
            >
                ${escapeHTML(
                    publicationStatusData
                        .label
                )}
            </span>
        `;

    }


    /* ---------------------------------
       Categories
    ---------------------------------- */

    function detectCategory(
        item
    ) {

        const data =
            item.data;


        const type =
            data.itemType;


        /*
         * Website-defined category
         * must be checked first.
         */

        if (
            hasWebsiteTag(
                item,
                "editedJournalIssue"
            )
        ) {

            return "Edited Journal Issues";

        }


        if (
            type === "book"
        ) {

            return "Books";

        }


        if (
            type ===
            "journalArticle"
        ) {

            return "Journal Articles";

        }


        if (
            type ===
                "bookSection" ||
            type ===
                "encyclopediaArticle"
        ) {

            return "Book Chapters";

        }


        if (
            type ===
            "conferencePaper"
        ) {

            return "Conference Publications";

        }


        if (
            type ===
                "dataset" ||
            type ===
                "computerProgram" ||
            type ===
                "software"
        ) {

            return "Datasets & Software";

        }


        if (
            type ===
                "blogPost" ||
            type ===
                "webpage"
        ) {

            return "Blog Posts";

        }


        return "Other Publications";

    }


    /* ---------------------------------
       Chicago Author-Date:
       title helpers
    ---------------------------------- */

    function quotedTitleHTML(
        title
    ) {

        const cleanTitle =
            stripFinalPunctuation(
                title ||
                "(Untitled)"
            );


        return `
            <span class="pub-citation-title">“${escapeHTML(
                cleanTitle
            )}.”</span>
        `;

    }


    function italicTitleHTML(
        title
    ) {

        const cleanTitle =
            stripFinalPunctuation(
                title ||
                "(Untitled)"
            );


        return `
            <span class="pub-citation-title"><em>${escapeHTML(
                cleanTitle
            )}</em>.</span>
        `;

    }


    function plainTitleHTML(
        title
    ) {

        const cleanTitle =
            stripFinalPunctuation(
                title ||
                "(Untitled)"
            );


        return `
            <span class="pub-citation-title">${escapeHTML(
                cleanTitle
            )}.</span>
        `;

    }


    function titleHTML(
        item,
        category
    ) {

        const data =
            item.data;


        const type =
            data.itemType;


        /*
         * Stand-alone works:
         * italic title
         */

        if (
            category ===
                "Books" ||
            category ===
                "Edited Journal Issues" ||
            type ===
                "dataset" ||
            type ===
                "computerProgram" ||
            type ===
                "software"
        ) {

            return italicTitleHTML(
                data.title
            );

        }


        /*
         * Contributions:
         * title in quotation marks
         */

        if (
            type ===
                "journalArticle" ||
            type ===
                "bookSection" ||
            type ===
                "encyclopediaArticle" ||
            type ===
                "conferencePaper" ||
            type ===
                "blogPost" ||
            type ===
                "webpage"
        ) {

            return quotedTitleHTML(
                data.title
            );

        }


        return plainTitleHTML(
            data.title
        );

    }


    /* ---------------------------------
       Chicago Author-Date:
       principal creators
    ---------------------------------- */

    function principalCreatorsHTML(
        item,
        category
    ) {

        const data =
            item.data;


        const authors =
            creatorsByType(
                data,
                "author"
            );


        const editors =
            creatorsByType(
                data,
                "editor"
            );


        if (
            authors.length
        ) {

            return formatChicagoCreators(
                authors
            );

        }


        /*
         * Editors become principal
         * creators for edited books
         * and edited journal issues.
         */

        if (
            editors.length &&
            (
                category ===
                    "Books" ||
                category ===
                    "Edited Journal Issues"
            )
        ) {

            const label =
                editors.length === 1
                    ? "ed."
                    : "eds.";


            return `${
                formatChicagoCreators(
                    editors
                )
            }, ${label}`;

        }


        return "";

    }


    function citationYearHTML(
        item
    ) {

        const year =
            yearOf(
                item.data
            );


        return year
            ? String(year)
            : "n.d.";

    }


    /* ---------------------------------
       Chicago Author-Date:
       journal articles
    ---------------------------------- */

    function journalDetailsHTML(
        data
    ) {

        const journal =
            String(
                data.publicationTitle ||
                ""
            )
                .trim();


        const volume =
            String(
                data.volume ||
                ""
            )
                .trim();


        const issue =
            String(
                data.issue ||
                ""
            )
                .trim();


        const pages =
            String(
                data.pages ||
                ""
            )
                .trim();


        let html = "";


        if (journal) {

            html +=
                `<em>${escapeHTML(
                    journal
                )}</em>`;

        }


        if (volume) {

            html +=
                `${
                    html
                        ? " "
                        : ""
                }${escapeHTML(
                    volume
                )}`;

        }


        if (issue) {

            html +=
                ` (${escapeHTML(
                    issue
                )})`;

        }


        if (pages) {

            html +=
                `: ${escapeHTML(
                    pages
                )}`;

        }


        return html
            ? ensurePeriod(html)
            : "";

    }


    /* ---------------------------------
       Chicago Author-Date:
       books
    ---------------------------------- */

    function bookDetailsHTML(
        data
    ) {

        const parts = [];


        const edition =
            String(
                data.edition ||
                ""
            )
                .trim();


        const volume =
            String(
                data.volume ||
                ""
            )
                .trim();


        const series =
            String(
                data.series ||
                ""
            )
                .trim();


        const seriesNumber =
            String(
                data.seriesNumber ||
                ""
            )
                .trim();


        const publisher =
            String(
                data.publisher ||
                ""
            )
                .trim();


        if (edition) {

            parts.push(
                `${escapeHTML(
                    edition
                )} ed.`
            );

        }


        if (volume) {

            parts.push(
                `Vol. ${escapeHTML(
                    volume
                )}`
            );

        }


        if (series) {

            parts.push(
                seriesNumber
                    ? `${
                        escapeHTML(
                            series
                        )
                    } ${
                        escapeHTML(
                            seriesNumber
                        )
                    }`
                    : escapeHTML(
                        series
                    )
            );

        }


        /*
         * Chicago 18 no longer
         * requires place of publication.
         */

        if (publisher) {

            parts.push(
                escapeHTML(
                    publisher
                )
            );

        }


        return parts.length
            ? `${parts.join(". ")}.`
            : "";

    }


    /* ---------------------------------
       Chicago Author-Date:
       chapters
    ---------------------------------- */

    function chapterDetailsHTML(
        data
    ) {

        const bookTitle =
            String(
                data.bookTitle ||
                ""
            )
                .trim();


        const editors =
            creatorsByType(
                data,
                "editor"
            );


        const edition =
            String(
                data.edition ||
                ""
            )
                .trim();


        const volume =
            String(
                data.volume ||
                ""
            )
                .trim();


        const publisher =
            String(
                data.publisher ||
                ""
            )
                .trim();


        const parts = [];


        if (bookTitle) {

            let bookPart =
                `In <em>${escapeHTML(
                    bookTitle
                )}</em>`;


            if (
                editors.length
            ) {

                bookPart +=
                    `, edited by ${
                        formatNaturalCreators(
                            editors
                        )
                    }`;

            }


            if (edition) {

                bookPart +=
                    `, ${escapeHTML(
                        edition
                    )} ed.`;

            }


            if (volume) {

                bookPart +=
                    `, vol. ${escapeHTML(
                        volume
                    )}`;

            }


            parts.push(
                bookPart
            );

        }


        if (publisher) {

            parts.push(
                escapeHTML(
                    publisher
                )
            );

        }


        return parts.length
            ? `${parts.join(". ")}.`
            : "";

    }


    /* ---------------------------------
       Chicago Author-Date:
       conference publications
    ---------------------------------- */

    function conferenceDetailsHTML(
        data
    ) {

        const proceedingsTitle =
            String(
                data.proceedingsTitle ||
                ""
            )
                .trim();


        const conferenceName =
            String(
                data.conferenceName ||
                ""
            )
                .trim();


        const publisher =
            String(
                data.publisher ||
                ""
            )
                .trim();


        const place =
            String(
                data.place ||
                ""
            )
                .trim();


        const pages =
            String(
                data.pages ||
                ""
            )
                .trim();


        const parts = [];


        /*
         * Published conference paper
         */

        if (proceedingsTitle) {

            let proceedings =
                `In <em>${escapeHTML(
                    proceedingsTitle
                )}</em>`;


            if (pages) {

                proceedings +=
                    `, ${escapeHTML(
                        pages
                    )}`;

            }


            parts.push(
                proceedings
            );


            if (publisher) {

                parts.push(
                    escapeHTML(
                        publisher
                    )
                );

            }

        }


        /*
         * Unpublished presentation
         */

        else if (conferenceName) {

            let presentation =
                `Paper presented at ${escapeHTML(
                    conferenceName
                )}`;


            if (place) {

                presentation +=
                    `, ${escapeHTML(
                        place
                    )}`;

            }


            parts.push(
                presentation
            );

        }


        return parts.length
            ? `${parts.join(". ")}.`
            : "";

    }


    /* ---------------------------------
       Chicago Author-Date:
       edited journal issues
    ---------------------------------- */

    function editedIssueDetailsHTML(
        data
    ) {

        const journal =
            String(
                data.publicationTitle ||
                ""
            )
                .trim();


        const volume =
            String(
                data.volume ||
                ""
            )
                .trim();


        const issue =
            String(
                data.issue ||
                ""
            )
                .trim();


        const publisher =
            String(
                data.publisher ||
                ""
            )
                .trim();


        let html = "";


        if (journal) {

            html =
                `Special issue of <em>${escapeHTML(
                    journal
                )}</em>`;


            if (volume) {

                html +=
                    ` ${escapeHTML(
                        volume
                    )}`;

            }


            if (issue) {

                html +=
                    ` (${escapeHTML(
                        issue
                    )})`;

            }

        }
        else if (publisher) {

            html =
                escapeHTML(
                    publisher
                );

        }


        return html
            ? ensurePeriod(html)
            : "";

    }


    /* ---------------------------------
       Chicago Author-Date:
       datasets & software
    ---------------------------------- */

    function datasetSoftwareDetailsHTML(
        data
    ) {

        const parts = [];


        const version =
            String(
                data.versionNumber ||
                data.version ||
                ""
            )
                .trim();


        const repository =
            String(
                data.repository ||
                data.archive ||
                ""
            )
                .trim();


        const publisher =
            String(
                data.publisher ||
                ""
            )
                .trim();


        if (version) {

            parts.push(
                `Version ${escapeHTML(
                    version
                )}`
            );

        }


        if (repository) {

            parts.push(
                escapeHTML(
                    repository
                )
            );

        }


        if (
            publisher &&
            publisher !== repository
        ) {

            parts.push(
                escapeHTML(
                    publisher
                )
            );

        }


        return parts.length
            ? `${parts.join(". ")}.`
            : "";

    }


    /* ---------------------------------
       Chicago Author-Date:
       blog posts / webpages
    ---------------------------------- */

    function blogDetailsHTML(
        data
    ) {

        const websiteTitle =
            String(
                data.websiteTitle ||
                ""
            )
                .trim();


        const blogTitle =
            String(
                data.blogTitle ||
                ""
            )
                .trim();


        const containerTitle =
            blogTitle ||
            websiteTitle;


        if (
            !containerTitle
        ) {

            return "";

        }


        return `<em>${escapeHTML(
            containerTitle
        )}</em>.`;

    }


    /* ---------------------------------
       Chicago Author-Date:
       fallback
    ---------------------------------- */

    function otherDetailsHTML(
        data
    ) {

        const parts = [
            data.publicationTitle,
            data.websiteTitle,
            data.publisher
        ]
            .map(
                value =>
                    String(
                        value || ""
                    )
                        .trim()
            )
            .filter(Boolean)
            .map(
                escapeHTML
            );


        return parts.length
            ? `${parts.join(". ")}.`
            : "";

    }


    function venueHTML(
        item,
        category
    ) {

        const data =
            item.data;


        if (
            category ===
            "Edited Journal Issues"
        ) {

            return editedIssueDetailsHTML(
                data
            );

        }


        switch (
            data.itemType
        ) {

            case "journalArticle":

                return journalDetailsHTML(
                    data
                );


            case "book":

                return bookDetailsHTML(
                    data
                );


            case "bookSection":
            case "encyclopediaArticle":

                return chapterDetailsHTML(
                    data
                );


            case "conferencePaper":

                return conferenceDetailsHTML(
                    data
                );


            case "dataset":
            case "computerProgram":
            case "software":

                return datasetSoftwareDetailsHTML(
                    data
                );


            case "blogPost":
            case "webpage":

                return blogDetailsHTML(
                    data
                );


            default:

                return otherDetailsHTML(
                    data
                );

        }

    }


    /* ---------------------------------
       DOI / URL
    ---------------------------------- */

    function itemLink(
        data
    ) {

        if (data.DOI) {

            const doi =
                String(
                    data.DOI
                )
                    .replace(
                        /^https?:\/\/(dx\.)?doi\.org\//i,
                        ""
                    );


            return {
                url:
                    `https://doi.org/${doi}`,

                label:
                    "DOI"
            };

        }


        if (
            data.url &&
            /^https?:\/\//i.test(
                data.url
            )
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


    function citationLinkHTML(
        data
    ) {

        const link =
            itemLink(
                data
            );


        if (!link) {

            return "";

        }


        return `
            <a
                class="pub-citation-url"
                href="${escapeHTML(
                    link.url
                )}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ${escapeHTML(
                    link.url
                )}
            </a>
        `;

    }


    /* ---------------------------------
       Chicago Author-Date:
       complete citation
    ---------------------------------- */

    function chicagoCitationHTML(
        item,
        category
    ) {

        const data =
            item.data;


        const creators =
            principalCreatorsHTML(
                item,
                category
            );


        const year =
            citationYearHTML(
                item
            );


        const title =
            titleHTML(
                item,
                category
            );


        const publicationStatusHTML =
            statusHTML(
                item
            );


        const venue =
            venueHTML(
                item,
                category
            );


        const citationLink =
            citationLinkHTML(
                data
            );


        const parts = [];


        /*
         * Author / editor
         */

        if (creators) {

            parts.push(
                `${creators}.`
            );

        }


        /*
         * Year
         */

        parts.push(
            `${year}.`
        );


        /*
         * Title + status
         *
         * IMPORTANT:
         * Upcoming, In Preparation and
         * Forthcoming are all rendered
         * directly after the title here.
         */

        parts.push(
            `${title}${publicationStatusHTML}`
        );


        /*
         * Journal / book / proceedings
         * / publisher information
         */

        if (venue) {

            parts.push(
                venue
            );

        }


        /*
         * DOI / URL
         */

        if (citationLink) {

            parts.push(
                citationLink
            );

        }


        return parts.join(" ");

    }


    /* ---------------------------------
       Rendering individual item
    ---------------------------------- */

    function renderItem(
        item,
        category
    ) {

        const data =
            item.data;


        const link =
            itemLink(
                data
            );


        const linkHTML =
            link
                ? `
                    <a
                        class="pub-link pub-resource-button"
                        href="${escapeHTML(
                            link.url
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ${escapeHTML(
                            link.label
                        )}
                    </a>
                `
                : "";


        return `
            <li class="pub-item">

                <div class="pub-actions">
                    ${linkHTML}
                </div>


                <div class="pub-content">

                    <p class="pub-citation">
                        ${chicagoCitationHTML(
                            item,
                            category
                        )}
                    </p>

                </div>

            </li>
        `;

    }


    /* ---------------------------------
       Grouping and sorting
    ---------------------------------- */

    function groupItems(
        items
    ) {

        const groups = {};


        items.forEach(
            item => {

                const category =
                    detectCategory(
                        item
                    );


                if (
                    !groups[
                        category
                    ]
                ) {

                    groups[
                        category
                    ] = [];

                }


                groups[
                    category
                ]
                    .push(
                        item
                    );

            }
        );


        /*
         * Existing reverse chronological
         * ordering is retained.
         */

        Object.values(
            groups
        )
            .forEach(
                group => {

                    group.sort(
                        (
                            a,
                            b
                        ) => {

                            const yearDifference =
                                yearOf(
                                    b.data
                                ) -
                                yearOf(
                                    a.data
                                );


                            if (
                                yearDifference !==
                                0
                            ) {

                                return yearDifference;

                            }


                            return String(
                                a.data.title ||
                                ""
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

                }
            );


        return groups;

    }


    function render(
        items
    ) {

        const groups =
            groupItems(
                items
            );


        const html =
            CATEGORY_ORDER
                .filter(
                    category =>
                        groups[
                            category
                        ] &&
                        groups[
                            category
                        ]
                            .length
                )
                .map(
                    category => `

                        <section
                            class="pub-section"
                            data-category="${escapeHTML(
                                category
                            )}"
                        >

                            <h2 class="pub-section-title">
                                ${escapeHTML(
                                    category
                                )}
                            </h2>


                            <ul class="pub-list">

                                ${
                                    groups[
                                        category
                                    ]
                                        .map(
                                            item =>
                                                renderItem(
                                                    item,
                                                    category
                                                )
                                        )
                                        .join("")
                                }

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

        yearSelect.innerHTML =
            `<option value="">All years</option>`;


        categorySelect.innerHTML =
            `<option value="">All categories</option>`;


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
                (
                    a,
                    b
                ) =>
                    b - a
            );


        years.forEach(
            year => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(year);


                option.textContent =
                    String(year);


                yearSelect
                    .appendChild(
                        option
                    );

            }
        );


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
                        .has(
                            category
                        )
            )
            .forEach(
                category => {

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

                }
            );

    }


    function searchableText(
        item
    ) {

        const data =
            item.data;


        const publicationStatusData =
            publicationStatus(
                item
            );


        return [
            data.title,

            joinCreators(
                data.creators ||
                []
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
            data.url,
            data.date,

            publicationStatusData
                ?.label,

            detectCategory(
                item
            )
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
            allItems.filter(
                item => {

                    if (
                        year &&
                        String(
                            yearOf(
                                item.data
                            )
                        ) !==
                        year
                    ) {

                        return false;

                    }


                    if (
                        category &&
                        detectCategory(
                            item
                        ) !==
                        category
                    ) {

                        return false;

                    }


                    if (
                        query &&
                        !searchableText(
                            item
                        )
                            .includes(
                                query
                            )
                    ) {

                        return false;

                    }


                    return true;

                }
            );


        render(
            filteredItems
        );

    }


    function resetFilters() {

        searchInput.value =
            "";

        yearSelect.value =
            "";

        categorySelect.value =
            "";


        render(
            allItems
        );

    }


    /* ---------------------------------
       Zotero API:
       publications
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


            if (
                !response.ok
            ) {

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
                batch.length <
                limit
            ) {

                break;

            }


            start +=
                limit;

        }


        return items.filter(
            item => {

                const type =
                    item?.data
                        ?.itemType;


                return (
                    item?.data &&
                    type !==
                        "attachment" &&
                    type !==
                        "note" &&
                    type !==
                        "annotation"
                );

            }
        );

    }


    /* ---------------------------------
       Zotero API:
       website tag keys
    ---------------------------------- */

    async function fetchTaggedItemKeys(
        tag
    ) {

        const url =
            new URL(
                `https://api.zotero.org/users/${USER_ID}/publications/items`
            );


        url.searchParams.set(
            "format",
            "keys"
        );


        url.searchParams.set(
            "tag",
            tag
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


        if (
            !response.ok
        ) {

            throw new Error(
                `Could not retrieve Zotero tag "${tag}" (${response.status}).`
            );

        }


        const text =
            await response.text();


        return new Set(
            text
                .split(
                    /\s+/
                )
                .map(
                    key =>
                        key.trim()
                )
                .filter(Boolean)
        );

    }


    /* ---------------------------------
       Load website tags
    ---------------------------------- */

    async function fetchWebsiteTags() {

        const tagNames = [
            "upcoming",
            "inPreparation",
            "forthcoming",
            "editedJournalIssue"
        ];


        const results =
            await Promise.allSettled(
                tagNames.map(
                    tagName =>
                        fetchTaggedItemKeys(
                            WEBSITE_TAGS[
                                tagName
                            ]
                        )
                )
            );


        const tagSets = {
            upcoming:
                new Set(),

            inPreparation:
                new Set(),

            forthcoming:
                new Set(),

            editedJournalIssue:
                new Set()
        };


        results.forEach(
            (
                result,
                index
            ) => {

                const tagName =
                    tagNames[
                        index
                    ];


                if (
                    result.status ===
                    "fulfilled"
                ) {

                    tagSets[
                        tagName
                    ] =
                        result.value;

                }
                else {

                    console.warn(
                        `Zotero tag fallback failed for ${WEBSITE_TAGS[tagName]}. Direct item tags will still be used.`,
                        result.reason
                    );

                }

            }
        );


        return tagSets;

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

            status.textContent =
                "Loading publications…";


            allItems =
                await fetchPublications();


            websiteTagKeys =
                await fetchWebsiteTags();


            buildFilters();


            render(
                allItems
            );


            status.textContent =
                "";

        }
        catch (error) {

            console.error(
                "Could not load Zotero publications:",
                error
            );


            status.innerHTML = `
                Publications could not be loaded.
                You can view them directly on
                <a
                    href="${escapeHTML(
                        ZOTERO_URL
                    )}"
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
        () =>
            window.print()
    );


    loadPublications();

})();