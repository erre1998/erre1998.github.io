(() => {

    "use strict";


    /* =========================================
       Configuration
    ========================================== */

    const COLORS = {
        navy: "#123348",
        blue: "#19405d",
        teal: "#17525b",
        muted: "#486c78",
        warm: "#bb9e76",
        line: "#d7e0e3",
        link: "#19405d"
    };


    const PUBLICATION_CATEGORY_ORDER = [
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
        upcoming: "website:upcoming",
        inPreparation: "website:in-preparation",
        forthcoming: "website:forthcoming",
        editedJournalIssue: "website:edited-journal-issue"
    };


    /* =========================================
       Basic helpers
    ========================================== */

    function normalizeText(value) {

        return String(value || "")
            .replace(/\s+/g, " ")
            .trim();

    }


    function text(root, selector) {

        return normalizeText(
            root?.querySelector(selector)
                ?.textContent
        );

    }


    function absoluteUrl(value) {

        if (!value) {
            return "";
        }


        try {

            return new URL(
                value,
                window.location.href
            ).href;

        }
        catch {

            return value;

        }

    }


    function directChildren(
        element,
        selector
    ) {

        return Array.from(
            element?.children || []
        )
            .filter(
                child =>
                    child.matches(selector)
            );

    }


    function linkedText(
        value,
        url,
        options = {}
    ) {

        if (!url) {

            return {
                text: value,
                ...options
            };

        }


        return {
            text: value,
            link: url,
            color: COLORS.link,
            decoration: "none",
            ...options
        };

    }


    /* =========================================
       Fetch helpers
    ========================================== */

    async function fetchDocument(url) {

        const response =
            await fetch(
                absoluteUrl(url),
                {
                    credentials:
                        "same-origin"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Could not load ${url} (${response.status}).`
            );

        }


        const html =
            await response.text();


        return new DOMParser()
            .parseFromString(
                html,
                "text/html"
            );

    }


    async function imageToDataUrl(url) {

        const response =
            await fetch(
                absoluteUrl(url),
                {
                    credentials:
                        "same-origin"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not load portrait."
            );

        }


        const blob =
            await response.blob();


        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();


                reader.onload =
                    () =>
                        resolve(
                            reader.result
                        );


                reader.onerror =
                    reject;


                reader.readAsDataURL(
                    blob
                );

            }
        );

    }


    /* =========================================
       HTML/link extraction
    ========================================== */

    function extractLink(element) {

        if (!element) {
            return "";
        }


        const anchor =
            element.matches?.("a")
                ? element
                : element.querySelector("a");


        if (!anchor) {
            return "";
        }


        return absoluteUrl(
            anchor.getAttribute("href")
        );

    }


    function extractLinks(
        root,
        selector
    ) {

        return Array.from(
            root.querySelectorAll(selector)
        )
            .map(anchor => ({

                label:
                    normalizeText(
                        anchor.textContent
                    ),

                url:
                    absoluteUrl(
                        anchor.getAttribute(
                            "href"
                        )
                    )
            }))
            .filter(
                link =>
                    link.label &&
                    link.url
            );

    }


    function richInline(element) {

        if (!element) {
            return "";
        }


        const runs = [];


        function walk(
            node,
            inherited = {}
        ) {

            if (
                node.nodeType ===
                Node.TEXT_NODE
            ) {

                const value =
                    String(
                        node.nodeValue || ""
                    )
                        .replace(
                            /\s+/g,
                            " "
                        );


                if (
                    value.trim()
                ) {

                    runs.push({
                        text: value,
                        ...inherited
                    });

                }


                return;

            }


            if (
                node.nodeType !==
                Node.ELEMENT_NODE
            ) {
                return;
            }


            const tag =
                node.tagName
                    .toLowerCase();


            if (
                tag === "br"
            ) {

                runs.push(" · ");

                return;

            }


            const formatting = {
                ...inherited
            };


            if (
                tag === "em" ||
                tag === "i"
            ) {

                formatting.italics =
                    true;

            }


            if (
                tag === "strong" ||
                tag === "b"
            ) {

                formatting.bold =
                    true;

            }


            if (
                tag === "a"
            ) {

                formatting.link =
                    absoluteUrl(
                        node.getAttribute(
                            "href"
                        )
                    );

                formatting.color =
                    COLORS.link;

                formatting.decoration =
                    "none";

            }


            Array.from(
                node.childNodes
            )
                .forEach(
                    child =>
                        walk(
                            child,
                            formatting
                        )
                );

        }


        Array.from(
            element.childNodes
        )
            .forEach(
                node =>
                    walk(node)
            );


        return runs;

    }


    function resourceRuns(links) {

        const runs =
            [];


        links.forEach(
            (link, index) => {

                if (index > 0) {
                    runs.push(" · ");
                }


                runs.push(
                    linkedText(
                        link.label,
                        link.url
                    )
                );

            }
        );


        return runs;

    }


    /* =========================================
       Profile
    ========================================== */

    function socialHandle(url) {

        if (!url) {
            return "";
        }


        try {

            const parsed =
                new URL(url);


            const parts =
                parsed.pathname
                    .split("/")
                    .filter(Boolean);


            return (
                parts[
                    parts.length - 1
                ] || ""
            );

        }
        catch {

            return url;

        }

    }


    function extractProfile(button) {

        const profileLinks =
            Array.from(
                document.querySelectorAll(
                    ".home-profile-link"
                )
            );


        function findLink(label) {

            const element =
                profileLinks.find(
                    item =>
                        normalizeText(
                            item.getAttribute(
                                "aria-label"
                            )
                        )
                            .toLowerCase() ===
                        label.toLowerCase()
                );


            if (!element) {
                return "";
            }


            return absoluteUrl(
                element.getAttribute(
                    "href"
                )
            );

        }


        const email =
            findLink("Email")
                .replace(
                    /^mailto:/i,
                    ""
                );


        const orcid =
            findLink("ORCID");


        const github =
            findLink("GitHub");


        const mastodon =
            findLink("Fedihum");


        return {
            name:
                button.dataset.name ||
                "Erik Renz",

            address:
                button.dataset.address ||
                "",

            birthDate:
                button.dataset.birthDate ||
                "",

            photo:
                button.dataset.photo ||
                "",

            email,

            website:
                window.location.origin,

            orcid: {
                label:
                    socialHandle(orcid),
                url:
                    orcid
            },

            github: {
                label:
                    socialHandle(github),
                url:
                    github
            },

            mastodon: {
                label:
                    socialHandle(mastodon),
                url:
                    mastodon
            }
        };

    }


    /* =========================================
       CV extraction
    ========================================== */

    function extractCvDetail(element) {

        if (!element) {
            return "";
        }


        const label =
            text(
                element,
                ".cv-entry-thesis-label"
            );


        const anchors =
            Array.from(
                element.querySelectorAll("a")
            );


        if (
            label &&
            anchors.length
        ) {

            const runs = [
                {
                    text:
                        `${label} `,

                    color:
                        COLORS.muted
                }
            ];


            anchors.forEach(
                (anchor, index) => {

                    if (index > 0) {
                        runs.push(" · ");
                    }


                    runs.push(
                        linkedText(
                            normalizeText(
                                anchor.textContent
                            ),

                            absoluteUrl(
                                anchor.getAttribute(
                                    "href"
                                )
                            )
                        )
                    );

                }
            );


            return runs;

        }


        return richInline(
            element
        );

    }


    function extractCvEntry(entry) {

        return {
            date:
                text(
                    entry,
                    ".cv-entry-date"
                ),

            title:
                richInline(
                    entry.querySelector(
                        ".cv-entry-title"
                    )
                ),

            meta:
                richInline(
                    entry.querySelector(
                        ".cv-entry-meta"
                    )
                ),

            detail:
                extractCvDetail(
                    entry.querySelector(
                        ".cv-entry-thesis"
                    )
                )
        };

    }


    function extractCv(documentNode) {

        return Array.from(
            documentNode.querySelectorAll(
                ".cv > .cv-section"
            )
        )
            .map(section => {

                const entries =
                    [];


                Array.from(
                    section.children
                )
                    .forEach(child => {

                        if (
                            child.classList
                                .contains(
                                    "cv-entry"
                                )
                        ) {

                            entries.push({
                                type:
                                    "entry",

                                data:
                                    extractCvEntry(
                                        child
                                    )
                            });

                        }


                        if (
                            child.classList
                                .contains(
                                    "cv-subsection"
                                )
                        ) {

                            entries.push({
                                type:
                                    "subsection",

                                title:
                                    text(
                                        child,
                                        ".cv-subsection-title"
                                    ),

                                entries:
                                    directChildren(
                                        child,
                                        ".cv-entry"
                                    )
                                        .map(
                                            extractCvEntry
                                        )
                            });

                        }

                    });


                return {
                    title:
                        text(
                            section,
                            ".cv-section-title"
                        ),

                    entries
                };

            })
            .filter(
                section =>
                    section.title
            );

    }


    /* =========================================
       Talks
    ========================================== */

    function extractTalks(documentNode) {

        return Array.from(
            documentNode.querySelectorAll(
                ".talk-item"
            )
        )
            .map(item => ({

                date:
                    text(
                        item,
                        ".talk-date"
                    ),

                event:
                    text(
                        item,
                        ".talk-event"
                    ),

                status:
                    text(
                        item,
                        ".talk-status"
                    ),

                title:
                    text(
                        item,
                        ".talk-title"
                    ),

                location:
                    text(
                        item,
                        ".talk-location"
                    ),

                collaborators:
                    normalizeText(
                        text(
                            item,
                            ".talk-collaborators"
                        )
                            .replace(
                                /^With\s+/i,
                                ""
                            )
                    ),

                resources:
                    extractLinks(
                        item,
                        ".talk-resource-button"
                    )

            }))
            .filter(
                item =>
                    item.title
            );

    }


    /* =========================================
       Teaching / Thesis
    ========================================== */

    function badgeMap(
        root,
        badgeSelector
    ) {

        const result =
            {};


        Array.from(
            root.querySelectorAll(
                badgeSelector
            )
        )
            .forEach(badge => {

                const label =
                    text(
                        badge,
                        ".teaching-badge-label, .thesis-badge-label"
                    );


                const value =
                    text(
                        badge,
                        ".teaching-badge-value, .thesis-badge-value"
                    );


                if (
                    label &&
                    value
                ) {

                    result[label] =
                        value;

                }

            });


        return result;

    }


    function extractTeaching(
        documentNode
    ) {

        return Array.from(
            documentNode.querySelectorAll(
                ".teaching-course"
            )
        )
            .map(course => {

                const titleElement =
                    course.querySelector(
                        ".teaching-course-title"
                    );


                return {
                    title:
                        normalizeText(
                            titleElement
                                ?.textContent
                        ),

                    titleLink:
                        extractLink(
                            titleElement
                        ),

                    meta:
                        badgeMap(
                            course,
                            ".teaching-badge"
                        )
                };

            })
            .filter(
                course =>
                    course.title
            );

    }


    function extractTheses(
        documentNode
    ) {

        return Array.from(
            documentNode.querySelectorAll(
                ".thesis-entry"
            )
        )
            .map(thesis => ({

                title:
                    text(
                        thesis,
                        ".thesis-title"
                    ),

                meta:
                    badgeMap(
                        thesis,
                        ".thesis-badge"
                    )

            }))
            .filter(
                thesis =>
                    thesis.title
            );

    }


    function termInformation(term) {

        const value =
            normalizeText(term);


        const winter =
            value.match(
                /^Winter\s+(\d{4})\/(\d{2})$/i
            );


        if (winter) {

            return {
                academicYear:
                    `${winter[1]}/${winter[2]}`,

                sort:
                    Number(
                        winter[1]
                    ) * 10 + 2,

                label:
                    value
            };

        }


        const summer =
            value.match(
                /^Summer\s+(\d{4})$/i
            );


        if (summer) {

            const year =
                Number(
                    summer[1]
                );


            return {
                academicYear:
                    `${year - 1}/${String(year).slice(-2)}`,

                sort:
                    year * 10 + 1,

                label:
                    value
            };

        }


        return {
            academicYear:
                value ||
                "Other",

            sort:
                0,

            label:
                value
        };

    }


    function groupByAcademicYear(
        items
    ) {

        const groups =
            new Map();


        items.forEach(item => {

            const info =
                termInformation(
                    item.meta?.Term ||
                    ""
                );


            if (
                !groups.has(
                    info.academicYear
                )
            ) {

                groups.set(
                    info.academicYear,
                    []
                );

            }


            groups
                .get(
                    info.academicYear
                )
                .push({
                    ...item,
                    termInfo:
                        info
                });

        });


        return Array.from(
            groups.entries()
        )
            .map(
                ([title, groupItems]) => ({

                    title,

                    sort:
                        Math.max(
                            ...groupItems.map(
                                item =>
                                    item.termInfo
                                        .sort
                            )
                        ),

                    items:
                        groupItems
                            .sort(
                                (a, b) =>
                                    b.termInfo.sort -
                                    a.termInfo.sort
                            )
                })
            )
            .sort(
                (a, b) =>
                    b.sort - a.sort
            );

    }


    /* =========================================
       Events
    ========================================== */

    function extractEvents(
        documentNode
    ) {

        return Array.from(
            documentNode.querySelectorAll(
                ".event-item"
            )
        )
            .map(item => {

                const titleElement =
                    item.querySelector(
                        ".event-item-title"
                    );


                const roles =
                    Array.from(
                        item.querySelectorAll(
                            ".event-role"
                        )
                    )
                        .map(role =>
                            normalizeText(
                                [
                                    text(
                                        role,
                                        ".event-role-name"
                                    ),

                                    text(
                                        role,
                                        ".event-role-detail"
                                    )
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                            )
                        )
                        .filter(Boolean);


                const editions =
                    Array.from(
                        item.querySelectorAll(
                            ".event-series-edition"
                        )
                    )
                        .map(edition => ({

                            term:
                                text(
                                    edition,
                                    ".event-series-edition-term"
                                ),

                            meta:
                                text(
                                    edition,
                                    ".event-series-edition-meta"
                                ),

                            resources:
                                extractLinks(
                                    edition,
                                    ".event-resource-button"
                                )
                        }))
                        .filter(
                            edition =>
                                edition.term
                        );


                return {
                    date:
                        text(
                            item,
                            ".event-item-date"
                        ),

                    type:
                        text(
                            item,
                            ".event-item-type"
                        ),

                    title:
                        normalizeText(
                            titleElement
                                ?.textContent
                        ),

                    titleLink:
                        extractLink(
                            titleElement
                        ),

                    location:
                        text(
                            item,
                            ".event-item-location"
                        ),

                    roles,

                    resources:
                        extractLinks(
                            item,
                            ":scope > .event-item-content > .event-item-links .event-resource-button"
                        ),

                    editions
                };

            })
            .filter(
                item =>
                    item.title
            );

    }


    /* =========================================
       Academic Service
    ========================================== */

    function extractServices(
        documentNode
    ) {

        return Array.from(
            documentNode.querySelectorAll(
                ".services-section"
            )
        )
            .map(section => ({

                title:
                    text(
                        section,
                        ".services-section-title"
                    ),

                entries:
                    Array.from(
                        section.querySelectorAll(
                            ".service-entry"
                        )
                    )
                        .map(entry => {

                            const titleElement =
                                entry.querySelector(
                                    ".service-entry-title"
                                );


                            return {
                                date:
                                    text(
                                        entry,
                                        ".service-entry-date"
                                    ),

                                title:
                                    normalizeText(
                                        titleElement
                                            ?.textContent
                                    ),

                                titleLink:
                                    extractLink(
                                        titleElement
                                    ),

                                detail:
                                    text(
                                        entry,
                                        ".service-entry-detail"
                                    ),

                                institution:
                                    text(
                                        entry,
                                        ".service-entry-institution"
                                    )
                            };

                        })
                        .filter(
                            entry =>
                                entry.title
                        )

            }))
            .filter(
                section =>
                    section.title
            );

    }


    /* =========================================
       Projects
    ========================================== */

    function extractProjects(
        documentNode
    ) {

        return Array.from(
            documentNode.querySelectorAll(
                ".project-item"
            )
        )
            .map(project => {

                const metadata =
                    {};


                Array.from(
                    project.querySelectorAll(
                        ".project-meta-item"
                    )
                )
                    .forEach(item => {

                        const label =
                            text(
                                item,
                                "dt"
                            );


                        const value =
                            text(
                                item,
                                "dd"
                            );


                        if (
                            label &&
                            value
                        ) {

                            metadata[label] =
                                value;

                        }

                    });


                const resources =
                    extractLinks(
                        project,
                        ".project-resource-button"
                    );


                const website =
                    resources.find(
                        link =>
                            /project website/i
                                .test(
                                    link.label
                                )
                    );


                return {
                    period:
                        text(
                            project,
                            ".project-period"
                        ),

                    title:
                        text(
                            project,
                            ".project-title"
                        ),

                    titleLink:
                        website?.url ||
                        "",

                    status:
                        text(
                            project,
                            ".project-status"
                        ),

                    metadata,

                    resources:
                        resources.filter(
                            link =>
                                link.url !==
                                website?.url
                        )
                };

            })
            .filter(
                project =>
                    project.title
            );

    }


    /* =========================================
       Zotero
    ========================================== */

    function yearOf(data) {

        const match =
            String(
                data?.date ||
                ""
            )
                .match(
                    /\b(?:19|20)\d{2}\b/
                );


        return match
            ? Number(
                match[0]
            )
            : 0;

    }


    function creatorName(
        creator
    ) {

        if (
            creator.name
        ) {
            return creator.name;
        }


        return [
            creator.lastName,
            creator.firstName
        ]
            .filter(Boolean)
            .join(", ");

    }


    function creatorsByType(
        data,
        type
    ) {

        return (
            data.creators ||
            []
        )
            .filter(
                creator =>
                    creator.creatorType ===
                    type
            );

    }


    function joinCreators(
        creators
    ) {

        return (
            creators ||
            []
        )
            .map(
                creatorName
            )
            .filter(Boolean)
            .join("; ");

    }


    function getTags(data) {

        return (
            data.tags ||
            []
        )
            .map(
                item =>
                    normalizeText(
                        item.tag
                    )
                        .toLowerCase()
            );

    }


    function hasTag(
        data,
        tag
    ) {

        return getTags(data)
            .includes(
                tag.toLowerCase()
            );

    }


    function publicationStatus(data) {

        if (
            hasTag(
                data,
                WEBSITE_TAGS
                    .inPreparation
            )
        ) {
            return "In preparation";
        }


        if (
            hasTag(
                data,
                WEBSITE_TAGS
                    .upcoming
            )
        ) {
            return "Upcoming";
        }


        if (
            hasTag(
                data,
                WEBSITE_TAGS
                    .forthcoming
            )
        ) {
            return "Forthcoming";
        }


        return "";

    }


    function publicationCategory(data) {

        if (
            hasTag(
                data,
                WEBSITE_TAGS
                    .editedJournalIssue
            )
        ) {
            return "Edited Journal Issues";
        }


        switch (
            data.itemType
        ) {

            case "book":
                return "Books";


            case "journalArticle":
                return "Journal Articles";


            case "bookSection":
            case "encyclopediaArticle":
                return "Book Chapters";


            case "conferencePaper":
                return "Conference Publications";


            case "dataset":
            case "computerProgram":
            case "software":
                return "Datasets & Software";


            case "blogPost":
            case "webpage":
                return "Blog Posts";


            default:
                return "Other Publications";

        }

    }


    async function fetchPublications(
        userId
    ) {

        if (!userId) {
            return [];
        }


        const items =
            [];


        const limit =
            100;


        let start =
            0;


        while (true) {

            const url =
                new URL(
                    `https://api.zotero.org/users/${userId}/publications/items`
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
                    `Zotero API returned ${response.status}.`
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


        return items
            .filter(item => {

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

            })
            .map(item => ({

                item,

                category:
                    publicationCategory(
                        item.data
                    ),

                status:
                    publicationStatus(
                        item.data
                    )
            }));

    }


    function publicationUrls(data) {

        const links =
            [];


        if (data.DOI) {

            const doi =
                String(
                    data.DOI
                )
                    .replace(
                        /^https?:\/\/doi\.org\//i,
                        ""
                    );


            links.push(
                `https://doi.org/${doi}`
            );

        }


        if (
            data.url &&
            /^https?:\/\//i.test(
                data.url
            )
        ) {

            links.push(
                data.url
            );

        }


        return [
            ...new Set(links)
        ];

    }


    function bibliographyText(record) {

        const data =
            record.item.data;


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


        const creatorText =
            authors ||
            (
                editors
                    ? `${editors} (ed${editorCount > 1 ? "s" : ""}.)`
                    : ""
            );


        const year =
            yearOf(data);


        const yearText =
            year
                ? String(year)
                : record.status ||
                "n.d.";


        const title =
            normalizeText(
                data.title ||
                "(Untitled)"
            );


        const parts =
            [];


        if (creatorText) {

            parts.push(
                `${creatorText}.`
            );

        }


        parts.push(
            `${yearText}.`
        );


        switch (
            data.itemType
        ) {

            case "journalArticle": {

                parts.push(
                    `“${title}.”`
                );


                let venue =
                    normalizeText(
                        data.publicationTitle
                    );


                if (data.volume) {

                    venue +=
                        `${venue ? " " : ""}${data.volume}`;

                }


                if (data.issue) {

                    venue +=
                        `(${data.issue})`;

                }


                if (data.pages) {

                    venue +=
                        `${venue ? ": " : ""}${data.pages}`;

                }


                if (venue) {

                    parts.push(
                        `${venue}.`
                    );

                }


                break;

            }


            case "bookSection":
            case "encyclopediaArticle": {

                parts.push(
                    `“${title}.”`
                );


                if (
                    data.bookTitle
                ) {

                    let sentence =
                        `In ${data.bookTitle}`;


                    if (editors) {

                        sentence +=
                            `, edited by ${editors}`;

                    }


                    if (data.pages) {

                        sentence +=
                            `, ${data.pages}`;

                    }


                    parts.push(
                        `${sentence}.`
                    );

                }


                break;

            }


            case "conferencePaper": {

                parts.push(
                    `“${title}.”`
                );


                const proceedings =
                    normalizeText(
                        data.proceedingsTitle ||
                        data.conferenceName
                    );


                if (proceedings) {

                    parts.push(
                        `In ${proceedings}.`
                    );

                }


                break;

            }


            default:

                parts.push(
                    `${title}.`
                );

        }


        const imprint =
            [
                data.place,
                data.publisher
            ]
                .filter(Boolean)
                .join(": ");


        if (imprint) {

            parts.push(
                `${imprint}.`
            );

        }


        if (
            record.status &&
            year
        ) {

            parts.push(
                `[${record.status}]`
            );

        }


        return normalizeText(
            parts.join(" ")
        );

    }


    function groupPublications(
        records
    ) {

        const groups =
            {};


        records.forEach(record => {

            if (
                !groups[
                    record.category
                ]
            ) {

                groups[
                    record.category
                ] = [];

            }


            groups[
                record.category
            ]
                .push(record);

        });


        Object.values(groups)
            .forEach(group => {

                group.sort(
                    (a, b) => {

                        const yearDiff =
                            yearOf(
                                b.item.data
                            ) -
                            yearOf(
                                a.item.data
                            );


                        if (yearDiff) {
                            return yearDiff;
                        }


                        return normalizeText(
                            a.item.data.title
                        )
                            .localeCompare(
                                normalizeText(
                                    b.item.data.title
                                ),
                                "en"
                            );

                    }
                );

            });


        return PUBLICATION_CATEGORY_ORDER
            .filter(
                category =>
                    groups[
                        category
                    ]?.length
            )
            .map(
                category => ({
                    title:
                        category,

                    items:
                        groups[
                            category
                        ]
                })
            );

    }


    /* =========================================
       Simple PDF helpers
    ========================================== */

    function sectionHeading(title) {

        return {
            margin:
                [0, 15, 0, 6],

            columns: [
                {
                    width:
                        4,

                    canvas: [
                        {
                            type:
                                "rect",

                            x:
                                0,

                            y:
                                0,

                            w:
                                4,

                            h:
                                16,

                            color:
                                COLORS.teal
                        }
                    ]
                },

                {
                    width:
                        "*",

                    text:
                        title,

                    style:
                        "sectionTitle",

                    margin:
                        [7, 0, 0, 0]
                }
            ]
        };

    }


    function subsectionHeading(title) {

        return {
            text:
                title,

            style:
                "subsectionTitle",

            margin:
                [0, 7, 0, 4]
        };

    }


    function simpleEntry(
        date,
        title,
        details = [],
        options = {}
    ) {

        let titleNode =
            title;


        if (
            typeof title ===
                "string" &&
            options.titleLink
        ) {

            titleNode =
                linkedText(
                    title,
                    options.titleLink
                );

        }


        const stack = [
            {
                text:
                    titleNode,

                style:
                    "entryTitle"
            }
        ];


        details
            .filter(Boolean)
            .forEach(detail => {

                stack.push({
                    text:
                        detail,

                    style:
                        "entryMeta",

                    margin:
                        [0, 1, 0, 0]
                });

            });


        if (
            options.resources
                ?.length
        ) {

            stack.push({
                text:
                    resourceRuns(
                        options.resources
                    ),

                style:
                    "resourceLinks",

                margin:
                    [0, 2, 0, 0]
            });

        }


        return {
            table: {
                widths:
                    [82, "*"],

                body: [[
                    {
                        text:
                            date ||
                            "",

                        style:
                            "date",

                        margin:
                            [0, 1, 8, 0]
                    },

                    {
                        stack
                    }
                ]]
            },

            layout:
                "noBorders",

            margin:
                [0, 0, 0, 6]
        };

    }


    function teachingMetadata(meta) {

        return [
            meta.Type,
            meta.Location,
            meta.SWS
                ? `${meta.SWS} SWS`
                : "",
            meta.Language
        ]
            .filter(Boolean)
            .join(" · ");

    }


    function thesisMetadata(meta) {

        const parts = [
            meta.Type,
            meta.Location,
            meta.Role
        ];


        if (
            meta["First Supervisor"] &&
            meta.Role !==
                "First Supervisor"
        ) {

            parts.push(
                `First Supervisor: ${meta["First Supervisor"]}`
            );

        }


        if (
            meta["Second Supervisor"] &&
            meta.Role !==
                "Second Supervisor"
        ) {

            parts.push(
                `Second Supervisor: ${meta["Second Supervisor"]}`
            );

        }


        if (
            meta.Language
        ) {

            parts.push(
                meta.Language
            );

        }


        return parts
            .filter(Boolean)
            .join(" · ");

    }


    function projectMetadata(metadata) {

        const order = [
            "Duration",
            "Funding",
            "Applicants",
            "Coordination",
            "Funder"
        ];


        return order
            .filter(
                key =>
                    metadata[key]
            )
            .map(
                key =>
                    `${key}: ${metadata[key]}`
            );

    }


    /* =========================================
       Document definition
    ========================================== */

    function buildDocumentDefinition(
        model,
        portrait
    ) {

        const content =
            [];


        /* ---------------------------------
           Header
        ---------------------------------- */

        const socialRuns =
            [];


        const socials = [
            model.profile.orcid,
            model.profile.github,
            model.profile.mastodon
        ]
            .filter(
                profile =>
                    profile.url &&
                    profile.label
            );


        socials.forEach(
            (profile, index) => {

                if (index > 0) {

                    socialRuns.push(
                        " · "
                    );

                }


                socialRuns.push(
                    linkedText(
                        profile.label,
                        profile.url
                    )
                );

            }
        );


        content.push({
            table: {
                widths:
                    [82, "*"],

                body: [[
                    {
                        image:
                            portrait,

                        width:
                            68,

                        height:
                            82,

                        fit:
                            [68, 82],

                        alignment:
                            "center",

                        border:
                            [
                                false,
                                false,
                                false,
                                false
                            ]
                    },

                    {
                        border:
                            [
                                false,
                                false,
                                false,
                                false
                            ],

                        stack: [
                            {
                                text:
                                    model.profile.name,

                                style:
                                    "name"
                            },

                            {
                                text:
                                    [
                                        model.profile.address,
                                        model.profile.address &&
                                        model.profile.birthDate
                                            ? " · "
                                            : "",
                                        model.profile.birthDate
                                    ],

                                style:
                                    "personalData",

                                margin:
                                    [0, 4, 0, 0]
                            },

                            {
                                text: [
                                    linkedText(
                                        model.profile.email,
                                        `mailto:${model.profile.email}`
                                    ),

                                    " · ",

                                    linkedText(
                                        model.profile.website,
                                        model.profile.website
                                    )
                                ],

                                style:
                                    "contact",

                                margin:
                                    [0, 4, 0, 0]
                            },

                            {
                                text:
                                    socialRuns,

                                style:
                                    "contact",

                                margin:
                                    [0, 4, 0, 0]
                            }
                        ]
                    }
                ]]
            },

            layout:
                "noBorders",

            margin:
                [0, 0, 0, 12]
        });


        content.push({
            canvas: [
                {
                    type:
                        "line",

                    x1:
                        0,

                    y1:
                        0,

                    x2:
                        515,

                    y2:
                        0,

                    lineWidth:
                        1,

                    lineColor:
                        COLORS.warm
                }
            ],

            margin:
                [0, 0, 0, 3]
        });


        /* ---------------------------------
           CV
        ---------------------------------- */

        model.cv.forEach(section => {

            content.push(
                sectionHeading(
                    section.title
                )
            );


            section.entries
                .forEach(block => {

                    if (
                        block.type ===
                        "entry"
                    ) {

                        content.push(
                            simpleEntry(
                                block.data.date,
                                block.data.title,
                                [
                                    block.data.meta,
                                    block.data.detail
                                ]
                            )
                        );

                    }


                    if (
                        block.type ===
                        "subsection"
                    ) {

                        content.push(
                            subsectionHeading(
                                block.title
                            )
                        );


                        block.entries
                            .forEach(entry => {

                                content.push(
                                    simpleEntry(
                                        entry.date,
                                        entry.title,
                                        [
                                            entry.meta,
                                            entry.detail
                                        ]
                                    )
                                );

                            });

                    }

                });

        });


        /* ---------------------------------
           Publications
        ---------------------------------- */

        content.push(
            sectionHeading(
                "Publications"
            )
        );


        model.publications
            .forEach(group => {

                content.push(
                    subsectionHeading(
                        group.title
                    )
                );


                group.items
                    .forEach(record => {

                        const runs = [
                            bibliographyText(
                                record
                            )
                        ];


                        publicationUrls(
                            record.item.data
                        )
                            .forEach(url => {

                                runs.push(
                                    " "
                                );


                                runs.push(
                                    linkedText(
                                        url,
                                        url,
                                        {
                                            fontSize:
                                                8
                                        }
                                    )
                                );

                            });


                        content.push({
                            text:
                                runs,

                            style:
                                "bibliography",

                            margin:
                                [0, 0, 0, 5]
                        });

                    });

            });


        /* ---------------------------------
           Talks
        ---------------------------------- */

        content.push(
            sectionHeading(
                "Talks"
            )
        );


        model.talks
            .forEach(talk => {

                content.push(
                    simpleEntry(
                        talk.date,
                        talk.title,
                        [
                            talk.event,
                            talk.location,

                            talk.collaborators
                                ? `With: ${talk.collaborators}`
                                : "",

                            talk.status
                                ? `Status: ${talk.status}`
                                : ""
                        ],
                        {
                            resources:
                                talk.resources
                        }
                    )
                );

            });


        /* ---------------------------------
           Teaching
        ---------------------------------- */

        content.push(
            sectionHeading(
                "Teaching"
            )
        );


        groupByAcademicYear(
            model.teaching
        )
            .forEach(group => {

                content.push({
                    table: {
                        widths:
                            [82, "*"],

                        body: [[
                            {
                                text:
                                    group.title,

                                style:
                                    "academicYear"
                            },

                            {
                                text:
                                    "Academic Year",

                                style:
                                    "academicYearLabel"
                            }
                        ]]
                    },

                    layout:
                        "noBorders",

                    margin:
                        [0, 5, 0, 4]
                });


                group.items
                    .forEach(course => {

                        content.push(
                            simpleEntry(
                                course.termInfo
                                    .label,

                                course.title,

                                [
                                    teachingMetadata(
                                        course.meta
                                    )
                                ],

                                {
                                    titleLink:
                                        course.titleLink
                                }
                            )
                        );

                    });

            });


        /* ---------------------------------
           Thesis Supervisions
        ---------------------------------- */

        content.push(
            sectionHeading(
                "Thesis Supervisions"
            )
        );


        groupByAcademicYear(
            model.theses
        )
            .forEach(group => {

                content.push({
                    table: {
                        widths:
                            [82, "*"],

                        body: [[
                            {
                                text:
                                    group.title,

                                style:
                                    "academicYear"
                            },

                            {
                                text:
                                    "Academic Year",

                                style:
                                    "academicYearLabel"
                            }
                        ]]
                    },

                    layout:
                        "noBorders",

                    margin:
                        [0, 5, 0, 4]
                });


                group.items
                    .forEach(thesis => {

                        content.push(
                            simpleEntry(
                                thesis.termInfo
                                    .label,

                                thesis.title,

                                [
                                    thesisMetadata(
                                        thesis.meta
                                    )
                                ]
                            )
                        );

                    });

            });


        /* ---------------------------------
           Organized Events
        ---------------------------------- */

        content.push(
            sectionHeading(
                "Organized Events"
            )
        );


        model.events
            .forEach(event => {

                content.push(
                    simpleEntry(
                        event.date,

                        event.title,

                        [
                            [
                                event.type,
                                event.location
                            ]
                                .filter(Boolean)
                                .join(" · "),

                            ...event.roles
                        ],

                        {
                            titleLink:
                                event.titleLink,

                            resources:
                                event.resources
                        }
                    )
                );


                event.editions
                    .forEach(edition => {

                        const runs = [
                            {
                                text:
                                    edition.term,

                                bold:
                                    true
                            }
                        ];


                        if (
                            edition.meta
                        ) {

                            runs.push(
                                ` · ${edition.meta}`
                            );

                        }


                        if (
                            edition.resources
                                .length
                        ) {

                            runs.push(
                                " · "
                            );


                            runs.push(
                                ...resourceRuns(
                                    edition.resources
                                )
                            );

                        }


                        content.push({
                            text:
                                runs,

                            style:
                                "entryMeta",

                            margin:
                                [90, -2, 0, 4]
                        });

                    });

            });


        /* ---------------------------------
           Academic Service
        ---------------------------------- */

        content.push(
            sectionHeading(
                "Academic Service"
            )
        );


        model.services
            .forEach(section => {

                content.push(
                    subsectionHeading(
                        section.title
                    )
                );


                section.entries
                    .forEach(entry => {

                        content.push(
                            simpleEntry(
                                entry.date,

                                entry.title,

                                [
                                    entry.detail,
                                    entry.institution
                                ],

                                {
                                    titleLink:
                                        entry.titleLink
                                }
                            )
                        );

                    });

            });


        /* ---------------------------------
           Projects & Funding
        ---------------------------------- */

        content.push(
            sectionHeading(
                "Projects & Funding"
            )
        );


        model.projects
            .forEach(project => {

                const details =
                    projectMetadata(
                        project.metadata
                    );


                if (
                    project.status
                ) {

                    details.unshift(
                        `Status: ${project.status}`
                    );

                }


                content.push(
                    simpleEntry(
                        project.period,

                        project.title,

                        details,

                        {
                            titleLink:
                                project.titleLink,

                            resources:
                                project.resources
                        }
                    )
                );

            });


        /* =========================================
           Document definition
        ========================================== */

        return {
            pageSize:
                "A4",

            pageMargins:
                [42, 42, 42, 46],


            info: {
                title:
                    `${model.profile.name} - Curriculum Vitae`,

                author:
                    model.profile.name
            },


            defaultStyle: {
                font:
                    "Roboto",

                fontSize:
                    9,

                color:
                    COLORS.navy,

                lineHeight:
                    1.18
            },


            styles: {

                name: {
                    fontSize:
                        22,

                    bold:
                        true,

                    color:
                        COLORS.navy
                },


                personalData: {
                    fontSize:
                        8.8,

                    color:
                        COLORS.muted
                },


                contact: {
                    fontSize:
                        8.1,

                    color:
                        COLORS.blue
                },


                sectionTitle: {
                    fontSize:
                        13.5,

                    bold:
                        true,

                    color:
                        COLORS.navy
                },


                subsectionTitle: {
                    fontSize:
                        9,

                    bold:
                        true,

                    color:
                        COLORS.teal
                },


                academicYear: {
                    fontSize:
                        8.7,

                    bold:
                        true,

                    color:
                        COLORS.teal
                },


                academicYearLabel: {
                    fontSize:
                        7.5,

                    bold:
                        true,

                    color:
                        COLORS.muted
                },


                date: {
                    fontSize:
                        8,

                    bold:
                        true,

                    color:
                        COLORS.blue
                },


                entryTitle: {
                    fontSize:
                        9.2,

                    bold:
                        true,

                    color:
                        COLORS.navy
                },


                entryMeta: {
                    fontSize:
                        8.3,

                    color:
                        COLORS.muted
                },


                resourceLinks: {
                    fontSize:
                        8,

                    color:
                        COLORS.link
                },


                bibliography: {
                    fontSize:
                        8.4,

                    color:
                        COLORS.navy,

                    lineHeight:
                        1.22
                }
            },


            footer: (
                currentPage,
                pageCount
            ) => ({

                margin:
                    [42, 10, 42, 0],

                columns: [
                    {
                        text:
                            `${model.profile.name} · Curriculum Vitae`,

                        fontSize:
                            7.2,

                        color:
                            COLORS.muted
                    },

                    {
                        text:
                            `Page ${currentPage} of ${pageCount}`,

                        alignment:
                            "right",

                        fontSize:
                            7.2,

                        color:
                            COLORS.muted
                    }
                ]
            }),


            content
        };

    }


    /* =========================================
       Load model
    ========================================== */

    async function loadModel(
        button
    ) {

        const [
            cvDocument,
            talksDocument,
            teachingDocument,
            eventsDocument,
            servicesDocument,
            projectsDocument,
            publicationRecords
        ] =
            await Promise.all([

                fetchDocument(
                    button.dataset.cvUrl
                ),

                fetchDocument(
                    button.dataset.talksUrl
                ),

                fetchDocument(
                    button.dataset.teachingUrl
                ),

                fetchDocument(
                    button.dataset.eventsUrl
                ),

                fetchDocument(
                    button.dataset.servicesUrl
                ),

                fetchDocument(
                    button.dataset.projectsUrl
                ),

                fetchPublications(
                    button.dataset
                        .zoteroUserId
                )
            ]);


        return {
            profile:
                extractProfile(
                    button
                ),

            cv:
                extractCv(
                    cvDocument
                ),

            publications:
                groupPublications(
                    publicationRecords
                ),

            talks:
                extractTalks(
                    talksDocument
                ),

            teaching:
                extractTeaching(
                    teachingDocument
                ),

            theses:
                extractTheses(
                    teachingDocument
                ),

            events:
                extractEvents(
                    eventsDocument
                ),

            services:
                extractServices(
                    servicesDocument
                ),

            projects:
                extractProjects(
                    projectsDocument
                )
        };

    }


    /* =========================================
       Generate PDF
    ========================================== */

    async function generatePdf(
        button,
        status
    ) {

        if (
            !window.pdfMake
        ) {

            throw new Error(
                "pdfmake is not available."
            );

        }


        status.textContent =
            "Collecting current website data…";


        const model =
            await loadModel(
                button
            );


        status.textContent =
            "Preparing PDF…";


        const portrait =
            await imageToDataUrl(
                model.profile.photo
            );


        const definition =
            buildDocumentDefinition(
                model,
                portrait
            );


        const filename =
            `${model.profile.name
                .replace(
                    /\s+/g,
                    "_"
                )}_CV.pdf`;


        console.time(
            "CV PDF generation"
        );


        window.pdfMake
            .createPdf(
                definition
            )
            .download(
                filename,
                () => {

                    console.timeEnd(
                        "CV PDF generation"
                    );


                    status.textContent =
                        "CV generated.";


                    button.disabled =
                        false;


                    setTimeout(
                        () => {

                            status.textContent =
                                "";

                        },
                        3000
                    );

                }
            );

    }


    /* =========================================
       Initialise
    ========================================== */

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            const button =
                document.getElementById(
                    "generate-cv-button"
                );


            const status =
                document.getElementById(
                    "generate-cv-status"
                );


            if (
                !button ||
                !status
            ) {
                return;
            }


            button.addEventListener(
                "click",
                async () => {

                    if (
                        button.disabled
                    ) {
                        return;
                    }


                    button.disabled =
                        true;


                    try {

                        await generatePdf(
                            button,
                            status
                        );

                    }
                    catch (error) {

                        console.error(
                            "CV generation failed:",
                            error
                        );


                        status.textContent =
                            "The CV could not be generated.";


                        button.disabled =
                            false;

                    }

                }
            );

        }
    );

})();